<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LocationController extends Controller
{
    public function index(): Response
    {
        $locations = Location::with(['manager:id,name,email'])
            ->withCount(['programs', 'members', 'payments', 'attendances', 'specialBookings'])
            ->orderBy('name')
            ->get();

        $managers = User::select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Locations/Index', [
            'locations' => $locations,
            'managers' => $managers,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:locations,name',
            'code' => 'nullable|string|max:50',
            'description' => 'nullable|string|max:1000',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:255',
            'manager_id' => 'nullable|exists:users,id',
            'is_active' => 'boolean',
        ]);

        Location::create($validated);

        return back()->with('success', 'Branch / Location created successfully.');
    }

    public function update(Request $request, Location $location): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:locations,name,'.$location->id,
            'code' => 'nullable|string|max:50',
            'description' => 'nullable|string|max:1000',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:255',
            'manager_id' => 'nullable|exists:users,id',
            'is_active' => 'boolean',
        ]);

        $location->update($validated);

        return back()->with('success', 'Branch / Location updated successfully.');
    }

    public function destroy(Location $location)
    {
        if ($location->programs()->count() > 0) {
            return back()->with('error', 'Cannot delete branch with active sports/programs assigned.');
        }

        if ($location->members()->count() > 0) {
            return back()->with('error', 'Cannot delete branch with active members assigned. Please transfer them first.');
        }

        $location->delete();

        return back()->with('success', 'Branch / Location deleted successfully.');
    }
}
