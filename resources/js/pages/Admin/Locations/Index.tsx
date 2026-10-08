import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    MapPin,
    Plus,
    Edit,
    Trash2,
    Building2,
    Users,
    Phone,
    Mail,
    UserCheck,
    CreditCard,
    CalendarCheck,
    Dumbbell,
} from 'lucide-react';
import { toast } from 'sonner';

interface Manager {
    id: string;
    name: string;
    email: string;
}

interface Location {
    id: string;
    name: string;
    code: string | null;
    description: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    manager_id: string | null;
    manager?: Manager | null;
    is_active: boolean;
    programs_count: number;
    members_count: number;
    payments_count: number;
    attendances_count: number;
    special_bookings_count: number;
}

interface Props {
    locations: Location[];
    managers?: Manager[];
}

interface FormState {
    name: string;
    code: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    manager_id: string;
    is_active: boolean;
}

const defaultForm: FormState = {
    name: '',
    code: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    manager_id: 'none',
    is_active: true,
};

export default function LocationsIndex({ locations = [], managers = [] }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);
    const [form, setForm] = useState<FormState>(defaultForm);

    const openAddDialog = () => {
        setEditingLocation(null);
        setForm(defaultForm);
        setDialogOpen(true);
    };

    const openEditDialog = (loc: Location) => {
        setEditingLocation(loc);
        setForm({
            name: loc.name,
            code: loc.code || '',
            description: loc.description || '',
            address: loc.address || '',
            phone: loc.phone || '',
            email: loc.email || '',
            manager_id: loc.manager_id || 'none',
            is_active: loc.is_active,
        });
        setDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...form,
            manager_id: form.manager_id === 'none' ? null : form.manager_id,
        };

        if (editingLocation) {
            router.put(`/admin/locations/${editingLocation.id}`, payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setDialogOpen(false);
                    toast.success('Branch / Location updated successfully');
                },
                onError: (errs) => {
                    toast.error(Object.values(errs)[0] as string || 'Failed to update branch');
                },
            });
        } else {
            router.post('/admin/locations', payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setDialogOpen(false);
                    toast.success('Branch / Location created successfully');
                },
                onError: (errs) => {
                    toast.error(Object.values(errs)[0] as string || 'Failed to create branch');
                },
            });
        }
    };

    const handleDelete = (loc: Location) => {
        if (loc.programs_count > 0) {
            toast.error('Cannot delete branch with active sports/programs assigned.');
            return;
        }
        if (loc.members_count > 0) {
            toast.error('Cannot delete branch with active members assigned. Please transfer them first.');
            return;
        }
        if (!window.confirm(`Are you sure you want to delete "${loc.name}"?`)) return;

        router.delete(`/admin/locations/${loc.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Branch deleted successfully'),
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Branches & Locations', href: '/admin/locations' }]}>
            <Head title="Branches & Locations" />

            <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Branches & Locations</h1>
                        <p className="text-muted-foreground">
                            Manage your academy branches, swimming pool facilities, and branch managers.
                        </p>
                    </div>
                    <Button onClick={openAddDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Branch
                    </Button>
                </div>

                {/* Branch Cards Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {locations.length > 0 ? (
                        locations.map((loc) => (
                            <Card key={loc.id} className={`flex flex-col justify-between ${!loc.is_active ? 'opacity-60 bg-muted/20' : ''}`}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-lg font-semibold">{loc.name}</CardTitle>
                                                {loc.code && (
                                                    <Badge variant="outline" className="font-mono text-xs uppercase bg-muted">
                                                        {loc.code}
                                                    </Badge>
                                                )}
                                            </div>
                                            {!loc.is_active && (
                                                <Badge variant="destructive" className="text-[10px]">Inactive</Badge>
                                            )}
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(loc)} title="Edit Branch">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-destructive"
                                                onClick={() => handleDelete(loc)}
                                                title="Delete Branch"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    {loc.description && (
                                        <CardDescription className="line-clamp-2 text-xs pt-1">
                                            {loc.description}
                                        </CardDescription>
                                    )}
                                </CardHeader>

                                <CardContent className="space-y-4 text-sm">
                                    {/* Contact & Manager Details */}
                                    <div className="space-y-1.5 text-xs text-muted-foreground border-y py-3">
                                        <div className="flex items-center gap-2">
                                            <UserCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                                            <span className="font-medium text-foreground">
                                                {loc.manager?.name ? loc.manager.name : 'No manager assigned'}
                                            </span>
                                        </div>

                                        {loc.address && (
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                                <span className="truncate">{loc.address}</span>
                                            </div>
                                        )}

                                        {loc.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-3.5 w-3.5 shrink-0" />
                                                <span>{loc.phone}</span>
                                            </div>
                                        )}

                                        {loc.email && (
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-3.5 w-3.5 shrink-0" />
                                                <span className="truncate">{loc.email}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Metrics / Branch Counts */}
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="flex items-center gap-1.5 p-2 rounded-md bg-muted/40">
                                            <Users className="h-3.5 w-3.5 text-blue-500" />
                                            <span className="font-semibold">{loc.members_count ?? 0}</span>
                                            <span className="text-muted-foreground">Students</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 p-2 rounded-md bg-muted/40">
                                            <Dumbbell className="h-3.5 w-3.5 text-indigo-500" />
                                            <span className="font-semibold">{loc.programs_count ?? 0}</span>
                                            <span className="text-muted-foreground">Sports</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 p-2 rounded-md bg-muted/40">
                                            <CreditCard className="h-3.5 w-3.5 text-emerald-500" />
                                            <span className="font-semibold">{loc.payments_count ?? 0}</span>
                                            <span className="text-muted-foreground">Payments</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 p-2 rounded-md bg-muted/40">
                                            <CalendarCheck className="h-3.5 w-3.5 text-amber-500" />
                                            <span className="font-semibold">{loc.attendances_count ?? 0}</span>
                                            <span className="text-muted-foreground">Check-ins</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card className="col-span-full">
                            <CardContent className="p-12 text-center">
                                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                <h3 className="text-lg font-semibold">No branches configured yet</h3>
                                <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                                    Create distinct academy branches (e.g. Colombo Central, Kandy Branch) to organize students, managers, revenue, and attendance.
                                </p>
                                <Button className="mt-4" onClick={openAddDialog}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add First Branch
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Add / Edit Branch Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingLocation ? 'Edit Branch / Location' : 'Add New Branch'}</DialogTitle>
                        <DialogDescription>
                            {editingLocation
                                ? 'Update branch venue information, manager assignment, and contact details.'
                                : 'Configure a new branch location for your swimming academy.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2 space-y-1.5">
                                <Label htmlFor="name">Branch / Venue Name <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. Colombo Branch"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="code">Branch Code</Label>
                                <Input
                                    id="code"
                                    value={form.code}
                                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                    placeholder="CMB-01"
                                    className="font-mono uppercase"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="manager_id">Branch Manager</Label>
                            <Select
                                value={form.manager_id}
                                onValueChange={(val) => setForm({ ...form, manager_id: val })}
                            >
                                <SelectTrigger id="manager_id">
                                    <SelectValue placeholder="Assign a branch manager" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Manager Assigned</SelectItem>
                                    {managers.map((m) => (
                                        <SelectItem key={m.id} value={m.id}>
                                            {m.name} ({m.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="phone">Contact Phone</Label>
                                <Input
                                    id="phone"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    placeholder="+94 11 234 5678"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="email">Branch Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="colombo@academy.lk"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="address">Physical Address</Label>
                            <Input
                                id="address"
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                placeholder="e.g. No. 45, Reid Avenue, Colombo 07"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Olympic-size pool, training lanes, changing rooms..."
                                rows={2}
                            />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <Label htmlFor="is_active" className="text-sm font-medium">Branch Active Status</Label>
                                <p className="text-xs text-muted-foreground">
                                    Inactive branches are hidden from new student registrations.
                                </p>
                            </div>
                            <Switch
                                id="is_active"
                                checked={form.is_active}
                                onCheckedChange={(val) => setForm({ ...form, is_active: val })}
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={!form.name.trim()}>
                                {editingLocation ? 'Save Changes' : 'Create Branch'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
