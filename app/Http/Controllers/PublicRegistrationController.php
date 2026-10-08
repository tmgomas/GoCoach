<?php

namespace App\Http\Controllers;

use App\Models\Program;
use App\Services\MemberService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicRegistrationController extends Controller
{
    public function __construct(
        protected MemberService $memberService
    ) {}

    public function create()
    {
        $programs = Program::where('is_active', true)->get();

        return Inertia::render('Public/Registration', [
            'programs' => $programs,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'calling_name' => 'nullable|string|max:50',
            'email' => 'required|email|unique:members,email|max:255',
            'nic_passport' => 'required|unique:members,nic_passport|max:20',
            'date_of_birth' => 'required|date|before:today',
            'gender' => 'required|in:male,female,other',
            'contact_number' => 'required|string|max:20',
            'address' => 'required|string',
            'emergency_contact' => 'required|string|max:100',
            'emergency_number' => 'required|string|max:20',
            'program_ids' => 'required|array|min:1',
            'program_ids.*' => 'exists:programs,id',
        ]);

        $member = $this->memberService->register($validated);

        return redirect()->route('registration.success')
            ->with('success', 'Registration submitted successfully. Your member number is: '.$member->member_number);
    }

    public function success()
    {
        return Inertia::render('Public/RegistrationSuccess');
    }
}
