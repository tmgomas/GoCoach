<?php

namespace App\Models;

use App\Enums\AttendanceMethod;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'member_id',
        'program_id',
        'location_id',
        'check_in_time',
        'check_out_time',
        'duration_minutes',
        'marked_by',
        'method',
        'notes',
    ];

    protected $casts = [
        'check_in_time' => 'datetime',
        'check_out_time' => 'datetime',
        'duration_minutes' => 'integer',
        'method' => AttendanceMethod::class,
    ];

    protected static function booted(): void
    {
        static::creating(function (Attendance $attendance): void {
            if (empty($attendance->location_id)) {
                if ($attendance->program_id) {
                    $program = $attendance->program ?? Program::find($attendance->program_id);
                    if ($program && $program->location_id) {
                        $attendance->location_id = $program->location_id;
                    }
                }
                if (empty($attendance->location_id) && $attendance->member_id) {
                    $member = $attendance->member ?? Member::find($attendance->member_id);
                    if ($member && $member->location_id) {
                        $attendance->location_id = $member->location_id;
                    }
                }
            }
        });
    }

    // Relationships
    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function markedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'marked_by');
    }

    // Scopes
    public function scopeToday($query)
    {
        return $query->whereDate('check_in_time', today());
    }

    public function scopeForProgram($query, $programId)
    {
        return $query->where('program_id', $programId);
    }

    public function scopeForMember($query, $memberId)
    {
        return $query->where('member_id', $memberId);
    }

    public function scopeByMethod($query, $method)
    {
        return $query->where('method', $method);
    }

    // Mutators
    public function setCheckOutTimeAttribute($value)
    {
        $this->attributes['check_out_time'] = $value;

        if ($value && $this->check_in_time) {
            $this->attributes['duration_minutes'] = $this->check_in_time->diffInMinutes($value);
        }
    }
}
