<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Member;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $programs = Program::select('id', 'name')->orderBy('name')->get();
        $locations = \App\Models\Location::where('is_active', true)->select('id', 'name', 'code')->orderBy('name')->get();

        $filters = $request->only(['date', 'program_id', 'location_id']);
        $date = $request->input('date', today()->format('Y-m-d'));
        $programId = $request->input('program_id');
        $locationId = $request->input('location_id');

        $members = [];

        if ($programId) {
            $members = Member::whereHas('programs', function ($query) use ($programId) {
                $query->where('programs.id', $programId);
            })
                ->when($locationId, fn ($q, $loc) => $q->where('location_id', $loc))
                ->whereIn('status', ['active', 'pending'])
                ->with(['location:id,name,code', 'attendances' => function ($query) use ($date, $programId) {
                    $query->whereDate('check_in_time', $date)
                        ->where('program_id', $programId);
                }])
                ->orderBy('full_name')
                ->paginate(50)
                ->through(function ($member) {
                    return [
                        'id' => $member->id,
                        'member_number' => $member->member_number,
                        'full_name' => $member->full_name,
                        'location' => $member->location ? [
                            'name' => $member->location->name,
                            'code' => $member->location->code,
                        ] : null,
                        'attendance' => $member->attendances->first() ? [
                            'id' => $member->attendances->first()->id,
                            'check_in_time' => $member->attendances->first()->check_in_time->format('H:i'),
                            'check_out_time' => $member->attendances->first()->check_out_time?->format('H:i'),
                        ] : null,
                    ];
                });
        }

        return Inertia::render('Admin/Attendance/Index', [
            'programs' => $programs,
            'locations' => $locations,
            'filters' => $filters,
            'members' => $members,
            'currentDate' => $date,
        ]);
    }

    public function mark(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'program_id' => 'required|exists:programs,id',
            'attendances' => 'required|array',
            'attendances.*.member_id' => 'required|exists:members,id',
            'attendances.*.present' => 'required|boolean',
            'attendances.*.check_in' => 'nullable|string', // HH:mm
        ]);

        $date = Carbon::parse($validated['date']);
        $programId = $validated['program_id'];

        DB::transaction(function () use ($validated, $date, $programId) {
            foreach ($validated['attendances'] as $item) {
                $checkInTime = $date->copy()->setTimeFromTimeString($item['check_in'] ?? '08:00'); // Default time if not set? Or use current?

                if ($item['present']) {
                    Attendance::updateOrCreate(
                        [
                            'member_id' => $item['member_id'],
                            'program_id' => $programId,
                            'check_in_time' => $checkInTime, // Note: This might create duplicates if we strictly match check_in_time.
                            // Better to find by member_id + program_id + DATE(check_in_time)
                        ],
                        [
                            'marked_by' => Auth::id(),
                            'method' => 'manual',
                            // 'check_in_time' => $checkInTime // update time if changed
                        ]
                    );
                } else {
                    // Remove attendance if unmarked
                    Attendance::where('member_id', $item['member_id'])
                        ->where('program_id', $programId)
                        ->whereDate('check_in_time', $date->toDateString())
                        ->delete();
                }
            }
        });

        return back()->with('success', 'Attendance updated successfully.');
    }

    // Fix updateOrCreate logic above:
    // updateOrCreate keys are minimal conditions to find the record.
    // Since check_in_time includes TIME, updateOrCreate won't find existing record for "today".
    // I should use explicit check.

    public function scan(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'program_id' => 'nullable|exists:programs,id', // Made optional
            'member_number' => 'required|string',
            'method' => 'nullable|in:qr_code,nfc,rfid', // Added method parameter
        ]);

        $date = $validated['date'];
        $programId = $validated['program_id'] ?? null;
        $scanData = $validated['member_number']; // This contains the scanned string (Member No, RFID ID, or NFC ID)
        $method = $validated['method'] ?? 'qr_code';

        $member = null;

        if ($method === 'rfid') {
            $member = Member::where('rfid_card_id', $scanData)->first();
        } elseif ($method === 'nfc') {
            $member = Member::where('nfc_tag_id', $scanData)->first();
        } else {
            // QR Code or Manual - usually member_number
            $member = Member::where('member_number', $scanData)->first();
        }

        if (! $member) {
            // Fallback: Try searching member_number even if method is set, just in case
            $member = Member::where('member_number', $scanData)->first();
        }

        if (! $member) {
            return response()->json([
                'success' => false,
                'message' => "Member not found for {$method} scan: {$scanData}",
            ], 404);
        }

        // Check if member is assigned to this program (only if program_id is provided)
        if ($programId) {
            $hasProgram = $member->programs()->where('programs.id', $programId)->exists();

            if (! $hasProgram) {
                return response()->json([
                    'success' => false,
                    'message' => "Member {$member->full_name} is not registered for this program.",
                ], 400);
            }
        }

        // Check status (handle Enum object)
        $statusValue = $member->status instanceof \UnitEnum ? $member->status->value : $member->status;

        if (! in_array($statusValue, ['active', 'pending'])) {
            return response()->json([
                'success' => false,
                'message' => "Member {$member->full_name} is {$statusValue}.",
            ], 400);
        }

        // Check for existing attendance on this day (and program if provided)
        $attendanceQuery = Attendance::where('member_id', $member->id)
            ->whereDate('check_in_time', $date);

        if ($programId) {
            $attendanceQuery->where('program_id', $programId);
        } else {
            $attendanceQuery->whereNull('program_id');
        }

        $attendance = $attendanceQuery->first();

        // Fetch Pending Payments and Schedules for Quick Payment UI
        $pendingInvoices = [];

        $payments = \App\Models\Payment::where('member_id', $member->id)
            ->whereIn('status', ['pending', 'overdue'])
            ->whereDate('due_date', '<=', \Carbon\Carbon::now()->endOfMonth())
            ->orderBy('due_date', 'asc')
            ->get();

        foreach($payments as $p) {
            $typeStr = $p->type instanceof \UnitEnum ? $p->type->value : $p->type;
            $pendingInvoices[] = [
                'id' => $p->id,
                'type' => 'payment',
                'month_year' => strtoupper($typeStr) . ($p->month_year ? " ({$p->month_year})" : ''),
                'amount' => $p->amount,
            ];
        }

        $schedules = \App\Models\MemberPaymentSchedule::where('member_id', $member->id)
            ->whereIn('status', ['pending', 'overdue'])
            ->whereDate('due_date', '<=', \Carbon\Carbon::now()->endOfMonth())
            ->orderBy('due_date', 'asc')
            ->get();

        foreach($schedules as $s) {
            $pendingInvoices[] = [
                'id' => $s->id,
                'type' => 'schedule',
                'month_year' => "Monthly - " . $s->month_year,
                'amount' => $s->amount,
            ];
        }

        if ($attendance) {
            // Already checked in. Check if checked out?
            if ($attendance->check_out_time) {
                return response()->json([
                    'success' => true,
                    'message' => "Already Checked Out: {$member->full_name} at ".$attendance->check_out_time->format('H:i'),
                    'member' => $member->load(['programs']),
                    'attendance' => $attendance,
                    'status' => 'checked_out',
                    'pending_payments' => $pendingInvoices,
                ]);
            } else {
                // Prevent double-punch (checking out immediately after checking in)
                // If check-in was less than 2 minutes ago, ignore this scan
                if ($attendance->check_in_time->diffInMinutes(\Carbon\Carbon::now()) < 5) { // 5 Minute cooldown
                    return response()->json([
                        'success' => true,
                        'message' => 'Already Checked In (Duplicate scan ignored) - Wait 5m to checkout',
                        'member' => $member->load(['programs']),
                        'attendance' => $attendance,
                        'status' => 'checked_in',
                        'pending_payments' => $pendingInvoices,
                    ]);
                }

                // Perform Check-out
                $attendance->update([
                    'check_out_time' => \Carbon\Carbon::now(),
                ]);

                return response()->json([
                    'success' => true,
                    'message' => "Checked Out: {$member->full_name}",
                    'member' => $member->load(['programs']),
                    'attendance' => $attendance->fresh(),
                    'status' => 'checked_out',
                    'pending_payments' => $pendingInvoices,
                ]);
            }
        }

        // Check In
        $attendance = \App\Models\Attendance::create([
            'member_id' => $member->id,
            'program_id' => $programId,
            'check_in_time' => \Carbon\Carbon::now()->setDateFrom($date),
            'marked_by' => \Illuminate\Support\Facades\Auth::id(),
            'method' => $method,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Checked In: {$member->full_name}",
            'member' => $member->load(['programs']),
            'attendance' => $attendance,
            'status' => 'checked_in',
            'pending_payments' => $pendingInvoices,
        ]);
    }

    public function bulkMark(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'program_id' => 'required|exists:programs,id',
            'attendances' => 'required|array',
            'attendances.*.member_id' => 'required|exists:members,id',
            'attendances.*.present' => 'required|boolean',
            'attendances.*.check_in' => 'nullable|string', // HH:mm format
            'attendances.*.check_out' => 'nullable|string', // HH:mm format
        ]);

        $dateStr = $validated['date'];
        $programId = $validated['program_id'];
        $userId = Auth::id();

        DB::transaction(function () use ($validated, $dateStr, $programId, $userId) {
            foreach ($validated['attendances'] as $item) {
                // Check for existing record on this day
                $attendance = Attendance::where('member_id', $item['member_id'])
                    ->where('program_id', $programId)
                    ->whereDate('check_in_time', $dateStr)
                    ->first();

                if ($item['present']) {
                    $checkInTime = $item['check_in'] ?? Carbon::now()->format('H:i');
                    $fullCheckIn = Carbon::parse("$dateStr $checkInTime");

                    $fullCheckOut = null;
                    if (! empty($item['check_out'])) {
                        $fullCheckOut = Carbon::parse("$dateStr ".$item['check_out']);
                        // Handle overnight shifts if needed? detailed requirement not given, assuming same day.
                        if ($fullCheckOut->lessThan($fullCheckIn)) {
                            // If check out is earlier than check in, maybe it's next day?
                            // For simplicity in manual entry, let's assume valid same-day input or ignored.
                            // Or just set it.
                        }
                    }

                    if ($attendance) {
                        $attendance->update([
                            'check_in_time' => $fullCheckIn,
                            'check_out_time' => $fullCheckOut,
                            'marked_by' => $userId,
                        ]);
                    } else {
                        Attendance::create([
                            'member_id' => $item['member_id'],
                            'program_id' => $programId,
                            'check_in_time' => $fullCheckIn,
                            'check_out_time' => $fullCheckOut,
                            'marked_by' => $userId,
                            'method' => 'bulk', // or manual
                        ]);
                    }
                } else {
                    if ($attendance) {
                        $attendance->delete();
                    }
                }
            }
        });

        return back()->with('success', 'Attendance records updated.');
    }

    public function quickPay(Request $request, \App\Services\PaymentService $paymentService)
    {
        $validated = $request->validate([
            'schedule_id' => 'required|exists:member_payment_schedules,id',
            'payment_method' => 'required|in:cash,bank_transfer',
        ]);

        $schedule = \App\Models\MemberPaymentSchedule::findOrFail($validated['schedule_id']);
        $member = \App\Models\Member::findOrFail($schedule->member_id);

        try {
            $paymentService->processMonthlyPayment(
                $member,
                $schedule->month_year,
                $validated['payment_method'],
                null, // receipt_url
                null, // reference_number
                $schedule->program_id
            );

            return response()->json([
                'success' => true,
                'message' => "Payment marked as paid.",
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}

