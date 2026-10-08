<?php

namespace App\Enums;

enum TenantStatus: string
{
    case Active = 'active';
    case Trialing = 'trialing';
    case Suspended = 'suspended';
    case Expired = 'expired';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Active',
            self::Trialing => 'In Trial',
            self::Suspended => 'Suspended',
            self::Expired => 'Expired',
            self::Cancelled => 'Cancelled',
        };
    }

    public function badgeColor(): string
    {
        return match ($this) {
            self::Active => 'emerald',
            self::Trialing => 'blue',
            self::Suspended => 'amber',
            self::Expired => 'red',
            self::Cancelled => 'slate',
        };
    }
}
