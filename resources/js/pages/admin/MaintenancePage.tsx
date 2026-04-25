/**
 * Admin Maintenance Page
 * Manage USB devices and cameras in maintenance mode.
 */
import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Calendar,
    Check,
    FileText,
    Loader2,
    RefreshCw,
    Search,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import client from '@/api/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { getHttpErrorMessage } from '@/lib/http-errors';
import * as maintenanceRoutes from '@/routes/admin/maintenance';
import * as camerasRoutes from '@/routes/admin/maintenance/cameras';
import * as usbDevicesRoutes from '@/routes/admin/maintenance/usb-devices';
import type { BreadcrumbItem } from '@/types';

type ResourceType = 'usb_device' | 'camera';
type ResourceTypeFilter = 'all' | ResourceType;
type MaintenanceStatusFilter = 'all' | 'in_maintenance' | 'available';

interface Resource {
    id: number;
    type: ResourceType;
    name: string;
    description: string | null;
    maintenance_mode: boolean;
    maintenance_notes: string | null;
    maintenance_until: string | null;
    is_in_maintenance: boolean;
    gateway?: string;
    source?: string;
    status: string;
}

interface Props {
    resources: Resource[];
}
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/infrastructure' },
    { title: 'Maintenance', href: '/admin/maintenance' },
];

interface MaintenanceFormState {
    resourceId: number | null;
    resourceType: ResourceType | null;
    notes: string;
    until: string;
    isSubmitting: boolean;
}

interface DescriptionEditState {
    resourceId: number | null;
    resourceType: ResourceType | null;
    description: string;
    isSubmitting: boolean;
}

const toDateInputValue = (isoDate: string | null): string => {
    if (!isoDate) {
        return '';
    }

    return isoDate.split('T')[0] ?? '';
};

const resourceKey = (resource: Pick<Resource, 'id' | 'type'>): string =>
    `${resource.type}-${resource.id}`;

