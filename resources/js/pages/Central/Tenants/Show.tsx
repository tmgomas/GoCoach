import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Building2,
    Server,
    CreditCard,
    UserCheck,
    Calendar,
    ArrowLeft,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Globe,
    ExternalLink,
    Edit,
    RefreshCw,
    Power,
    Users,
    Activity,
    Layers,
    Database,
} from 'lucide-react';

interface Domain {
    id: number;
    domain: string;
}

interface Tenant {
    id: string;
    name: string;
    admin_name?: string | null;
    email: string;
    phone?: string | null;
    status: string;
    plan: string;
    plan_status: string;
    subscription_amount: number | string;
    currency: string;
    trial_ends_at?: string | null;
    subscription_starts_at?: string | null;
    subscription_ends_at?: string | null;
    hosting_provider?: string | null;
    hosting_plan?: string | null;
    hosting_cost: number | string;
    hosting_renewal_date?: string | null;
    hosting_notes?: string | null;
    max_members: number;
    max_coaches: number;
    notes?: string | null;
    primary_domain?: string | null;
    days_until_hosting_renewal?: number | null;
    is_hosting_due_soon?: boolean;
    is_hosting_overdue?: boolean;
    days_until_sub_ends?: number | null;
    domains: Domain[];
    created_at: string;
}

interface TenantStats {
    members_count: number;
    coaches_count: number;
    payments_count: number;
    is_database_connected: boolean;
    error?: string;
}

interface Props {
    tenant: Tenant;
    tenantStats: TenantStats;
}

