import { Head } from '@inertiajs/react';
import { format, isBefore, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    Calendar,
    CalendarClock,
    Camera as CameraIcon,
    CheckCircle2,
    Clock,
    Database,
    Eye,
    HelpCircle,
    Loader2,
    Plus,
    RefreshCw,
    Trash2,
    Usb,
    XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { cameraReservationApi } from '@/api/camera.api';
import { hardwareApi, reservationApi } from '@/api/hardware.api';
import { vmReservationApi } from '@/api/vm.api';
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
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type {
    Camera,
    CameraReservation,
    CameraReservationStatus,
} from '@/types/camera.types';
import type {
    UsbDevice,
    UsbDeviceReservation,
    UsbReservationStatus,
} from '@/types/hardware.types';
import type {
    ProxmoxVMInfo,
    VMReservation,
} from '@/types/vm.types';

type ReservationKind = 'usb' | 'camera' | 'vm';
type ReservationStatus = UsbReservationStatus | CameraReservationStatus | 'pending' | 'approved' | 'rejected' | 'cancelled' | 'active' | 'completed';
type ReservationRecord = UsbDeviceReservation | CameraReservation | VMReservation;

interface RequestableItem {
    id: number;
    label: string;
    description?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reservations', href: '/reservations' },
];

const STATUS_CONFIG: Record<
    ReservationStatus,
    { color: string; label: string; icon: React.ReactNode }
> = {
    pending: {
        color: 'bg-yellow-500',
        label: 'Pending Approval',
        icon: <Clock className="h-4 w-4" />,
    },
    approved: {
        color: 'bg-blue-500',
        label: 'Approved',
        icon: <CheckCircle2 className="h-4 w-4" />,
    },
    rejected: {
        color: 'bg-red-500',
        label: 'Rejected',
        icon: <XCircle className="h-4 w-4" />,
    },
    cancelled: {
        color: 'bg-gray-500',
        label: 'Cancelled',
        icon: <XCircle className="h-4 w-4" />,
    },
    active: {
        color: 'bg-green-500',
        label: 'Active Now',
        icon: <CheckCircle2 className="h-4 w-4" />,
    },
    completed: {
        color: 'bg-gray-400',
        label: 'Completed',
        icon: <CheckCircle2 className="h-4 w-4" />,
    },
};

function formatDateTime(value: string | null | undefined): string {
    if (!value) return '—';
    return format(parseISO(value), 'MMM d, yyyy h:mm a');
}

function formatDateTimeShort(value: string | null | undefined): string {
    if (!value) return '—';
    return format(parseISO(value), 'MMM d, h:mm a');
}

function getReservationId(kind: ReservationKind, reservation: ReservationRecord): number {
    if (kind === 'usb' || kind === 'camera') {
        return (reservation as UsbDeviceReservation | CameraReservation).id;
    }
    return (reservation as VMReservation).id;
}

function getReservationStatus(
    kind: ReservationKind,
    reservation: ReservationRecord,
): ReservationStatus {
    return kind === 'usb'
        ? (reservation as UsbDeviceReservation).status
        : (reservation as CameraReservation).status;
}

function getReservationSubject(
    kind: ReservationKind,
    reservation: ReservationRecord,
): string {
    if (kind === 'usb') {
        const usbReservation = reservation as UsbDeviceReservation;
        return (
            usbReservation.device?.name ??
            `USB Device #${usbReservation.usb_device_id}`
        );
    }

    if (kind === 'camera') {
        const cameraReservation = reservation as CameraReservation;
        return cameraReservation.camera?.name ?? `Camera #${cameraReservation.camera_id}`;
    }

    const vmReservation = reservation as VMReservation;
    return vmReservation.vm_name ?? `VM #${vmReservation.vm_id}`;
}

function getReservationSource(
    kind: ReservationKind,
    reservation: ReservationRecord,
): string {
    if (kind === 'usb') {
        return (
            (reservation as UsbDeviceReservation).device?.gateway_node_name ??
            'Unknown gateway'
        );
    }

    if (kind === 'camera') {
        return (
            (reservation as CameraReservation).camera?.source_name ??
            (reservation as CameraReservation).camera?.gateway_name ??
            (reservation as CameraReservation).camera?.robot_name ??
            'Unknown source'
        );
    }

    const vmReservation = reservation as VMReservation;
    return vmReservation.node_name ?? 'Unknown node';
}

function getReservationResourceId(
    kind: ReservationKind,
    reservation: ReservationRecord,
): number {
    if (kind === 'usb') {
        return (reservation as UsbDeviceReservation).usb_device_id;
    }
    if (kind === 'camera') {
        return (reservation as CameraReservation).camera_id;
    }
    return (reservation as VMReservation).vm_id;
}

function getReservationRequestedStart(reservation: ReservationRecord): string | null {
    return reservation.requested_start_at;
}

function getReservationRequestedEnd(reservation: ReservationRecord): string | null {
    return reservation.requested_end_at;
}

function getReservationApprovedStart(reservation: ReservationRecord): string | null {
    return reservation.approved_start_at;
}

function getReservationApprovedEnd(reservation: ReservationRecord): string | null {
    return reservation.approved_end_at;
}

function canCancelReservation(reservation: ReservationRecord): boolean {
    return reservation.status === 'pending' || reservation.status === 'approved';
}

interface ReservationCardProps {
    kind: ReservationKind;
    reservation: ReservationRecord;
    actionLoading: boolean;
    onCancel: (kind: ReservationKind, reservationId: number) => void;
    onViewDetails: (kind: ReservationKind, reservationId: number) => void;
    onViewCalendar: (
        kind: ReservationKind,
        resourceId: number,
        subject: string,
    ) => void;
}

function ReservationCard({
    kind,
    reservation,
    actionLoading,
    onCancel,
    onViewDetails,
    onViewCalendar,
}: ReservationCardProps) {
    const status = getReservationStatus(kind, reservation);
    const statusConfig = STATUS_CONFIG[status];
    const isActive = status === 'active';
    const resourceId = getReservationResourceId(kind, reservation);
    const reservationId = getReservationId(kind, reservation);
    const subject = getReservationSubject(kind, reservation);
    const source = getReservationSource(kind, reservation);
    const Icon = kind === 'usb' ? Usb : kind === 'camera' ? CameraIcon : Database;

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
                                <Icon
                                    className={`h-5 w-5 ${isActive ? 'text-green-600' : ''}`}
                                />
                            </div>
                            <div>
                                <CardTitle className="text-base">
                                    {subject}
                                </CardTitle>
                                <CardDescription>{source}</CardDescription>
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
                        {status === 'pending' && (
                            <div className="flex items-center gap-2 rounded-md bg-yellow-50 p-2 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                                <Clock className="h-4 w-4" />
                                <span>
                                    Requested:{' '}
                                    {formatDateTimeShort(
                                        getReservationRequestedStart(reservation),
                                    )}{' '}
                                    —{' '}
                                    {formatDateTimeShort(
                                        getReservationRequestedEnd(reservation),
                                    )}
                                </span>
                            </div>
                        )}
                        {(status === 'approved' || status === 'active') && (
                            <div
                                className={`flex items-center gap-2 rounded-md p-2 ${isActive ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200' : 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'}`}
                            >
                                <CalendarClock className="h-4 w-4" />
                                <span>
                                    {isActive ? 'Active until: ' : 'Approved for: '}
                                    {formatDateTimeShort(
                                        getReservationApprovedStart(reservation),
                                    )}{' '}
                                    —{' '}
                                    {formatDateTimeShort(
                                        getReservationApprovedEnd(reservation),
                                    )}
                                </span>
                            </div>
                        )}
                        {status === 'rejected' && reservation.admin_notes && (
                            <div className="flex items-start gap-2 rounded-md bg-red-50 p-2 text-red-800 dark:bg-red-900/20 dark:text-red-200">
                                <AlertCircle className="mt-0.5 h-4 w-4" />
                                <div>
                                    <span className="font-medium">
                                        Rejection reason:
                                    </span>
                                    <p className="mt-1">{reservation.admin_notes}</p>
                                </div>
                            </div>
                        )}
                        {reservation.purpose && (
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">Purpose:</span>
                                <span className="max-w-[280px] text-right">
                                    {reservation.purpose}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between text-muted-foreground">
                            <span>Submitted:</span>
                            <span>{formatDateTime(reservation.created_at)}</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2 border-t pt-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewDetails(kind, reservationId)}
                        >
                            <Eye className="mr-1 h-4 w-4" />
                            Details
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                                onViewCalendar(kind, resourceId, subject)
                            }
                        >
                            <Calendar className="mr-1 h-4 w-4" />
                            Calendar
                        </Button>
                        {canCancelReservation(reservation) && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onCancel(kind, reservationId)}
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
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

interface RequestReservationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    kind: ReservationKind;
    items: RequestableItem[];
    itemsLoading: boolean;
    trainingPaths?: Array<{ id: number; title: string }>;
    onSubmit: (data: {
        resourceId: number;
        startAt: string;
        endAt: string;
        purpose: string;
        trainingPathId?: number;
    }) => void;
    submitting: boolean;
}

function RequestReservationDialog({
    open,
    onOpenChange,
    kind,
    items,
    itemsLoading,
    trainingPaths,
    onSubmit,
    submitting,
}: RequestReservationDialogProps) {
    const [selectedResourceId, setSelectedResourceId] = useState<string>('');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');
    const [purpose, setPurpose] = useState('');
    const [trainingPathId, setTrainingPathId] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const resetForm = () => {
        setSelectedResourceId('');
        setStartDate('');
        setStartTime('');
        setEndDate('');
        setEndTime('');
        setPurpose('');
        setTrainingPathId('');
        setError(null);
    };

    const handleOpenChange = (nextOpen: boolean) => {
        resetForm();
        onOpenChange(nextOpen);
    };

    const handleSubmit = () => {
        setError(null);

        if (!selectedResourceId) {
            setError(
                `Please select a ${kind === 'usb' ? 'USB device' : kind === 'camera' ? 'camera' : 'VM'}`,
            );
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
            resourceId: Number(selectedResourceId),
            startAt,
            endAt,
            purpose,
            trainingPathId: trainingPathId ? Number(trainingPathId) : undefined,
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {kind === 'usb' ? (
                            <Usb className="h-5 w-5" />
                        ) : kind === 'camera' ? (
                            <CameraIcon className="h-5 w-5" />
                        ) : (
                            <Database className="h-5 w-5" />
                        )}
                        Request {kind === 'usb' ? 'USB Device' : kind === 'camera' ? 'Camera' : 'VM'} Reservation
                    </DialogTitle>
                    <DialogDescription>
                        Request exclusive access to a{' '}                        {kind === 'usb' ? 'USB device' : kind === 'camera' ? 'camera' : 'VM'} for a specific
                        time period. An administrator will review your request.
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
                        <Label htmlFor="reservation-item">
                            {kind === 'usb' ? 'USB Device' : kind === 'camera' ? 'Camera' : 'VM'}
                        </Label>
                        {itemsLoading ? (
                            <Skeleton className="h-10 w-full" />
                        ) : (
                            <Select
                                value={selectedResourceId}
                                onValueChange={setSelectedResourceId}
                            >
                                <SelectTrigger id="reservation-item">
                                    <SelectValue
                                        placeholder={`Select a ${kind === 'usb' ? 'device' : kind === 'camera' ? 'camera' : 'VM'}...`}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {items.length === 0 ? (
                                        <SelectItem value="_none" disabled>
                                            Nothing available right now
                                        </SelectItem>
                                    ) : (
                                        items.map((item) => (
                                            <SelectItem
                                                key={item.id}
                                                value={String(item.id)}
                                            >
                                                <div className="flex flex-col">
                                                    <span>{item.label}</span>
                                                    {item.description && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {item.description}
                                                        </span>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    {kind === 'vm' && (
                        <div className="space-y-2">
                            <Label htmlFor="training-path">
                                Training Path
                                <span className="ml-1 text-muted-foreground">
                                    (optional)
                                </span>
                            </Label>
                            <Select
                                value={trainingPathId || '__none__'}
                                onValueChange={(value) =>
                                    setTrainingPathId(value === '__none__' ? '' : value)
                                }
                            >
                                <SelectTrigger id="training-path">
                                    <SelectValue placeholder="Select a training path (optional)..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none__">None</SelectItem>
                                    {trainingPaths?.map((path) => (
                                        <SelectItem
                                            key={path.id}
                                            value={String(path.id)}
                                        >
                                            {path.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start-date">Start Date</Label>
                            <Input
                                id="start-date"
                                type="date"
                                value={startDate}
                                onChange={(event) =>
                                    setStartDate(event.target.value)
                                }
                                min={format(new Date(), 'yyyy-MM-dd')}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="start-time">Start Time</Label>
                            <Input
                                id="start-time"
                                type="time"
                                value={startTime}
                                onChange={(event) =>
                                    setStartTime(event.target.value)
                                }
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
                                onChange={(event) => setEndDate(event.target.value)}
                                min={startDate || format(new Date(), 'yyyy-MM-dd')}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end-time">End Time</Label>
                            <Input
                                id="end-time"
                                type="time"
                                value={endTime}
                                onChange={(event) =>
                                    setEndTime(event.target.value)
                                }
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
                            placeholder={`Describe why you need this ${kind === 'usb' ? 'device' : 'camera'}...`}
                            value={purpose}
                            onChange={(event) => setPurpose(event.target.value)}
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

function ReservationDetailsDialog({
    open,
    onOpenChange,
    kind,
    reservation,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    kind: ReservationKind | null;
    reservation: ReservationRecord | null;
}) {
    if (!kind || !reservation) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[560px]">
                <DialogHeader>
                    <DialogTitle>
                        {kind === 'usb' ? 'USB Reservation Details' : 'Camera Reservation Details'}
                    </DialogTitle>
                    <DialogDescription>
                        {getReservationSubject(kind, reservation)}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 text-sm">
                    <div className="grid gap-1">
                        <span className="text-muted-foreground">Source</span>
                        <span>{getReservationSource(kind, reservation)}</span>
                    </div>
                    <div className="grid gap-1">
                        <span className="text-muted-foreground">Requested Window</span>
                        <span>
                            {formatDateTime(getReservationRequestedStart(reservation))} —{' '}
                            {formatDateTime(getReservationRequestedEnd(reservation))}
                        </span>
                    </div>
                    <div className="grid gap-1">
                        <span className="text-muted-foreground">Approved Window</span>
                        <span>
                            {formatDateTime(getReservationApprovedStart(reservation))} —{' '}
                            {formatDateTime(getReservationApprovedEnd(reservation))}
                        </span>
                    </div>
                    <div className="grid gap-1">
                        <span className="text-muted-foreground">Status</span>
                        <span>{STATUS_CONFIG[reservation.status].label}</span>
                    </div>
                    <div className="grid gap-1">
                        <span className="text-muted-foreground">Purpose</span>
                        <span>{reservation.purpose || '—'}</span>
                    </div>
                    <div className="grid gap-1">
                        <span className="text-muted-foreground">Admin Notes</span>
                        <span>{reservation.admin_notes || '—'}</span>
                    </div>
                    <div className="grid gap-1">
                        <span className="text-muted-foreground">Submitted</span>
                        <span>{formatDateTime(reservation.created_at)}</span>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ReservationCalendarDialog({
    open,
    onOpenChange,
    kind,
    subject,
    reservations,
    loading,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    kind: ReservationKind | null;
    subject: string;
    reservations: ReservationRecord[];
    loading: boolean;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[620px]">
                <DialogHeader>
                    <DialogTitle>
                        {kind === 'camera' ? 'Camera Calendar' : 'USB Device Calendar'}
                    </DialogTitle>
                    <DialogDescription>{subject}</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-4">
                    {loading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    ) : reservations.length === 0 ? (
                        <Card>
                            <CardContent className="py-8 text-center text-sm text-muted-foreground">
                                No upcoming reservations found for this resource.
                            </CardContent>
                        </Card>
                    ) : (
                        reservations.map((reservation) => (
                            <Card key={reservation.id}>
                                <CardContent className="flex items-start justify-between gap-4 py-4">
                                    <div className="space-y-1">
                                        <p className="font-medium">
                                            {STATUS_CONFIG[reservation.status].label}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDateTime(
                                                reservation.approved_start_at ||
                                                    reservation.requested_start_at,
                                            )}{' '}
                                            —{' '}
                                            {formatDateTime(
                                                reservation.approved_end_at ||
                                                    reservation.requested_end_at,
                                            )}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Requested by {reservation.user?.name || 'another engineer'}
                                        </p>
                                    </div>
                                    <Badge
                                        className={`${STATUS_CONFIG[reservation.status].color} text-white`}
                                    >
                                        {reservation.status_label}
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function splitReservations<T extends ReservationRecord>(reservations: T[]) {
    const active = reservations.filter((reservation) => reservation.status === 'active');
    const pending = reservations.filter((reservation) => reservation.status === 'pending');
    const approved = reservations.filter((reservation) => reservation.status === 'approved');
    const upcoming = [...pending, ...approved];
    const history = reservations.filter((reservation) =>
        ['completed', 'rejected', 'cancelled'].includes(reservation.status),
    );

    return {
        active,
        pending,
        approved,
        upcoming,
        history,
    };
}

export default function MyReservationsPage() {
    const [usbReservations, setUsbReservations] = useState<UsbDeviceReservation[]>([]);
    const [cameraReservations, setCameraReservations] = useState<CameraReservation[]>([]);
    const [vmReservations, setVmReservations] = useState<VMReservation[]>([]);
    const [usbDevices, setUsbDevices] = useState<UsbDevice[]>([]);
    const [cameras, setCameras] = useState<Camera[]>([]);
    const [vms, setVms] = useState<ProxmoxVMInfo[]>([]);
    const [trainingPaths, setTrainingPaths] = useState<Array<{ id: number; title: string }>>([]);
    const [loading, setLoading] = useState(true);
    const [resourceLoading, setResourceLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [requestDialogOpen, setRequestDialogOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [detailsKind, setDetailsKind] = useState<ReservationKind | null>(null);
    const [detailsReservation, setDetailsReservation] =
        useState<ReservationRecord | null>(null);
    const [calendarKind, setCalendarKind] = useState<ReservationKind | null>(null);
    const [calendarSubject, setCalendarSubject] = useState('');
    const [calendarReservations, setCalendarReservations] = useState<
        ReservationRecord[]
    >([]);
    const [calendarLoading, setCalendarLoading] = useState(false);
    const [resourceTab, setResourceTab] = useState<ReservationKind>(() => {
        if (typeof window === 'undefined') {
            return 'usb';
        }

        return window.location.search.includes('tab=cameras') ? 'camera' : 'usb';
    });
    const [statusTab, setStatusTab] = useState('active');

    const fetchReservations = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [usbData, cameraData, vmData] = await Promise.all([
                reservationApi.getMyReservations(),
                cameraReservationApi.getMyReservations(),
                vmReservationApi.getMyReservations(),
            ]);

            setUsbReservations(usbData);
            setCameraReservations(cameraData);
            setVmReservations(vmData);
        } catch {
            setError('Failed to load reservations');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchResourcesForDialog = useCallback(async (kind: ReservationKind) => {
        try {
            setResourceLoading(true);

            if (kind === 'usb') {
                const devices = await hardwareApi.getDevices();
                setUsbDevices(
                    devices.filter((device) => device.status !== 'disconnected'),
                );
                return;
            }

            if (kind === 'camera') {
                const availableCameras = await cameraReservationApi.getCameras();
                setCameras(availableCameras);
                return;
            }

            if (kind === 'vm') {
                const [availableVMs, paths] = await Promise.all([
                    vmReservationApi.getAvailableVMs(),
                    vmReservationApi.getMyTrainingPaths(),
                ]);
                setVms(availableVMs);
                setTrainingPaths(paths);
            }
        } finally {
            setResourceLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchReservations();
    }, [fetchReservations]);

    useEffect(() => {
        const hasPending = [...usbReservations, ...cameraReservations, ...vmReservations].some(
            (reservation) => reservation.status === 'pending',
        );

        if (!hasPending) {
            return;
        }

        const interval = setInterval(() => {
            void fetchReservations();
        }, 30000);

        return () => clearInterval(interval);
    }, [cameraReservations, fetchReservations, usbReservations, vmReservations]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const nextUrl =
            resourceTab === 'camera' ? '/reservations?tab=cameras' : '/reservations';
        window.history.replaceState({}, '', nextUrl);
    }, [resourceTab]);

    const usbBreakdown = useMemo(
        () => splitReservations(usbReservations),
        [usbReservations],
    );
    const cameraBreakdown = useMemo(
        () => splitReservations(cameraReservations),
        [cameraReservations],
    );
    const vmBreakdown = useMemo(
        () => splitReservations(vmReservations),
        [vmReservations],
    );

    const currentBreakdown = resourceTab === 'usb' ? usbBreakdown : resourceTab === 'camera' ? cameraBreakdown : vmBreakdown;
    const currentReservations =
        statusTab === 'active'
            ? currentBreakdown.active
            : statusTab === 'upcoming'
              ? currentBreakdown.upcoming
              : currentBreakdown.history;

    const requestableItems = useMemo<RequestableItem[]>(
        () =>
            resourceTab === 'usb'
                ? usbDevices.map((device) => ({
                      id: device.id,
                      label: device.name,
                      description: device.gateway_node_name || device.busid,
                  }))
                : resourceTab === 'camera'
                  ? cameras.map((camera) => ({
                        id: camera.id,
                        label: camera.name,
                        description: camera.source_name,
                    }))
                  : vms.map((vm) => ({
                        id: vm.vmid,
                        label: vm.name,
                        description: `${vm.node_name} (${vm.server_name})`,
                    })),
        [cameras, resourceTab, usbDevices, vms],
    );

    const handleOpenRequestDialog = () => {
        setRequestDialogOpen(true);
        void fetchResourcesForDialog(resourceTab);
    };

    const handleCancel = async (
        kind: ReservationKind,
        reservationId: number,
    ) => {
        try {
            setActionLoading(true);

            if (kind === 'usb') {
                await reservationApi.cancel(reservationId);
            } else if (kind === 'camera') {
                await cameraReservationApi.cancel(reservationId);
            } else {
                await vmReservationApi.cancel(reservationId);
            }

            await fetchReservations();
        } catch {
            setError('Failed to cancel reservation');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSubmitReservation = async (data: {
        resourceId: number;
        startAt: string;
        endAt: string;
        purpose: string;
        trainingPathId?: number;
    }) => {
        try {
            setSubmitting(true);
            setError(null);

            if (resourceTab === 'usb') {
                await reservationApi.create({
                    usb_device_id: data.resourceId,
                    start_at: data.startAt,
                    end_at: data.endAt,
                    purpose: data.purpose || undefined,
                });
            } else if (resourceTab === 'camera') {
                await cameraReservationApi.create({
                    camera_id: data.resourceId,
                    start_at: data.startAt,
                    end_at: data.endAt,
                    purpose: data.purpose || undefined,
                });
            } else {
                const vm = vms.find((v) => v.vmid === data.resourceId);
                if (!vm) throw new Error('VM not found');
                await vmReservationApi.create({
                    node_id: vm.node_id,
                    vm_id: vm.vmid,
                    vm_name: vm.name,
                    start_at: data.startAt,
                    end_at: data.endAt,
                    purpose: data.purpose || undefined,
                    training_path_id: data.trainingPathId,
                });
            }

            toast.success('Reservation request submitted');
            setRequestDialogOpen(false);
            await fetchReservations();
        } catch (submitError) {
            const message =
                submitError instanceof Error
                    ? submitError.message
                    : 'Failed to create reservation request';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleViewDetails = async (
        kind: ReservationKind,
        reservationId: number,
    ) => {
        try {
            setActionLoading(true);
            setDetailsKind(kind);

            if (kind === 'usb') {
                setDetailsReservation(await reservationApi.get(reservationId));
            } else if (kind === 'camera') {
                setDetailsReservation(await cameraReservationApi.get(reservationId));
            } else {
                setDetailsReservation(await vmReservationApi.get(reservationId));
            }

            setDetailsOpen(true);
        } catch {
            setError('Failed to load reservation details');
        } finally {
            setActionLoading(false);
        }
    };

    const handleViewCalendar = async (
        kind: ReservationKind,
        resourceId: number,
        subject: string,
    ) => {
        try {
            setCalendarKind(kind);
            setCalendarSubject(subject);
            setCalendarLoading(true);
            setCalendarOpen(true);

            if (kind === 'usb') {
                setCalendarReservations(await reservationApi.getDeviceCalendar(resourceId));
            } else if (kind === 'camera') {
                setCalendarReservations(
                    await cameraReservationApi.getCameraCalendar(resourceId),
                );
            } else {
                const vm = vms.find((v) => v.vmid === resourceId);
                if (!vm) throw new Error('VM not found');
                setCalendarReservations(
                    await vmReservationApi.getVmCalendar(vm.node_id, vm.vmid),
                );
            }
        } catch {
            setError('Failed to load reservation calendar');
        } finally {
            setCalendarLoading(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reservations" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Reservations
                        </h1>
                        <p className="text-muted-foreground">
                            Manage USB device, camera, and VM reservation requests.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => void fetchReservations()}
                            disabled={loading}
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                            />
                        </Button>
                        <Button onClick={handleOpenRequestDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Request {resourceTab === 'usb' ? 'USB Device' : resourceTab === 'camera' ? 'Camera' : 'VM'}
                        </Button>
                    </div>
                </div>

                <Alert>
                    <HelpCircle className="h-4 w-4" />
                    <AlertTitle>How Reservations Work</AlertTitle>
                    <AlertDescription>
                        Request the time slot you need, wait for admin approval,
                        then use the approved USB device, camera, or VM during that
                        reserved window.
                    </AlertDescription>
                </Alert>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Tabs
                    value={resourceTab}
                    onValueChange={(value) =>
                        setResourceTab(value as ReservationKind)
                    }
                >
                    <TabsList>
                        <TabsTrigger value="usb" className="gap-2">
                            <Usb className="h-4 w-4" />
                            USB Devices
                        </TabsTrigger>
                        <TabsTrigger value="camera" className="gap-2">
                            <CameraIcon className="h-4 w-4" />
                            Cameras
                        </TabsTrigger>
                        <TabsTrigger value="vm" className="gap-2">
                            <Database className="h-4 w-4" />
                            VMs
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={resourceTab} className="mt-4 space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Active Now</CardDescription>
                                    <CardTitle className="text-3xl text-green-600">
                                        {currentBreakdown.active.length}
                                    </CardTitle>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Pending Approval</CardDescription>
                                    <CardTitle className="text-3xl text-yellow-600">
                                        {currentBreakdown.pending.length}
                                    </CardTitle>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Approved Upcoming</CardDescription>
                                    <CardTitle className="text-3xl text-blue-600">
                                        {currentBreakdown.approved.length}
                                    </CardTitle>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>History</CardDescription>
                                    <CardTitle className="text-3xl text-gray-600">
                                        {currentBreakdown.history.length}
                                    </CardTitle>
                                </CardHeader>
                            </Card>
                        </div>

                        <Tabs value={statusTab} onValueChange={setStatusTab}>
                            <TabsList>
                                <TabsTrigger value="active" className="gap-2">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Active ({currentBreakdown.active.length})
                                </TabsTrigger>
                                <TabsTrigger value="upcoming" className="gap-2">
                                    <Clock className="h-4 w-4" />
                                    Upcoming ({currentBreakdown.upcoming.length})
                                </TabsTrigger>
                                <TabsTrigger value="history" className="gap-2">
                                    <Calendar className="h-4 w-4" />
                                    History ({currentBreakdown.history.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value={statusTab} className="mt-4">
                                {loading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((index) => (
                                            <Skeleton
                                                key={index}
                                                className="h-40 w-full"
                                            />
                                        ))}
                                    </div>
                                ) : currentReservations.length === 0 ? (
                                    <Card>
                                        <CardContent className="flex flex-col items-center justify-center py-12">
                                            {resourceTab === 'usb' ? (
                                                <Usb className="mb-4 h-12 w-12 text-muted-foreground" />
                                            ) : resourceTab === 'camera' ? (
                                                <CameraIcon className="mb-4 h-12 w-12 text-muted-foreground" />
                                            ) : (
                                                <Database className="mb-4 h-12 w-12 text-muted-foreground" />
                                            )}
                                            <p className="mb-4 text-center text-muted-foreground">
                                                No {resourceTab === 'usb' ? 'USB device' : resourceTab === 'camera' ? 'camera' : 'VM'} reservations in this section.
                                            </p>
                                            <Button onClick={handleOpenRequestDialog}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Request {resourceTab === 'usb' ? 'USB Device' : resourceTab === 'camera' ? 'Camera' : 'VM'}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    currentReservations.map((reservation) => (
                                        <ReservationCard
                                            key={`${resourceTab}-${reservation.id}`}
                                            kind={resourceTab}
                                            reservation={reservation}
                                            actionLoading={actionLoading}
                                            onCancel={handleCancel}
                                            onViewDetails={handleViewDetails}
                                            onViewCalendar={handleViewCalendar}
                                        />
                                    ))
                                )}
                            </TabsContent>
                        </Tabs>
                    </TabsContent>
                </Tabs>
            </div>

            <RequestReservationDialog
                open={requestDialogOpen}
                onOpenChange={setRequestDialogOpen}
                kind={resourceTab}
                items={requestableItems}
                itemsLoading={resourceLoading}
                trainingPaths={trainingPaths}
                onSubmit={handleSubmitReservation}
                submitting={submitting}
            />

            <ReservationDetailsDialog
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                kind={detailsKind}
                reservation={detailsReservation}
            />

            <ReservationCalendarDialog
                open={calendarOpen}
                onOpenChange={setCalendarOpen}
                kind={calendarKind}
                subject={calendarSubject}
                reservations={calendarReservations}
                loading={calendarLoading}
            />
        </AppLayout>
    );
}
