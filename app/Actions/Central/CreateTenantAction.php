<?php

namespace App\Actions\Central;

use App\Enums\TenantPlan;
use App\Models\Tenant;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;
use Stancl\Tenancy\Database\Models\Domain;

class CreateTenantAction
{
    /**
     * Create a new tenant, domain, and seed the initial admin account.
     *
     * @param  array<string, mixed>  $data
     */
    public function execute(array $data): Tenant
    {
        $cleanDomain = preg_replace('#^https?://#i', '', trim($data['domain']));
        $cleanDomain = strtolower(rtrim($cleanDomain, '/'));

        if (Domain::where('domain', $cleanDomain)->exists()) {
            throw ValidationException::withMessages([
                'domain' => 'The domain is already registered to another club.',
            ]);
        }

        $plan = $data['plan'] ?? 'trial';
        $now = Carbon::now();

        // Calculate default subscription/trial dates if not provided
        $trialEndsAt = $data['trial_ends_at'] ?? null;
        $subscriptionStartsAt = $data['subscription_starts_at'] ?? $now->toDateString();
        $subscriptionEndsAt = $data['subscription_ends_at'] ?? null;

        if ($plan === TenantPlan::Trial->value && ! $trialEndsAt) {
            $trialEndsAt = $now->copy()->addDays(14)->toDateString();
        } elseif ($plan === TenantPlan::Monthly->value && ! $subscriptionEndsAt) {
            $subscriptionEndsAt = $now->copy()->addMonth()->toDateString();
        } elseif ($plan === TenantPlan::Yearly->value && ! $subscriptionEndsAt) {
            $subscriptionEndsAt = $now->copy()->addYear()->toDateString();
        }

        $tenant = Tenant::create([
            'id' => strtolower($data['id']),
            'name' => $data['name'],
            'admin_name' => $data['admin_name'] ?? ($data['name'].' Admin'),
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'status' => 'active',
            'plan' => $plan,
            'plan_status' => $data['plan_status'] ?? ($plan === TenantPlan::Trial->value ? 'trialing' : 'active'),
            'subscription_amount' => $data['subscription_amount'] ?? 0.00,
            'currency' => $data['currency'] ?? 'LKR',
            'trial_ends_at' => $trialEndsAt,
            'subscription_starts_at' => $subscriptionStartsAt,
            'subscription_ends_at' => $subscriptionEndsAt,
            'hosting_provider' => $data['hosting_provider'] ?? null,
            'hosting_plan' => $data['hosting_plan'] ?? null,
            'hosting_cost' => $data['hosting_cost'] ?? 0.00,
            'hosting_renewal_date' => $data['hosting_renewal_date'] ?? null,
            'hosting_notes' => $data['hosting_notes'] ?? null,
            'max_members' => $data['max_members'] ?? 500,
            'max_coaches' => $data['max_coaches'] ?? 20,
            'notes' => $data['notes'] ?? null,
        ]);

        $tenant->domains()->create([
            'domain' => $cleanDomain,
        ]);

        // Seed initial admin user & roles inside the new tenant database
        $adminPassword = ! empty($data['password']) ? $data['password'] : 'password';
        $adminName = $data['admin_name'] ?? ($data['name'].' Admin');
        $adminEmail = $data['email'];

        $tenant->run(function () use ($adminName, $adminEmail, $adminPassword) {
            $user = User::create([
                'name' => $adminName,
                'email' => $adminEmail,
                'password' => Hash::make($adminPassword),
            ]);

            $user->forceFill(['email_verified_at' => now()])->save();

            $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
            Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
            Role::firstOrCreate(['name' => 'coach', 'guard_name' => 'web']);
            Role::firstOrCreate(['name' => 'member', 'guard_name' => 'web']);

            $user->assignRole($adminRole);
        });

        return $tenant;
    }
}
