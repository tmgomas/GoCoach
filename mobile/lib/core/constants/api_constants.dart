/// API endpoint and base URL constants.
class ApiConstants {
  ApiConstants._();

  // Base URL is now dynamically loaded per-tenant.
  // This central URL is used only to fetch the list of available clubs.
  static const String centralBaseUrl = 'https://gocoach.test/api'; // Change to production central domain when deploying

  // Auth

  static const String login = '/login';
  static const String logout = '/logout';
  static const String user = '/user';

  // Member
  static const String memberProfile = '/member/profile';
  static const String memberPrograms = '/member/programs';
  static const String memberSchedule = '/member/schedule';
  static const String memberPayments = '/member/payments';
  static String memberPayOnline(String id) => '/member/payments/$id/pay-online';
  static const String memberAttendance = '/member/attendance';

  // Coach
  static const String coachDashboard = '/coach/dashboard';
  static const String coachScheduleToday = '/coach/schedule/today';
  static const String coachAttendance = '/coach/attendance';
  static const String coachAttendanceMark = '/coach/attendance/mark';
}
