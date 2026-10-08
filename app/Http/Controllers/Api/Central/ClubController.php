<?php

namespace App\Http\Controllers\Api\Central;

use App\Enums\TenantStatus;
use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;

class ClubController extends Controller
{
    /**
     * Get a list of all active clubs (tenants) for the mobile app.
     */
    public function index(Request $request)
    {
        $scheme = $request->getScheme(); // 'http' or 'https'

        $clubs = Tenant::where('status', TenantStatus::Active)
            ->with('domains')
            ->get()
            ->map(function ($tenant) use ($scheme) {
                $domain = $tenant->primary_domain;

                return [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'domain' => $domain,
                    'baseUrl' => $domain ? "{$scheme}://{$domain}/api" : null,
                ];
            })
            ->filter(fn ($club) => $club['baseUrl'] !== null)
            ->values();

        return response()->json([
            'clubs' => $clubs,
        ]);
    }
}
