<?php

namespace App\Http\Controllers\Central;

use App\Actions\Central\CreateTenantAction;
use App\Actions\Central\UpdateTenantAction;
use App\Enums\HostingProvider;
use App\Enums\TenantPlan;
use App\Enums\TenantStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Central\StoreTenantRequest;
use App\Http\Requests\Central\UpdateTenantRequest;
use App\Models\Tenant;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TenantController extends Controller
{
    /**
     * Display a listing of registered clubs/tenants with KPI metrics and filters.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $planFilter = $request->query('plan');
        $statusFilter = $request->query('status');
        $hostingFilter = $request->query('hosting');

        $query = Tenant::with('domains')->latest();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('id', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhereHas('domains', function ($dq) use ($search) {
                        $dq->where('domain', 'like', "%{$search}%");
                    });
            });
        }

        if ($planFilter && $planFilter !== 'all') {
            $query->where('plan', $planFilter);
        }

        if ($statusFilter && $statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        if ($hostingFilter === 'due_soon') {
            $query->whereNotNull('hosting_renewal_date')
                ->where('hosting_renewal_date', '<=', Carbon::now()->addDays(30)->toDateString());
        } elseif ($hostingFilter === 'overdue') {
            $query->whereNotNull('hosting_renewal_date')
                ->where('hosting_renewal_date', '<', Carbon::now()->toDateString());
        }

        $allTenants = Tenant::with('domains')->get();

        // Calculate KPI Metrics
        $totalClubs = $allTenants->count();
        $activeClubs = $allTenants->where('status', 'active')->count();
        $trialClubs = $allTenants->filter(fn (Tenant $t) => $t->plan === TenantPlan::Trial)->count();
        $hostingDueSoon = $allTenants->filter(fn (Tenant $t) => $t->isHostingRenewalDueSoon(30) || $t->isHostingRenewalOverdue())->count();

        // Estimated Monthly Subscription Revenue (MRR)
        $estimatedMonthlyRevenue = $allTenants->sum(function (Tenant $t) {
            if ($t->status !== 'active') {
                return 0;
            }
            if ($t->plan === TenantPlan::Monthly) {
                return (float) $t->subscription_amount;
            }
            if ($t->plan === TenantPlan::Yearly && $t->subscription_amount > 0) {
                return (float) ($t->subscription_amount / 12);
            }

            return 0;
        });

        $tenants = $query->paginate(15)->withQueryString();

        // Map enhanced fields
        $tenants->getCollection()->transform(function (Tenant $tenant) {
            $tenant->primary_domain = $tenant->primary_domain;
            $tenant->days_until_hosting_renewal = $tenant->daysUntilHostingRenewal();
            $tenant->is_hosting_due_soon = $tenant->isHostingRenewalDueSoon(30);
            $tenant->is_hosting_overdue = $tenant->isHostingRenewalOverdue();
            $tenant->days_until_sub_ends = $tenant->daysUntilSubscriptionEnds();

            return $tenant;
        });

        return Inertia::render('Central/Tenants/Index', [
            'tenants' => $tenants,
            'filters' => [
                'search' => $search,
                'plan' => $planFilter ?? 'all',
                'status' => $statusFilter ?? 'all',
                'hosting' => $hostingFilter ?? 'all',
            ],
            'stats' => [
                'total_clubs' => $totalClubs,
                'active_clubs' => $activeClubs,
                'trial_clubs' => $trialClubs,
                'hosting_due_soon' => $hostingDueSoon,
                'estimated_monthly_revenue' => round($estimatedMonthlyRevenue, 2),
            ],
            'availablePlans' => collect(TenantPlan::cases())->map(fn (TenantPlan $p) => [
                'value' => $p->value,
                'label' => $p->label(),
                'badgeColor' => $p->badgeColor(),
            ]),
            'availableStatuses' => collect(TenantStatus::cases())->map(fn (TenantStatus $s) => [
                'value' => $s->value,
                'label' => $s->label(),
                'badgeColor' => $s->badgeColor(),
            ]),
        ]);
    }

    /**
     * Show the form for creating a new club/tenant.
     */
    public function create(): Response
    {
        return Inertia::render('Central/Tenants/Create', [
            'plans' => collect(TenantPlan::cases())->map(fn (TenantPlan $p) => [
                'value' => $p->value,
                'label' => $p->label(),
                'badgeColor' => $p->badgeColor(),
            ]),
            'statuses' => collect(TenantStatus::cases())->map(fn (TenantStatus $s) => [
                'value' => $s->value,
                'label' => $s->label(),
                'badgeColor' => $s->badgeColor(),
            ]),
            'hostingProviders' => collect(HostingProvider::cases())->map(fn (HostingProvider $h) => [
                'value' => $h->value,
                'label' => $h->label(),
            ]),
        ]);
    }

    /**
     * Store a newly created club/tenant in storage.
     */
    public function store(StoreTenantRequest $request, CreateTenantAction $createTenant): RedirectResponse
    {
        $tenant = $createTenant->execute($request->validated());

        return redirect()->route('central.tenants.index')
            ->with('success', "Club '{$tenant->name}' registered successfully with database and admin initialized!");
    }

    /**
     * Display the specified club details.
     */
    public function show(Tenant $tenant): Response
    {
        $tenant->load('domains');
        $tenant->primary_domain = $tenant->primary_domain;
        $tenant->days_until_hosting_renewal = $tenant->daysUntilHostingRenewal();
        $tenant->is_hosting_due_soon = $tenant->isHostingRenewalDueSoon(30);
        $tenant->is_hosting_overdue = $tenant->isHostingRenewalOverdue();
        $tenant->days_until_sub_ends = $tenant->daysUntilSubscriptionEnds();

        // Safely fetch database stats from the tenant database
        $tenantStats = [
            'members_count' => 0,
            'coaches_count' => 0,
            'payments_count' => 0,
            'is_database_connected' => false,
        ];

        try {
            $tenant->run(function () use (&$tenantStats) {
                $tenantStats['members_count'] = \App\Models\User::role('member')->count();
                $tenantStats['coaches_count'] = \App\Models\User::role('coach')->count();
                $tenantStats['payments_count'] = \Illuminate\Support\Facades\DB::table('payments')->count();
                $tenantStats['is_database_connected'] = true;
            });
        } catch (\Throwable $e) {
            // Database might be unreachable or migrating
            $tenantStats['error'] = $e->getMessage();
        }

        return Inertia::render('Central/Tenants/Show', [
            'tenant' => $tenant,
            'tenantStats' => $tenantStats,
        ]);
    }

    /**
     * Show the form for editing the specified club/tenant.
     */
    public function edit(Tenant $tenant): Response
    {
        $tenant->load('domains');
        $tenant->domain = $tenant->primary_domain;

        return Inertia::render('Central/Tenants/Edit', [
            'tenant' => $tenant,
            'plans' => collect(TenantPlan::cases())->map(fn (TenantPlan $p) => [
                'value' => $p->value,
                'label' => $p->label(),
                'badgeColor' => $p->badgeColor(),
            ]),
            'statuses' => collect(TenantStatus::cases())->map(fn (TenantStatus $s) => [
                'value' => $s->value,
                'label' => $s->label(),
                'badgeColor' => $s->badgeColor(),
            ]),
            'hostingProviders' => collect(HostingProvider::cases())->map(fn (HostingProvider $h) => [
                'value' => $h->value,
                'label' => $h->label(),
            ]),
        ]);
    }

    /**
     * Update the specified club/tenant in storage.
     */
    public function update(UpdateTenantRequest $request, Tenant $tenant, UpdateTenantAction $updateTenant): RedirectResponse
    {
        $updateTenant->execute($tenant, $request->validated());

        return redirect()->route('central.tenants.index')
            ->with('success', "Club '{$tenant->name}' updated successfully!");
    }

    /**
     * Toggle club status (Active <-> Suspended).
     */
    public function toggleStatus(Tenant $tenant): RedirectResponse
    {
        $newStatus = $tenant->status === 'active' ? 'suspended' : 'active';
        $tenant->update(['status' => $newStatus]);

        return back()->with('success', "Club '{$tenant->name}' status changed to {$newStatus}.");
    }

    /**
     * Quick-renew hosting for 1 year or 1 month.
     */
    public function renewHosting(Request $request, Tenant $tenant): RedirectResponse
    {
        $validated = $request->validate([
            'period' => 'required|in:1_month,3_months,6_months,1_year',
        ]);

        $baseDate = ($tenant->hosting_renewal_date && $tenant->hosting_renewal_date->isFuture())
            ? $tenant->hosting_renewal_date
            : Carbon::now();

        $newRenewalDate = match ($validated['period']) {
            '1_month' => $baseDate->copy()->addMonth(),
            '3_months' => $baseDate->copy()->addMonths(3),
            '6_months' => $baseDate->copy()->addMonths(6),
            '1_year' => $baseDate->copy()->addYear(),
        };

        $tenant->update([
            'hosting_renewal_date' => $newRenewalDate->toDateString(),
        ]);

        return back()->with('success', "Hosting for '{$tenant->name}' renewed until {$newRenewalDate->format('M d, Y')}.");
    }

    /**
     * Remove the specified club/tenant and drop its database.
     */
    public function destroy(Tenant $tenant): RedirectResponse
    {
        $name = $tenant->name;
        $tenant->delete(); // Automatically triggers Stancl Tenancy database deletion listener if configured

        return redirect()->route('central.tenants.index')
            ->with('success', "Club '{$name}' was deleted successfully.");
    }
}
