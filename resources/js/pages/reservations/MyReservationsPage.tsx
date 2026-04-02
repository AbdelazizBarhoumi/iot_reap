/**
 * My Reservations Page - User-facing page for managing device reservations.
 *
 * Allows engineers to:
 * - View their pending, approved, active, and past reservations
 * - Request new reservations for USB devices
 * - Cancel pending or approved reservations
 * - See when devices are available
 */
import { Head } from '@inertiajs/react';
import { format, isBefore, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    Calendar,
    CalendarClock,
    CheckCircle2,
    Clock,
    HelpCircle,
    Loader2,
    Plus,
    RefreshCw,
    Trash2,
    Usb,
    XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { hardwareApi, reservationApi } from '@/api/hardware.api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type {
    UsbDevice,
    UsbDeviceReservation,
    UsbReservationStatus,
} from '@/types/hardware.types';
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'My Reservations', href: '/my-reservations' },
];
const STATUS_CONFIG: Record<
    UsbReservationStatus,
    { color: string; icon: React.ReactNode; label: string }
> = {
    pending: {
        color: 'bg-yellow-500',
        icon: <Clock className="h-4 w-4" />,
        label: 'Pending Approval',
    },
    approved: {
        color: 'bg-blue-500',
        icon: <CheckCircle2 className="h-4 w-4" />,
        label: 'Approved',
    },
    rejected: {
        color: 'bg-red-500',
        icon: <XCircle className="h-4 w-4" />,
        label: 'Rejected',
    },
    cancelled: {
        color: 'bg-gray-500',
        icon: <XCircle className="h-4 w-4" />,
        label: 'Cancelled',
    },
    active: {
        color: 'bg-green-500',
        icon: <CheckCircle2 className="h-4 w-4" />,
        label: 'Active Now',
    },
    completed: {
        color: 'bg-gray-400',
        icon: <CheckCircle2 className="h-4 w-4" />,
        label: 'Completed',
    },
};
function formatDateTime(iso: string | null): string {
    if (!iso) return '—';
    return format(parseISO(iso), 'MMM d, yyyy h:mm a');
}
function formatDateTimeShort(iso: string | null): string {
    if (!iso) return '—';
    return format(parseISO(iso), 'MMM d, h:mm a');
}
interface ReservationCardProps {
    reservation: UsbDeviceReservation;
    onCancel: (id: number) => void;
    actionLoading: boolean;
}
function ReservationCard({
    reservation,
    onCancel,
    actionLoading,
}: ReservationCardProps) {
    const statusConfig = STATUS_CONFIG[reservation.status];
    const canCancel =
        reservation.status === 'pending' || reservation.status === 'approved';
    const isActive = reservation.status === 'active';
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className={`mb-4 ${isActive ? 'ring-2 ring-green-500' : ''}`}>
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className={`rounded-lg p-2 ${isActive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted'}`}
                            >
                                <Usb
                                    className={`h-5 w-5 ${isActive ? 'text-green-600' : ''}`}
                                />
                            </div>
                            <div>
                                <CardTitle className="text-base">
                                    {reservation.device?.name ||
                                        `Device #${reservation.usb_device_id}`}
                                </CardTitle>
                                <CardDescription>
                                    Gateway:{' '}
                                    {reservation.device?.gateway_node_name ||
                                        'Unknown'}
                                </CardDescription>
                            </div>
                        </div>
                        <Badge
                            className={`${statusConfig.color} flex items-center gap-1 text-white`}
                        >
                            {statusConfig.icon}
                            {statusConfig.label}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid gap-2 text-sm">
                        {/* Time information */}
                        {reservation.status === 'pending' && (
                            <div className="flex items-center gap-2 rounded-md bg-yellow-50 p-2 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                                <Clock className="h-4 w-4" />
                                <span>
                                    Requested:{' '}
                                    {formatDateTimeShort(
                                        reservation.requested_start_at,
                                    )}{' '}
                                    —{' '}
                                    {formatDateTimeShort(
                                        reservation.requested_end_at,
                                    )}
                                </span>
                            </div>
                        )}
                        {(reservation.status === 'approved' ||
                            reservation.status === 'active') && (
                            <div
                                className={`flex items-center gap-2 rounded-md p-2 ${isActive ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200' : 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'}`}
                            >
                                <CalendarClock className="h-4 w-4" />
                                <span>
                                    {isActive
                                        ? 'Active until: '
                                        : 'Approved for: '}
                                    {formatDateTimeShort(
                                        reservation.approved_start_at,
                                    )}{' '}
                                    —{' '}
                                    {formatDateTimeShort(
                                        reservation.approved_end_at,
                                    )}
                                </span>
                            </div>
                        )}
                        {reservation.status === 'rejected' &&
                            reservation.admin_notes && (
                                <div className="flex items-start gap-2 rounded-md bg-red-50 p-2 text-red-800 dark:bg-red-900/20 dark:text-red-200">
                                    <AlertCircle className="mt-0.5 h-4 w-4" />
                                    <div>
                                        <span className="font-medium">
                                            Rejection reason:
                                        </span>
                                        <p className="mt-1">
                                            {reservation.admin_notes}
                                        </p>
                                    </div>
                                </div>
                            )}
                        {reservation.purpose && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Purpose:
                                </span>
                                <span className="max-w-[250px] text-right">
                                    {reservation.purpose}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between text-muted-foreground">
                            <span>Submitted:</span>
                            <span>
                                {formatDateTime(reservation.created_at)}
                            </span>
                        </div>
                    </div>
                    {/* Actions */}
                    {canCancel && (
                        <div className="flex justify-end border-t pt-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onCancel(reservation.id)}
                                disabled={actionLoading}
                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                                {actionLoading ? (
                                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="mr-1 h-4 w-4" />
                                )}
                                Cancel Reservation
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
interface RequestReservationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    devices: UsbDevice[];
    devicesLoading: boolean;
    onSubmit: (data: {
        deviceId: number;
        startAt: string;
        endAt: string;
        purpose: string;
    }) => void;
    submitting: boolean;
}
function RequestReservationDialog({
    open,
    onOpenChange,
    devices,
    devicesLoading,
    onSubmit,
    submitting,
}: RequestReservationDialogProps) {
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');
    const [purpose, setPurpose] = useState('');
    const [error, setError] = useState<string | null>(null);
    
    // Reset form when dialog opens
    useEffect(() => {
        if (!open) return;
        
        // Reset all fields together
        const resetForm = () => {
            setSelectedDeviceId('');
            setStartDate('');
            setStartTime('');
            setEndDate('');
            setEndTime('');
            setPurpose('');
            setError(null);
        };
        
        resetForm();
    }, [open]);
    const handleSubmit = () => {
        setError(null);
        if (!selectedDeviceId) {
            setError('Please select a device');
            return;
        }
        if (!startDate || !startTime || !endDate || !endTime) {
            setError('Please fill in all date and time fields');
            return;
        }
        const startAt = `${startDate}T${startTime}:00`;
        const endAt = `${endDate}T${endTime}:00`;
        const startDateTime = parseISO(startAt);
        const endDateTime = parseISO(endAt);
        if (isBefore(startDateTime, new Date())) {
            setError('Start time cannot be in the past');
            return;
        }
        if (isBefore(endDateTime, startDateTime)) {
            setError('End time must be after start time');
            return;
        }
        onSubmit({
            deviceId: parseInt(selectedDeviceId),
            startAt,
            endAt,
            purpose,
        });
    };
    // Get available devices (not already reserved for the same time)
    const availableDevices = devices.filter((d) => d.status !== 'disconnected');
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Request Device Reservation
                    </DialogTitle>
                    <DialogDescription>
                        Request exclusive access to a USB device for a specific
                        time period. An administrator will review and approve
                        your request.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="device">USB Device</Label>
                        {devicesLoading ? (
                            <Skeleton className="h-10 w-full" />
                        ) : (
                            <Select
                                value={selectedDeviceId}
                                onValueChange={setSelectedDeviceId}
                            >
                                <SelectTrigger id="device">
                                    <SelectValue placeholder="Select a device..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableDevices.length === 0 ? (
                                        <SelectItem value="_none" disabled>
                                            No devices available
                                        </SelectItem>
                                    ) : (
                                        availableDevices.map((device) => (
                                            <SelectItem
                                                key={device.id}
                                                value={String(device.id)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Usb className="h-4 w-4" />
                                                    <span>{device.name}</span>
                                                    <span className="text-muted-foreground">
                                                        (
                                                        {
                                                            device.gateway_node_name
                                                        }
                                                        )
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start-date">Start Date</Label>
                            <Input
                                id="start-date"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                min={format(new Date(), 'yyyy-MM-dd')}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="start-time">Start Time</Label>
                            <Input
                                id="start-time"
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="end-date">End Date</Label>
                            <Input
                                id="end-date"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={
                                    startDate ||
                                    format(new Date(), 'yyyy-MM-dd')
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end-time">End Time</Label>
                            <Input
                                id="end-time"
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="purpose">
                            Purpose
                            <span className="ml-1 text-muted-foreground">
                                (optional)
                            </span>
                        </Label>
                        <Textarea
                            id="purpose"
                            placeholder="Describe why you need this device..."
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting}>
                        {submitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Calendar className="mr-2 h-4 w-4" />
                                Submit Request
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
export default function MyReservationsPage() {
    const [reservations, setReservations] = useState<UsbDeviceReservation[]>(
        [],
    );
    const [devices, setDevices] = useState<UsbDevice[]>([]);
    const [loading, setLoading] = useState(true);
    const [devicesLoading, setDevicesLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('active');
    const fetchReservations = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await reservationApi.getMyReservations();
            setReservations(data);
        } catch {
            setError('Failed to load reservations');
        } finally {
            setLoading(false);
        }
    }, []);
    const fetchDevices = useCallback(async () => {
        try {
            setDevicesLoading(true);
            const data = await hardwareApi.getDevices();
            setDevices(data);
        } catch {
            // Silently fail - devices are only needed for the dialog
        } finally {
            setDevicesLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchReservations();
    }, [fetchReservations]);
    // Poll for status updates when there are pending reservations
    useEffect(() => {
        const hasPending = reservations.some((r) => r.status === 'pending');
        if (!hasPending) return;
        const pollInterval = setInterval(async () => {
            try {
                const data = await reservationApi.getMyReservations();
                // Check if any status changed
                const oldPending = reservations
                    .filter((r) => r.status === 'pending')
                    .map((r) => r.id);
                const newStatuses = data.filter((r) =>
                    oldPending.includes(r.id),
                );
                newStatuses.forEach((newRes) => {
                    const oldRes = reservations.find((r) => r.id === newRes.id);
                    if (
                        oldRes &&
                        oldRes.status === 'pending' &&
                        newRes.status !== 'pending'
                    ) {
                        // Status changed - show toast
                        if (newRes.status === 'approved') {
                            toast.success('Reservation Approved', {
                                description: `Your reservation for ${newRes.device?.name || 'device'} has been approved.`,
                            });
                        } else if (newRes.status === 'rejected') {
                            toast.error('Reservation Rejected', {
                                description: `Your reservation request was not approved.`,
                            });
                        }
                    }
                });
                setReservations(data);
            } catch {
                // Silently fail - will retry on next poll
            }
        }, 30000); // Poll every 30 seconds
        return () => clearInterval(pollInterval);
    }, [reservations]);
    const handleOpenDialog = () => {
        setDialogOpen(true);
        fetchDevices();
    };
    const handleCancel = async (reservationId: number) => {
        try {
            setActionLoading(true);
            await reservationApi.cancel(reservationId);
            await fetchReservations();
        } catch {
            setError('Failed to cancel reservation');
        } finally {
            setActionLoading(false);
        }
    };
    const handleSubmitReservation = async (data: {
        deviceId: number;
        startAt: string;
        endAt: string;
        purpose: string;
    }) => {
        try {
            setSubmitting(true);
            await reservationApi.create({
                usb_device_id: data.deviceId,
                start_at: data.startAt,
                end_at: data.endAt,
                purpose: data.purpose || undefined,
            });
            setDialogOpen(false);
            await fetchReservations();
        } catch {
            setError('Failed to create reservation request');
        } finally {
            setSubmitting(false);
        }
    };
    // Categorize reservations
    const activeReservations = reservations.filter(
        (r) => r.status === 'active',
    );
    const pendingReservations = reservations.filter(
        (r) => r.status === 'pending',
    );
    const approvedReservations = reservations.filter(
        (r) => r.status === 'approved',
    );
    const upcomingReservations = [
        ...pendingReservations,
        ...approvedReservations,
    ];
    const pastReservations = reservations.filter(
        (r) =>
            r.status === 'completed' ||
            r.status === 'rejected' ||
            r.status === 'cancelled',
    );
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Reservations" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            My Reservations
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your USB device reservation requests
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={fetchReservations}
                                        disabled={loading}
                                    >
                                        <RefreshCw
                                            className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                                        />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Refresh reservations
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Button onClick={handleOpenDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Request Reservation
                        </Button>
                    </div>
                </div>
                {/* Help alert for new users */}
                <Alert>
                    <HelpCircle className="h-4 w-4" />
                    <AlertTitle>How Reservations Work</AlertTitle>
                    <AlertDescription>
                        <ol className="mt-2 list-inside list-decimal space-y-1">
                            <li>
                                Request a device reservation specifying when you
                                need it
                            </li>
                            <li>
                                An administrator reviews and approves/rejects
                                your request
                            </li>
                            <li>
                                Once approved, you can attach the device during
                                your reserved time
                            </li>
                            <li>
                                Other users cannot attach the device during your
                                reservation
                            </li>
                        </ol>
                    </AlertDescription>
                </Alert>
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {/* Stats cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Active Now</CardDescription>
                            <CardTitle className="text-3xl text-green-600">
                                {activeReservations.length}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Pending Approval</CardDescription>
                            <CardTitle className="text-3xl text-yellow-600">
                                {pendingReservations.length}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Approved Upcoming</CardDescription>
                            <CardTitle className="text-3xl text-blue-600">
                                {approvedReservations.length}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Past Reservations</CardDescription>
                            <CardTitle className="text-3xl text-gray-600">
                                {pastReservations.length}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>
                {/* Tabs */}
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="flex-1"
                >
                    <TabsList>
                        <TabsTrigger value="active" className="gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Active ({activeReservations.length})
                        </TabsTrigger>
                        <TabsTrigger value="upcoming" className="gap-2">
                            <Clock className="h-4 w-4" />
                            Upcoming ({upcomingReservations.length})
                        </TabsTrigger>
                        <TabsTrigger value="history" className="gap-2">
                            <Calendar className="h-4 w-4" />
                            History ({pastReservations.length})
                        </TabsTrigger>
                    </TabsList>
                    {/* Active reservations */}
                    <TabsContent value="active" className="mt-4">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2].map((i) => (
                                    <Skeleton key={i} className="h-40 w-full" />
                                ))}
                            </div>
                        ) : activeReservations.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <CheckCircle2 className="mb-4 h-12 w-12 text-muted-foreground" />
                                    <p className="text-center text-muted-foreground">
                                        No active reservations right now.
                                        <br />
                                        Your approved reservations will appear
                                        here when they become active.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div>
                                {activeReservations.map((r) => (
                                    <ReservationCard
                                        key={r.id}
                                        reservation={r}
                                        onCancel={handleCancel}
                                        actionLoading={actionLoading}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                    {/* Upcoming (pending + approved) */}
                    <TabsContent value="upcoming" className="mt-4">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-40 w-full" />
                                ))}
                            </div>
                        ) : upcomingReservations.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                                    <p className="mb-4 text-center text-muted-foreground">
                                        No upcoming reservations.
                                    </p>
                                    <Button onClick={handleOpenDialog}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Request Your First Reservation
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div>
                                {/* Pending first, then approved */}
                                {pendingReservations.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            Pending Approval (
                                            {pendingReservations.length})
                                        </h3>
                                        {pendingReservations.map((r) => (
                                            <ReservationCard
                                                key={r.id}
                                                reservation={r}
                                                onCancel={handleCancel}
                                                actionLoading={actionLoading}
                                            />
                                        ))}
                                    </div>
                                )}
                                {approvedReservations.length > 0 && (
                                    <div>
                                        <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Approved (
                                            {approvedReservations.length})
                                        </h3>
                                        {approvedReservations.map((r) => (
                                            <ReservationCard
                                                key={r.id}
                                                reservation={r}
                                                onCancel={handleCancel}
                                                actionLoading={actionLoading}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>
                    {/* History (completed, rejected, cancelled) */}
                    <TabsContent value="history" className="mt-4">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-32 w-full" />
                                ))}
                            </div>
                        ) : pastReservations.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                                    <p className="text-center text-muted-foreground">
                                        No reservation history yet.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div>
                                {pastReservations.map((r) => (
                                    <ReservationCard
                                        key={r.id}
                                        reservation={r}
                                        onCancel={handleCancel}
                                        actionLoading={actionLoading}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
            {/* Request Reservation Dialog */}
            <RequestReservationDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                devices={devices}
                devicesLoading={devicesLoading}
                onSubmit={handleSubmitReservation}
                submitting={submitting}
            />
        </AppLayout>
    );
}

