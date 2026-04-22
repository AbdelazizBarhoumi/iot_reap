import { Head } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    Loader2,
    Plug,
    RefreshCw,
    Shield,
    ShieldAlert,
    Unplug,
    Usb,
    Wifi,
    WifiOff,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useHardwareGateway } from '@/hooks/useHardwareGateway';
import { useVMSessions } from '@/hooks/useVMSessions';
import AppLayout from '@/layouts/app-layout';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { BreadcrumbItem } from '@/types';
import type { UsbDevice } from '@/types/hardware.types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Hardware', href: '/hardware' }];

function getDeviceStatusBadgeClass(status: UsbDevice['status']): string {
    switch (status) {
        case 'available':
            return 'border-success/30 bg-success/10 text-success';
        case 'bound':
            return 'border-warning/30 bg-warning/10 text-warning';
        case 'attached':
            return 'border-info/30 bg-info/10 text-info';
        case 'pending_attach':
            return 'border-amber-400/30 bg-amber-500/10 text-amber-600';
        case 'disconnected':
            return 'border-destructive/30 bg-destructive/10 text-destructive';
        default:
            return 'bg-muted text-muted-foreground';
    }
}

export default function HardwarePage() {
    const {
        nodes,
        loading,
        error,
        actionLoading,
        refreshAll,
        refreshNode,
        bindDevice,
        unbindDevice,
        attachDevice,
        detachDevice,
        cancelPendingAttachment,
    } = useHardwareGateway();

    const {
        sessions,
        loading: sessionsLoading,
        refetch: refetchSessions,
    } = useVMSessions();

    const attachableSessions = useMemo(
        () =>
            sessions.filter(
                (session) =>
                    (session.status === 'active' || session.status === 'expiring') &&
                    session.time_remaining_seconds > 0,
            ),
        [sessions],
    );

    const [attachTargetDevice, setAttachTargetDevice] = useState<UsbDevice | null>(null);
    const [selectedSessionId, setSelectedSessionId] = useState<string>('');

    useEffect(() => {
        if (!attachTargetDevice) {
            setSelectedSessionId('');
            return;
        }

        setSelectedSessionId(attachableSessions[0]?.id ?? '');
    }, [attachTargetDevice, attachableSessions]);

    const handleAttachToSession = async () => {
        if (!attachTargetDevice || !selectedSessionId) {
            return;
        }

        const success = await attachDevice(attachTargetDevice.id, {
            session_id: selectedSessionId,
        });

        if (success) {
            setAttachTargetDevice(null);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Hardware" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Hardware Gateway</h1>
                        <p className="text-muted-foreground">
                            Manage USB gateway devices for your active VM sessions.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                void refetchSessions();
                            }}
                            disabled={sessionsLoading}
                        >
                            <RefreshCw
                                className={`mr-2 h-4 w-4 ${sessionsLoading ? 'animate-spin' : ''}`}
                            />
                            Refresh Sessions
                        </Button>

                        <Button onClick={() => void refreshAll()} disabled={loading || actionLoading}>
                            <RefreshCw
                                className={`mr-2 h-4 w-4 ${loading || actionLoading ? 'animate-spin' : ''}`}
                            />
                            Refresh Gateways
                        </Button>
                    </div>
                </div>

                {attachableSessions.length === 0 && (
                    <Alert>
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>No active session found</AlertTitle>
                        <AlertDescription>
                            Start a VM session first, then attach bound USB devices to it.
                        </AlertDescription>
                    </Alert>
                )}

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Hardware Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : nodes.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Usb className="mb-4 h-12 w-12 text-muted-foreground" />
                            <p className="text-center text-muted-foreground">
                                No hardware gateways found.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {nodes.map((node) => {
                            const devices = node.devices ?? [];
                            const isOnline = node.online;

                            return (
                                <Card key={node.id}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <CardTitle className="flex items-center gap-2 text-base">
                                                    {isOnline ? (
                                                        <Wifi className="h-4 w-4 text-success" />
                                                    ) : (
                                                        <WifiOff className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                    {node.name}
                                                </CardTitle>
                                                <CardDescription>
                                                    {node.ip}:{node.port} · {devices.length} device
                                                    {devices.length === 1 ? '' : 's'}
                                                </CardDescription>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        isOnline
                                                            ? 'border-success/30 bg-success/10 text-success'
                                                            : 'bg-muted text-muted-foreground'
                                                    }
                                                >
                                                    {isOnline ? 'Online' : 'Offline'}
                                                </Badge>

                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        node.is_verified
                                                            ? 'border-success/30 bg-success/10 text-success'
                                                            : 'border-warning/30 bg-warning/10 text-warning'
                                                    }
                                                >
                                                    {node.is_verified ? (
                                                        <>
                                                            <Shield className="mr-1 h-3 w-3" /> Verified
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ShieldAlert className="mr-1 h-3 w-3" /> Unverified
                                                        </>
                                                    )}
                                                </Badge>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => void refreshNode(node.id)}
                                                    disabled={actionLoading}
                                                >
                                                    <RefreshCw
                                                        className={`h-4 w-4 ${actionLoading ? 'animate-spin' : ''}`}
                                                    />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent>
                                        {!node.is_verified ? (
                                            <p className="text-sm text-muted-foreground">
                                                This gateway is not verified yet. Device actions are disabled.
                                            </p>
                                        ) : devices.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">
                                                No USB devices detected on this gateway.
                                            </p>
                                        ) : (
                                            <div className="grid gap-3 md:grid-cols-2">
                                                {devices.map((device) => (
                                                    <div key={device.id} className="rounded-md border p-3">
                                                        <div className="mb-3 flex items-start justify-between gap-2">
                                                            <div>
                                                                <p className="text-sm font-medium">{device.name}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Bus {device.busid} · VID:PID {device.vendor_id}:
                                                                    {device.product_id}
                                                                </p>
                                                                {device.attached_to && (
                                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                                        Attached to: {device.attached_to}
                                                                    </p>
                                                                )}
                                                                {device.status === 'pending_attach' && device.pending_vmid && (
                                                                    <p className="mt-1 text-xs text-amber-600">
                                                                        Pending on VM #{device.pending_vmid}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <Badge
                                                                variant="outline"
                                                                className={getDeviceStatusBadgeClass(device.status)}
                                                            >
                                                                {device.status_label}
                                                            </Badge>
                                                        </div>

                                                        <div className="flex flex-wrap gap-2">
                                                            {device.status === 'available' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => void bindDevice(device.id)}
                                                                    disabled={actionLoading}
                                                                >
                                                                    <Plug className="mr-1 h-3 w-3" />
                                                                    Bind
                                                                </Button>
                                                            )}

                                                            {device.status === 'bound' && (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => setAttachTargetDevice(device)}
                                                                        disabled={
                                                                            actionLoading ||
                                                                            attachableSessions.length === 0
                                                                        }
                                                                    >
                                                                        <Plug className="mr-1 h-3 w-3" />
                                                                        Attach
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => void unbindDevice(device.id)}
                                                                        disabled={actionLoading}
                                                                    >
                                                                        <Unplug className="mr-1 h-3 w-3" />
                                                                        Unbind
                                                                    </Button>
                                                                </>
                                                            )}

                                                            {device.status === 'attached' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => void detachDevice(device.id)}
                                                                    disabled={actionLoading}
                                                                >
                                                                    <Unplug className="mr-1 h-3 w-3" />
                                                                    Detach
                                                                </Button>
                                                            )}

                                                            {device.status === 'pending_attach' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        void cancelPendingAttachment(device.id)
                                                                    }
                                                                    disabled={actionLoading}
                                                                >
                                                                    <Clock className="mr-1 h-3 w-3" />
                                                                    Cancel Pending
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            <Dialog
                open={!!attachTargetDevice}
                onOpenChange={(open) => {
                    if (!open) {
                        setAttachTargetDevice(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Attach Device to Session</DialogTitle>
                        <DialogDescription>
                            Choose an active session for <strong>{attachTargetDevice?.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-2">
                        {attachableSessions.length === 0 ? (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    No active session available. Start a session first.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <Select
                                value={selectedSessionId}
                                onValueChange={setSelectedSessionId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a session..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {attachableSessions.map((session) => (
                                        <SelectItem key={session.id} value={session.id}>
                                            VM #{session.vm_id} · {session.node_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setAttachTargetDevice(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                void handleAttachToSession();
                            }}
                            disabled={
                                actionLoading ||
                                !attachTargetDevice ||
                                !selectedSessionId ||
                                attachableSessions.length === 0
                            }
                        >
                            {actionLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                            )}
                            Attach
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
