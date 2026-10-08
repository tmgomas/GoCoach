import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    Clock,
    CreditCard,
    CheckCircle2,
    AlertTriangle,
    Calendar,
    DollarSign,
    Globe,
    ExternalLink,
    MoreVertical,
    Edit,
    Trash2,
    Power,
    RefreshCw,
    Search,
    Plus,
    Eye,
    ShieldAlert,
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
    primary_domain?: string | null;
    days_until_hosting_renewal?: number | null;
    is_hosting_due_soon?: boolean;
    is_hosting_overdue?: boolean;
    days_until_sub_ends?: number | null;
    domains: Domain[];
    created_at: string;
}

interface PaginatedTenants {
    data: Tenant[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    tenants: PaginatedTenants;
    filters: {
        search?: string;
        plan?: string;
        status?: string;
        hosting?: string;
    };
    stats: {
        total_clubs: number;
        active_clubs: number;
        trial_clubs: number;
        hosting_due_soon: number;
        estimated_monthly_revenue: number;
    };
    availablePlans: { value: string; label: string; badgeColor: string }[];
    availableStatuses: { value: string; label: string; badgeColor: string }[];
}

export default function Index({
    tenants,
    filters,
    stats,
    availablePlans,
    availableStatuses,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedPlan, setSelectedPlan] = useState(filters.plan || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedHosting, setSelectedHosting] = useState(filters.hosting || 'all');

    // Quick Hosting Renewal State
    const [renewModalOpen, setRenewModalOpen] = useState(false);
    const [tenantToRenew, setTenantToRenew] = useState<Tenant | null>(null);
    const [renewPeriod, setRenewPeriod] = useState('1_year');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete Confirmation State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);

