# GoCoach - Project Documentation & Architecture Guide

Welcome to the GoCoach project documentation. This document serves as a comprehensive reference for the structure, architecture, and technology stack of the GoCoach application, designed to be used at any time for onboarding or development reference.

---

## 🚀 1. Project Overview

**GoCoach** is a robust, multi-tenant SaaS application designed for sports academies, coaching centers, and similar organizations. It allows businesses (tenants) to manage their members, coaches, programs, attendances, and payments seamlessly. It features both a web platform and a mobile app.

### Core Features:
- **Multi-Tenancy:** Each academy gets its own secure workspace.
- **Member & Coach Management:** Profile handling, assignments, and roles.
- **Attendance Tracking:** Support for NFC, RFID, and QR Code scanning (via mobile app and web).
- **Payment Processing:** Integrated with PayHere for online payments, along with tracking manual payments.
- **Scheduling & Programs:** Managing sports/classes, special bookings, and holidays.
- **Notifications:** SMS and Push Notifications via Firebase.

---

## 🛠 2. Technology Stack

This project strictly follows modern web and mobile ecosystem standards:

### Web Backend (Laravel)
- **PHP:** 8.4+
- **Laravel Framework:** v12
- **Authentication:** Laravel Fortify (Headless Auth), Laravel Sanctum (API Tokens for Mobile)
- **Multi-Tenancy:** `stancl/tenancy`
- **Testing:** Pest v4

### Web Frontend (React)
- **Framework:** React v19
- **Routing/Bridge:** Inertia.js v2 (`@inertiajs/react`)
- **Styling:** Tailwind CSS v4
- **UI Components:** Radix UI (Headless) + custom Shadcn-like components
- **Frontend/Backend Bridge:** Laravel Wayfinder (Generates TypeScript functions for Laravel routes)

### Mobile App (Flutter)
- **SDK:** Flutter (Dart ^3.11.0)
- **Architecture Pattern:** Clean Architecture (Feature-driven)
- **State Management:** Flutter BLoC (`flutter_bloc`) & Equatable
- **Dependency Injection:** GetIt (`get_it`)
- **Networking:** Dio (`dio`) with Pretty Dio Logger
- **Routing:** Go Router (`go_router`)
- **Storage:** Flutter Secure Storage (`flutter_secure_storage`)
- **Special Features:** `mobile_scanner` (QR scanning), Firebase Messaging (Push notifications)

---

## 📂 3. Directory Structure

### Backend & Web Frontend
- `app/`: Laravel models, controllers, services, and traits.
- `database/migrations/tenant/`: Tenant-specific database schemas.
- `routes/`: Contains `web.php` (Central), `tenant.php` (Tenant), and `api.php` (Mobile App endpoints).
- `resources/js/`: React frontend (Pages, Layouts, Components, Actions via Wayfinder).

### Mobile App (`mobile/`)
The mobile application strictly follows Clean Architecture principles, separated by features:
- `mobile/lib/core/`: Common utilities, API clients (`network/api_client.dart`), secure storage, error handling (`dartz`), and constants.
- `mobile/lib/config/`: App theming and routing configuration (`app_router.dart`).
- `mobile/lib/injection_container.dart`: Centralized dependency injection setup using `get_it`.
- `mobile/lib/features/`: Contains domain-specific modules. Each feature folder (e.g., `auth`, `attendance`, `coach`, `payments`, `schedule`) is subdivided into:
  - `data/`: Repositories, API remote data sources, and models.
  - `domain/`: Entities, repository interfaces, and use cases.
  - `presentation/`: BLoCs, Cubits, Pages, and Widgets.

---

## 🏗 4. Key Architectural Concepts

### Multi-Tenancy (`stancl/tenancy`)
The app uses a database-per-tenant or prefix-per-tenant architecture. 
- **Central Domain:** Where tenants register and manage their subscription.
- **Tenant Domain:** Where the actual academy operates (e.g., `academy.gocoach.test`).

### Mobile API Integration (Sanctum & Dio)
- The Flutter mobile app communicates with the Laravel backend via `routes/api.php`.
- Authentication is handled using **Laravel Sanctum**. The token is securely stored on the device using `flutter_secure_storage`.
- Network requests are managed by **Dio** through a custom `ApiClient` configured in `mobile/lib/core/network/`, handling tenant identification (e.g., sending the tenant domain in headers) and token injection.

### Wayfinder Integration (Web)
Instead of manual Axios calls, the React frontend uses **Laravel Wayfinder** to make type-safe backend calls using automatically generated TypeScript files (`@/actions/...`).

---

## 🧑‍💻 5. Development Guidelines & Workflow

1. **Routing (Web):** Define routes in `routes/web.php` or `routes/tenant.php`. Use `Inertia::render()` for views.
2. **State Management (Mobile):** Always use `flutter_bloc` for state management in Flutter. UI components should react to BLoC states rather than managing local state.
3. **Database:** Prevent N+1 issues using eager loading (`with()`). Prefer Eloquent Relationships.
4. **Validation:** Always use Form Requests (`php artisan make:request`).
5. **Testing & Formatting:** 
   - Web: Run `php artisan test --compact` and `vendor/bin/pint --format agent`.
   - Mobile: Run `flutter test` and use `flutter analyze`.

---

## 🚀 6. Common Commands

| Task | Command |
| :--- | :--- |
| Start Web Dev Server | `npm run dev` |
| Run Laravel Migrations (Tenants) | `php artisan tenants:migrate` |
| Format Laravel Code | `vendor/bin/pint --format agent` |
| Start Flutter Mobile App | `cd mobile && flutter run` |
| Generate BLoC Code / Build Runner | `cd mobile && dart run build_runner build --delete-conflicting-outputs` |

---

*This document can be expanded as the project grows. Keep it updated when introducing major architectural changes.*
