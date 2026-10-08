<?php

use App\Models\Attendance;
use App\Models\Member;
use App\Models\Program;
use App\Models\User;
use App\Services\AttendanceService;
use Illuminate\Support\Carbon;
use Spatie\Permission\Models\Role;
use function Pest\Laravel\assertDatabaseHas;

beforeEach(function () {
    $this->artisan('migrate', ['--path' => 'database/migrations/tenant', '--database' => config('database.default')]);
    $this->attendanceService = app(AttendanceService::class);
});

it('can mark attendance manually via service', function () {
    $admin = User::factory()->create();
    $this->actingAs($admin);

    $member = Member::factory()->create(['status' => 'active']);
    $program = Program::factory()->create();
    $member->programs()->attach($program->id, ['status' => 'active', 'enrolled_at' => now()]);
    
    $attendance = $this->attendanceService->markManually($member, $program, 'Late arrival');
    
    expect($attendance)->toBeInstanceOf(Attendance::class);
    expect($attendance->method->value ?? $attendance->method)->toBe('manual');
    
    assertDatabaseHas('attendances', [
        'member_id' => $member->id,
        'program_id' => $program->id,
        'method' => 'manual'
    ]);
});

it('can fetch correct member statistics from service', function () {
    $admin = User::factory()->create();
    $member = Member::factory()->create(['status' => 'active']);
    $program = Program::factory()->create();
    
    Attendance::create([
        'member_id' => $member->id,
        'program_id' => $program->id,
        'check_in_time' => now()->subHours(2),
        'check_out_time' => now(),
        'method' => 'qr_code',
        'marked_by' => $admin->id,
    ]);
    
    $stats = $this->attendanceService->getMemberStatistics($member);
    
    expect($stats)->toBeArray();
    expect($stats['total_count'])->toBe(1);
    expect($stats['total_duration'])->toBeGreaterThan(0);
});

it('can check out a member via service', function () {
    $admin = User::factory()->create();
    $member = Member::factory()->create(['status' => 'active']);
    $program = Program::factory()->create();
    
    $attendance = Attendance::create([
        'member_id' => $member->id,
        'program_id' => $program->id,
        'check_in_time' => now()->subHour(),
        'method' => 'qr_code',
        'marked_by' => $admin->id,
    ]);
    
    $updatedAttendance = $this->attendanceService->checkOut($attendance);
    
    expect($updatedAttendance->check_out_time)->not->toBeNull();
});

it('toggles coach attendance correctly', function () {
    $coach = User::factory()->create();
    $member = Member::factory()->create(['status' => 'active', 'user_id' => $coach->id]);
    $program = Program::factory()->create();
    $member->programs()->attach($program->id, ['status' => 'active', 'enrolled_at' => now()]);
    
    // First toggle should check in
    $attendance = $this->attendanceService->toggleCoachAttendance($member, $program, $coach->id);
    expect($attendance->check_in_time)->not->toBeNull();
    expect($attendance->check_out_time)->toBeNull();
    
    // Second toggle should check out
    $updatedAttendance = $this->attendanceService->toggleCoachAttendance($member, $program, $coach->id);
    expect($updatedAttendance->check_out_time)->not->toBeNull();
});
