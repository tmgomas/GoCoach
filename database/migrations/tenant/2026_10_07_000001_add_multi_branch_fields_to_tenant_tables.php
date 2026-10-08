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
        // 1. Expand locations table with branch details
        Schema::table('locations', function (Blueprint $table) {
            $table->string('code', 50)->nullable()->after('name');
            $table->text('address')->nullable()->after('description');
            $table->string('phone', 30)->nullable()->after('address');
            $table->string('email')->nullable()->after('phone');
            $table->foreignUuid('manager_id')->nullable()->after('email')->constrained('users')->onDelete('set null');
        });

        // 2. Add student primary branch / location to members table
        Schema::table('members', function (Blueprint $table) {
            $table->foreignUuid('location_id')->nullable()->after('user_id')->constrained('locations')->onDelete('set null');
        });

        // 3. Add historical location snapshot to payments table
        Schema::table('payments', function (Blueprint $table) {
            $table->foreignUuid('location_id')->nullable()->after('program_id')->constrained('locations')->onDelete('set null');
        });

        // 4. Add location snapshot to attendances table
        Schema::table('attendances', function (Blueprint $table) {
            $table->foreignUuid('location_id')->nullable()->after('program_id')->constrained('locations')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropForeign(['location_id']);
            $table->dropColumn('location_id');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['location_id']);
            $table->dropColumn('location_id');
        });

        Schema::table('members', function (Blueprint $table) {
            $table->dropForeign(['location_id']);
            $table->dropColumn('location_id');
        });

        Schema::table('locations', function (Blueprint $table) {
            $table->dropForeign(['manager_id']);
            $table->dropColumn(['code', 'address', 'phone', 'email', 'manager_id']);
        });
    }
};
