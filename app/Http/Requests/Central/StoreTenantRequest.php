<?php

namespace App\Http\Requests\Central;

use Illuminate\Foundation\Http\FormRequest;

class StoreTenantRequest extends FormRequest
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
        return [
            'id' => ['required', 'string', 'max:50', 'alpha_dash', 'unique:tenants,id'],
            'name' => ['required', 'string', 'max:255'],
            'admin_name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:tenants,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'domain' => ['required', 'string', 'max:255'],
            'password' => ['nullable', 'string', 'min:6'],

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
            'id.required' => 'The Club ID / Tenant shortcode is required.',
            'id.alpha_dash' => 'The Club ID may only contain letters, numbers, dashes and underscores.',
            'id.unique' => 'A club with this ID already exists.',
            'name.required' => 'The club name is required.',
            'email.required' => 'The admin contact email is required.',
            'email.unique' => 'This email address is already registered with another club.',
            'domain.required' => 'The primary domain or subdomain is required.',
            'plan.required' => 'Please select a subscription plan (Trial, Monthly, Yearly, Lifetime).',
            'plan.in' => 'The selected subscription plan is invalid.',
            'hosting_cost.numeric' => 'Hosting cost must be a valid number.',
            'subscription_amount.numeric' => 'Subscription fee must be a valid number.',
        ];
    }
}
