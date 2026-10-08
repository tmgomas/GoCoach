import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/bloc/auth_bloc.dart';
import '../../features/auth/presentation/bloc/auth_state.dart';
import '../../features/auth/presentation/pages/splash_page.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/club_selection_page.dart';
import '../../features/home/presentation/pages/home_page.dart';
import '../../features/coach/presentation/pages/coach_home_page.dart';

/// GoRouter configuration with auth + role-based redirect.
class AppRouter {
  final AuthBloc authBloc;

  AppRouter(this.authBloc);

  late final GoRouter router = GoRouter(
    initialLocation: '/splash',
    refreshListenable: GoRouterRefreshStream(authBloc.stream),
    redirect: (context, state) {
      final authState = authBloc.state;
      final location = state.matchedLocation;
      final isOnSplash = location == '/splash';
      final isOnLogin = location == '/login';
      final isOnClubSelection = location == '/club_selection';
      final isAuthPage = isOnSplash || isOnLogin || isOnClubSelection;

      // Still loading auth — stay on splash
      if (authState is AuthInitial || authState is AuthLoading) {
        return isOnSplash ? null : '/splash';
      }

      // Not authenticated — go to login (unless on club selection)
      if (authState is AuthUnauthenticated || authState is AuthFailure) {
        if (isOnClubSelection) return null;
        return isOnLogin ? null : '/login';
      }

      // Authenticated — route by role
      if (authState is AuthAuthenticated) {
        if (!isAuthPage) return null;
        return authState.user.isCoach ? '/coach' : '/home';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/club_selection',
        builder: (context, state) => const ClubSelectionPage(),
      ),
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashPage(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/home',
        builder: (context, state) => const HomePage(),
      ),
      GoRoute(
        path: '/coach',
        builder: (context, state) => const CoachHomePage(),
      ),
    ],
  );
}

/// Converts a BLoC stream into a Listenable for GoRouter's refreshListenable.
class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Stream<dynamic> stream) {
    stream.listen((_) => notifyListeners());
  }
}
