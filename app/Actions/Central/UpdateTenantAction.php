<?php

namespace App\Actions\Central;

use App\Models\Tenant;
use Illuminate\Validation\ValidationException;
use Stancl\Tenancy\Database\Models\Domain;

class UpdateTenantAction
{
    /**
     * Update tenant details, subscription, hosting info, and primary domain.
     *
     * @param  array<string, mixed>  $data
     */
    public function execute(Tenant $tenant, array $data): Tenant
    {
        $tenant->fill([
            'name' => $data['name'],
            'admin_name' => $data['admin_name'] ?? $tenant->admin_name,
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'status' => $data['status'] ?? $tenant->status,
            'plan' => $data['plan'] ?? $tenant->plan,
            'plan_status' => $data['plan_status'] ?? $tenant->plan_status,
            'subscription_amount' => $data['subscription_amount'] ?? $tenant->subscription_amount,
            'currency' => $data['currency'] ?? $tenant->currency,
            'trial_ends_at' => $data['trial_ends_at'] ?? null,
            'subscription_starts_at' => $data['subscription_starts_at'] ?? null,
            'subscription_ends_at' => $data['subscription_ends_at'] ?? null,
            'hosting_provider' => $data['hosting_provider'] ?? null,
            'hosting_plan' => $data['hosting_plan'] ?? null,
            'hosting_cost' => $data['hosting_cost'] ?? 0.00,
            'hosting_renewal_date' => $data['hosting_renewal_date'] ?? null,
            'hosting_notes' => $data['hosting_notes'] ?? null,
            'max_members' => $data['max_members'] ?? $tenant->max_members,
            'max_coaches' => $data['max_coaches'] ?? $tenant->max_coaches,
            'notes' => $data['notes'] ?? null,
        ]);

        $tenant->save();

        if (! empty($data['domain'])) {
            $cleanDomain = preg_replace('#^https?://#i', '', trim($data['domain']));
            $cleanDomain = strtolower(rtrim($cleanDomain, '/'));

            $existingDomain = Domain::where('domain', $cleanDomain)
                ->where('tenant_id', '!=', $tenant->id)
                ->first();

            if ($existingDomain) {
                throw ValidationException::withMessages([
                    'domain' => 'The domain is already in use by another club.',
                ]);
            }

            $primaryDomainModel = $tenant->domains->first();
            if ($primaryDomainModel) {
                if ($primaryDomainModel->domain !== $cleanDomain) {
                    $primaryDomainModel->update(['domain' => $cleanDomain]);
                }
            } else {
                $tenant->domains()->create(['domain' => $cleanDomain]);
            }
        }

        return $tenant->fresh(['domains']);
    }
}