    const handleFilterChange = (params: {
        search?: string;
        plan?: string;
        status?: string;
        hosting?: string;
    }) => {
        router.get(
            route('central.tenants.index'),
            {
                search: params.search !== undefined ? params.search : search,
                plan: params.plan !== undefined ? params.plan : selectedPlan,
                status: params.status !== undefined ? params.status : selectedStatus,
                hosting: params.hosting !== undefined ? params.hosting : selectedHosting,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilterChange({ search });
    };

    const handleToggleStatus = (tenant: Tenant) => {
        if (confirm(`Are you sure you want to change status for ${tenant.name}?`)) {
            router.patch(route('central.tenants.toggle-status', tenant.id), {}, {
                preserveScroll: true,
            });
        }
    };

    const handleOpenRenewModal = (tenant: Tenant) => {
        setTenantToRenew(tenant);
        setRenewPeriod('1_year');
        setRenewModalOpen(true);
    };

    const handleConfirmRenewHosting = () => {
        if (!tenantToRenew) return;
        setIsSubmitting(true);
        router.post(
            route('central.tenants.renew-hosting', tenantToRenew.id),
            { period: renewPeriod },
            {
                onSuccess: () => {
                    setRenewModalOpen(false);
                    setTenantToRenew(null);
                },
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    const handleOpenDeleteModal = (tenant: Tenant) => {
        setTenantToDelete(tenant);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!tenantToDelete) return;
        setIsSubmitting(true);
        router.delete(route('central.tenants.destroy', tenantToDelete.id), {
            onSuccess: () => {
                setDeleteModalOpen(false);
                setTenantToDelete(null);
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    // Helper to get plan badge color
    const getPlanBadge = (plan: string) => {
        switch (plan) {
            case 'trial':
                return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200">Trial</Badge>;
            case 'monthly':
                return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200">Monthly</Badge>;
            case 'yearly':
                return <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200">Yearly</Badge>;
            case 'lifetime':
                return <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200">Lifetime</Badge>;
            default:
                return <Badge variant="outline">{plan}</Badge>;
        }
    };

    // Helper for hosting renewal badge
    const getHostingRenewalBadge = (tenant: Tenant) => {
        if (!tenant.hosting_renewal_date) {
            return <span className="text-xs text-muted-foreground">Not set</span>;
        }

        const days = tenant.days_until_hosting_renewal;

        if (tenant.is_hosting_overdue) {
            return (
                <div className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                    <AlertTriangle className="size-3.5 shrink-0" />
                    <span>Overdue ({Math.abs(days || 0)}d ago)</span>
                </div>
            );
        }

        if (tenant.is_hosting_due_soon) {
            return (
                <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                    <Clock className="size-3.5 shrink-0" />
                    <span>Due in {days} days</span>
                </div>
            );
        }

        return (
            <div className="text-xs text-muted-foreground">
                {tenant.hosting_renewal_date}
            </div>
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'SaaS Super Admin', href: '/saas-admin/tenants' },
                { title: 'Clubs & Tenants' },
            ]}
        >
            <Head title="Clubs & Multi-Tenant Management - SaaS Admin" />

            <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Clubs & Tenants Management</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Monitor club registrations, multi-database status, subscription packages, and server hosting renewals.
                        </p>
                    </div>
                    <Link href={route('central.tenants.create')}>
                        <Button className="gap-2 shadow-sm">
                            <Plus className="size-4" />
                            Register New Club
                        </Button>
                    </Link>
                </div>

                {/* KPI Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Card className="shadow-xs border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Total Clubs</CardTitle>
                            <Building2 className="size-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_clubs}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                <span className="text-emerald-600 font-medium">{stats.active_clubs} active</span> across platforms
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xs border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Active Subscriptions</CardTitle>
                            <CheckCircle2 className="size-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active_clubs}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Paying recurring clients
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xs border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Free Trials</CardTitle>
                            <Clock className="size-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.trial_clubs}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                In 14-day evaluation
                            </p>
                        </CardContent>
                    </Card>

                    <Card className={`shadow-xs border-sidebar-border ${stats.hosting_due_soon > 0 ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40' : ''}`}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Hosting Renewals Due</CardTitle>
                            <Server className={`size-4 ${stats.hosting_due_soon > 0 ? 'text-amber-600 animate-pulse' : 'text-slate-500'}`} />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${stats.hosting_due_soon > 0 ? 'text-amber-700 dark:text-amber-400' : ''}`}>
                                {stats.hosting_due_soon}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Expiring within 30 days
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xs border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Estimated MRR</CardTitle>
                            <DollarSign className="size-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                Rs. {stats.estimated_monthly_revenue.toLocaleString('en-LK')}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Normalized monthly value
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search Toolbar */}
                <Card className="shadow-xs border-sidebar-border">
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-80">
                                <div className="relative w-full">
                                    <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name, domain, ID..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9 h-9 text-sm"
                                    />
                                </div>
                                <Button type="submit" size="sm" variant="secondary" className="h-9">
                                    Search
                                </Button>
                            </form>

                            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                                {/* Plan Filter */}
                                <Select
                                    value={selectedPlan}
                                    onValueChange={(val) => {
                                        setSelectedPlan(val);
                                        handleFilterChange({ plan: val });
                                    }}
                                >
                                    <SelectTrigger className="w-[140px] h-9 text-xs">
                                        <SelectValue placeholder="All Plans" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Plans</SelectItem>
                                        {availablePlans.map((p) => (
                                            <SelectItem key={p.value} value={p.value}>
                                                {p.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Status Filter */}
                                <Select
                                    value={selectedStatus}
                                    onValueChange={(val) => {
                                        setSelectedStatus(val);
                                        handleFilterChange({ status: val });
                                    }}
                                >
                                    <SelectTrigger className="w-[130px] h-9 text-xs">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        {availableStatuses.map((s) => (
                                            <SelectItem key={s.value} value={s.value}>
                                                {s.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Hosting Renewal Filter */}
                                <Select
                                    value={selectedHosting}
                                    onValueChange={(val) => {
                                        setSelectedHosting(val);
                                        handleFilterChange({ hosting: val });
                                    }}
                                >
                                    <SelectTrigger className="w-[160px] h-9 text-xs">
                                        <SelectValue placeholder="Hosting Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Hosting</SelectItem>
                                        <SelectItem value="due_soon">Renewal Due Soon</SelectItem>
                                        <SelectItem value="overdue">Renewal Overdue</SelectItem>
                                    </SelectContent>
                                </Select>

                                {(search || selectedPlan !== 'all' || selectedStatus !== 'all' || selectedHosting !== 'all') && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSearch('');
                                            setSelectedPlan('all');
                                            setSelectedStatus('all');
                                            setSelectedHosting('all');
                                            router.get(route('central.tenants.index'));
                                        }}
                                        className="h-9 text-xs text-muted-foreground"
                                    >
                                        Reset
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Tenants Table */}
                <Card className="shadow-xs border-sidebar-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40">
                                    <TableHead className="w-[260px]">Club Name & Info</TableHead>
                                    <TableHead className="w-[200px]">Domain & Host</TableHead>
                                    <TableHead>Subscription Plan</TableHead>
                                    <TableHead>Hosting & Renewal</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tenants.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-48 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                                                <Building2 className="size-8 stroke-[1.5] text-muted-foreground/60" />
                                                <p className="font-medium text-foreground">No clubs found</p>
                                                <p className="text-xs">
                                                    {search || selectedPlan !== 'all'
                                                        ? 'Try clearing the search or filters.'
                                                        : 'Register your first sports club to get started.'}
                                                </p>
                                                <Link href={route('central.tenants.create')} className="mt-2">
                                                    <Button size="sm" variant="outline" className="gap-1.5">
                                                        <Plus className="size-3.5" />
                                                        Add Club
                                                    </Button>
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tenants.data.map((tenant) => {
                                        const domain = tenant.primary_domain || tenant.domains?.[0]?.domain;
                                        const initials = tenant.name
                                            .split(' ')
                                            .map((n) => n[0])
                                            .join('')
                                            .slice(0, 2)
                                            .toUpperCase();

                                        return (
                                            <TableRow key={tenant.id} className="hover:bg-muted/30 transition-colors">
                                                {/* Club Identity */}
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-sm text-primary shrink-0">
                                                            {initials}
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <Link
                                                                href={route('central.tenants.show', tenant.id)}
                                                                className="font-semibold text-sm hover:underline truncate text-foreground"
                                                            >
                                                                {tenant.name}
                                                            </Link>
                                                            <div className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                                                                <span>ID: <code className="text-foreground/80 font-mono">{tenant.id}</code></span>
                                                                {tenant.admin_name && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className="truncate">{tenant.admin_name}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                            <span className="text-[11px] text-muted-foreground truncate">{tenant.email}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Domain */}
                                                <TableCell>
                                                    {domain ? (
                                                        <a
                                                            href={`http://${domain}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline group"
                                                        >
                                                            <Globe className="size-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
                                                            <span className="truncate max-w-[150px]">{domain}</span>
                                                            <ExternalLink className="size-3 text-muted-foreground opacity-60 group-hover:opacity-100 shrink-0" />
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">No domain</span>
                                                    )}
                                                </TableCell>

                                                {/* Subscription Plan */}
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            {getPlanBadge(tenant.plan)}
                                                            {Number(tenant.subscription_amount) > 0 && (
                                                                <span className="text-xs font-semibold text-foreground">
                                                                    {tenant.currency} {Number(tenant.subscription_amount).toLocaleString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {tenant.plan === 'trial' && tenant.trial_ends_at && (
                                                            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                                                                Trial ends {tenant.trial_ends_at}
                                                            </span>
                                                        )}
                                                        {tenant.plan !== 'trial' && tenant.subscription_ends_at && (
                                                            <span className="text-[11px] text-muted-foreground">
                                                                Renews: {tenant.subscription_ends_at}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* Hosting & Renewal */}
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                                                            <Server className="size-3.5 text-muted-foreground" />
                                                            <span>{tenant.hosting_provider || 'Not specified'}</span>
                                                        </div>
                                                        {getHostingRenewalBadge(tenant)}
                                                    </div>
                                                </TableCell>

                                                {/* Status */}
                                                <TableCell className="text-center">
                                                    {tenant.status === 'active' ? (
                                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200">
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200">
                                                            {tenant.status}
                                                        </Badge>
                                                    )}
                                                </TableCell>

                                                {/* Actions */}
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="size-8">
                                                                <MoreVertical className="size-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuLabel>Club Options</DropdownMenuLabel>
                                                            <DropdownMenuItem asChild>
                                                                <Link href={route('central.tenants.show', tenant.id)} className="flex items-center gap-2 cursor-pointer">
                                                                    <Eye className="size-4" />
                                                                    View Details
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <Link href={route('central.tenants.edit', tenant.id)} className="flex items-center gap-2 cursor-pointer">
                                                                    <Edit className="size-4" />
                                                                    Edit Settings
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            {domain && (
                                                                <DropdownMenuItem asChild>
                                                                    <a
                                                                        href={`http://${domain}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-2 cursor-pointer"
                                                                    >
                                                                        <ExternalLink className="size-4" />
                                                                        Open Tenant Site
                                                                    </a>
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleOpenRenewModal(tenant)}
                                                                className="flex items-center gap-2 cursor-pointer text-amber-600 focus:text-amber-700"
                                                            >
                                                                <RefreshCw className="size-4" />
                                                                Renew Hosting
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleToggleStatus(tenant)}
                                                                className="flex items-center gap-2 cursor-pointer"
                                                            >
                                                                <Power className="size-4" />
                                                                {tenant.status === 'active' ? 'Suspend Club' : 'Activate Club'}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleOpenDeleteModal(tenant)}
                                                                className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-700"
                                                            >
                                                                <Trash2 className="size-4" />
                                                                Delete Club
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {tenants.last_page > 1 && (
                        <div className="flex items-center justify-between p-4 border-t border-sidebar-border text-xs text-muted-foreground">
                            <div>
                                Showing <span className="font-medium text-foreground">{tenants.from}</span> to{' '}
                                <span className="font-medium text-foreground">{tenants.to}</span> of{' '}
                                <span className="font-medium text-foreground">{tenants.total}</span> clubs
                            </div>
                            <div className="flex items-center gap-1">
                                {tenants.links.map((link, idx) => (
                                    <Button
                                        key={idx}
                                        size="sm"
                                        variant={link.active ? 'default' : 'outline'}
                                        disabled={!link.url}
                                        className="h-8 min-w-8 text-xs"
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
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
                            Extend server hosting and domain renewal for <strong>{tenantToRenew?.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-1.5 border">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Current Renewal Date:</span>
                                <span className="font-medium text-foreground">
                                    {tenantToRenew?.hosting_renewal_date || 'Not set'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Hosting Provider:</span>
                                <span className="font-medium text-foreground">
                                    {tenantToRenew?.hosting_provider || 'Not configured'}
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

            {/* Delete Club Confirmation Dialog */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <ShieldAlert className="size-5" />
                            Delete Club & Tenant Database
                        </DialogTitle>
                        <DialogDescription>
                            Are you completely sure you want to delete <strong>{tenantToDelete?.name}</strong> (<code>{tenantToDelete?.id}</code>)?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-2 text-sm text-muted-foreground">
                        <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50">
                            <strong>Warning:</strong> This will drop the dedicated tenant database, domains, members, and all related club records. This action cannot be reversed.
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmDelete} disabled={isSubmitting}>
                            {isSubmitting ? 'Deleting...' : 'Delete Permanently'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
