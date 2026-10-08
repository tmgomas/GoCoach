import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';

interface Program {
    id: string;
    name: string;
}

export default function Registration({ programs }: { programs: Program[] }) {
    const { data, setData, post, processing, errors } = useForm({
        full_name: '',
        calling_name: '',
        email: '',
        nic_passport: '',
        date_of_birth: '',
        gender: '',
        contact_number: '',
        address: '',
        emergency_contact: '',
        emergency_number: '',
        program_ids: [] as string[],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/register');
    };

    const handleProgramChange = (programId: string, checked: boolean) => {
        if (checked) {
            setData('program_ids', [...data.program_ids, programId]);
        } else {
            setData('program_ids', data.program_ids.filter((id) => id !== programId));
        }
    };

    return (
        <AuthLayout
            title="Member Registration"
            description="Join our sports club by filling out the details below."
        >
            <Head title="Member Registration" />
            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-6">
                    {/* Personal Details */}
                    <div className="space-y-4">
                        <h3 className="font-semibold leading-none tracking-tight">Personal Details</h3>
                        
                        <div className="grid gap-2">
                            <Label htmlFor="full_name">Full Name</Label>
                            <Input
                                id="full_name"
                                type="text"
                                required
                                value={data.full_name}
                                onChange={(e) => setData('full_name', e.target.value)}
                                placeholder="Full legal name"
                            />
                            <InputError message={errors.full_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="calling_name">Calling Name (Optional)</Label>
                            <Input
                                id="calling_name"
                                type="text"
                                value={data.calling_name}
                                onChange={(e) => setData('calling_name', e.target.value)}
                                placeholder="Name you prefer to be called"
                            />
                            <InputError message={errors.calling_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="email@example.com"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="nic_passport">NIC / Passport</Label>
                            <Input
                                id="nic_passport"
                                type="text"
                                required
                                value={data.nic_passport}
                                onChange={(e) => setData('nic_passport', e.target.value)}
                                placeholder="National ID or Passport number"
                            />
                            <InputError message={errors.nic_passport} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="date_of_birth">Date of Birth</Label>
                                <Input
                                    id="date_of_birth"
                                    type="date"
                                    required
                                    value={data.date_of_birth}
                                    onChange={(e) => setData('date_of_birth', e.target.value)}
                                />
                                <InputError message={errors.date_of_birth} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="gender">Gender</Label>
                                <Select value={data.gender} onValueChange={(val) => setData('gender', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.gender} />
                            </div>
                        </div>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-4">
                        <h3 className="font-semibold leading-none tracking-tight">Contact Information</h3>
                        
                        <div className="grid gap-2">
                            <Label htmlFor="contact_number">Mobile Number</Label>
                            <Input
                                id="contact_number"
                                type="text"
                                required
                                value={data.contact_number}
                                onChange={(e) => setData('contact_number', e.target.value)}
                                placeholder="07XXXXXXXX"
                            />
                            <InputError message={errors.contact_number} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="address">Residential Address</Label>
                            <Input
                                id="address"
                                type="text"
                                required
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                placeholder="Full address"
                            />
                            <InputError message={errors.address} />
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="space-y-4">
                        <h3 className="font-semibold leading-none tracking-tight">Emergency Contact</h3>
                        
                        <div className="grid gap-2">
                            <Label htmlFor="emergency_contact">Contact Person Name</Label>
                            <Input
                                id="emergency_contact"
                                type="text"
                                required
                                value={data.emergency_contact}
                                onChange={(e) => setData('emergency_contact', e.target.value)}
                                placeholder="Parent, Guardian, or Spouse"
                            />
                            <InputError message={errors.emergency_contact} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="emergency_number">Emergency Phone Number</Label>
                            <Input
                                id="emergency_number"
                                type="text"
                                required
                                value={data.emergency_number}
                                onChange={(e) => setData('emergency_number', e.target.value)}
                                placeholder="07XXXXXXXX"
                            />
                            <InputError message={errors.emergency_number} />
                        </div>
                    </div>

                    {/* Programs */}
                    <div className="space-y-4">
                        <h3 className="font-semibold leading-none tracking-tight">Select Programs</h3>
                        <p className="text-sm text-muted-foreground">Choose the sports you wish to join.</p>
                        <div className="grid gap-3">
                            {programs.map((program) => (
                                <div key={program.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`program-${program.id}`}
                                        checked={data.program_ids.includes(program.id)}
                                        onCheckedChange={(checked) => handleProgramChange(program.id, checked as boolean)}
                                    />
                                    <Label htmlFor={`program-${program.id}`} className="font-normal cursor-pointer">
                                        {program.name}
                                    </Label>
                                </div>
                            ))}
                            <InputError message={errors.program_ids} />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="mt-4 w-full"
                        disabled={processing}
                    >
                        {processing && <Spinner />}
                        Submit Application
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Already a member?{' '}
                    <TextLink href="/login">
                        Log in here
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
