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
} from 'lucide-react';
import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import * as maintenanceRoutes from '@/routes/admin/maintenance';
import * as camerasRoutes from '@/routes/admin/maintenance/cameras';
import * as usbDevicesRoutes from '@/routes/admin/maintenance/usb-devices';
import type { BreadcrumbItem } from '@/types';

interface Resource {
    id: number;
    type: 'usb_device' | 'camera';
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
    resourceType: 'usb_device' | 'camera' | null;
    notes: string;
    until: string;
    isSubmitting: boolean;
}

interface DescriptionEditState {
    resourceId: number | null;
    resourceType: 'usb_device' | 'camera' | null;
    description: string;
    isSubmitting: boolean;
}

export default function MaintenancePage({ resources = [] }: Props) {
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

    const inMaintenanceCount = resources.filter(
        (r) => r.is_in_maintenance,
    ).length;

    const openMaintenanceForm = (resource: Resource) => {
        setMaintenanceForm({
            resourceId: resource.id,
            resourceType: resource.type,
            notes: resource.maintenance_notes || '',
            until: resource.maintenance_until
                ? new Date(resource.maintenance_until).toISOString().split('T')[0]
                : '',
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

    const submitMaintenanceForm = (e: React.FormEvent) => {
        e.preventDefault();
        if (!maintenanceForm.resourceId || !maintenanceForm.resourceType) {
            return;
        }

        setMaintenanceForm((prev) => ({ ...prev, isSubmitting: true }));

        const url =
            maintenanceForm.resourceType === 'usb_device'
                ? usbDevicesRoutes.set({ device: maintenanceForm.resourceId }).url
                : camerasRoutes.set({ camera: maintenanceForm.resourceId }).url;

        router.post(
            url,
            {
                notes: maintenanceForm.notes,
                until: maintenanceForm.until || null,
            },
            {
                onSuccess: () => {
                    closeMaintenanceForm();
                },
                onFinish: () => {
                    setMaintenanceForm((prev) => ({
                        ...prev,
                        isSubmitting: false,
                    }));
                },
            },
        );
    };

    const clearMaintenance = (resource: Resource) => {
        const url =
            resource.type === 'usb_device'
                ? usbDevicesRoutes.clear({ device: resource.id }).url
                : camerasRoutes.clear({ camera: resource.id }).url;

        router.delete(url);
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

    const submitDescriptionEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!descriptionEdit.resourceId || !descriptionEdit.resourceType) {
            return;
        }

        setDescriptionEdit((prev) => ({ ...prev, isSubmitting: true }));

        router.post(
            maintenanceRoutes.description().url,
            {
                type: descriptionEdit.resourceType,
                id: descriptionEdit.resourceId,
                description: descriptionEdit.description,
            },
            {
                onSuccess: () => {
                    closeDescriptionEdit();
                },
                onFinish: () => {
                    setDescriptionEdit((prev) => ({
                        ...prev,
                        isSubmitting: false,
                    }));
                },
            },
        );
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
                        onClick={() => router.reload()}
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
                    <CardContent className="grid grid-cols-3 gap-4">
                        <div>
                            <div className="text-2xl font-bold">
                                {resources.length}
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
                                {resources.length - inMaintenanceCount}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Available
                            </p>
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
                        {resources.length === 0 ? (
                            <p className="py-4 text-center text-muted-foreground">
                                No resources found
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {resources.map((resource) => (
                                    <div
                                        key={`${resource.type}-${resource.id}`}
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
                                                        <Badge
                                                            variant="outline"
                                                        >
                                                            {resource.type ===
                                                            'usb_device'
                                                                ? 'USB Device'
                                                                : 'Camera'}
                                                        </Badge>
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
                                                                Maintenance Notes:
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
                                                >
                                                    <AlertTriangle className="h-4 w-4 text-warning" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Description Edit Modal */}
                {descriptionEdit.resourceId !== null && (
                    <Card className="border-primary bg-white shadow-lg">
                        <CardHeader>
                            <CardTitle>Edit Admin Notes</CardTitle>
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
                                            descriptionEdit.isSubmitting
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
                                            descriptionEdit.isSubmitting
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
                                        min={new Date()
                                            .toISOString()
                                            .split('T')[0]}
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
                                            !maintenanceForm.notes
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
                                            maintenanceForm.isSubmitting
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