export default function MaintenancePage({ resources = [] }: Props) {
    const [resourceItems, setResourceItems] = useState<Resource[]>(resources);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<ResourceTypeFilter>('all');
    const [maintenanceStatusFilter, setMaintenanceStatusFilter] =
        useState<MaintenanceStatusFilter>('all');
    const [busyResourceKey, setBusyResourceKey] = useState<string | null>(null);

    const [maintenanceForm, setMaintenanceForm] =
        useState<MaintenanceFormState>({
            resourceId: null,
            resourceType: null,
            notes: '',
            until: '',
            isSubmitting: false,
        });

    const [descriptionEdit, setDescriptionEdit] =
        useState<DescriptionEditState>({
            resourceId: null,
            resourceType: null,
            description: '',
            isSubmitting: false,
        });

    useEffect(() => {
        setResourceItems(resources);
    }, [resources]);

    const inMaintenanceCount = resourceItems.filter(
        (r) => r.is_in_maintenance,
    ).length;

    const filteredResources = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return resourceItems.filter((resource) => {
            const matchesSearch =
                normalizedSearch.length === 0 ||
                [
                    resource.name,
                    resource.description ?? '',
                    resource.maintenance_notes ?? '',
                    resource.gateway ?? '',
                    resource.source ?? '',
                    resource.status,
                ].some((value) =>
                    value.toLowerCase().includes(normalizedSearch),
                );

            const matchesType =
                typeFilter === 'all' || resource.type === typeFilter;

            const matchesMaintenanceStatus =
                maintenanceStatusFilter === 'all' ||
                (maintenanceStatusFilter === 'in_maintenance'
                    ? resource.is_in_maintenance
                    : !resource.is_in_maintenance);

            return matchesSearch && matchesType && matchesMaintenanceStatus;
        });
    }, [maintenanceStatusFilter, resourceItems, search, typeFilter]);

    const selectedMaintenanceResource = useMemo(
        () =>
            resourceItems.find(
                (resource) =>
                    resource.id === maintenanceForm.resourceId &&
                    resource.type === maintenanceForm.resourceType,
            ),
        [
            maintenanceForm.resourceId,
            maintenanceForm.resourceType,
            resourceItems,
        ],
    );

    const selectedDescriptionResource = useMemo(
        () =>
            resourceItems.find(
                (resource) =>
                    resource.id === descriptionEdit.resourceId &&
                    resource.type === descriptionEdit.resourceType,
            ),
        [
            descriptionEdit.resourceId,
            descriptionEdit.resourceType,
            resourceItems,
        ],
    );

    const resetFilters = () => {
        setSearch('');
        setTypeFilter('all');
        setMaintenanceStatusFilter('all');
    };

    const openMaintenanceForm = (resource: Resource) => {
        setMaintenanceForm({
            resourceId: resource.id,
            resourceType: resource.type,
            notes: resource.maintenance_notes || '',
            until: toDateInputValue(resource.maintenance_until),
            isSubmitting: false,
        });
    };

    const closeMaintenanceForm = () => {
        setMaintenanceForm({
            resourceId: null,
            resourceType: null,
            notes: '',
            until: '',
            isSubmitting: false,
        });
    };

    const submitMaintenanceForm = async (e: React.FormEvent) => {
        e.preventDefault();

        const targetResourceId = maintenanceForm.resourceId;
        const targetResourceType = maintenanceForm.resourceType;
        const trimmedNotes = maintenanceForm.notes.trim();

        if (targetResourceId === null || targetResourceType === null) {
            return;
        }

        if (!trimmedNotes) {
            toast.error('Please provide maintenance notes before submitting.');

            return;
        }

        const targetKey = resourceKey({
            id: targetResourceId,
            type: targetResourceType,
        });

        setMaintenanceForm((prev) => ({ ...prev, isSubmitting: true }));
        setBusyResourceKey(targetKey);

        const url =
            targetResourceType === 'usb_device'
                ? usbDevicesRoutes.set({ device: targetResourceId }).url
                : camerasRoutes.set({ camera: targetResourceId }).url;

        try {
            const response = await client.post<{
                data: {
                    maintenance_notes: string | null;
                    maintenance_until: string | null;
                };
            }>(url, {
                notes: trimmedNotes,
                until: maintenanceForm.until || null,
            });

            setResourceItems((prev) =>
                prev.map((resource) =>
                    resource.id === targetResourceId &&
                    resource.type === targetResourceType
                        ? {
                              ...resource,
                              maintenance_mode: true,
                              is_in_maintenance: true,
                              maintenance_notes:
                                  response.data.data.maintenance_notes ??
                                  trimmedNotes,
                              maintenance_until:
                                  response.data.data.maintenance_until,
                          }
                        : resource,
                ),
            );

            closeMaintenanceForm();
            toast.success('Maintenance mode enabled successfully.');
        } catch (error) {
            toast.error(
                getHttpErrorMessage(
                    error,
                    'Failed to enable maintenance mode. Please try again.',
                ),
            );
        } finally {
            setBusyResourceKey(null);
            setMaintenanceForm((prev) => ({
                ...prev,
                isSubmitting: false,
            }));
        }
    };

    const clearMaintenance = async (resource: Resource) => {
        const shouldProceed = window.confirm(
            `Clear maintenance mode for ${resource.name}?`,
        );

        if (!shouldProceed) {
            return;
        }

        const url =
            resource.type === 'usb_device'
                ? usbDevicesRoutes.clear({ device: resource.id }).url
                : camerasRoutes.clear({ camera: resource.id }).url;

        setBusyResourceKey(resourceKey(resource));

        try {
            await client.delete(url);

            setResourceItems((prev) =>
                prev.map((item) =>
                    item.id === resource.id && item.type === resource.type
                        ? {
                              ...item,
                              maintenance_mode: false,
                              maintenance_notes: null,
                              maintenance_until: null,
                              is_in_maintenance: false,
                          }
                        : item,
                ),
            );

            toast.success('Maintenance mode cleared successfully.');
        } catch (error) {
            toast.error(
                getHttpErrorMessage(
                    error,
                    'Failed to clear maintenance mode. Please try again.',
                ),
            );
        } finally {
            setBusyResourceKey(null);
        }
    };

    const openDescriptionEdit = (resource: Resource) => {
        setDescriptionEdit({
            resourceId: resource.id,
            resourceType: resource.type,
            description: resource.description || '',
            isSubmitting: false,
        });
    };

    const closeDescriptionEdit = () => {
        setDescriptionEdit({
            resourceId: null,
            resourceType: null,
            description: '',
            isSubmitting: false,
        });
    };

    const submitDescriptionEdit = async (e: React.FormEvent) => {
        e.preventDefault();

        const targetResourceId = descriptionEdit.resourceId;
        const targetResourceType = descriptionEdit.resourceType;

        if (targetResourceId === null || targetResourceType === null) {
            return;
        }

        setDescriptionEdit((prev) => ({ ...prev, isSubmitting: true }));
        setBusyResourceKey(
            resourceKey({ id: targetResourceId, type: targetResourceType }),
        );

        try {
            await client.post(maintenanceRoutes.description().url, {
                type: targetResourceType,
                id: targetResourceId,
                description: descriptionEdit.description,
            });

            setResourceItems((prev) =>
                prev.map((resource) =>
                    resource.id === targetResourceId &&
                    resource.type === targetResourceType
                        ? {
                              ...resource,
                              description: descriptionEdit.description || null,
                          }
                        : resource,
                ),
            );

            closeDescriptionEdit();
            toast.success('Admin notes updated successfully.');
        } catch (error) {
            toast.error(
                getHttpErrorMessage(
                    error,
                    'Failed to update admin notes. Please try again.',
                ),
            );
        } finally {
            setBusyResourceKey(null);
            setDescriptionEdit((prev) => ({
                ...prev,
                isSubmitting: false,
            }));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Maintenance - Admin" />
            <div className="container space-y-6 py-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Device Maintenance
                        </h1>
                        <p className="text-muted-foreground">
                            Manage USB devices and cameras in maintenance mode
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() =>
                            router.reload({
                                only: ['resources'],
                            })
                        }
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                {/* Summary Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Maintenance Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <div className="text-2xl font-bold">
                                {resourceItems.length}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Total Resources
                            </p>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-warning">
                                {inMaintenanceCount}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                In Maintenance
                            </p>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-success">
                                {resourceItems.length - inMaintenanceCount}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Available
                            </p>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-primary">
                                {filteredResources.length}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Matching Filters
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Filter Resources</CardTitle>
                        <CardDescription>
                            Search by name, notes, source, or status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-[1fr,180px,220px,auto]">
                            <div className="relative">
                                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search resources..."
                                    className="pl-9"
                                />
                            </div>

                            <Select
                                value={typeFilter}
                                onValueChange={(value: ResourceTypeFilter) =>
                                    setTypeFilter(value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Resource type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Types
                                    </SelectItem>
                                    <SelectItem value="usb_device">
                                        USB Devices
                                    </SelectItem>
                                    <SelectItem value="camera">
                                        Cameras
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={maintenanceStatusFilter}
                                onValueChange={(
                                    value: MaintenanceStatusFilter,
                                ) => setMaintenanceStatusFilter(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Maintenance status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Statuses
                                    </SelectItem>
                                    <SelectItem value="in_maintenance">
                                        In Maintenance
                                    </SelectItem>
                                    <SelectItem value="available">
                                        Available
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                type="button"
                                variant="ghost"
                                onClick={resetFilters}
                                className="justify-self-start"
                            >
                                <X className="mr-2 h-4 w-4" />
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Resources Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Resources</CardTitle>
                        <CardDescription>
                            USB devices and cameras with maintenance status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {resourceItems.length === 0 ? (
                            <p className="py-4 text-center text-muted-foreground">
                                No resources found
                            </p>
                        ) : filteredResources.length === 0 ? (
                            <p className="py-4 text-center text-muted-foreground">
                                No resources match the current filters
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {filteredResources.map((resource) => {
                                    const isBusy =
                                        busyResourceKey ===
                                        resourceKey(resource);

                                    return (
                                        <div
                                            key={resourceKey(resource)}
                                            className="flex items-center justify-between rounded-lg border p-4"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">
                                                                {resource.name}
                                                            </span>
                                                            <Badge
                                                                variant={
                                                                    resource.is_in_maintenance
                                                                        ? 'destructive'
                                                                        : 'default'
                                                                }
                                                            >
                                                                {resource.is_in_maintenance
                                                                    ? 'IN MAINTENANCE'
                                                                    : 'AVAILABLE'}
                                                            </Badge>
                                                            <Badge variant="outline">
                                                                {resource.type ===
                                                                'usb_device'
                                                                    ? 'USB Device'
                                                                    : 'Camera'}
                                                            </Badge>
                                                            <Badge variant="secondary">
                                                                {
                                                                    resource.status
                                                                }
                                                            </Badge>
                                                            {isBusy && (
                                                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {resource.gateway ||
                                                                resource.source ||
                                                                'N/A'}
                                                        </div>
                                                        {resource.description && (
                                                            <div className="mt-2 text-sm">
                                                                <span className="font-medium">
                                                                    Admin Notes:
                                                                </span>{' '}
                                                                {
                                                                    resource.description
                                                                }
                                                            </div>
                                                        )}
                                                        {resource.maintenance_notes && (
                                                            <div className="mt-1 text-sm">
                                                                <span className="font-medium">
                                                                    Maintenance
                                                                    Notes:
                                                                </span>{' '}
                                                                {
                                                                    resource.maintenance_notes
                                                                }
                                                            </div>
                                                        )}
                                                        {resource.maintenance_until && (
                                                            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                                                                <Calendar className="h-4 w-4" />
                                                                Until{' '}
                                                                {new Date(
                                                                    resource.maintenance_until,
                                                                ).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        openDescriptionEdit(
                                                            resource,
                                                        )
                                                    }
                                                    disabled={isBusy}
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </Button>
                                                {resource.is_in_maintenance ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            clearMaintenance(
                                                                resource,
                                                            )
                                                        }
                                                        disabled={isBusy}
                                                    >
                                                        <Check className="h-4 w-4 text-success" />
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            openMaintenanceForm(
                                                                resource,
                                                            )
                                                        }
                                                        disabled={isBusy}
                                                    >
                                                        <AlertTriangle className="h-4 w-4 text-warning" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Description Edit Modal */}
                {descriptionEdit.resourceId !== null && (
                    <Card className="border-primary bg-white shadow-lg">
                        <CardHeader>
                            <CardTitle>Edit Admin Notes</CardTitle>
                            {selectedDescriptionResource && (
                                <CardDescription>
                                    Resource: {selectedDescriptionResource.name}
                                </CardDescription>
                            )}
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={submitDescriptionEdit}
                                className="space-y-4"
                            >
                                <div>
                                    <Label htmlFor="description">
                                        Admin Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={descriptionEdit.description}
                                        onChange={(e) =>
                                            setDescriptionEdit((prev) => ({
                                                ...prev,
                                                description: e.target.value,
                                            }))
                                        }
                                        placeholder="Enter admin notes (e.g., repairs needed, replacement pending, etc.)"
                                        maxLength={5000}
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        type="submit"
                                        disabled={
                                            descriptionEdit.isSubmitting ||
                                            busyResourceKey !== null
                                        }
                                    >
                                        {descriptionEdit.isSubmitting && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Save
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={closeDescriptionEdit}
                                        disabled={
                                            descriptionEdit.isSubmitting ||
                                            busyResourceKey !== null
                                        }
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Maintenance Form Modal */}
                {maintenanceForm.resourceId !== null && (
                    <Card className="border-destructive bg-white shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                Enable Maintenance Mode
                            </CardTitle>
                            <CardDescription>
                                This will prevent the device from being used
                                until maintenance is cleared.
                            </CardDescription>
                            {selectedMaintenanceResource && (
                                <CardDescription>
                                    Resource: {selectedMaintenanceResource.name}
                                </CardDescription>
                            )}
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={submitMaintenanceForm}
                                className="space-y-4"
                            >
                                <div>
                                    <Label htmlFor="notes">
                                        Maintenance Notes *
                                    </Label>
                                    <Textarea
                                        id="notes"
                                        value={maintenanceForm.notes}
                                        onChange={(e) =>
                                            setMaintenanceForm((prev) => ({
                                                ...prev,
                                                notes: e.target.value,
                                            }))
                                        }
                                        placeholder="Describe the maintenance work (repairs, replacements, etc.)"
                                        maxLength={2000}
                                        required
                                    />
                                    <div className="text-xs text-muted-foreground">
                                        {maintenanceForm.notes.length}/2000
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="until">
                                        Maintenance Until (Optional)
                                    </Label>
                                    <Input
                                        id="until"
                                        type="date"
                                        value={maintenanceForm.until}
                                        onChange={(e) =>
                                            setMaintenanceForm((prev) => ({
                                                ...prev,
                                                until: e.target.value,
                                            }))
                                        }
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split('T')[0]
                                        }
                                    />
                                    <div className="text-xs text-muted-foreground">
                                        If set, maintenance will auto-clear on
                                        this date
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        type="submit"
                                        variant="destructive"
                                        disabled={
                                            maintenanceForm.isSubmitting ||
                                            !maintenanceForm.notes.trim() ||
                                            busyResourceKey !== null
                                        }
                                    >
                                        {maintenanceForm.isSubmitting && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Enable Maintenance
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={closeMaintenanceForm}
                                        disabled={
                                            maintenanceForm.isSubmitting ||
                                            busyResourceKey !== null
                                        }
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
