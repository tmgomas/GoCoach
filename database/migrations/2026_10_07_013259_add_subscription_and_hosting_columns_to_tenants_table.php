<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('admin_name')->nullable()->after('name');
            $table->string('phone')->nullable()->after('email');
            $table->string('plan')->default('trial')->after('status'); // trial, monthly, yearly, lifetime, custom
            $table->string('plan_status')->default('active')->after('plan'); // active, trialing, past_due, suspended, expired, cancelled
            $table->decimal('subscription_amount', 10, 2)->default(0.00)->after('plan_status');
            $table->string('currency', 10)->default('LKR')->after('subscription_amount');
            $table->date('trial_ends_at')->nullable()->after('currency');
            $table->date('subscription_starts_at')->nullable()->after('trial_ends_at');
            $table->date('subscription_ends_at')->nullable()->after('subscription_starts_at');
            $table->string('hosting_provider')->nullable()->after('subscription_ends_at'); // digitalocean, aws, herd_local, cpanel, etc.
            $table->string('hosting_plan')->nullable()->after('hosting_provider');
            $table->decimal('hosting_cost', 10, 2)->default(0.00)->after('hosting_plan');
            $table->date('hosting_renewal_date')->nullable()->after('hosting_cost');
            $table->text('hosting_notes')->nullable()->after('hosting_renewal_date');
            $table->integer('max_members')->default(500)->after('hosting_notes');
            $table->integer('max_coaches')->default(20)->after('max_members');
            $table->text('notes')->nullable()->after('max_coaches');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn([
                'admin_name',
                'phone',
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
            ]);
        });
    }
};
