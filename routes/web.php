<?php

use App\Http\Controllers\Central\TenantController;
use Illuminate\Support\Facades\Route;

foreach (config('tenancy.central_domains', ['gocoach.test', 'nycsc.test', 'localhost', '127.0.0.1']) as $centralDomain) {
    Route::domain($centralDomain)->group(function () {
        Route::get('/', function () {
            return 'Central SaaS Landing Page';
        });

        Route::get('/dashboard', function () {
            return redirect()->route('central.tenants.index');
        });

        Route::middleware(['auth', 'verified', 'role:super_admin'])->prefix('saas-admin')->name('central.')->group(function () {
            Route::get('/dashboard', [TenantController::class, 'index'])->name('dashboard');
            Route::patch('tenants/{tenant}/toggle-status', [TenantController::class, 'toggleStatus'])->name('tenants.toggle-status');
            Route::post('tenants/{tenant}/renew-hosting', [TenantController::class, 'renewHosting'])->name('tenants.renew-hosting');
            Route::resource('tenants', TenantController::class);
        });
    });
}
