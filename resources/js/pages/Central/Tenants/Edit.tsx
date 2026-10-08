import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
    Check,
    Save,
    Globe,
    Layers,
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
    domain?: string | null;
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
    domains: Domain[];
}

interface Props {
    tenant: Tenant;
    plans: { value: string; label: string; badgeColor: string }[];
    statuses: { value: string; label: string; badgeColor: string }[];
    hostingProviders: { value: string; label: string }[];
}

export default function Edit({ tenant, plans, statuses, hostingProviders }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: tenant.name || '',
        admin_name: tenant.admin_name || '',
        email: tenant.email || '',
        phone: tenant.phone || '',
        domain: tenant.domain || tenant.domains?.[0]?.domain || '',
        status: tenant.status || 'active',

        // Subscription
        plan: tenant.plan || 'trial',
        plan_status: tenant.plan_status || 'active',
        subscription_amount: tenant.subscription_amount ? String(tenant.subscription_amount) : '0',
        currency: tenant.currency || 'LKR',
        trial_ends_at: tenant.trial_ends_at || '',
        subscription_starts_at: tenant.subscription_starts_at || '',
        subscription_ends_at: tenant.subscription_ends_at || '',

        // Hosting
        hosting_provider: tenant.hosting_provider || 'herd_local',
        hosting_plan: tenant.hosting_plan || '',
        hosting_cost: tenant.hosting_cost ? String(tenant.hosting_cost) : '0',
        hosting_renewal_date: tenant.hosting_renewal_date || '',
        hosting_notes: tenant.hosting_notes || '',

        // Quotas
        max_members: tenant.max_members || 500,
        max_coaches: tenant.max_coaches || 20,
        notes: tenant.notes || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('central.tenants.update', tenant.id));
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'SaaS Super Admin', href: '/saas-admin/tenants' },
                { title: tenant.name, href: route('central.tenants.show', tenant.id) },
                { title: 'Edit Settings' },
            ]}
        >
            <Head title={`Edit ${tenant.name} - SaaS Admin`} />

            <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Link href={route('central.tenants.index')}>
                                <Button variant="ghost" size="icon" className="size-8">
                                    <ArrowLeft className="size-4" />
                                </Button>
                            </Link>
                            <h1 className="text-2xl font-bold tracking-tight">Edit Club: {tenant.name}</h1>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 ml-10">
                            Update domain routing, subscription packages, and server hosting renewal schedules.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Section 1: Club Identity & Domain */}
                    <Card className="shadow-xs border-sidebar-border">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Building2 className="size-5 text-primary" />
                                <CardTitle className="text-base font-semibold">1. Club Identity & Domain</CardTitle>
                            </div>
                            <CardDescription>
                                System ID: <code className="font-mono text-foreground font-semibold">{tenant.id}</code> (Database: <code>tenant{tenant.id}</code>)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="name">Club Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1.5"
                                        required
                                    />
                                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="domain">Primary Domain <span className="text-red-500">*</span></Label>
                                    <div className="relative mt-1.5">
                                        <Globe className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                        <Input
                                            id="domain"
                                            value={data.domain}
                                            onChange={(e) => setData('domain', e.target.value)}
                                            className="pl-9"
                                            required
                                        />
                                    </div>
                                    {errors.domain && <p className="text-xs text-red-500 mt-1">{errors.domain}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="status">Club Status</Label>
                                    <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                        <SelectTrigger className="mt-1.5">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="suspended">Suspended</SelectItem>
                                            <SelectItem value="archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="phone">Contact Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="+94 77 123 4567"
                                        className="mt-1.5"
                                    />
                                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="admin_name">Primary Contact Person</Label>
                                    <Input
                                        id="admin_name"
                                        value={data.admin_name}
                                        onChange={(e) => setData('admin_name', e.target.value)}
                                        className="mt-1.5"
                                    />
                                    {errors.admin_name && <p className="text-xs text-red-500 mt-1">{errors.admin_name}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 2: Subscription & Billing Plan */}
                    <Card className="shadow-xs border-sidebar-border">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <CreditCard className="size-5 text-primary" />
                                <CardTitle className="text-base font-semibold">2. Subscription & Billing Plan</CardTitle>
                            </div>
                            <CardDescription>
                                Manage client contract plan, billing frequency, and renewal schedule.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <div>
                                    <Label htmlFor="plan">Subscription Plan</Label>
                                    <Select value={data.plan} onValueChange={(val) => setData('plan', val)}>
                                        <SelectTrigger className="mt-1.5">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {plans.map((p) => (
                                                <SelectItem key={p.value} value={p.value}>
                                                    {p.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="plan_status">Plan Status</Label>
                                    <Select value={data.plan_status} onValueChange={(val) => setData('plan_status', val)}>
                                        <SelectTrigger className="mt-1.5">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="trialing">In Trial</SelectItem>
                                            <SelectItem value="past_due">Past Due</SelectItem>
                                            <SelectItem value="suspended">Suspended</SelectItem>
                                            <SelectItem value="expired">Expired</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="subscription_amount">Subscription Fee</Label>
                                    <Input
                                        id="subscription_amount"
                                        type="number"
                                        step="0.01"
                                        value={data.subscription_amount}
                                        onChange={(e) => setData('subscription_amount', e.target.value)}
                                        className="mt-1.5"
                                    />
                                    {errors.subscription_amount && <p className="text-xs text-red-500 mt-1">{errors.subscription_amount}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="currency">Currency</Label>
                                    <Select value={data.currency} onValueChange={(val) => setData('currency', val)}>
                                        <SelectTrigger className="mt-1.5">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LKR">LKR (Sri Lankan Rupee)</SelectItem>
                                            <SelectItem value="USD">USD (US Dollar)</SelectItem>
                                            <SelectItem value="EUR">EUR (Euro)</SelectItem>
                                            <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                                            <SelectItem value="AED">AED (Emirati Dirham)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                                <div>
                                    <Label htmlFor="subscription_starts_at">Subscription Start Date</Label>
                                    <Input
                                        id="subscription_starts_at"
                                        type="date"
                                        value={data.subscription_starts_at}
                                        onChange={(e) => setData('subscription_starts_at', e.target.value)}
                                        className="mt-1.5"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="trial_ends_at">Trial Expiry Date (if on trial)</Label>
                                    <Input
                                        id="trial_ends_at"
                                        type="date"
                                        value={data.trial_ends_at}
                                        onChange={(e) => setData('trial_ends_at', e.target.value)}
                                        className="mt-1.5"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="subscription_ends_at">Subscription Renewal / Expiry</Label>
                                    <Input
                                        id="subscription_ends_at"
                                        type="date"
                                        value={data.subscription_ends_at}
                                        onChange={(e) => setData('subscription_ends_at', e.target.value)}
                                        className="mt-1.5"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 3: Hosting & Renewal Tracking */}
                    <Card className="shadow-xs border-sidebar-border">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Server className="size-5 text-primary" />
                                <CardTitle className="text-base font-semibold">3. Server Hosting & Renewal</CardTitle>
                            </div>
                            <CardDescription>
                                Track hosting providers, renewal due dates, and server infrastructure specs.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="hosting_provider">Hosting Provider</Label>
                                    <Select
                                        value={data.hosting_provider}
                                        onValueChange={(val) => setData('hosting_provider', val)}
                                    >
                                        <SelectTrigger className="mt-1.5">
                                            <SelectValue placeholder="Select provider" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {hostingProviders.map((p) => (
                                                <SelectItem key={p.value} value={p.value}>
                                                    {p.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="hosting_plan">Hosting Plan / Size</Label>
                                    <Input
                                        id="hosting_plan"
                                        value={data.hosting_plan}
                                        onChange={(e) => setData('hosting_plan', e.target.value)}
                                        className="mt-1.5"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="hosting_renewal_date" className="text-foreground font-semibold flex items-center gap-1.5">
                                        <Calendar className="size-4 text-primary" />
                                        Hosting Renewal Due Date
                                    </Label>
                                    <Input
                                        id="hosting_renewal_date"
                                        type="date"
                                        value={data.hosting_renewal_date}
                                        onChange={(e) => setData('hosting_renewal_date', e.target.value)}
                                        className="mt-1.5 font-medium border-primary/40 focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                                <div>
                                    <Label htmlFor="hosting_cost">Hosting Cost ({data.currency})</Label>
                                    <Input
                                        id="hosting_cost"
                                        type="number"
                                        step="0.01"
                                        value={data.hosting_cost}
                                        onChange={(e) => setData('hosting_cost', e.target.value)}
                                        className="mt-1.5"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <Label htmlFor="hosting_notes">Server Notes & Credentials Info</Label>
                                    <Input
                                        id="hosting_notes"
                                        value={data.hosting_notes}
                                        onChange={(e) => setData('hosting_notes', e.target.value)}
                                        placeholder="Server IP, Droplet ID, DNS records, backup notes"
                                        className="mt-1.5"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 4: Quotas & Notes */}
                    <Card className="shadow-xs border-sidebar-border">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Layers className="size-5 text-primary" />
                                <CardTitle className="text-base font-semibold">4. Quotas & Contract Notes</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="max_members">Maximum Members Quota</Label>
                                    <Input
                                        id="max_members"
                                        type="number"
                                        value={data.max_members}
                                        onChange={(e) => setData('max_members', parseInt(e.target.value) || 0)}
                                        className="mt-1.5"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="max_coaches">Maximum Coaches Quota</Label>
                                    <Input
                                        id="max_coaches"
                                        type="number"
                                        value={data.max_coaches}
                                        onChange={(e) => setData('max_coaches', parseInt(e.target.value) || 0)}
                                        className="mt-1.5"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="notes">Internal Admin Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    className="mt-1.5"
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Link href={route('central.tenants.index')}>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing} className="gap-2 px-6">
                            <Save className="size-4" />
                            {processing ? 'Saving Changes...' : 'Save Settings'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
