import React, { useState, useEffect } from 'react';
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
    Sparkles,
    Shield,
    Globe,
    Layers,
} from 'lucide-react';

interface Props {
    plans: { value: string; label: string; badgeColor: string }[];
    statuses: { value: string; label: string; badgeColor: string }[];
    hostingProviders: { value: string; label: string }[];
}

export default function Create({ plans, statuses, hostingProviders }: Props) {
    const today = new Date().toISOString().split('T')[0];

    // Calculate dates helper
    const addDays = (days: number) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        return d.toISOString().split('T')[0];
    };

    const addMonths = (months: number) => {
        const d = new Date();
        d.setMonth(d.getMonth() + months);
        return d.toISOString().split('T')[0];
    };

    const addYears = (years: number) => {
        const d = new Date();
        d.setFullYear(d.getFullYear() + years);
        return d.toISOString().split('T')[0];
    };

    const { data, setData, post, processing, errors } = useForm({
        id: '',
        name: '',
        admin_name: '',
        email: '',
        phone: '',
        domain: '',
        password: 'password',

        // Subscription
        plan: 'trial',
        plan_status: 'trialing',
        subscription_amount: '0',
        currency: 'LKR',
        trial_ends_at: addDays(14),
        subscription_starts_at: today,
        subscription_ends_at: '',

        // Hosting
        hosting_provider: 'herd_local',
        hosting_plan: 'Herd Local / Development',
        hosting_cost: '0',
        hosting_renewal_date: addYears(1),
        hosting_notes: '',

        // Quotas
        max_members: 500,
        max_coaches: 20,
        notes: '',
    });

    const [isCustomId, setIsCustomId] = useState(false);

    // Auto-generate shortcode / ID and domain from name
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const newSlug = name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .slice(0, 30);

        setData((prev) => ({
            ...prev,
            name,
            id: isCustomId ? prev.id : newSlug,
            domain: isCustomId ? prev.domain : (newSlug ? `${newSlug}.test` : ''),
            admin_name: prev.admin_name === '' || prev.admin_name === `${prev.name} Admin`
                ? (name ? `${name} Admin` : '')
                : prev.admin_name,
        }));
    };

    // Auto-update dates when plan changes
    const handlePlanChange = (plan: string) => {
        let trialEndsAt = '';
        let subEndsAt = '';
        let status = 'active';
        let defaultAmount = data.subscription_amount;

        if (plan === 'trial') {
            status = 'trialing';
            trialEndsAt = addDays(14);
            defaultAmount = '0';
        } else if (plan === 'monthly') {
            subEndsAt = addMonths(1);
            if (defaultAmount === '0') defaultAmount = '15000';
        } else if (plan === 'yearly') {
            subEndsAt = addYears(1);
            if (defaultAmount === '0') defaultAmount = '150000';
        } else if (plan === 'lifetime') {
            subEndsAt = '';
            if (defaultAmount === '0') defaultAmount = '450000';
        }

        setData((prev) => ({
            ...prev,
            plan,
            plan_status: status,
            trial_ends_at: trialEndsAt,
            subscription_ends_at: subEndsAt,
            subscription_amount: defaultAmount,
        }));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('central.tenants.store'));
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'SaaS Super Admin', href: '/saas-admin/tenants' },
                { title: 'Register New Club' },
            ]}
        >
            <Head title="Register New Club - SaaS Admin" />

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
                            <h1 className="text-2xl font-bold tracking-tight">Register a New Sports Club</h1>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 ml-10">
                            Configure club tenant database, custom domain, subscription plan, and server hosting details.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Section 1: Club Identity & Domain */}
                    <Card className="shadow-xs border-sidebar-border">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Building2 className="size-5 text-primary" />
                                <CardTitle className="text-base font-semibold">1. Club Identity & Custom Domain</CardTitle>
                            </div>
                            <CardDescription>
                                Set the official club name, tenant identifier, and primary access domain.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Club Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={handleNameChange}
                                        placeholder="e.g. Colombo Royal Aquatic Club"
                                        className="mt-1.5"
                                        required
                                    />
                                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="id">Tenant ID (Shortcode) <span className="text-red-500">*</span></Label>
                                        <button
                                            type="button"
                                            onClick={() => setIsCustomId(!isCustomId)}
                                            className="text-xs text-primary hover:underline"
                                        >
                                            {isCustomId ? 'Auto-generate' : 'Custom edit'}
                                        </button>
                                    </div>
                                    <Input
                                        id="id"
                                        value={data.id}
                                        onChange={(e) => {
                                            setIsCustomId(true);
                                            setData('id', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''));
                                        }}
                                        placeholder="e.g. royalclub"
                                        className="mt-1.5 font-mono"
                                        required
                                    />
                                    <p className="text-[11px] text-muted-foreground mt-1">
                                        Used for dedicated MySQL database (<code>tenant{data.id || 'id'}</code>).
                                    </p>
                                    {errors.id && <p className="text-xs text-red-500 mt-1">{errors.id}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="domain">Primary Domain / Subdomain <span className="text-red-500">*</span></Label>
                                    <div className="relative mt-1.5">
                                        <Globe className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                        <Input
                                            id="domain"
                                            value={data.domain}
                                            onChange={(e) => setData('domain', e.target.value)}
                                            placeholder="e.g. royalclub.test or royalclub.com"
                                            className="pl-9"
                                            required
                                        />
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-1">
                                        For local Herd testing, use <code>{data.id || 'club'}.test</code>.
                                    </p>
                                    {errors.domain && <p className="text-xs text-red-500 mt-1">{errors.domain}</p>}
                                </div>

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
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 2: Club Admin Account */}
                    <Card className="shadow-xs border-sidebar-border">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <UserCheck className="size-5 text-primary" />
                                <CardTitle className="text-base font-semibold">2. Initial Club Administrator</CardTitle>
                            </div>
                            <CardDescription>
                                This user will be seeded automatically into the new tenant database with full Admin rights.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="admin_name">Admin Full Name</Label>
                                    <Input
                                        id="admin_name"
                                        value={data.admin_name}
                                        onChange={(e) => setData('admin_name', e.target.value)}
                                        placeholder="e.g. John Perera"
                                        className="mt-1.5"
                                    />
                                    {errors.admin_name && <p className="text-xs text-red-500 mt-1">{errors.admin_name}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="email">Admin Email <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="admin@royalclub.com"
                                        className="mt-1.5"
                                        required
                                    />
                                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="password">Initial Password</Label>
                                    <Input
                                        id="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="password"
                                        className="mt-1.5"
                                    />
                                    <p className="text-[11px] text-muted-foreground mt-1">
                                        Default is <code>password</code>. User can change later.
                                    </p>
                                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 3: Subscription & Billing Plan */}
                    <Card className="shadow-xs border-sidebar-border">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <CreditCard className="size-5 text-primary" />
                                <CardTitle className="text-base font-semibold">3. Subscription & Billing Plan</CardTitle>
                            </div>
                            <CardDescription>
                                Select whether this club is on Free Trial, Monthly, Yearly, or Lifetime subscription.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Plan Selection Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { key: 'trial', title: 'Free Trial', desc: '14 days trial access' },
                                    { key: 'monthly', title: 'Monthly', desc: 'Recurring monthly billing' },
                                    { key: 'yearly', title: 'Yearly', desc: 'Annual contract' },
                                    { key: 'lifetime', title: 'Lifetime', desc: 'One-time payment' },
                                ].map((p) => {
                                    const isSelected = data.plan === p.key;
                                    return (
                                        <button
                                            type="button"
                                            key={p.key}
                                            onClick={() => handlePlanChange(p.key)}
                                            className={`p-3.5 rounded-lg border text-left transition-all ${
                                                isSelected
                                                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                                    : 'border-sidebar-border hover:bg-muted/50'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-sm">{p.title}</span>
                                                {isSelected && <Check className="size-4 text-primary" />}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">{p.desc}</p>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                <div>
                                    <Label htmlFor="subscription_amount">Subscription Fee ({data.currency})</Label>
                                    <Input
                                        id="subscription_amount"
                                        type="number"
                                        step="0.01"
                                        value={data.subscription_amount}
                                        onChange={(e) => setData('subscription_amount', e.target.value)}
                                        placeholder="0.00"
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

                                <div>
                                    <Label htmlFor="plan_status">Subscription Status</Label>
                                    <Select value={data.plan_status} onValueChange={(val) => setData('plan_status', val)}>
                                        <SelectTrigger className="mt-1.5">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="trialing">In Trial</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="past_due">Past Due</SelectItem>
                                            <SelectItem value="suspended">Suspended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                                <div>
                                    <Label htmlFor="subscription_starts_at">Start Date</Label>
                                    <Input
                                        id="subscription_starts_at"
                                        type="date"
                                        value={data.subscription_starts_at}
                                        onChange={(e) => setData('subscription_starts_at', e.target.value)}
                                        className="mt-1.5"
                                    />
                                </div>

                                {data.plan === 'trial' ? (
                                    <div>
                                        <Label htmlFor="trial_ends_at">Trial Expiration Date</Label>
                                        <Input
                                            id="trial_ends_at"
                                            type="date"
                                            value={data.trial_ends_at}
                                            onChange={(e) => setData('trial_ends_at', e.target.value)}
                                            className="mt-1.5"
                                        />
                                        <p className="text-[11px] text-muted-foreground mt-1">Default 14-day trial period.</p>
                                    </div>
                                ) : (
                                    <div>
                                        <Label htmlFor="subscription_ends_at">Next Renewal / Expiry Date</Label>
                                        <Input
                                            id="subscription_ends_at"
                                            type="date"
                                            value={data.subscription_ends_at}
                                            onChange={(e) => setData('subscription_ends_at', e.target.value)}
                                            className="mt-1.5"
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 4: Hosting & Infrastructure Tracking */}
                    <Card className="shadow-xs border-sidebar-border">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Server className="size-5 text-primary" />
                                <CardTitle className="text-base font-semibold">4. Server Hosting & Renewal Tracking</CardTitle>
                            </div>
                            <CardDescription>
                                Track which server provider hosts this tenant, server costs, and hosting renewal due dates.
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
                                    <Label htmlFor="hosting_plan">Hosting Plan / Package</Label>
                                    <Input
                                        id="hosting_plan"
                                        value={data.hosting_plan}
                                        onChange={(e) => setData('hosting_plan', e.target.value)}
                                        placeholder="e.g. 2 vCPU, 4GB RAM Droplet"
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
                                    <p className="text-[11px] text-muted-foreground mt-1">
                                        Alerts will appear on the dashboard 30 days before this date.
                                    </p>
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
                                        placeholder="0.00"
                                        className="mt-1.5"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <Label htmlFor="hosting_notes">Server & Hosting Notes</Label>
                                    <Input
                                        id="hosting_notes"
                                        value={data.hosting_notes}
                                        onChange={(e) => setData('hosting_notes', e.target.value)}
                                        placeholder="Server IP (e.g. 159.89.x.x), Droplet ID, DNS records, backup notes"
                                        className="mt-1.5"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 5: Limits & Quotas */}
                    <Card className="shadow-xs border-sidebar-border">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Layers className="size-5 text-primary" />
                                <CardTitle className="text-base font-semibold">5. Resource Limits & Quotas</CardTitle>
                            </div>
                            <CardDescription>
                                Set system usage caps for this sports club.
                            </CardDescription>
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
                                    <p className="text-[11px] text-muted-foreground mt-1">Default 500 members.</p>
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
                                    <p className="text-[11px] text-muted-foreground mt-1">Default 20 coaches.</p>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="notes">Additional Admin Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Internal notes regarding this club's contract, special requirements, contact person details..."
                                    className="mt-1.5"
                                    rows={2}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bottom Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Link href={route('central.tenants.index')}>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing} className="gap-2 px-6">
                            {processing ? (
                                <>Setting up Database & Domain...</>
                            ) : (
                                <>
                                    <Sparkles className="size-4" />
                                    Register Club & Setup Platform
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
