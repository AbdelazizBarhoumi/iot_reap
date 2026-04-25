/**
 * Admin Reservations Page.
 * Manage USB reservation requests/device blocks, camera reservation approvals,
 * and VM reservation approvals.
 */
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    Calendar,
    Check,
    Clock,
    Loader2,
    Lock,
    Monitor,
    RefreshCw,
    Usb,
    Video,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { adminCameraApi } from '@/api/camera.api';
import { adminReservationApi, hardwareApi } from '@/api/hardware.api';
import { usersApi } from '@/api/users.api';
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
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Camera, CameraReservation } from '@/types/camera.types';
import type {
    RunningVm,
    ReservationUser,
    UsbDevice,
    UsbDeviceReservation,
    UsbReservationStatus,
} from '@/types/hardware.types';
import type { VMReservation } from '@/types/vm.types';
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/reservations' },
    { title: 'Device Reservations', href: '/admin/reservations' },
];
const STATUS_COLORS: Record<UsbReservationStatus, string> = {
    pending: 'bg-yellow-500',
    approved: 'bg-blue-500',
    rejected: 'bg-red-500',
    cancelled: 'bg-gray-500',
    active: 'bg-green-500',
    completed: 'bg-gray-400',
};

const RESERVATION_BADGE_COLORS: Record<string, string> = {
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    gray: 'bg-gray-500',
    green: 'bg-green-500',
};

const VM_STATUS_COLORS: Record<VMReservation['status'], string> = {
    pending: 'bg-yellow-500',
    approved: 'bg-blue-500',
    rejected: 'bg-red-500',
    cancelled: 'bg-gray-500',
    active: 'bg-green-500',
    completed: 'bg-gray-400',
};

