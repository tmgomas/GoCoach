<?php

namespace App\Enums;

enum HostingProvider: string
{
    case DigitalOcean = 'digitalocean';
    case Aws = 'aws';
    case HerdLocal = 'herd_local';
    case CPanel = 'cpanel';
    case Hetzner = 'hetzner';
    case Linode = 'linode';
    case VpsOther = 'vps_other';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::DigitalOcean => 'DigitalOcean',
            self::Aws => 'Amazon Web Services (AWS)',
            self::HerdLocal => 'Laravel Herd (Local)',
            self::CPanel => 'cPanel / Shared Host',
            self::Hetzner => 'Hetzner Cloud',
            self::Linode => 'Linode / Akamai',
            self::VpsOther => 'Custom VPS',
            self::Other => 'Other Provider',
        };
    }
}