export default function Show({ tenant, tenantStats }: Props) {
    const domain = tenant.primary_domain || tenant.domains?.[0]?.domain;
    const [renewModalOpen, setRenewModalOpen] = useState(false);
    const [renewPeriod, setRenewPeriod] = useState('1_year');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirmRenewHosting = () => {
        setIsSubmitting(true);
        router.post(
            route('central.tenants.renew-hosting', tenant.id),
            { period: renewPeriod },
            {
                onSuccess: () => setRenewModalOpen(false),
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    const handleToggleStatus = () => {
        if (confirm(`Change status of ${tenant.name}?`)) {
            router.patch(route('central.tenants.toggle-status', tenant.id));
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'SaaS Super Admin', href: '/saas-admin/tenants' },
                { title: tenant.name },
            ]}
        >
            <Head title={`${tenant.name} - SaaS Club Details`} />

            <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
                {/* Header with Quick Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <Link href={route('central.tenants.index')}>
                            <Button variant="ghost" size="icon" className="size-9">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-2xl font-bold tracking-tight">{tenant.name}</h1>
                                {tenant.status === 'active' ? (
                                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200">
                                        Active
                                    </Badge>
                                ) : (
                                    <Badge variant="destructive">{tenant.status}</Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                                Tenant ID: {tenant.id} • DB: tenant{tenant.id}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {domain && (
                            <a
                                href={`http://${domain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button variant="outline" size="sm" className="gap-1.5">
                                    <Globe className="size-3.5 text-primary" />
                                    Visit Site
                                    <ExternalLink className="size-3 text-muted-foreground" />
                                </Button>
                            </a>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-900/40 dark:hover:bg-amber-950/20"
                            onClick={() => setRenewModalOpen(true)}
                        >
                            <RefreshCw className="size-3.5" />
                            Renew Hosting
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleToggleStatus}
                            className="gap-1.5"
                        >
                            <Power className="size-3.5" />
                            {tenant.status === 'active' ? 'Suspend' : 'Activate'}
                        </Button>
                        <Link href={route('central.tenants.edit', tenant.id)}>
                            <Button size="sm" className="gap-1.5">
                                <Edit className="size-3.5" />
                                Edit Club
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Live Database Health Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <Card className="shadow-xs border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Database Health</CardTitle>
                            <Database className="size-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <span className={`size-2.5 rounded-full ${tenantStats.is_database_connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                <span className="text-base font-semibold">
                                    {tenantStats.is_database_connected ? 'Connected' : 'Unavailable'}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 font-mono">
                                tenant{tenant.id}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xs border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Registered Members</CardTitle>
                            <Users className="size-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{tenantStats.members_count}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Quota: {tenant.max_members} max
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xs border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Coaches</CardTitle>
                            <UserCheck className="size-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{tenantStats.coaches_count}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Quota: {tenant.max_coaches} max
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xs border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Payments Processed</CardTitle>
                            <Activity className="size-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{tenantStats.payments_count}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Tenant fee records
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Details 2-Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Subscription Card */}
                    <Card className="shadow-xs border-sidebar-border">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="size-5 text-primary" />
                                    <CardTitle className="text-base font-semibold">Subscription & Plan</CardTitle>
                                </div>
                                <Badge variant="secondary" className="capitalize">
                                    {tenant.plan}
                                </Badge>
                            </div>
                            <CardDescription>
                                Client subscription details, billing terms, and renewal cycles.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3.5 text-sm">
                            <div className="flex justify-between py-2 border-b border-sidebar-border">
                                <span className="text-muted-foreground">Subscription Fee:</span>
                                <span className="font-semibold text-foreground">
                                    {tenant.currency} {Number(tenant.subscription_amount || 0).toLocaleString()}
                                </span>
                            </div>

                            <div className="flex justify-between py-2 border-b border-sidebar-border">
                                <span className="text-muted-foreground">Status:</span>
                                <span className="capitalize font-medium text-foreground">{tenant.plan_status}</span>
                            </div>

                            <div className="flex justify-between py-2 border-b border-sidebar-border">
                                <span className="text-muted-foreground">Contract Started:</span>
                                <span className="text-foreground">{tenant.subscription_starts_at || 'Not set'}</span>
                            </div>

                            {tenant.plan === 'trial' ? (
                                <div className="flex justify-between py-2 border-b border-sidebar-border">
                                    <span className="text-muted-foreground">Trial Ends At:</span>
                                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                                        {tenant.trial_ends_at || 'Not set'}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex justify-between py-2 border-b border-sidebar-border">
                                    <span className="text-muted-foreground">Next Subscription Renewal:</span>
                                    <span className="font-semibold text-foreground">
                                        {tenant.subscription_ends_at || 'Lifetime / Ongoing'}
                                    </span>
                                </div>
                            )}

                            {tenant.days_until_sub_ends !== null && (
                                <div className="flex justify-between py-2">
                                    <span className="text-muted-foreground">Subscription Countdown:</span>
                                    <span className="font-medium text-foreground">
                                        {tenant.days_until_sub_ends >= 0
                                            ? `${tenant.days_until_sub_ends} days remaining`
                                            : `Expired ${Math.abs(tenant.days_until_sub_ends)} days ago`}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Hosting & Infrastructure Card */}
                    <Card className="shadow-xs border-sidebar-border">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Server className="size-5 text-primary" />
                                    <CardTitle className="text-base font-semibold">Server Hosting & Infrastructure</CardTitle>
                                </div>
                                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
                                    {tenant.hosting_provider || 'Local'}
                                </span>
                            </div>
                            <CardDescription>
                                Infrastructure host, renewal schedule, and server maintenance notes.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3.5 text-sm">
                            <div className="flex justify-between py-2 border-b border-sidebar-border">
                                <span className="text-muted-foreground">Hosting Provider:</span>
                                <span className="font-semibold text-foreground">{tenant.hosting_provider || 'Not configured'}</span>
                            </div>

                            <div className="flex justify-between py-2 border-b border-sidebar-border">
                                <span className="text-muted-foreground">Package / Plan:</span>
                                <span className="text-foreground">{tenant.hosting_plan || 'Standard'}</span>
                            </div>

                            <div className="flex justify-between py-2 border-b border-sidebar-border">
                                <span className="text-muted-foreground">Hosting Renewal Due Date:</span>
                                <div className="text-right">
                                    <span className="font-semibold text-foreground">
                                        {tenant.hosting_renewal_date || 'Not set'}
                                    </span>
                                    {tenant.is_hosting_overdue && (
                                        <p className="text-xs text-red-500 font-medium">Overdue!</p>
                                    )}
                                    {tenant.is_hosting_due_soon && (
                                        <p className="text-xs text-amber-500 font-medium">Due in {tenant.days_until_hosting_renewal} days</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between py-2 border-b border-sidebar-border">
                                <span className="text-muted-foreground">Hosting Cost:</span>
                                <span className="text-foreground">
                                    {tenant.currency} {Number(tenant.hosting_cost || 0).toLocaleString()}
                                </span>
                            </div>

                            {tenant.hosting_notes && (
                                <div className="pt-2">
                                    <span className="text-xs font-medium text-muted-foreground">Server Notes:</span>
                                    <p className="text-xs bg-muted/50 p-2.5 rounded-md mt-1 font-mono text-foreground break-all">
                                        {tenant.hosting_notes}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Contact and Domain Summary Card */}
                <Card className="shadow-xs border-sidebar-border">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Globe className="size-5 text-primary" />
                            <CardTitle className="text-base font-semibold">Domain & Contact Information</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="rounded-lg bg-muted/40 p-3">
                                <span className="text-xs text-muted-foreground block">Primary Domain:</span>
                                <span className="font-medium text-foreground block mt-0.5">
                                    {domain ? `http://${domain}` : 'None'}
                                </span>
                            </div>

                            <div className="rounded-lg bg-muted/40 p-3">
                                <span className="text-xs text-muted-foreground block">Admin Contact Email:</span>
                                <span className="font-medium text-foreground block mt-0.5">{tenant.email}</span>
                            </div>

                            <div className="rounded-lg bg-muted/40 p-3">
                                <span className="text-xs text-muted-foreground block">Contact Phone:</span>
                                <span className="font-medium text-foreground block mt-0.5">{tenant.phone || 'Not provided'}</span>
                            </div>
                        </div>

                        {tenant.notes && (
                            <div className="pt-2">
                                <span className="text-xs font-medium text-muted-foreground">Contract / Internal Notes:</span>
                                <p className="text-xs bg-muted/30 p-3 rounded-md mt-1 text-muted-foreground">
                                    {tenant.notes}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Renew Hosting Modal */}
            <Dialog open={renewModalOpen} onOpenChange={setRenewModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Server className="size-5 text-primary" />
                            Renew Hosting Contract
                        </DialogTitle>
                        <DialogDescription>
                            Extend server hosting and domain renewal for <strong>{tenant.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-1.5 border">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Current Renewal Date:</span>
                                <span className="font-medium text-foreground">
                                    {tenant.hosting_renewal_date || 'Not set'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Extend Contract Duration</label>
                            <Select value={renewPeriod} onValueChange={setRenewPeriod}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select renewal period" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1_month">Extend by 1 Month</SelectItem>
                                    <SelectItem value="3_months">Extend by 3 Months</SelectItem>
                                    <SelectItem value="6_months">Extend by 6 Months</SelectItem>
                                    <SelectItem value="1_year">Extend by 1 Year (Standard)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRenewModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmRenewHosting} disabled={isSubmitting}>
                            {isSubmitting ? 'Updating...' : 'Confirm Renewal'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
