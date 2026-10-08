<?php

namespace App\Http\Requests\Central;

use App\Models\Tenant;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTenantRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->hasRole('super_admin') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $tenant = $this->route('tenant');
        $tenantId = $tenant instanceof Tenant ? $tenant->id : $tenant;

        return [
            'name' => ['required', 'string', 'max:255'],
            'admin_name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('tenants', 'email')->ignore($tenantId)],
            'phone' => ['nullable', 'string', 'max:30'],
            'domain' => ['required', 'string', 'max:255'],
            'status' => ['required', 'string', 'in:active,suspended,archived'],

            // Subscription fields
            'plan' => ['required', 'string', 'in:trial,monthly,yearly,lifetime,custom'],
            'plan_status' => ['nullable', 'string', 'in:active,trialing,past_due,suspended,expired,cancelled'],
            'subscription_amount' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'max:10'],
            'trial_ends_at' => ['nullable', 'date'],
            'subscription_starts_at' => ['nullable', 'date'],
            'subscription_ends_at' => ['nullable', 'date'],

            // Hosting fields
            'hosting_provider' => ['nullable', 'string', 'max:50'],
            'hosting_plan' => ['nullable', 'string', 'max:100'],
            'hosting_cost' => ['nullable', 'numeric', 'min:0'],
            'hosting_renewal_date' => ['nullable', 'date'],
            'hosting_notes' => ['nullable', 'string', 'max:2000'],

            // Quotas
            'max_members' => ['nullable', 'integer', 'min:1'],
            'max_coaches' => ['nullable', 'integer', 'min:1'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'The club name is required.',
            'email.required' => 'The admin contact email is required.',
            'email.unique' => 'This email address is already in use by another club.',
            'domain.required' => 'The domain is required.',
            'plan.required' => 'Please select a subscription plan.',
        ];
    }
}
