<?php

namespace App\Models;

use App\Enums\HostingProvider;
use App\Enums\TenantPlan;
use App\Enums\TenantStatus;
use Carbon\Carbon;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains;

    public static function getCustomColumns(): array
    {
        return [
            'id',
            'name',
            'admin_name',
            'email',
            'phone',
            'status',
            'plan',
            'plan_status',
            'subscription_amount',
            'currency',
            'trial_ends_at',
            'subscription_starts_at',
            'subscription_ends_at',
            'hosting_provider',
            'hosting_plan',
            'hosting_cost',
            'hosting_renewal_date',
            'hosting_notes',
            'max_members',
            'max_coaches',
            'notes',
        ];
    }

    protected function casts(): array
    {
        return [
            'plan' => TenantPlan::class,
            'plan_status' => TenantStatus::class,
            'hosting_provider' => HostingProvider::class,
            'subscription_amount' => 'decimal:2',
            'hosting_cost' => 'decimal:2',
            'trial_ends_at' => 'date',
            'subscription_starts_at' => 'date',
            'subscription_ends_at' => 'date',
            'hosting_renewal_date' => 'date',
            'max_members' => 'integer',
            'max_coaches' => 'integer',
        ];
    }

    public function getPrimaryDomainAttribute(): ?string
    {
        return $this->domains->first()?->domain;
    }

    public function isTrial(): bool
    {
        return $this->plan === TenantPlan::Trial;
    }

    public function daysUntilHostingRenewal(): ?int
    {
        if (! $this->hosting_renewal_date) {
            return null;
        }

        return (int) Carbon::now()->startOfDay()->diffInDays($this->hosting_renewal_date->startOfDay(), false);
    }

    public function isHostingRenewalDueSoon(int $days = 30): bool
    {
        $diff = $this->daysUntilHostingRenewal();

        return $diff !== null && $diff >= 0 && $diff <= $days;
    }

    public function isHostingRenewalOverdue(): bool
    {
        $diff = $this->daysUntilHostingRenewal();

        return $diff !== null && $diff < 0;
    }

    public function daysUntilSubscriptionEnds(): ?int
    {
        $targetDate = $this->isTrial() ? $this->trial_ends_at : $this->subscription_ends_at;
        if (! $targetDate) {
            return null;
        }

        return (int) Carbon::now()->startOfDay()->diffInDays($targetDate->startOfDay(), false);
    }
}
