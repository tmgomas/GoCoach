<?php

namespace App\Enums;

enum TenantPlan: string
{
    case Trial = 'trial';
    case Monthly = 'monthly';
    case Yearly = 'yearly';
    case Lifetime = 'lifetime';
    case Custom = 'custom';

    public function label(): string
    {
        return match ($this) {
            self::Trial => 'Free Trial',
            self::Monthly => 'Monthly Subscription',
            self::Yearly => 'Yearly Subscription',
            self::Lifetime => 'One-time / Lifetime',
            self::Custom => 'Custom Plan',
        };
    }

    public function badgeColor(): string
    {
        return match ($this) {
            self::Trial => 'blue',
            self::Monthly => 'emerald',
            self::Yearly => 'purple',
            self::Lifetime => 'amber',
            self::Custom => 'slate',
        };
    }
}
