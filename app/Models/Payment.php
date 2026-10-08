<?php

namespace App\Models;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'member_id',
        'program_id',
        'location_id',
        'type',
        'amount',
        'month_year',
        'months_count',
        'status',
        'due_date',
        'paid_date',
        'payment_method',
        'receipt_url',
        'reference_number',
        'receipt_number',
        'notes',
        'verified_by',
        'verified_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'months_count' => 'integer',
        'due_date' => 'date',
        'paid_date' => 'date',
        'verified_at' => 'datetime',
        'type' => PaymentType::class,
        'status' => PaymentStatus::class,
        'payment_method' => PaymentMethod::class,
    ];

    protected static function booted(): void
    {
        static::creating(function (Payment $payment): void {
            if (empty($payment->location_id) && $payment->member_id) {
                $member = $payment->member ?? Member::find($payment->member_id);
                if ($member && $member->location_id) {
                    $payment->location_id = $member->location_id;
                } elseif ($payment->program_id) {
                    $program = $payment->program ?? Program::find($payment->program_id);
                    if ($program && $program->location_id) {
                        $payment->location_id = $program->location_id;
                    }
                }
            }
        });
    }

    // Relationships
    public function location(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function member(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function program(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function verifiedBy(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function schedules()
    {
        return $this->hasMany(MemberPaymentSchedule::class);
    }

    public function items()
    {
        return $this->hasMany(PaymentItem::class);
    }

    public function onlineTransactions()
    {
        return $this->hasMany(OnlinePaymentTransaction::class);
    }

    public function latestOnlineTransaction()
    {
        return $this->hasOne(OnlinePaymentTransaction::class)->latestOfMany();
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopeVerified($query)
    {
        return $query->where('status', 'verified');
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'pending')
            ->where('due_date', '<', now());
    }

    // Accessors
    public function getIsOverdueAttribute()
    {
        return $this->status === 'pending' && $this->due_date < now();
    }
}
