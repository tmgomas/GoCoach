import AuthLayout from '@/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import { Head, Link, usePage } from '@inertiajs/react';
import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function RegistrationSuccess() {
    const { flash } = usePage().props as any;

    return (
        <AuthLayout
            title="Registration Successful!"
            description="Your application has been received."
        >
            <Head title="Registration Success" />
            
            <div className="flex flex-col items-center justify-center space-y-6 py-6 text-center">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
                
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                        {flash?.success || 'Thank you for registering. An administrator will review your application and contact you soon.'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Once approved, you will receive an email with your login credentials.
                    </p>
                </div>

                <Button asChild className="w-full">
                    <Link href="/login">Return to Login</Link>
                </Button>
            </div>
        </AuthLayout>
    );
}