function formatDateTime(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString();
}
interface ReservationCardProps {
    reservation: UsbDeviceReservation;
    onApprove: (id: number) => void;
    onReject: (id: number) => void;
    actionLoading: boolean;
}
function ReservationCard({
    reservation,
    onApprove,
    onReject,
    actionLoading,
}: ReservationCardProps) {
    const isPending = reservation.status === 'pending';
    return (
        <Card className="mb-4">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-muted p-2">
                            <Usb className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base">
                                {reservation.device?.name ||
                                    `Device #${reservation.usb_device_id}`}
                            </CardTitle>
                            <CardDescription>
                                Requested by{' '}
                                {reservation.user?.name || 'Unknown User'}
                            </CardDescription>
                        </div>
                    </div>
                    <Badge
                        className={`${STATUS_COLORS[reservation.status]} text-white`}
                    >
                        {reservation.is_admin_block
                            ? 'Admin Block'
                            : reservation.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            Requested Period:
                        </span>
                        <span>
                            {formatDateTime(reservation.requested_start_at)} —{' '}
                            {formatDateTime(reservation.requested_end_at)}
                        </span>
                    </div>
                    {(reservation.approved_start_at ||
                        reservation.approved_end_at) && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Approved Period:
                            </span>
                            <span>
                                {formatDateTime(reservation.approved_start_at)}{' '}
                                — {formatDateTime(reservation.approved_end_at)}
                            </span>
                        </div>
                    )}
                    {reservation.reason && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Reason:
                            </span>
                            <span className="max-w-[200px] truncate">
                                {reservation.reason}
                            </span>
                        </div>
                    )}
                    {reservation.admin_notes && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Admin Notes:
                            </span>
                            <span className="max-w-[200px] truncate">
                                {reservation.admin_notes}
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            Submitted:
                        </span>
                        <span>{formatDateTime(reservation.created_at)}</span>
                    </div>
                </div>
                {isPending && (
                    <div className="flex justify-end gap-2 border-t pt-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onReject(reservation.id)}
                            disabled={actionLoading}
                        >
                            <X className="mr-1 h-4 w-4" />
                            Reject
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => onApprove(reservation.id)}
                            disabled={actionLoading}
                        >
                            <Check className="mr-1 h-4 w-4" />
                            Approve
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface CameraReservationCardProps {
    reservation: CameraReservation;
    onApprove: (id: number) => void;
    onReject: (id: number) => void;
    actionLoading: boolean;
    showActions?: boolean;
}

function CameraReservationCard({
    reservation,
    onApprove,
    onReject,
    actionLoading,
    showActions = true,
}: CameraReservationCardProps) {
    return (
        <Card className="mb-4 border-yellow-200/50">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-yellow-500/10 p-2 text-yellow-600">
                            <Video className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base">
                                {reservation.camera?.name ??
                                    `Camera #${reservation.camera_id}`}
                            </CardTitle>
                            <CardDescription>
                                Requested by{' '}
                                {reservation.user?.name ?? 'Unknown User'}
                            </CardDescription>
                        </div>
                    </div>

                    <Badge
                        className={`${RESERVATION_BADGE_COLORS[reservation.status_color] ?? 'bg-yellow-500'} text-white`}
                    >
                        {reservation.status_label}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            Requested Period:
                        </span>
                        <span>
                            {formatDateTime(reservation.requested_start_at)} —{' '}
                            {formatDateTime(reservation.requested_end_at)}
                        </span>
                    </div>

                    {reservation.purpose && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Purpose:
                            </span>
                            <span className="max-w-[220px] truncate">
                                {reservation.purpose}
                            </span>
                        </div>
                    )}

                    {(reservation.approved_start_at ||
                        reservation.approved_end_at) && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Approved Period:
                            </span>
                            <span>
                                {formatDateTime(reservation.approved_start_at)}{' '}
                                — {formatDateTime(reservation.approved_end_at)}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            Submitted:
                        </span>
                        <span>{formatDateTime(reservation.created_at)}</span>
                    </div>
                </div>

                {showActions && (
                    <div className="flex justify-end gap-2 border-t pt-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onReject(reservation.id)}
                            disabled={actionLoading}
                        >
                            <X className="mr-1 h-4 w-4" />
                            Reject
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => onApprove(reservation.id)}
                            disabled={actionLoading}
                        >
                            <Check className="mr-1 h-4 w-4" />
                            Approve
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface VMReservationCardProps {
    reservation: VMReservation;
    onApprove: (id: number) => void;
    onReject: (id: number) => void;
    actionLoading: boolean;
    showActions?: boolean;
}

function VMReservationCard({
    reservation,
    onApprove,
    onReject,
    actionLoading,
    showActions = true,
}: VMReservationCardProps) {
    return (
        <Card className="mb-4 border-sky-200/50">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-sky-500/10 p-2 text-sky-600">
                            <Monitor className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base">
                                {reservation.vm_name ??
                                    `VM #${reservation.vm_id}`}
                            </CardTitle>
                            <CardDescription>
                                Requested by{' '}
                                {reservation.user?.name ?? 'Unknown User'}
                            </CardDescription>
                        </div>
                    </div>

                    <Badge
                        className={`${VM_STATUS_COLORS[reservation.status] ?? 'bg-sky-500'} text-white`}
                    >
                        {reservation.status_label}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            Requested Period:
                        </span>
                        <span>
                            {formatDateTime(reservation.requested_start_at)} —{' '}
                            {formatDateTime(reservation.requested_end_at)}
                        </span>
                    </div>

                    {reservation.purpose && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Purpose:
                            </span>
                            <span className="max-w-[220px] truncate">
                                {reservation.purpose}
                            </span>
                        </div>
                    )}

                    {(reservation.approved_start_at ||
                        reservation.approved_end_at) && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Approved Period:
                            </span>
                            <span>
                                {formatDateTime(reservation.approved_start_at)}{' '}
                                — {formatDateTime(reservation.approved_end_at)}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            Submitted:
                        </span>
                        <span>{formatDateTime(reservation.created_at)}</span>
                    </div>
                </div>

                {showActions && (
                    <div className="flex justify-end gap-2 border-t pt-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onReject(reservation.id)}
                            disabled={actionLoading}
                        >
                            <X className="mr-1 h-4 w-4" />
                            Reject
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => onApprove(reservation.id)}
                            disabled={actionLoading}
                        >
                            <Check className="mr-1 h-4 w-4" />
                            Approve
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface ApproveDialogProps {
    reservation: UsbDeviceReservation | null;
    open: boolean;
    onClose: () => void;
    onConfirm: (start: string, end: string, notes: string) => Promise<void>;
    loading: boolean;
}
function ApproveDialog({
    reservation,
    open,
    onClose,
    onConfirm,
    loading,
}: ApproveDialogProps) {
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [notes, setNotes] = useState('');

    const defaultStart = reservation?.requested_start_at?.slice(0, 16) ?? '';
    const defaultEnd = reservation?.requested_end_at?.slice(0, 16) ?? '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const approvedStart = start || defaultStart;
        const approvedEnd = end || defaultEnd;

        if (approvedStart && approvedEnd) {
            await onConfirm(approvedStart, approvedEnd, notes);
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Approve Reservation</DialogTitle>
                    <DialogDescription>
                        Set the approved time period for this device
                        reservation.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="approve-start">Start Time</Label>
                            <Input
                                id="approve-start"
                                type="datetime-local"
                                value={start || defaultStart}
                                onChange={(e) => setStart(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="approve-end">End Time</Label>
                            <Input
                                id="approve-end"
                                type="datetime-local"
                                value={end || defaultEnd}
                                onChange={(e) => setEnd(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="approve-notes">
                                Admin Notes (optional)
                            </Label>
                            <Input
                                id="approve-notes"
                                placeholder="Any notes for the user..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Approve
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
interface BlockDialogProps {
    devices: UsbDevice[];
    users: ReservationUser[];
    vms: RunningVm[];
    open: boolean;
    onClose: () => void;
    onConfirm: (
        deviceId: number,
        mode: 'block' | 'reserve_to_user' | 'reserve_to_vm',
        targetUserId: number | undefined,
        targetVmId: number | undefined,
        start: string,
        end: string,
        purpose: string | undefined,
        notes: string,
    ) => Promise<void>;
    loading: boolean;
}
function BlockDialog({
    devices,
    users,
    vms,
    open,
    onClose,
    onConfirm,
    loading,
}: BlockDialogProps) {
    const [deviceId, setDeviceId] = useState<string>('');
    const [mode, setMode] = useState<
        'block' | 'reserve_to_user' | 'reserve_to_vm'
    >('block');
    const [targetUserId, setTargetUserId] = useState<string>('');
    const [targetVmId, setTargetVmId] = useState<string>('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [purpose, setPurpose] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (deviceId && start && end) {
            await onConfirm(
                parseInt(deviceId, 10),
                mode,
                targetUserId ? parseInt(targetUserId, 10) : undefined,
                targetVmId ? parseInt(targetVmId, 10) : undefined,
                start,
                end,
                purpose || undefined,
                notes,
            );
            setDeviceId('');
            setMode('block');
            setTargetUserId('');
            setTargetVmId('');
            setStart('');
            setEnd('');
            setPurpose('');
            setNotes('');
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Block Device</DialogTitle>
                    <DialogDescription>
                        Create an admin block or reservation for a device during
                        a time period.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="block-device">Device</Label>
                            <Select
                                value={deviceId}
                                onValueChange={setDeviceId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a device..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {devices.map((device) => (
                                        <SelectItem
                                            key={device.id}
                                            value={device.id.toString()}
                                        >
                                            {device.name} ({device.vendor_id}:
                                            {device.product_id})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="block-mode">Reservation Mode</Label>
                            <Select
                                value={mode}
                                onValueChange={(value) =>
                                    setMode(
                                        value as
                                            | 'block'
                                            | 'reserve_to_user'
                                            | 'reserve_to_vm',
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="block">
                                        Block Device (unavailable for all)
                                    </SelectItem>
                                    <SelectItem value="reserve_to_user">
                                        Reserve for User (only specified user
                                        can use)
                                    </SelectItem>
                                    <SelectItem value="reserve_to_vm">
                                        Reserve for VM (only specified VM can
                                        use)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {mode === 'reserve_to_user' && (
                            <div className="space-y-2">
                                <Label htmlFor="block-target-user">
                                    Target User{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={targetUserId}
                                    onValueChange={setTargetUserId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a user..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((user) => (
                                            <SelectItem
                                                key={user.id}
                                                value={user.id.toString()}
                                            >
                                                {user.name} ({user.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {mode === 'reserve_to_vm' && (
                            <div className="space-y-2">
                                <Label htmlFor="block-target-vm">
                                    Target VM{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={targetVmId}
                                    onValueChange={setTargetVmId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a VM..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vms.map((vm) => (
                                            <SelectItem
                                                key={vm.vmid}
                                                value={vm.vmid.toString()}
                                            >
                                                {vm.name} ({vm.node})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {mode !== 'block' && (
                            <div className="space-y-2">
                                <Label htmlFor="block-purpose">Purpose</Label>
                                <Input
                                    id="block-purpose"
                                    placeholder="Why is this reserved? (e.g., Class, Maintenance)..."
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="block-start">Start Time</Label>
                            <Input
                                id="block-start"
                                type="datetime-local"
                                value={start}
                                onChange={(e) => setStart(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="block-end">End Time</Label>
                            <Input
                                id="block-end"
                                type="datetime-local"
                                value={end}
                                onChange={(e) => setEnd(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="block-notes">
                                Notes (optional)
                            </Label>
                            <Input
                                id="block-notes"
                                placeholder="Admin notes..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                loading ||
                                !deviceId ||
                                (mode === 'reserve_to_user' && !targetUserId) ||
                                (mode === 'reserve_to_vm' && !targetVmId)
                            }
                        >
                            {loading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            <Lock className="mr-1 h-4 w-4" />
                            {mode === 'block'
                                ? 'Block Device'
                                : 'Create Reservation'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface CameraBlockDialogProps {
    cameras: Camera[];
    users: ReservationUser[];
    vms: RunningVm[];
    open: boolean;
    onClose: () => void;
    onConfirm: (
        cameraId: number,
        mode: 'block' | 'reserve_to_user' | 'reserve_to_vm',
        targetUserId: number | undefined,
        targetVmId: number | undefined,
        start: string,
        end: string,
        purpose: string | undefined,
        notes: string,
    ) => Promise<void>;
    loading: boolean;
}

function CameraBlockDialog({
    cameras,
    users,
    vms,
    open,
    onClose,
    onConfirm,
    loading,
}: CameraBlockDialogProps) {
    const [cameraId, setCameraId] = useState<string>('');
    const [mode, setMode] = useState<
        'block' | 'reserve_to_user' | 'reserve_to_vm'
    >('block');
    const [targetUserId, setTargetUserId] = useState<string>('');
    const [targetVmId, setTargetVmId] = useState<string>('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [purpose, setPurpose] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cameraId && start && end) {
            await onConfirm(
                parseInt(cameraId, 10),
                mode,
                targetUserId ? parseInt(targetUserId, 10) : undefined,
                targetVmId ? parseInt(targetVmId, 10) : undefined,
                start,
                end,
                purpose || undefined,
                notes,
            );
            setCameraId('');
            setMode('block');
            setTargetUserId('');
            setTargetVmId('');
            setStart('');
            setEnd('');
            setPurpose('');
            setNotes('');
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Block Camera</DialogTitle>
                    <DialogDescription>
                        Create an admin block or reservation for a camera during
                        a time period.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="camera-block-device">Camera</Label>
                            <Select
                                value={cameraId}
                                onValueChange={setCameraId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a camera..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {cameras.map((camera) => (
                                        <SelectItem
                                            key={camera.id}
                                            value={camera.id.toString()}
                                        >
                                            {camera.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="camera-block-mode">
                                Reservation Mode
                            </Label>
                            <Select
                                value={mode}
                                onValueChange={(value) =>
                                    setMode(
                                        value as
                                            | 'block'
                                            | 'reserve_to_user'
                                            | 'reserve_to_vm',
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="block">
                                        Block Camera (unavailable for all)
                                    </SelectItem>
                                    <SelectItem value="reserve_to_user">
                                        Reserve for User (only specified user
                                        can use)
                                    </SelectItem>
                                    <SelectItem value="reserve_to_vm">
                                        Reserve for VM (only specified VM can
                                        use)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {mode === 'reserve_to_user' && (
                            <div className="space-y-2">
                                <Label htmlFor="camera-block-target-user">
                                    Target User{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={targetUserId}
                                    onValueChange={setTargetUserId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a user..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((user) => (
                                            <SelectItem
                                                key={user.id}
                                                value={user.id.toString()}
                                            >
                                                {user.name} ({user.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {mode === 'reserve_to_vm' && (
                            <div className="space-y-2">
                                <Label htmlFor="camera-block-target-vm">
                                    Target VM{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={targetVmId}
                                    onValueChange={setTargetVmId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a VM..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vms.map((vm) => (
                                            <SelectItem
                                                key={vm.vmid}
                                                value={vm.vmid.toString()}
                                            >
                                                {vm.name} ({vm.node})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {mode !== 'block' && (
                            <div className="space-y-2">
                                <Label htmlFor="camera-block-purpose">
                                    Purpose
                                </Label>
                                <Input
                                    id="camera-block-purpose"
                                    placeholder="Why is this reserved? (e.g., Class, Maintenance)..."
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="camera-block-start">
                                Start Time
                            </Label>
                            <Input
                                id="camera-block-start"
                                type="datetime-local"
                                value={start}
                                onChange={(e) => setStart(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="camera-block-end">End Time</Label>
                            <Input
                                id="camera-block-end"
                                type="datetime-local"
                                value={end}
                                onChange={(e) => setEnd(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="camera-block-notes">
                                Notes (optional)
                            </Label>
                            <Input
                                id="camera-block-notes"
                                placeholder="Admin notes..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                loading ||
                                !cameraId ||
                                (mode === 'reserve_to_user' && !targetUserId) ||
                                (mode === 'reserve_to_vm' && !targetVmId)
                            }
                        >
                            {loading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            <Lock className="mr-1 h-4 w-4" />
                            {mode === 'block'
                                ? 'Block Camera'
                                : 'Create Reservation'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <Card key={i}>
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-9 w-9 rounded-lg" />
                                <div>
                                    <Skeleton className="mb-1 h-5 w-40" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                            <Skeleton className="h-5 w-16" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-20 w-full" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
export default function AdminReservationsPage() {
    const [reservations, setReservations] = useState<UsbDeviceReservation[]>(
        [],
    );
    const [cameraReservations, setCameraReservations] = useState<
        CameraReservation[]
    >([]);
    const [cameraApprovedReservations, setCameraApprovedReservations] =
        useState<CameraReservation[]>([]);
    const [vmReservations, setVmReservations] = useState<VMReservation[]>([]);
    const [vmApprovedReservations, setVmApprovedReservations] = useState<
        VMReservation[]
    >([]);
    const [devices, setDevices] = useState<UsbDevice[]>([]);
    const [cameras, setCameras] = useState<Camera[]>([]);
    const [users, setUsers] = useState<ReservationUser[]>([]);
    const [vms, setVms] = useState<RunningVm[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('pending');
    // Dialog states
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [blockDialogOpen, setBlockDialogOpen] = useState(false);
    const [cameraBlockDialogOpen, setCameraBlockDialogOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] =
        useState<UsbDeviceReservation | null>(null);
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [
                reservationsData,
                devicesData,
                cameraPendingData,
                cameraApprovedData,
                camerasData,
                vmPendingData,
                vmApprovedData,
                vmsData,
                usersData,
            ] = await Promise.all([
                adminReservationApi.getAll(),
                hardwareApi.getDevices(),
                adminCameraApi.getPending(),
                adminCameraApi.getReservations('approved'),
                adminCameraApi.getCameras(),
                vmReservationApi.getPendingForAdmin(),
                vmReservationApi.getReservations('approved'),
                hardwareApi.getRunningVms(),
                usersApi.getUsers({ per_page: 1000 }),
            ]);
            setReservations(reservationsData);
            setDevices(devicesData);
            setCameraReservations(cameraPendingData);
            setCameraApprovedReservations(cameraApprovedData);
            setCameras(camerasData);
            setVmReservations(vmPendingData);
            setVmApprovedReservations(vmApprovedData);
            setVms(vmsData);
            setUsers(usersData.data);
            setError(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    const handleApproveClick = (id: number) => {
        const reservation = reservations.find((r) => r.id === id);
        if (reservation) {
            setSelectedReservation(reservation);
            setApproveDialogOpen(true);
        }
    };
    const handleApproveConfirm = async (
        start: string,
        end: string,
        notes: string,
    ) => {
        if (!selectedReservation) return;
        setActionLoading(true);
        try {
            await adminReservationApi.approve(selectedReservation.id, {
                approved_start_at: new Date(start).toISOString(),
                approved_end_at: new Date(end).toISOString(),
                admin_notes: notes || undefined,
            });
            await fetchData();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Approve failed');
        } finally {
            setActionLoading(false);
        }
    };
    const handleReject = async (id: number) => {
        setActionLoading(true);
        try {
            await adminReservationApi.reject(id);
            await fetchData();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Reject failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleApproveCameraReservation = async (id: number) => {
        setActionLoading(true);
        try {
            await adminCameraApi.approve(id, {});
            await fetchData();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Camera approval failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectCameraReservation = async (id: number) => {
        setActionLoading(true);
        try {
            await adminCameraApi.reject(id);
            await fetchData();
        } catch (e) {
            setError(
                e instanceof Error ? e.message : 'Camera rejection failed',
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleApproveVmReservation = async (id: number) => {
        setActionLoading(true);
        try {
            await vmReservationApi.approveForAdmin(id, {});
            await fetchData();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'VM approval failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectVmReservation = async (id: number) => {
        setActionLoading(true);
        try {
            await vmReservationApi.rejectForAdmin(id);
            await fetchData();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'VM rejection failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleBlockConfirm = async (
        deviceId: number,
        mode: 'block' | 'reserve_to_user' | 'reserve_to_vm',
        targetUserId: number | undefined,
        targetVmId: number | undefined,
        start: string,
        end: string,
        purpose: string | undefined,
        notes: string,
    ) => {
        setActionLoading(true);
        try {
            await adminReservationApi.createBlock({
                usb_device_id: deviceId,
                mode,
                target_user_id: targetUserId,
                target_vm_id: targetVmId,
                start_at: new Date(start).toISOString(),
                end_at: new Date(end).toISOString(),
                purpose,
                notes: notes || undefined,
            });
            await fetchData();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Block failed');
        } finally {
            setActionLoading(false);
        }
    };

    const cameraApprovedCount = cameraApprovedReservations.length;
    const vmApprovedCount = vmApprovedReservations.length;

    const handleCameraBlockConfirm = async (
        cameraId: number,
        mode: 'block' | 'reserve_to_user' | 'reserve_to_vm',
        targetUserId: number | undefined,
        targetVmId: number | undefined,
        start: string,
        end: string,
        purpose: string | undefined,
        notes: string,
    ) => {
        setActionLoading(true);
        try {
            await adminCameraApi.createBlock({
                camera_id: cameraId,
                mode,
                target_user_id: targetUserId,
                target_vm_id: targetVmId,
                start_at: new Date(start).toISOString(),
                end_at: new Date(end).toISOString(),
                purpose,
                notes: notes || undefined,
            });
            await fetchData();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Camera block failed');
        } finally {
            setActionLoading(false);
        }
    };
    // Filter reservations by tab
    const filteredReservations = reservations.filter((r) => {
        if (activeTab === 'camera' || activeTab === 'vm') return false;
        if (activeTab === 'pending') return r.status === 'pending';
        if (activeTab === 'approved')
            return r.status === 'approved' || r.status === 'active';
        if (activeTab === 'blocks') return r.is_admin_block;
        if (activeTab === 'history')
            return ['rejected', 'cancelled', 'completed'].includes(r.status);
        return true;
    });
    const pendingCount = reservations.filter(
        (r) => r.status === 'pending',
    ).length;
    const approvedCount = reservations.filter(
        (r) => r.status === 'approved' || r.status === 'active',
    ).length;
    const blocksCount = reservations.filter((r) => r.is_admin_block).length;
    const cameraPendingCount = cameraReservations.length;
    const vmPendingCount = vmReservations.length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reservations" />
            <div className="min-h-screen bg-background">
                <div className="container py-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 text-info">
                                <Usb className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="font-heading text-3xl font-bold text-foreground">
                                    Reservations
                                </h1>
                                <p className="text-muted-foreground">
                                    Manage USB reservations, camera
                                    reservations, and device blocking
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchData}
                                disabled={loading}
                            >
                                <RefreshCw
                                    className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                                />
                                Refresh
                            </Button>
                            <Button
                                className="bg-info text-info-foreground hover:bg-info/90"
                                size="sm"
                                onClick={() => setBlockDialogOpen(true)}
                            >
                                <Lock className="mr-2 h-4 w-4" />
                                Block Device
                            </Button>
                            <Button
                                className="bg-yellow-600 text-white hover:bg-yellow-700"
                                size="sm"
                                onClick={() => setCameraBlockDialogOpen(true)}
                            >
                                <Video className="mr-2 h-4 w-4" />
                                Block Camera
                            </Button>
                        </div>
                    </motion.div>
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList>
                            <TabsTrigger value="pending" className="gap-2">
                                <Clock className="h-4 w-4" />
                                Pending
                                {pendingCount > 0 && (
                                    <Badge variant="primary" className="ml-1">
                                        {pendingCount}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="approved" className="gap-2">
                                <Check className="h-4 w-4" />
                                Approved
                                {approvedCount > 0 && (
                                    <Badge variant="primary" className="ml-1">
                                        {approvedCount}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="blocks" className="gap-2">
                                <Lock className="h-4 w-4" />
                                Blocks
                                {blocksCount > 0 && (
                                    <Badge variant="primary" className="ml-1">
                                        {blocksCount}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="camera" className="gap-2">
                                <Video className="h-4 w-4" />
                                Camera Pending
                                {cameraPendingCount > 0 && (
                                    <Badge variant="primary" className="ml-1">
                                        {cameraPendingCount}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger
                                value="camera-approved"
                                className="gap-2"
                            >
                                <Video className="h-4 w-4" />
                                Camera Approved
                                {cameraApprovedCount > 0 && (
                                    <Badge variant="primary" className="ml-1">
                                        {cameraApprovedCount}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="vm" className="gap-2">
                                <Monitor className="h-4 w-4" />
                                VM Pending
                                {vmPendingCount > 0 && (
                                    <Badge variant="primary" className="ml-1">
                                        {vmPendingCount}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="vm-approved" className="gap-2">
                                <Monitor className="h-4 w-4" />
                                VM Approved
                                {vmApprovedCount > 0 && (
                                    <Badge variant="primary" className="ml-1">
                                        {vmApprovedCount}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="history" className="gap-2">
                                <Calendar className="h-4 w-4" />
                                History
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value={activeTab} className="mt-4">
                            {activeTab === 'camera' ? (
                                loading ? (
                                    <LoadingSkeleton />
                                ) : cameraReservations.length === 0 ? (
                                    <Card>
                                        <CardContent className="p-12 text-center">
                                            <p className="text-muted-foreground">
                                                No pending camera reservations
                                            </p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {cameraReservations.map(
                                            (reservation) => (
                                                <CameraReservationCard
                                                    key={reservation.id}
                                                    reservation={reservation}
                                                    onApprove={
                                                        handleApproveCameraReservation
                                                    }
                                                    onReject={
                                                        handleRejectCameraReservation
                                                    }
                                                    actionLoading={
                                                        actionLoading
                                                    }
                                                />
                                            ),
                                        )}
                                    </div>
                                )
                            ) : activeTab === 'camera-approved' ? (
                                loading ? (
                                    <LoadingSkeleton />
                                ) : cameraApprovedReservations.length === 0 ? (
                                    <Card>
                                        <CardContent className="p-12 text-center">
                                            <p className="text-muted-foreground">
                                                No approved camera reservations
                                            </p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {cameraApprovedReservations.map(
                                            (reservation) => (
                                                <CameraReservationCard
                                                    key={reservation.id}
                                                    reservation={reservation}
                                                    onApprove={
                                                        handleApproveCameraReservation
                                                    }
                                                    onReject={
                                                        handleRejectCameraReservation
                                                    }
                                                    actionLoading={
                                                        actionLoading
                                                    }
                                                    showActions={false}
                                                />
                                            ),
                                        )}
                                    </div>
                                )
                            ) : activeTab === 'vm' ? (
                                loading ? (
                                    <LoadingSkeleton />
                                ) : vmReservations.length === 0 ? (
                                    <Card>
                                        <CardContent className="p-12 text-center">
                                            <p className="text-muted-foreground">
                                                No pending VM reservations
                                            </p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {vmReservations.map((reservation) => (
                                            <VMReservationCard
                                                key={reservation.id}
                                                reservation={reservation}
                                                onApprove={
                                                    handleApproveVmReservation
                                                }
                                                onReject={
                                                    handleRejectVmReservation
                                                }
                                                actionLoading={actionLoading}
                                            />
                                        ))}
                                    </div>
                                )
                            ) : activeTab === 'vm-approved' ? (
                                loading ? (
                                    <LoadingSkeleton />
                                ) : vmApprovedReservations.length === 0 ? (
                                    <Card>
                                        <CardContent className="p-12 text-center">
                                            <p className="text-muted-foreground">
                                                No approved VM reservations
                                            </p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {vmApprovedReservations.map(
                                            (reservation) => (
                                                <VMReservationCard
                                                    key={reservation.id}
                                                    reservation={reservation}
                                                    onApprove={
                                                        handleApproveVmReservation
                                                    }
                                                    onReject={
                                                        handleRejectVmReservation
                                                    }
                                                    actionLoading={
                                                        actionLoading
                                                    }
                                                    showActions={false}
                                                />
                                            ),
                                        )}
                                    </div>
                                )
                            ) : loading ? (
                                <LoadingSkeleton />
                            ) : filteredReservations.length === 0 ? (
                                <Card>
                                    <CardContent className="p-12 text-center">
                                        <p className="text-muted-foreground">
                                            {activeTab === 'pending' &&
                                                'No pending reservations'}
                                            {activeTab === 'approved' &&
                                                'No approved reservations'}
                                            {activeTab === 'blocks' &&
                                                'No active device blocks'}
                                            {activeTab === 'camera-approved' &&
                                                'No approved camera reservations'}
                                            {activeTab === 'vm-approved' &&
                                                'No approved VM reservations'}
                                            {activeTab === 'vm' &&
                                                'No pending VM reservations'}
                                            {activeTab === 'history' &&
                                                'No reservation history'}
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {filteredReservations.map((reservation) => (
                                        <ReservationCard
                                            key={reservation.id}
                                            reservation={reservation}
                                            onApprove={handleApproveClick}
                                            onReject={handleReject}
                                            actionLoading={actionLoading}
                                        />
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
            <ApproveDialog
                key={selectedReservation?.id ?? 'none'}
                reservation={selectedReservation}
                open={approveDialogOpen}
                onClose={() => {
                    setApproveDialogOpen(false);
                    setSelectedReservation(null);
                }}
                onConfirm={handleApproveConfirm}
                loading={actionLoading}
            />
            <BlockDialog
                devices={devices}
                users={users}
                vms={vms}
                open={blockDialogOpen}
                onClose={() => setBlockDialogOpen(false)}
                onConfirm={handleBlockConfirm}
                loading={actionLoading}
            />
            <CameraBlockDialog
                cameras={cameras}
                users={users}
                vms={vms}
                open={cameraBlockDialogOpen}
                onClose={() => setCameraBlockDialogOpen(false)}
                onConfirm={handleCameraBlockConfirm}
                loading={actionLoading}
            />
        </AppLayout>
    );
}
