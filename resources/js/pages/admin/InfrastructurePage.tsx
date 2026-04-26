/**
 * Admin Infrastructure Page – Unified Management of Proxmox, Hardware Gateways & Cameras.
 * Sprint 3 – Consolidated admin view with 3 tabs
 *
 * Tabs:
 *  1. Proxmox  – Servers → Nodes → VMs
 *  2. Hardware – Gateway nodes & USB devices
 *  3. Cameras  – Camera list & control actions
 *  4. Sessions – Active/provisioning VM sessions
 */
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Activity,
    AlertCircle,
    Check,
    ChevronDown,
    ChevronRight,
    Clock,
    Loader2,
    MoreVertical,
    PlusCircle,
    Plug,
    PlugZap,
    Power,
    RefreshCw,
    Search,
    Server,
    ShieldAlert,
    ShieldCheck,
    Trash2,
    Unplug,
    X,
    Shield,
    Monitor,
    Camera,
    Video,
    Eye,
    EyeOff,
    Usb,
    Wifi,
    WifiOff,
    Settings2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import * as adminApi from '@/api/admin.api';
import { adminCameraApi } from '@/api/camera.api';
import client from '@/api/client';
import { hardwareApi } from '@/api/hardware.api';
import {
    connectionPreferencesApi,
    proxmoxVMApi,
    vmSessionApi,
} from '@/api/vm.api';
import { GuacamoleViewer } from '@/components/GuacamoleViewer';
import { SessionCountdown } from '@/components/SessionCountdown';
import { SessionExtendButton } from '@/components/SessionExtendButton';
import { TerminateSessionButton } from '@/components/TerminateSessionButton';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VMListCard } from '@/components/VMListCard';
import { useHardwareGateway } from '@/hooks/useHardwareGateway';
import { useVMSessions } from '@/hooks/useVMSessions';
import AppLayout from '@/layouts/app-layout';
import { getHttpErrorMessage } from '@/lib/http-errors';
import type { BreadcrumbItem } from '@/types';
import type { Camera as CameraType } from '@/types/camera.types';
import type { GatewayNode, RunningVm, UsbDevice } from '@/types/hardware.types';
import type {
    ConnectionProfile,
    CreateVMSessionRequest,
    ProxmoxNode,
    ProxmoxServerAdmin,
    ProxmoxVM,
    VMSnapshot,
} from '@/types/vm.types';

// ─── Constants ────────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/infrastructure' },
    { title: 'Infrastructure', href: '/admin/infrastructure' },
];

interface ProxmoxServerFormData {
    name: string;
    description: string;
    host: string;
    port: number;
    realm: string;
    token_id: string;
    token_secret: string;
    verify_ssl: boolean;
}

const initialFormData: ProxmoxServerFormData = {
    name: '',
    description: '',
    host: '',
    port: 8006,
    realm: 'pam',
    token_id: '',
    token_secret: '',
    verify_ssl: true,
};

const DURATION_OPTIONS = [
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 120, label: '2 hours' },
    { value: 240, label: '4 hours' },
];
const NO_PROFILE_SELECTED_VALUE = '__default_profile__';

const NO_SNAPSHOT_VALUE = '__none';
const SPLIT_MIN_LEFT_PX = 520;
const SPLIT_MIN_RIGHT_PX = 500;
const SPLIT_STEP_PERCENT = 5;
const SPLIT_FALLBACK_MIN_PERCENT = 25;
const SPLIT_FALLBACK_MAX_PERCENT = 75;

interface LaunchableVM extends ProxmoxVM {
    node_id: number;
    node_name: string;
    server_id: number;
    server_name: string;
    is_template: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    if (days > 0) return `${days}d ${hours}h`;
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}

function formatTimeRemaining(seconds: number): string {
    if (seconds <= 0) {
        return 'Expired';
    }

    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}h ${minutes % 60}m remaining`;
    }

    return `${minutes}m remaining`;
}

function getLoadColor(percent: number): string {
    if (percent < 60) return 'bg-green-500';
    if (percent < 80) return 'bg-amber-500';
    return 'bg-red-500';
}

function getUsbStatusBadgeClass(status: UsbDevice['status']): string {
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

function getSplitBoundsPercent(containerWidth: number): {
    minPercent: number;
    maxPercent: number;
} {
    if (containerWidth <= 0) {
        return {
            minPercent: SPLIT_FALLBACK_MIN_PERCENT,
            maxPercent: SPLIT_FALLBACK_MAX_PERCENT,
        };
    }

    const minPercent = Math.max(
        SPLIT_FALLBACK_MIN_PERCENT,
        (SPLIT_MIN_LEFT_PX / containerWidth) * 100,
    );

    const maxPercent = Math.min(
        SPLIT_FALLBACK_MAX_PERCENT,
        100 - (SPLIT_MIN_RIGHT_PX / containerWidth) * 100,
    );

    if (minPercent >= maxPercent) {
        return {
            minPercent: SPLIT_FALLBACK_MIN_PERCENT,
            maxPercent: SPLIT_FALLBACK_MAX_PERCENT,
        };
    }

    return { minPercent, maxPercent };
}

function clampSplitLeftPercent(value: number, containerWidth: number): number {
    const { minPercent, maxPercent } = getSplitBoundsPercent(containerWidth);
    return Math.min(maxPercent, Math.max(minPercent, value));
}

const statsIconClass: Record<
    'info' | 'success' | 'warning' | 'secondary',
    string
> = {
    info: 'bg-info/10 text-info',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    secondary: 'bg-secondary/10 text-secondary',
};

// ─── Shared Sub-Components ────────────────────────────────────────────────────

function ProgressBar({
    value,
    max,
    label,
}: {
    value: number;
    max: number;
    label: string;
}) {
    const percent = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>{label}</span>
                <span>{percent}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                    className={`h-full ${getLoadColor(percent)} transition-all duration-300`}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}

// ─── Proxmox Tab Sub-Components ───────────────────────────────────────────────

interface NodeCardProps {
    node: ProxmoxNode;
    onSelectNode: (nodeId: number) => void;
    selectedNodeId: number | null;
}

function NodeCard({ node, onSelectNode, selectedNodeId }: NodeCardProps) {
    const isSelected = selectedNodeId === node.id;
    const statusColor =
        node.status === 'online'
            ? 'bg-green-500'
            : node.status === 'maintenance'
              ? 'bg-yellow-500'
              : 'bg-red-500';
    const textColor =
        node.status === 'online'
            ? 'text-green-600'
            : node.status === 'maintenance'
              ? 'text-yellow-600'
              : 'text-red-600';

    return (
        <div
            className={`cursor-pointer rounded-lg border p-4 transition-all hover:border-secondary/50 ${
                isSelected ? 'border-secondary ring-2 ring-secondary' : ''
            }`}
            onClick={() => onSelectNode(node.id)}
        >
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{node.name}</span>
                </div>
                <Badge
                    variant="outline"
                    className={`${textColor} border-current capitalize`}
                >
                    <span
                        className={`mr-1.5 h-2 w-2 rounded-full ${statusColor}`}
                    />
                    {node.status}
                </Badge>
            </div>
            {node.status === 'online' && (
                <div className="space-y-2">
                    <ProgressBar
                        value={node.cpu_percent ?? 0}
                        max={100}
                        label="CPU"
                    />
                    <ProgressBar
                        value={node.ram_used_mb ?? 0}
                        max={node.ram_total_mb ?? 1}
                        label={`RAM ${Math.round((node.ram_used_mb ?? 0) / 1024)}/${Math.round((node.ram_total_mb ?? 0) / 1024)} GB`}
                    />
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                        <span>VMs: {node.active_vm_count ?? 0}</span>
                        {node.uptime_seconds !== undefined && (
                            <span>
                                Uptime: {formatUptime(node.uptime_seconds)}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function VMsPanel({
    nodeId,
    nodeName,
    server,
    onOpenLaunch,
    onClose,
}: {
    nodeId: number;
    nodeName: string;
    server: ProxmoxServerAdmin;
    onOpenLaunch: (vm: LaunchableVM) => void;
    onClose: () => void;
}) {
    const [vms, setVms] = useState<ProxmoxVM[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const fetchVMs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminApi.getNodeVMs(nodeId.toString());
            const payload = response.data as unknown;
            const vmList = Array.isArray(payload)
                ? payload
                : ((payload as { data?: ProxmoxVM[] }).data ?? []);
            setVms(vmList as ProxmoxVM[]);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load VMs');
        } finally {
            setLoading(false);
        }
    }, [nodeId]);

    useEffect(() => {
        fetchVMs();
    }, [fetchVMs]);

    const handleAction = async (
        vmid: number,
        action: 'start' | 'stop' | 'reboot' | 'shutdown',
    ) => {
        setActionLoading(vmid);
        try {
            switch (action) {
                case 'start':
                    await adminApi.startVM(nodeId.toString(), vmid);
                    break;
                case 'stop':
                    await adminApi.stopVM(nodeId.toString(), vmid);
                    break;
                case 'reboot':
                    await adminApi.rebootVM(nodeId.toString(), vmid);
                    break;
                case 'shutdown':
                    await adminApi.shutdownVM(nodeId.toString(), vmid);
                    break;
            }
            setTimeout(fetchVMs, 1000);
        } catch (e) {
            console.error('VM action failed:', e);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <Card className="mt-4">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base">
                            VMs on {nodeName}
                        </CardTitle>
                        <CardDescription>
                            {vms.length} virtual machines
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={fetchVMs}
                            disabled={loading}
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                            />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <VMListCard
                    vms={vms}
                    loading={loading}
                    error={error}
                    actionLoading={actionLoading}
                    onStart={(vmid) => handleAction(vmid, 'start')}
                    onStop={(vmid) => handleAction(vmid, 'stop')}
                    onReboot={(vmid) => handleAction(vmid, 'reboot')}
                    onShutdown={(vmid) => handleAction(vmid, 'shutdown')}
                    onRefresh={fetchVMs}
                    onSelectVm={(vm) =>
                        onOpenLaunch({
                            ...vm,
                            node_id: nodeId,
                            node_name: nodeName,
                            server_id: server.id,
                            server_name: server.name,
                            is_template: Boolean(vm.template),
                        })
                    }
                />
            </CardContent>
        </Card>
    );
}

interface ServerCardProps {
    server: ProxmoxServerAdmin;
    nodes: ProxmoxNode[];
    nodesLoading: boolean;
    isExpanded: boolean;
    onOpenLaunch: (vm: LaunchableVM) => void;
    onToggleExpand: () => void;
    onEdit: () => void;
    onToggleActive: () => void;
    onDelete: () => void;
    onSyncNodes: () => void;
}

function ServerCard({
    server,
    nodes,
    nodesLoading,
    isExpanded,
    onOpenLaunch,
    onToggleExpand,
    onEdit,
    onToggleActive,
    onDelete,
    onSyncNodes,
}: ServerCardProps) {
    const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
    const serverNodes = nodes.filter((n) => n.server_name === server.name);
    const onlineNodes = serverNodes.filter((n) => n.status === 'online').length;
    const selectedNode = serverNodes.find((n) => n.id === selectedNodeId);

    return (
        <Card
            className={`shadow-card transition-all hover:shadow-card-hover ${
                !server.is_active ? 'opacity-60' : ''
            }`}
        >
            <Collapsible open={isExpanded} onOpenChange={onToggleExpand}>
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <CollapsibleTrigger asChild>
                            <div className="flex cursor-pointer items-center gap-3 hover:opacity-80">
                                {isExpanded ? (
                                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                )}
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 text-info">
                                    <Server className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="font-heading text-lg">
                                        {server.name}
                                    </CardTitle>
                                    <CardDescription>
                                        {server.description || server.host}
                                    </CardDescription>
                                </div>
                            </div>
                        </CollapsibleTrigger>
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className={
                                    server.is_active
                                        ? 'border-success/30 bg-success/10 text-success'
                                        : 'bg-muted text-muted-foreground'
                                }
                            >
                                {server.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        aria-label="Server actions"
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={onEdit}>
                                        <Check className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={onSyncNodes}>
                                        <RefreshCw className="mr-2 h-4 w-4" />{' '}
                                        Sync Nodes
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={onToggleActive}>
                                        {server.is_active ? (
                                            <>
                                                <X className="mr-2 h-4 w-4" />{' '}
                                                Deactivate
                                            </>
                                        ) : (
                                            <>
                                                <Check className="mr-2 h-4 w-4" />{' '}
                                                Activate
                                            </>
                                        )}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={onDelete}
                                        className="text-destructive"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />{' '}
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Activity className="h-4 w-4" />
                            {onlineNodes}/{serverNodes.length} nodes online
                        </span>
                        <span>|</span>
                        <span>
                            {server.host}:{server.port}
                        </span>
                        {server.active_sessions_count !== undefined && (
                            <>
                                <span>|</span>
                                <span>
                                    {server.active_sessions_count} active
                                    sessions
                                </span>
                            </>
                        )}
                    </div>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent className="pt-0">
                        {nodesLoading && serverNodes.length === 0 ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : serverNodes.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                <p>
                                    No nodes found. Click "Sync Nodes" to
                                    discover nodes from this server.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {serverNodes.map((node) => (
                                        <NodeCard
                                            key={node.id}
                                            node={node}
                                            onSelectNode={setSelectedNodeId}
                                            selectedNodeId={selectedNodeId}
                                        />
                                    ))}
                                </div>
                                {selectedNode && (
                                    <VMsPanel
                                        nodeId={selectedNode.id}
                                        nodeName={selectedNode.name}
                                        server={server}
                                        onOpenLaunch={onOpenLaunch}
                                        onClose={() => setSelectedNodeId(null)}
                                    />
                                )}
                            </>
                        )}
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}

// ─── Hardware Tab Sub-Components ──────────────────────────────────────────────

interface AttachDialogProps {
    device: UsbDevice | null;
    open: boolean;
    onClose: () => void;
    onAttach: (
        deviceId: number,
        vmIp: string,
        vmName: string,
        vmid: number,
        node: string,
        serverId: number,
    ) => Promise<void>;
    loading: boolean;
}

function AttachDialog({
    device,
    open,
    onClose,
    onAttach,
    loading,
}: AttachDialogProps) {
    const [selectedVmKey, setSelectedVmKey] = useState<string>('');
    const [runningVms, setRunningVms] = useState<RunningVm[]>([]);
    const [loadingVms, setLoadingVms] = useState(false);
    const [vmError, setVmError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) {
            setSelectedVmKey('');
            return;
        }

        let isMounted = true;

        const fetchRunningVms = async () => {
            setLoadingVms(true);
            setVmError(null);
            setSelectedVmKey('');

            try {
                const vms = await hardwareApi.getRunningVms();
                if (!isMounted) {
                    return;
                }

                setRunningVms(vms);

                if (vms.length === 0) {
                    setVmError(
                        'No running VMs found. Power on target VMs first and ensure guest agent is available.',
                    );
                }
            } catch (err) {
                if (!isMounted) {
                    return;
                }

                setRunningVms([]);
                setVmError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to load running VMs',
                );
            } finally {
                if (isMounted) {
                    setLoadingVms(false);
                }
            }
        };

        fetchRunningVms();

        return () => {
            isMounted = false;
        };
    }, [open]);

    const selectedVm = runningVms.find(
        (vm) => `${vm.vmid}-${vm.server_id}` === selectedVmKey,
    );

    const canAttach =
        !!device &&
        !!selectedVm &&
        !!selectedVm.ip_address &&
        !loading &&
        !loadingVms;

    const handleAttach = async () => {
        if (!device || !selectedVm || !selectedVm.ip_address) {
            return;
        }

        await onAttach(
            device.id,
            selectedVm.ip_address,
            selectedVm.name,
            selectedVm.vmid,
            selectedVm.node,
            selectedVm.server_id,
        );

        onClose();
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    onClose();
                }
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Attach USB Device</DialogTitle>
                    <DialogDescription>
                        Select a running VM to attach{' '}
                        <strong>{device?.name}</strong>.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="attach-vm-select">Target VM</Label>
                        {loadingVms ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading running VMs...
                            </div>
                        ) : vmError ? (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{vmError}</AlertDescription>
                            </Alert>
                        ) : (
                            <Select
                                value={selectedVmKey}
                                onValueChange={setSelectedVmKey}
                            >
                                <SelectTrigger id="attach-vm-select">
                                    <SelectValue placeholder="Select a running VM..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {runningVms.map((vm) => (
                                        <SelectItem
                                            key={`${vm.vmid}-${vm.server_id}`}
                                            value={`${vm.vmid}-${vm.server_id}`}
                                            disabled={!vm.ip_address}
                                        >
                                            {vm.display_name}
                                            {!vm.ip_address &&
                                                ' (Guest agent unavailable)'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {selectedVm && (
                        <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                            <p>
                                <strong>VM:</strong> {selectedVm.name}
                            </p>
                            <p>
                                <strong>IP:</strong>{' '}
                                {selectedVm.ip_address ?? 'Not available'}
                            </p>
                            <p>
                                <strong>Node:</strong> {selectedVm.node} (
                                {selectedVm.server_name})
                            </p>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleAttach} disabled={!canAttach}>
                        {loading ? 'Attaching...' : 'Attach Device'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface UsbDeviceRowProps {
    device: UsbDevice;
    loading: boolean;
    onBind: () => void;
    onUnbind: () => void;
    onAttach: () => void;
    onDetach: () => void;
    onCancelPending: () => void;
    onMarkAsCamera: () => void;
    onRemoveCamera: () => void;
}

function UsbDeviceRow({
    device,
    loading,
    onBind,
    onUnbind,
    onAttach,
    onDetach,
    onCancelPending,
    onMarkAsCamera,
    onRemoveCamera,
}: UsbDeviceRowProps) {
    const hasCameraRegistration = device.has_camera_registration;

    return (
        <div className="rounded-md border p-3">
            <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        {hasCameraRegistration ? (
                            <Camera className="h-4 w-4 shrink-0 text-purple-500" />
                        ) : (
                            <Usb className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        <p className="truncate text-sm font-medium">
                            {device.name}
                        </p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Bus {device.busid} · VID:PID {device.vendor_id}:
                        {device.product_id}
                    </p>
                    {device.attached_to && !hasCameraRegistration && (
                        <p className="mt-1 text-xs text-muted-foreground">
                            Attached to: {device.attached_to}
                        </p>
                    )}
                    {device.status === 'pending_attach' &&
                        device.pending_vmid && (
                            <p className="mt-1 text-xs text-amber-600">
                                Pending on VM #{device.pending_vmid}
                                {device.pending_vm_name
                                    ? ` (${device.pending_vm_name})`
                                    : ''}
                            </p>
                        )}
                </div>
                {hasCameraRegistration ? (
                    <Badge
                        variant="outline"
                        className="border-purple-300 bg-purple-500/10 text-purple-600"
                    >
                        Camera
                    </Badge>
                ) : (
                    <Badge
                        variant="outline"
                        className={getUsbStatusBadgeClass(device.status)}
                    >
                        {device.status_label}
                    </Badge>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                {hasCameraRegistration ? (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onRemoveCamera}
                        disabled={loading}
                        className="border-destructive/30 text-destructive hover:bg-destructive/10"
                    >
                        <Camera className="mr-1 h-3 w-3" />
                        Remove Camera
                    </Button>
                ) : (
                    <>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onMarkAsCamera}
                            disabled={loading}
                            className="border-purple-300 text-purple-600 hover:bg-purple-50"
                        >
                            <Camera className="mr-1 h-3 w-3" />
                            Mark as Camera
                        </Button>

                        {device.status === 'available' && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onBind}
                                disabled={loading}
                            >
                                <Plug className="mr-1 h-3 w-3" />
                                Bind
                            </Button>
                        )}

                        {device.status === 'bound' && (
                            <>
                                <Button
                                    size="sm"
                                    onClick={onAttach}
                                    disabled={loading}
                                >
                                    <PlugZap className="mr-1 h-3 w-3" />
                                    Attach
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={onUnbind}
                                    disabled={loading}
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
                                onClick={onDetach}
                                disabled={loading}
                            >
                                <Unplug className="mr-1 h-3 w-3" />
                                Detach
                            </Button>
                        )}

                        {device.status === 'pending_attach' && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onCancelPending}
                                disabled={loading}
                                className="border-amber-300 text-amber-600 hover:bg-amber-50"
                            >
                                <X className="mr-1 h-3 w-3" />
                                Cancel Pending
                            </Button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

interface GatewayNodeCardProps {
    node: GatewayNode;
    loading: boolean;
    onRefreshNode: (nodeId: number) => void;
    onVerifyNode: (nodeId: number, verified: boolean) => void;
    onBindDevice: (deviceId: number) => void;
    onUnbindDevice: (deviceId: number) => void;
    onAttachDevice: (device: UsbDevice) => void;
    onDetachDevice: (deviceId: number) => void;
    onCancelPending: (deviceId: number) => void;
    onMarkAsCamera: (deviceId: number) => void;
    onRemoveCamera: (deviceId: number) => void;
}

function GatewayNodeCard({
    node,
    loading,
    onRefreshNode,
    onVerifyNode,
    onBindDevice,
    onUnbindDevice,
    onAttachDevice,
    onDetachDevice,
    onCancelPending,
    onMarkAsCamera,
    onRemoveCamera,
}: GatewayNodeCardProps) {
    const [expanded, setExpanded] = useState(false);
    const isOnline = node.online;
    const devices = node.devices ?? [];

    return (
        <Card className="shadow-card transition-all hover:shadow-card-hover">
            <Collapsible open={expanded} onOpenChange={setExpanded}>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-3">
                        <CollapsibleTrigger asChild>
                            <div className="flex cursor-pointer items-center gap-3 hover:opacity-80">
                                {expanded ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                                <div
                                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                                        isOnline
                                            ? 'bg-success/10 text-success'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {isOnline ? (
                                        <Wifi className="h-4 w-4" />
                                    ) : (
                                        <WifiOff className="h-4 w-4" />
                                    )}
                                </div>
                                <div>
                                    <CardTitle className="text-base font-medium">
                                        {node.name}
                                    </CardTitle>
                                    <CardDescription>
                                        {node.ip}:{node.port} &middot;{' '}
                                        {devices.length} USB device
                                        {devices.length !== 1 ? 's' : ''}
                                    </CardDescription>
                                </div>
                            </div>
                        </CollapsibleTrigger>

                        <div className="flex flex-wrap items-center justify-end gap-2">
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

                            {node.is_verified ? (
                                <Badge
                                    variant="outline"
                                    className="border-success/30 bg-success/10 text-success"
                                >
                                    <ShieldCheck className="mr-1 h-3 w-3" />
                                    Verified
                                </Badge>
                            ) : (
                                <Badge
                                    variant="outline"
                                    className="border-warning/30 bg-warning/10 text-warning"
                                >
                                    <ShieldAlert className="mr-1 h-3 w-3" />
                                    Unverified
                                </Badge>
                            )}

                            <Button
                                size="sm"
                                variant={
                                    node.is_verified ? 'outline' : 'default'
                                }
                                onClick={() =>
                                    onVerifyNode(node.id, !node.is_verified)
                                }
                                disabled={loading}
                            >
                                {node.is_verified ? 'Unverify' : 'Verify'}
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onRefreshNode(node.id)}
                                disabled={loading}
                                aria-label={`Refresh ${node.name}`}
                            >
                                <RefreshCw
                                    className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                                />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CollapsibleContent>
                    <CardContent className="pt-0">
                        {!node.is_verified ? (
                            <p className="py-4 text-center text-sm text-muted-foreground">
                                Verify this gateway to view and manage USB
                                devices.
                            </p>
                        ) : devices.length === 0 ? (
                            <p className="py-4 text-center text-sm text-muted-foreground">
                                No USB devices detected on this gateway.
                            </p>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {devices.map((device) => (
                                    <UsbDeviceRow
                                        key={device.id}
                                        device={device}
                                        loading={loading}
                                        onBind={() => onBindDevice(device.id)}
                                        onUnbind={() =>
                                            onUnbindDevice(device.id)
                                        }
                                        onAttach={() => onAttachDevice(device)}
                                        onDetach={() =>
                                            onDetachDevice(device.id)
                                        }
                                        onCancelPending={() =>
                                            onCancelPending(device.id)
                                        }
                                        onMarkAsCamera={() =>
                                            onMarkAsCamera(device.id)
                                        }
                                        onRemoveCamera={() =>
                                            onRemoveCamera(device.id)
                                        }
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}

// ─── Cameras Tab Sub-Components ───────────────────────────────────────────────

interface CameraCardProps {
    cam: CameraType;
    loading: boolean;
    selected?: boolean;
    onToggleSelect?: (checked: boolean) => void;
    onAttach: () => void;
    onDetach: () => void;
    onActivate: () => void;
    onDeactivate: () => void;
}

function CameraCard({
    cam,
    loading,
    selected = false,
    onToggleSelect,
    onAttach,
    onDetach,
    onActivate,
    onDeactivate,
}: CameraCardProps) {
    const statusColor =
        cam.status === 'active'
            ? 'bg-green-500'
            : cam.status === 'inactive'
              ? 'bg-gray-400'
              : 'bg-red-500';
    const textColor =
        cam.status === 'active'
            ? 'text-green-600'
            : cam.status === 'inactive'
              ? 'text-gray-500'
              : 'text-red-600';
    const hasReservation = cam.is_controlled || cam.has_active_reservation;
    const isActive = cam.status === 'active';

    return (
        <div className="rounded-lg border p-4 transition-all hover:border-secondary/50">
            <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Checkbox
                        checked={selected}
                        onCheckedChange={(checked: boolean) =>
                            onToggleSelect?.(checked)
                        }
                        disabled={loading}
                        aria-label={`Select ${cam.name} for bulk assignment`}
                    />
                    <Camera className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{cam.name}</span>
                </div>
                <Badge
                    variant="outline"
                    className={`${textColor} border-current text-xs capitalize`}
                >
                    <span
                        className={`mr-1.5 h-2 w-2 rounded-full ${statusColor}`}
                    />
                    {cam.status}
                </Badge>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
                <p>Robot: {cam.robot_name}</p>
                <p>
                    Type: {cam.type_label} {cam.ptz_capable ? '(PTZ)' : ''}
                </p>
                <p>Stream: {cam.stream_key}</p>
                {cam.is_controlled && cam.control && (
                    <p className="text-amber-600">
                        Controlled by session #
                        {cam.control.session_id.slice(0, 8)}
                    </p>
                )}
                {hasReservation && !cam.control && (
                    <p className="text-amber-600">Reserved</p>
                )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                {/* Activate/Deactivate buttons */}
                {!isActive ? (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onActivate}
                        disabled={loading}
                        className="border-success/30 text-success hover:bg-success/10"
                    >
                        <Check className="mr-1 h-3 w-3" />
                        Activate
                    </Button>
                ) : (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onDeactivate}
                        disabled={loading}
                        className="border-amber-300 text-amber-600 hover:bg-amber-50"
                    >
                        <X className="mr-1 h-3 w-3" />
                        Deactivate
                    </Button>
                )}

                {/* Attach/Detach buttons */}
                {!hasReservation && isActive && (
                    <Button size="sm" onClick={onAttach} disabled={loading}>
                        <PlugZap className="mr-1 h-3 w-3" />
                        Attach
                    </Button>
                )}

                {hasReservation && (
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={onDetach}
                        disabled={loading}
                    >
                        <Unplug className="mr-1 h-3 w-3" />
                        Detach
                    </Button>
                )}
            </div>
        </div>
    );
}

interface CameraAttachDialogProps {
    camera: CameraType | null;
    open: boolean;
    onClose: () => void;
    onAttach: (cameraId: number, vmid: number, vmName: string) => Promise<void>;
    loading: boolean;
}

function CameraAttachDialog({
    camera,
    open,
    onClose,
    onAttach,
    loading,
}: CameraAttachDialogProps) {
    const [selectedVmId, setSelectedVmId] = useState<string>('');
    const [runningVms, setRunningVms] = useState<RunningVm[]>([]);
    const [loadingVms, setLoadingVms] = useState(false);
    const [vmError, setVmError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) {
            setSelectedVmId('');
            return;
        }

        let isMounted = true;

        const fetchVms = async () => {
            setLoadingVms(true);
            setVmError(null);
            setSelectedVmId('');

            try {
                const vms = await hardwareApi.getRunningVms();

                if (!isMounted) {
                    return;
                }

                setRunningVms(vms);

                if (vms.length === 0) {
                    setVmError(
                        'No running VMs found. Make sure target VMs are powered on.',
                    );
                }
            } catch (err) {
                if (!isMounted) {
                    return;
                }

                setRunningVms([]);
                setVmError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to load running VMs',
                );
            } finally {
                if (isMounted) {
                    setLoadingVms(false);
                }
            }
        };

        void fetchVms();

        return () => {
            isMounted = false;
        };
    }, [open]);

    const selectedVm = runningVms.find(
        (vm) => `${vm.vmid}-${vm.server_id}` === selectedVmId,
    );

    const canSubmit = !!camera && !!selectedVm && !loading && !loadingVms;

    const handleAttach = async () => {
        if (!camera || !selectedVm) {
            return;
        }

        await onAttach(camera.id, selectedVm.vmid, selectedVm.name);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    onClose();
                }
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Attach Camera to VM</DialogTitle>
                    <DialogDescription>
                        Reserve <strong>{camera?.name}</strong> for a virtual
                        machine.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="camera-vm-select">Target VM</Label>

                        {loadingVms ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading running VMs...
                            </div>
                        ) : vmError ? (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{vmError}</AlertDescription>
                            </Alert>
                        ) : (
                            <Select
                                value={selectedVmId}
                                onValueChange={setSelectedVmId}
                            >
                                <SelectTrigger id="camera-vm-select">
                                    <SelectValue placeholder="Select a VM..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {runningVms.map((vm) => (
                                        <SelectItem
                                            key={`${vm.vmid}-${vm.server_id}`}
                                            value={`${vm.vmid}-${vm.server_id}`}
                                        >
                                            {vm.display_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {selectedVm && (
                        <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                            <p>
                                <strong>VM:</strong> {selectedVm.name}
                            </p>
                            <p>
                                <strong>IP:</strong>{' '}
                                {selectedVm.ip_address ?? 'Not available'}
                            </p>
                            <p>
                                <strong>Node:</strong> {selectedVm.node} (
                                {selectedVm.server_name})
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleAttach} disabled={!canSubmit}>
                        {loading ? 'Attaching...' : 'Attach Camera'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type InfrastructureTab = 'proxmox' | 'hardware' | 'cameras' | 'sessions';

interface InfrastructurePageProps {
    initialTab?: InfrastructureTab;
}

export default function InfrastructurePage({
    initialTab = 'proxmox',
}: InfrastructurePageProps) {
    const [activeTab, setActiveTab] = useState<InfrastructureTab>(initialTab);

    // ── Proxmox state ──
    const [servers, setServers] = useState<ProxmoxServerAdmin[]>([]);
    const [nodes, setNodes] = useState<ProxmoxNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [nodesLoading, setNodesLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedServers, setExpandedServers] = useState<Set<number>>(
        new Set(),
    );

    // ── Dialog state ──
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingServer, setEditingServer] =
        useState<ProxmoxServerAdmin | null>(null);
    const [formData, setFormData] =
        useState<ProxmoxServerFormData>(initialFormData);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [deleteServer, setDeleteServer] = useState<ProxmoxServerAdmin | null>(
        null,
    );
    const [deleteLoading, setDeleteLoading] = useState(false);

    // ── Hardware state (via hook) ──
    const {
        nodes: gatewayNodes,
        loading: hardwareLoading,
        actionLoading: hardwareActionLoading,
        error: hardwareError,
        refreshAll,
        refreshNode,
        bindDevice,
        unbindDevice,
        attachDevice,
        detachDevice,
        cancelPendingAttachment,
        markAsCamera,
        removeCamera,
        discoverGateways,
        verifyNode,
    } = useHardwareGateway();

    const [attachDialogDevice, setAttachDialogDevice] =
        useState<UsbDevice | null>(null);

    // ── Camera state ──
    const [cameras, setCameras] = useState<CameraType[]>([]);
    const [camerasLoading, setCamerasLoading] = useState(false);
    const [cameraActionLoading, setCameraActionLoading] = useState(false);
    const [cameraAttachTarget, setCameraAttachTarget] =
        useState<CameraType | null>(null);
    const [bulkAssignDialogOpen, setBulkAssignDialogOpen] = useState(false);
    const [selectedCameraIds, setSelectedCameraIds] = useState<number[]>([]);
    const [bulkAssignVmKey, setBulkAssignVmKey] = useState('');
    const [bulkAssignVms, setBulkAssignVms] = useState<RunningVm[]>([]);
    const [bulkAssignLoadingVms, setBulkAssignLoadingVms] = useState(false);
    const [bulkAssignSaving, setBulkAssignSaving] = useState(false);
    const [bulkAssignError, setBulkAssignError] = useState<string | null>(null);

    // ── Session launch + viewer state ──
    const {
        sessions,
        loading: sessionsLoading,
        refetch: refetchSessions,
        terminateSession,
    } = useVMSessions();
    const [selectedLaunchVm, setSelectedLaunchVm] =
        useState<LaunchableVM | null>(null);
    const [isLaunchDialogOpen, setIsLaunchDialogOpen] = useState(false);
    const [launchDuration, setLaunchDuration] = useState<number>(60);
    const [launchLoading, setLaunchLoading] = useState(false);
    const [launchError, setLaunchError] = useState<string | null>(null);
    const [useExisting, setUseExisting] = useState(false);
    const [launchUsername, setLaunchUsername] = useState('');
    const [launchPassword, setLaunchPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [launchProtocol, setLaunchProtocol] = useState<string>('rdp');
    const [selectedConnectionProfile, setSelectedConnectionProfile] =
        useState<string>(NO_PROFILE_SELECTED_VALUE);
    const [savedProfiles, setSavedProfiles] = useState<{
        rdp: ConnectionProfile[];
        vnc: ConnectionProfile[];
        ssh: ConnectionProfile[];
    }>({
        rdp: [],
        vnc: [],
        ssh: [],
    });
    const [protocolDisabled, setProtocolDisabled] = useState(false);
    const [launchReturnSnapshot, setLaunchReturnSnapshot] =
        useState<string>('');
    const [vmSnapshots, setVmSnapshots] = useState<VMSnapshot[]>([]);
    const [snapshotsLoading, setSnapshotsLoading] = useState(false);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [terminatingSessionId, setTerminatingSessionId] = useState<
        string | null
    >(null);
    const [splitLeftWidth, setSplitLeftWidth] = useState<number>(58);
    const [isResizingSplit, setIsResizingSplit] = useState(false);
    const [isWorkspaceFullscreen, setIsWorkspaceFullscreen] = useState(false);
    const splitContainerRef = useRef<HTMLDivElement | null>(null);
    const [perVmDefaultProfile, setPerVmDefaultProfile] = useState<{
        name: string | null;
        isAdmin: boolean;
    }>({ name: null, isAdmin: false });

    const launchProfiles = useMemo(
        () => savedProfiles[launchProtocol as keyof typeof savedProfiles] ?? [],
        [launchProtocol, savedProfiles],
    );

    const defaultLaunchProfile = useMemo(() => {
        // 1. If a per-VM default is set (by user or admin), prioritize it
        if (perVmDefaultProfile.name) {
            return (
                launchProfiles.find(
                    (p) => p.profile_name === perVmDefaultProfile.name,
                ) ?? {
                    profile_name: perVmDefaultProfile.name,
                    is_default: true,
                }
            );
        }
        // 2. Fall back to the user's protocol-level default profile
        return launchProfiles.find((profile) => profile.is_default) ?? null;
    }, [launchProfiles, perVmDefaultProfile]);

    const [saveAsVmDefault, setSaveAsVmDefault] = useState(false);

    // Auto-update the "saveAsVmDefault" checkbox if the user selects a profile that is already their per-VM default
    useEffect(() => {
        if (
            perVmDefaultProfile.name &&
            selectedConnectionProfile === perVmDefaultProfile.name
        ) {
            setSaveAsVmDefault(true);
        } else if (selectedConnectionProfile === NO_PROFILE_SELECTED_VALUE) {
            // When resetting to protocol default, uncheck
            setSaveAsVmDefault(false);
        }
    }, [selectedConnectionProfile, perVmDefaultProfile]);

    // Refresh per-VM default when VM or protocol changes
    useEffect(() => {
        if (!selectedLaunchVm || !isLaunchDialogOpen) {
            setPerVmDefaultProfile({ name: null, isAdmin: false });
            setSaveAsVmDefault(false);
            return;
        }

        connectionPreferencesApi
            .getPerVMDefault(selectedLaunchVm.vmid, launchProtocol)
            .then((data) => {
                setPerVmDefaultProfile({
                    name: data.preferred_profile_name,
                    isAdmin: !!data.is_admin_defined,
                });
                // If a default is found and it belongs to this user (the admin), check the box
                setSaveAsVmDefault(
                    !!data.preferred_profile_name && !data.is_admin_defined,
                );
            })
            .catch(() => {
                setPerVmDefaultProfile({ name: null, isAdmin: false });
                setSaveAsVmDefault(false);
            });
    }, [selectedLaunchVm, launchProtocol, isLaunchDialogOpen]);

    // ── Data fetching ──
    const fetchServers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await client.get<{ data: ProxmoxServerAdmin[] }>(
                '/admin/proxmox-servers',
            );
            setServers(response.data.data);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to fetch servers',
            );
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchNodes = useCallback(async () => {
        setNodesLoading(true);
        try {
            const response = await adminApi.getNodes();
            const payload = response.data as unknown;
            const proxmoxNodes = Array.isArray(payload)
                ? payload
                : ((payload as { data?: ProxmoxNode[] }).data ?? []);
            setNodes(proxmoxNodes as ProxmoxNode[]);
        } catch (err) {
            console.error('Failed to fetch nodes:', err);
        } finally {
            setNodesLoading(false);
        }
    }, []);

    const fetchCameras = useCallback(async () => {
        setCamerasLoading(true);
        try {
            const cams = await adminCameraApi.getCameras();
            setCameras(cams);
        } catch (err) {
            console.error('Failed to fetch cameras:', err);
        } finally {
            setCamerasLoading(false);
        }
    }, []);

    const loadConnectionProfiles = useCallback(async () => {
        try {
            const profiles = await connectionPreferencesApi.getAll();
            setSavedProfiles(profiles);
        } catch {
            // Profiles are optional for launch flow; keep defaults.
        }
    }, []);

    useEffect(() => {
        fetchServers();
        fetchNodes();
        fetchCameras();
        void loadConnectionProfiles();
    }, [fetchServers, fetchNodes, fetchCameras, loadConnectionProfiles]);

    // Auto-refresh nodes every 30s
    useEffect(() => {
        const interval = setInterval(fetchNodes, 30000);
        return () => clearInterval(interval);
    }, [fetchNodes]);

    // Keep the embedded session pane fresh while a session is selected.
    useEffect(() => {
        if (!activeSessionId) {
            return;
        }

        const interval = setInterval(() => {
            void refetchSessions();
        }, 10000);

        return () => clearInterval(interval);
    }, [activeSessionId, refetchSessions]);

    useEffect(() => {
        if (!activeSessionId) {
            setIsResizingSplit(false);
            setIsWorkspaceFullscreen(false);
        }
    }, [activeSessionId]);

    useEffect(() => {
        if (selectedConnectionProfile === NO_PROFILE_SELECTED_VALUE) {
            return;
        }

        const profileStillExists = launchProfiles.some(
            (profile) => profile.profile_name === selectedConnectionProfile,
        );

        if (!profileStillExists) {
            setSelectedConnectionProfile(NO_PROFILE_SELECTED_VALUE);
        }
    }, [launchProfiles, selectedConnectionProfile]);

    useEffect(() => {
        if (!bulkAssignDialogOpen) {
            setBulkAssignVmKey('');
            setBulkAssignError(null);
            return;
        }

        let isMounted = true;

        const fetchRunningVmsForBulkAssign = async () => {
            setBulkAssignLoadingVms(true);
            setBulkAssignError(null);

            try {
                const runningVms = await hardwareApi.getRunningVms();
                if (!isMounted) {
                    return;
                }

                setBulkAssignVms(runningVms);

                if (runningVms.length === 0) {
                    setBulkAssignError(
                        'No running VMs found. Start target VMs first before bulk assignment.',
                    );
                }
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                setBulkAssignVms([]);
                setBulkAssignError(
                    error instanceof Error
                        ? error.message
                        : 'Failed to load running VMs',
                );
            } finally {
                if (isMounted) {
                    setBulkAssignLoadingVms(false);
                }
            }
        };

        void fetchRunningVmsForBulkAssign();

        return () => {
            isMounted = false;
        };
    }, [bulkAssignDialogOpen]);

    useEffect(() => {
        if (!isResizingSplit || !activeSessionId || isWorkspaceFullscreen) {
            return;
        }

        const handlePointerMove = (event: PointerEvent) => {
            const container = splitContainerRef.current;
            if (!container) {
                return;
            }

            const rect = container.getBoundingClientRect();
            const relativeX = event.clientX - rect.left;
            const ratio = (relativeX / rect.width) * 100;
            const clampedRatio = clampSplitLeftPercent(ratio, rect.width);

            setSplitLeftWidth(clampedRatio);
        };

        const stopResize = () => {
            setIsResizingSplit(false);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', stopResize);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', stopResize);
        };
    }, [activeSessionId, isResizingSplit, isWorkspaceFullscreen]);

    useEffect(() => {
        if (!activeSessionId || isWorkspaceFullscreen) {
            return;
        }

        const syncSplitBounds = () => {
            const width =
                splitContainerRef.current?.getBoundingClientRect().width ?? 0;

            setSplitLeftWidth((current) =>
                clampSplitLeftPercent(current, width),
            );
        };

        syncSplitBounds();
        window.addEventListener('resize', syncSplitBounds);

        return () => {
            window.removeEventListener('resize', syncSplitBounds);
        };
    }, [activeSessionId, isWorkspaceFullscreen]);

    // ── Handlers ──
    const handleOpenLaunch = useCallback((vm: LaunchableVM) => {
        setSelectedLaunchVm(vm);
        setLaunchError(null);
        setLaunchUsername('');
        setLaunchPassword('');
        setShowPassword(false);
        setLaunchProtocol('rdp');
        setSelectedConnectionProfile(NO_PROFILE_SELECTED_VALUE);
        setLaunchDuration(60);
        setLaunchReturnSnapshot('');
        setVmSnapshots([]);

        const isTemplate = vm.is_template;
        setUseExisting(!isTemplate);
        setProtocolDisabled(isTemplate);
        setIsLaunchDialogOpen(true);

        setSnapshotsLoading(true);
        proxmoxVMApi
            .listSnapshots(vm.server_id, vm.node_id, vm.vmid)
            .then((snaps) => setVmSnapshots(snaps))
            .catch(() => setVmSnapshots([]))
            .finally(() => setSnapshotsLoading(false));
    }, []);

    const handleLaunchSession = useCallback(async () => {
        if (!selectedLaunchVm) {
            return;
        }

        setLaunchLoading(true);
        setLaunchError(null);

        try {
            const effectiveProfileForVmDefault =
                selectedConnectionProfile !== NO_PROFILE_SELECTED_VALUE
                    ? selectedConnectionProfile
                    : (defaultLaunchProfile?.profile_name ?? null);

            // Save as per-VM default if requested
            if (saveAsVmDefault) {
                if (!effectiveProfileForVmDefault) {
                    throw new Error(
                        'No connection profile is available to save as VM default. Create one in Connection Preferences first.',
                    );
                }

                await connectionPreferencesApi.setPerVMDefault(
                    selectedLaunchVm.vmid,
                    launchProtocol,
                    effectiveProfileForVmDefault,
                );
            }

            const payload: CreateVMSessionRequest = {
                vmid: selectedLaunchVm.vmid,
                node_id: selectedLaunchVm.node_id,
                proxmox_server_id: selectedLaunchVm.server_id,
                vm_name: selectedLaunchVm.name || undefined,
                duration_minutes: launchDuration,
                username: launchUsername || undefined,
                password: launchPassword || undefined,
                connection_preference_protocol: launchProtocol || undefined,
                connection_preference_profile:
                    selectedConnectionProfile !== NO_PROFILE_SELECTED_VALUE
                        ? selectedConnectionProfile
                        : undefined,
                return_snapshot: launchReturnSnapshot || undefined,
                use_existing: useExisting || undefined,
            };

            if (!useExisting) {
                payload.connection_preference_protocol =
                    launchProtocol || undefined;
            }

            const session = await vmSessionApi.create(payload);
            if (!session || !session.id) {
                throw new Error('API returned an invalid session response');
            }

            setIsLaunchDialogOpen(false);
            setActiveSessionId(session.id);
            await refetchSessions();
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Failed to launch session';
            setLaunchError(message);
        } finally {
            setLaunchLoading(false);
        }
    }, [
        selectedLaunchVm,
        launchDuration,
        launchUsername,
        launchPassword,
        launchProtocol,
        selectedConnectionProfile,
        defaultLaunchProfile,
        launchReturnSnapshot,
        useExisting,
        saveAsVmDefault,
        refetchSessions,
    ]);

    const handleToggleExpand = (serverId: number) => {
        setExpandedServers((prev) => {
            const next = new Set(prev);

            if (next.has(serverId)) {
                next.delete(serverId);
            } else {
                next.add(serverId);
            }

            return next;
        });
    };

    const handleRefresh = () => {
        fetchServers();
        fetchNodes();
        fetchCameras();
        refetchSessions();

        if (activeTab === 'hardware') {
            refreshAll();
        }
    };

    const handleSaveServer = async () => {
        setFormLoading(true);
        setFormError(null);
        try {
            if (editingServer) {
                const payload: Record<string, unknown> = { ...formData };
                if (!formData.token_id) delete payload.token_id;
                if (!formData.token_secret) delete payload.token_secret;
                await client.patch(
                    `/admin/proxmox-servers/${editingServer.id}`,
                    payload,
                );
            } else {
                await client.post('/admin/proxmox-servers', formData);
            }
            setIsDialogOpen(false);
            setEditingServer(null);
            setFormData(initialFormData);
            fetchServers();
            fetchNodes();
        } catch (err: unknown) {
            const axiosErr = err as {
                response?: {
                    data?: {
                        error?: string;
                        errors?: Record<string, string[]>;
                        message?: string;
                    };
                };
            };
            if (axiosErr.response?.data?.error) {
                setFormError(axiosErr.response.data.error);
            } else if (axiosErr.response?.data?.errors) {
                const msgs = Object.entries(axiosErr.response.data.errors)
                    .map(
                        ([field, messages]) =>
                            `${field}: ${Array.isArray(messages) ? messages[0] : messages}`,
                    )
                    .join('\n');
                setFormError(msgs);
            } else if (axiosErr.response?.data?.message) {
                setFormError(axiosErr.response.data.message);
            } else {
                setFormError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to save server',
                );
            }
        } finally {
            setFormLoading(false);
        }
    };

    const handleToggleActive = async (server: ProxmoxServerAdmin) => {
        try {
            await client.patch(`/admin/proxmox-servers/${server.id}`, {
                is_active: !server.is_active,
            });
            fetchServers();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to update server',
            );
        }
    };

    const handleDeleteServer = async () => {
        if (!deleteServer) return;
        setDeleteLoading(true);
        try {
            await client.delete(`/admin/proxmox-servers/${deleteServer.id}`);
            setDeleteServer(null);
            fetchServers();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to delete server',
            );
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleSyncNodes = async (serverId: number) => {
        try {
            await client.post(`/admin/proxmox-servers/${serverId}/sync-nodes`);
            fetchNodes();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to sync nodes',
            );
        }
    };

    const handleDiscoverGateways = async () => {
        await discoverGateways();
    };

    const handleMarkAsCamera = async (deviceId: number) => {
        const success = await markAsCamera(deviceId);
        if (success) {
            await fetchCameras();
        }
    };

    const handleRemoveCamera = async (deviceId: number) => {
        const success = await removeCamera(deviceId);
        if (success) {
            await fetchCameras();
        }
    };

    const handleAttachHardwareDevice = async (
        deviceId: number,
        vmIp: string,
        vmName: string,
        vmid: number,
        node: string,
        serverId: number,
    ) => {
        await attachDevice(deviceId, {
            vm_ip: vmIp,
            vm_name: vmName,
            vmid,
            node,
            server_id: serverId,
        });
    };

    const handleAttachCamera = async (
        cameraId: number,
        _vmid: number,
        vmName: string,
    ) => {
        setCameraActionLoading(true);

        try {
            const now = new Date();
            const end = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

            await adminCameraApi.createBlock({
                camera_id: cameraId,
                start_at: now.toISOString(),
                end_at: end.toISOString(),
                notes: `Attached to VM: ${vmName}`,
            });

            await fetchCameras();
            toast.success('Camera attached successfully');
        } catch (err) {
            console.error('Failed to attach camera:', err);
            toast.error(
                err instanceof Error ? err.message : 'Failed to attach camera',
            );
        } finally {
            setCameraActionLoading(false);
        }
    };

    const handleDetachCamera = async (cameraId: number) => {
        setCameraActionLoading(true);

        try {
            const camera = cameras.find((cam) => cam.id === cameraId);
            if (!camera || !camera.active_reservation_id) {
                throw new Error('No active reservation found for this camera');
            }

            await adminCameraApi.cancelReservation(
                camera.active_reservation_id,
            );
            await fetchCameras();
            toast.success('Camera detached successfully');
        } catch (err) {
            console.error('Failed to detach camera:', err);
            toast.error(
                err instanceof Error ? err.message : 'Failed to detach camera',
            );
        } finally {
            setCameraActionLoading(false);
        }
    };

    const handleActivateCamera = async (cameraId: number) => {
        setCameraActionLoading(true);

        try {
            await adminCameraApi.activate(cameraId);
            await fetchCameras();
            toast.success('Camera activated successfully');
        } catch (err) {
            console.error('Failed to activate camera:', err);
            toast.error(getHttpErrorMessage(err, 'Failed to activate camera'));
        } finally {
            setCameraActionLoading(false);
        }
    };

    const handleDeactivateCamera = async (cameraId: number) => {
        setCameraActionLoading(true);

        try {
            await adminCameraApi.deactivate(
                cameraId,
                'Deactivated via Infrastructure page',
            );
            await fetchCameras();
            toast.success('Camera deactivated successfully');
        } catch (err) {
            console.error('Failed to deactivate camera:', err);
            toast.error(
                err instanceof Error
                    ? err.message
                    : 'Failed to deactivate camera',
            );
        } finally {
            setCameraActionLoading(false);
        }
    };

    const handleToggleBulkCameraSelection = (
        cameraId: number,
        checked: boolean,
    ) => {
        setSelectedCameraIds((previous) => {
            if (checked) {
                if (previous.includes(cameraId)) {
                    return previous;
                }

                return [...previous, cameraId];
            }

            return previous.filter((id) => id !== cameraId);
        });
    };

    const handleBulkAssignCameras = async () => {
        const selectedVm = bulkAssignVms.find(
            (vm) => `${vm.vmid}-${vm.server_id}` === bulkAssignVmKey,
        );

        if (!selectedVm || selectedCameraIds.length === 0) {
            return;
        }

        setBulkAssignSaving(true);
        setBulkAssignError(null);

        try {
            const result = await adminCameraApi.bulkAssign(
                selectedCameraIds.map((cameraId) => ({
                    camera_id: cameraId,
                    vm_id: selectedVm.vmid,
                })),
            );

            const failedAssignments = result.results.filter(
                (entry) => !entry.success,
            );

            if (failedAssignments.length > 0) {
                toast.warning(
                    `${failedAssignments.length} camera assignments failed. Check logs for details.`,
                );
            } else {
                toast.success('Bulk camera assignment completed successfully');
            }

            setSelectedCameraIds([]);
            setBulkAssignVmKey('');
            setBulkAssignDialogOpen(false);
            await fetchCameras();
        } catch (error) {
            setBulkAssignError(
                error instanceof Error
                    ? error.message
                    : 'Failed to assign cameras in bulk',
            );
        } finally {
            setBulkAssignSaving(false);
        }
    };

    const handleTerminateSession = useCallback(
        async (sessionId: string) => {
            setTerminatingSessionId(sessionId);

            try {
                await terminateSession(sessionId);

                if (activeSessionId === sessionId) {
                    setActiveSessionId(null);
                }
            } catch (err) {
                toast.error(
                    err instanceof Error
                        ? err.message
                        : 'Failed to terminate session',
                );
            } finally {
                setTerminatingSessionId(null);
            }
        },
        [activeSessionId, terminateSession],
    );

    const handleMakeWorkspaceWider = useCallback(() => {
        setIsWorkspaceFullscreen(false);
        const width =
            splitContainerRef.current?.getBoundingClientRect().width ?? 0;
        setSplitLeftWidth((current) =>
            clampSplitLeftPercent(current - SPLIT_STEP_PERCENT, width),
        );
    }, []);

    const handleMakeWorkspaceNarrower = useCallback(() => {
        setIsWorkspaceFullscreen(false);
        const width =
            splitContainerRef.current?.getBoundingClientRect().width ?? 0;
        setSplitLeftWidth((current) =>
            clampSplitLeftPercent(current + SPLIT_STEP_PERCENT, width),
        );
    }, []);

    // ── Derived stats ──
    const activeServers = servers.filter((s) => s.is_active).length;
    const onlineNodes = nodes.filter((n) => n.status === 'online').length;
    const totalVMs = nodes.reduce(
        (sum, n) => sum + (n.active_vm_count ?? 0),
        0,
    );
    const activeCameras = cameras.filter((c) => c.status === 'active').length;
    const onlineGateways = (gatewayNodes ?? []).filter((n) => n.online).length;
    const activeSessions = sessions.filter(
        (session) =>
            session.status === 'active' && session.time_remaining_seconds > 0,
    );
    const provisioningSessions = sessions.filter(
        (session) =>
            (session.status === 'provisioning' ||
                session.status === 'pending') &&
            session.time_remaining_seconds > 0,
    );
    const visibleSessionCount =
        activeSessions.length + provisioningSessions.length;
    const activeSession = activeSessionId
        ? (sessions.find((session) => session.id === activeSessionId) ?? null)
        : null;
    const splitContainerWidth =
        splitContainerRef.current?.getBoundingClientRect().width ?? 0;
    const { minPercent: minSplitLeftPercent, maxPercent: maxSplitLeftPercent } =
        getSplitBoundsPercent(splitContainerWidth);
    const selectedBulkAssignVm = bulkAssignVms.find(
        (vm) => `${vm.vmid}-${vm.server_id}` === bulkAssignVmKey,
    );
    const canSubmitBulkAssign =
        selectedCameraIds.length > 0 &&
        Boolean(selectedBulkAssignVm) &&
        !bulkAssignSaving &&
        !bulkAssignLoadingVms;

    // ── Render ──
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Infrastructure" />
            <div className="container py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 text-info">
                            <Shield className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="font-heading text-3xl font-bold text-foreground">
                                Infrastructure
                            </h1>
                            <p className="text-muted-foreground">
                                Manage Proxmox servers, hardware gateways, and
                                cameras
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={
                                loading ||
                                nodesLoading ||
                                hardwareLoading ||
                                hardwareActionLoading
                            }
                        >
                            <RefreshCw
                                className={`mr-2 h-4 w-4 ${
                                    loading ||
                                    nodesLoading ||
                                    hardwareLoading ||
                                    hardwareActionLoading
                                        ? 'animate-spin'
                                        : ''
                                }`}
                            />
                            Refresh
                        </Button>

                        {activeTab === 'hardware' && (
                            <Button
                                size="sm"
                                className="bg-info text-info-foreground hover:bg-info/90"
                                onClick={handleDiscoverGateways}
                                disabled={
                                    hardwareLoading || hardwareActionLoading
                                }
                            >
                                <Search
                                    className={`mr-2 h-4 w-4 ${
                                        hardwareActionLoading
                                            ? 'animate-pulse'
                                            : ''
                                    }`}
                                />
                                Discover Gateways
                            </Button>
                        )}

                        {activeTab === 'proxmox' && (
                            <>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/connection-preferences">
                                        <Settings2 className="mr-2 h-4 w-4" />
                                        Connection Profiles
                                    </Link>
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-info text-info-foreground hover:bg-info/90"
                                    onClick={() => {
                                        setEditingServer(null);
                                        setFormData(initialFormData);
                                        setIsDialogOpen(true);
                                    }}
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Server
                                </Button>
                            </>
                        )}
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {(
                        [
                            {
                                icon: Server,
                                color: 'info',
                                label: 'Active Servers',
                                value: `${activeServers}/${servers.length}`,
                                delay: 0.1,
                            },
                            {
                                icon: Activity,
                                color: 'success',
                                label: 'Nodes Online',
                                value: `${onlineNodes}/${nodes.length}`,
                                delay: 0.2,
                            },
                            {
                                icon: Monitor,
                                color: 'warning',
                                label: 'Total VMs',
                                value: String(totalVMs),
                                delay: 0.3,
                            },
                            {
                                icon: Camera,
                                color: 'secondary',
                                label: 'Cameras Active',
                                value: `${activeCameras}/${cameras.length}`,
                                delay: 0.4,
                            },
                        ] as const
                    ).map(({ icon: Icon, color, label, value, delay }) => (
                        <motion.div
                            key={label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay }}
                        >
                            <Card className="shadow-card transition-shadow hover:shadow-card-hover">
                                <CardContent className="flex items-center gap-4 p-5">
                                    <div
                                        className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                                            statsIconClass[color]
                                        }`}
                                    >
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            {label}
                                        </p>
                                        <p className="font-heading text-2xl font-bold text-foreground">
                                            {value}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div
                    ref={splitContainerRef}
                    className={
                        activeSessionId
                            ? 'relative space-y-6 xl:flex xl:min-h-[70vh] xl:items-stretch xl:space-y-0'
                            : ''
                    }
                >
                    <div
                        className={
                            activeSessionId
                                ? isWorkspaceFullscreen
                                    ? 'hidden'
                                    : 'min-w-0 shrink-0 transition-[width] duration-150 xl:pr-3'
                                : ''
                        }
                        style={
                            activeSessionId && !isWorkspaceFullscreen
                                ? { width: `${splitLeftWidth}%` }
                                : undefined
                        }
                    >
                        {/* ── Tabs ── */}
                        <Tabs
                            value={activeTab}
                            onValueChange={(v) =>
                                setActiveTab(
                                    v as
                                        | 'proxmox'
                                        | 'hardware'
                                        | 'cameras'
                                        | 'sessions',
                                )
                            }
                        >
                            <TabsList className="mb-6">
                                <TabsTrigger
                                    value="proxmox"
                                    className="flex items-center gap-2"
                                >
                                    <Server className="h-4 w-4" />
                                    Proxmox
                                    <Badge
                                        variant="secondary"
                                        className="ml-1 text-xs"
                                    >
                                        {servers.length}
                                    </Badge>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="hardware"
                                    className="flex items-center gap-2"
                                >
                                    <Usb className="h-4 w-4" />
                                    Hardware Gateways
                                    <Badge
                                        variant="secondary"
                                        className="ml-1 text-xs"
                                    >
                                        {onlineGateways}/
                                        {(gatewayNodes ?? []).length}
                                    </Badge>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="cameras"
                                    className="flex items-center gap-2"
                                >
                                    <Video className="h-4 w-4" />
                                    Cameras
                                </TabsTrigger>
                                <TabsTrigger
                                    value="sessions"
                                    className="flex items-center gap-2"
                                >
                                    <Activity className="h-4 w-4" />
                                    Active Sessions
                                    <Badge
                                        variant="secondary"
                                        className="ml-1 text-xs"
                                    >
                                        {visibleSessionCount}
                                    </Badge>
                                </TabsTrigger>
                            </TabsList>

                            {/* ── Proxmox Tab ── */}
                            <TabsContent value="proxmox">
                                {loading && servers.length === 0 ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : servers.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="py-12 text-center"
                                    >
                                        <Server className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
                                        <h3 className="font-heading text-lg font-medium">
                                            No Proxmox servers configured
                                        </h3>
                                        <p className="mb-4 text-muted-foreground">
                                            Add your first Proxmox VE cluster to
                                            get started.
                                        </p>
                                        <Button
                                            className="bg-info text-info-foreground hover:bg-info/90"
                                            onClick={() =>
                                                setIsDialogOpen(true)
                                            }
                                        >
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Add Server
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <div className="space-y-4">
                                        {servers.map((server, i) => (
                                            <motion.div
                                                key={server.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.08 }}
                                            >
                                                <ServerCard
                                                    server={server}
                                                    nodes={nodes}
                                                    nodesLoading={nodesLoading}
                                                    isExpanded={expandedServers.has(
                                                        server.id,
                                                    )}
                                                    onOpenLaunch={
                                                        handleOpenLaunch
                                                    }
                                                    onToggleExpand={() =>
                                                        handleToggleExpand(
                                                            server.id,
                                                        )
                                                    }
                                                    onEdit={() => {
                                                        setEditingServer(
                                                            server,
                                                        );
                                                        setFormData({
                                                            name:
                                                                server.name ??
                                                                '',
                                                            description:
                                                                server.description ??
                                                                '',
                                                            host:
                                                                server.host ??
                                                                '',
                                                            port:
                                                                server.port ??
                                                                8006,
                                                            realm:
                                                                server.realm ??
                                                                'pam',
                                                            token_id: '',
                                                            token_secret: '',
                                                            verify_ssl:
                                                                server.verify_ssl ??
                                                                true,
                                                        });
                                                        setIsDialogOpen(true);
                                                    }}
                                                    onToggleActive={() =>
                                                        handleToggleActive(
                                                            server,
                                                        )
                                                    }
                                                    onDelete={() =>
                                                        setDeleteServer(server)
                                                    }
                                                    onSyncNodes={() =>
                                                        handleSyncNodes(
                                                            server.id,
                                                        )
                                                    }
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            {/* ── Hardware Tab ── */}
                            <TabsContent value="hardware">
                                {hardwareError && (
                                    <Alert
                                        variant="destructive"
                                        className="mb-4"
                                    >
                                        <AlertDescription>
                                            {hardwareError}
                                        </AlertDescription>
                                    </Alert>
                                )}
                                {hardwareLoading &&
                                (gatewayNodes ?? []).length === 0 ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (gatewayNodes ?? []).length === 0 ? (
                                    <div className="py-12 text-center">
                                        <Usb className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
                                        <h3 className="font-heading text-lg font-medium">
                                            No hardware gateways found
                                        </h3>
                                        <p className="text-muted-foreground">
                                            Gateway nodes will appear here once
                                            they are registered.
                                        </p>
                                        <Button
                                            size="sm"
                                            className="mt-4 bg-info text-info-foreground hover:bg-info/90"
                                            onClick={handleDiscoverGateways}
                                            disabled={hardwareActionLoading}
                                        >
                                            <Search
                                                className={`mr-2 h-4 w-4 ${
                                                    hardwareActionLoading
                                                        ? 'animate-pulse'
                                                        : ''
                                                }`}
                                            />
                                            Discover Gateways
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {(gatewayNodes ?? []).map((node, i) => (
                                            <motion.div
                                                key={node.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.08 }}
                                            >
                                                <GatewayNodeCard
                                                    node={node}
                                                    loading={
                                                        hardwareActionLoading
                                                    }
                                                    onRefreshNode={refreshNode}
                                                    onVerifyNode={verifyNode}
                                                    onBindDevice={bindDevice}
                                                    onUnbindDevice={
                                                        unbindDevice
                                                    }
                                                    onAttachDevice={
                                                        setAttachDialogDevice
                                                    }
                                                    onDetachDevice={
                                                        detachDevice
                                                    }
                                                    onCancelPending={
                                                        cancelPendingAttachment
                                                    }
                                                    onMarkAsCamera={
                                                        handleMarkAsCamera
                                                    }
                                                    onRemoveCamera={
                                                        handleRemoveCamera
                                                    }
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            {/* ── Cameras Tab ── */}
                            <TabsContent value="cameras">
                                <p className="mb-3 text-xs text-muted-foreground">
                                    Reservation approvals moved to Admin
                                    Reservations. Attach/detach actions remain
                                    available here.
                                </p>

                                <div>
                                    <div className="mb-3 flex items-center justify-between gap-2">
                                        <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <Eye className="h-4 w-4" />
                                            All Cameras ({cameras.length})
                                            {(camerasLoading ||
                                                cameraActionLoading) && (
                                                <Loader2 className="ml-1 h-3 w-3 animate-spin" />
                                            )}
                                        </h3>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setSelectedCameraIds([])
                                                }
                                                disabled={
                                                    selectedCameraIds.length ===
                                                        0 || cameraActionLoading
                                                }
                                            >
                                                Clear Selection
                                            </Button>

                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    setBulkAssignDialogOpen(
                                                        true,
                                                    )
                                                }
                                                disabled={
                                                    selectedCameraIds.length ===
                                                        0 || cameraActionLoading
                                                }
                                            >
                                                Bulk Assign (
                                                {selectedCameraIds.length})
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={fetchCameras}
                                                disabled={
                                                    camerasLoading ||
                                                    cameraActionLoading
                                                }
                                            >
                                                <RefreshCw
                                                    className={`mr-2 h-4 w-4 ${
                                                        camerasLoading ||
                                                        cameraActionLoading
                                                            ? 'animate-spin'
                                                            : ''
                                                    }`}
                                                />
                                                Refresh
                                            </Button>
                                        </div>
                                    </div>

                                    {camerasLoading && cameras.length === 0 ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : cameras.length === 0 ? (
                                        <p className="py-8 text-center text-muted-foreground">
                                            No cameras configured. Run the
                                            camera seeder to add cameras.
                                        </p>
                                    ) : (
                                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                            {cameras.map((cam) => (
                                                <CameraCard
                                                    key={cam.id}
                                                    cam={cam}
                                                    loading={
                                                        cameraActionLoading
                                                    }
                                                    selected={selectedCameraIds.includes(
                                                        cam.id,
                                                    )}
                                                    onToggleSelect={(checked) =>
                                                        handleToggleBulkCameraSelection(
                                                            cam.id,
                                                            checked,
                                                        )
                                                    }
                                                    onAttach={() =>
                                                        setCameraAttachTarget(
                                                            cam,
                                                        )
                                                    }
                                                    onDetach={() =>
                                                        handleDetachCamera(
                                                            cam.id,
                                                        )
                                                    }
                                                    onActivate={() =>
                                                        handleActivateCamera(
                                                            cam.id,
                                                        )
                                                    }
                                                    onDeactivate={() =>
                                                        handleDeactivateCamera(
                                                            cam.id,
                                                        )
                                                    }
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            {/* ── Sessions Tab ── */}
                            <TabsContent value="sessions">
                                <div className="mb-4 flex items-center justify-between gap-2">
                                    <p className="text-sm text-muted-foreground">
                                        View and manage your active or
                                        provisioning VM sessions.
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            void refetchSessions();
                                        }}
                                        disabled={sessionsLoading}
                                    >
                                        <RefreshCw
                                            className={`mr-2 h-4 w-4 ${sessionsLoading ? 'animate-spin' : ''}`}
                                        />
                                        Refresh
                                    </Button>
                                </div>

                                {sessionsLoading &&
                                visibleSessionCount === 0 ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : visibleSessionCount === 0 ? (
                                    <Alert>
                                        <AlertDescription>
                                            No active sessions found. Launch a
                                            VM from the Proxmox tab to start a
                                            new session.
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                        {activeSessions.map((session) => {
                                            const isTerminating =
                                                terminatingSessionId ===
                                                session.id;

                                            return (
                                                <Card
                                                    key={session.id}
                                                    className="flex flex-col shadow-card transition-all hover:shadow-card-hover"
                                                >
                                                    <CardHeader className="pb-3">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <CardTitle className="text-base">
                                                                    {session
                                                                        .template
                                                                        ?.name ??
                                                                        `VM #${session.vm_id}`}
                                                                </CardTitle>
                                                                <CardDescription>
                                                                    {
                                                                        session.node_name
                                                                    }
                                                                </CardDescription>
                                                                {session.user && (
                                                                    <div className="mt-1 flex items-center gap-1 text-xs font-medium text-info">
                                                                        <span className="truncate">
                                                                            {
                                                                                session
                                                                                    .user
                                                                                    .name
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <Badge className="border-success/30 bg-success/10 text-success">
                                                                Active
                                                            </Badge>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="space-y-2 pb-3 text-sm text-muted-foreground">
                                                        <p className="font-medium text-foreground">
                                                            VM #{session.vm_id}
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4" />
                                                            {formatTimeRemaining(
                                                                session.time_remaining_seconds,
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                    <div className="mt-auto flex gap-2 border-t p-3">
                                                        <Button
                                                            className="flex-1 bg-info text-info-foreground hover:bg-info/90"
                                                            size="sm"
                                                            onClick={() =>
                                                                setActiveSessionId(
                                                                    session.id,
                                                                )
                                                            }
                                                        >
                                                            Open Workspace
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="border-destructive/30 text-destructive hover:bg-destructive/10"
                                                            onClick={() => {
                                                                void handleTerminateSession(
                                                                    session.id,
                                                                );
                                                            }}
                                                            disabled={
                                                                isTerminating
                                                            }
                                                        >
                                                            {isTerminating ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <Power className="h-3 w-3" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </Card>
                                            );
                                        })}

                                        {provisioningSessions.map((session) => (
                                            <Card
                                                key={session.id}
                                                className="flex flex-col opacity-80 shadow-card"
                                            >
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <CardTitle className="text-base">
                                                                {session
                                                                    .template
                                                                    ?.name ??
                                                                    `VM #${session.vm_id}`}
                                                            </CardTitle>
                                                            <CardDescription>
                                                                {
                                                                    session.node_name
                                                                }
                                                            </CardDescription>
                                                            {session.user && (
                                                                <div className="mt-1 flex items-center gap-1 text-xs font-medium text-info">
                                                                    <span className="truncate">
                                                                        {
                                                                            session
                                                                                .user
                                                                                .name
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <Badge className="border-warning/30 bg-warning/10 text-warning capitalize">
                                                            {session.status}
                                                        </Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="pb-3 text-sm text-muted-foreground">
                                                    Provisioning in progress.
                                                    This may take a few
                                                    minutes...
                                                </CardContent>
                                                <div className="mt-auto border-t p-3">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full"
                                                        onClick={() =>
                                                            setActiveSessionId(
                                                                session.id,
                                                            )
                                                        }
                                                    >
                                                        View Workspace
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>

                    {activeSessionId && !isWorkspaceFullscreen && (
                        <div
                            role="separator"
                            aria-orientation="vertical"
                            aria-label="Resize workspace split"
                            className="relative hidden w-3 shrink-0 cursor-col-resize self-stretch xl:block"
                            onPointerDown={(event) => {
                                event.preventDefault();
                                setIsResizingSplit(true);
                            }}
                        >
                            <div
                                className={`absolute inset-y-0 left-1/2 w-px -translate-x-1/2 ${
                                    isResizingSplit ? 'bg-info' : 'bg-border'
                                }`}
                            />
                            <div
                                className={`absolute top-1/2 left-1/2 h-10 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border ${
                                    isResizingSplit
                                        ? 'border-info/40 bg-info/10'
                                        : 'border-border bg-background'
                                }`}
                            />
                        </div>
                    )}

                    {activeSessionId && (
                        <div
                            className={
                                isWorkspaceFullscreen
                                    ? 'w-full min-w-0'
                                    : 'min-w-0 flex-1 xl:min-w-[500px] xl:pl-3'
                            }
                        >
                            <Card
                                className={`h-fit shadow-card ${
                                    isWorkspaceFullscreen
                                        ? ''
                                        : 'xl:sticky xl:top-4'
                                }`}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <CardTitle className="text-base">
                                                Session Workspace
                                            </CardTitle>
                                            <CardDescription>
                                                {activeSession
                                                    ? `${activeSession.template?.name ?? 'VM Session'} · ${activeSession.status}`
                                                    : 'Loading session details...'}
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="hidden xl:inline-flex"
                                                onClick={
                                                    handleMakeWorkspaceNarrower
                                                }
                                                disabled={
                                                    isWorkspaceFullscreen ||
                                                    splitLeftWidth >=
                                                        maxSplitLeftPercent
                                                }
                                            >
                                                Narrower
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="hidden xl:inline-flex"
                                                onClick={
                                                    handleMakeWorkspaceWider
                                                }
                                                disabled={
                                                    isWorkspaceFullscreen ||
                                                    splitLeftWidth <=
                                                        minSplitLeftPercent
                                                }
                                            >
                                                Wider
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setIsWorkspaceFullscreen(
                                                        (prev) => !prev,
                                                    )
                                                }
                                            >
                                                {isWorkspaceFullscreen
                                                    ? 'Split View'
                                                    : 'Full Workspace'}
                                            </Button>
                                            {activeSession && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/sessions/${activeSession.id}`}
                                                    >
                                                        Open Full Page
                                                    </Link>
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() =>
                                                    setActiveSessionId(null)
                                                }
                                                aria-label="Close embedded session"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {sessionsLoading && !activeSession ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : !activeSession ? (
                                        <Alert>
                                            <AlertDescription>
                                                Session not found. It may have
                                                expired or been terminated.
                                            </AlertDescription>
                                        </Alert>
                                    ) : (
                                        <>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <SessionCountdown
                                                    expiresAt={
                                                        activeSession.expires_at
                                                    }
                                                />
                                                <SessionExtendButton
                                                    sessionId={activeSession.id}
                                                    onExtended={() => {
                                                        void refetchSessions();
                                                    }}
                                                    disabled={
                                                        activeSession.status !==
                                                        'active'
                                                    }
                                                />
                                                <TerminateSessionButton
                                                    sessionId={activeSession.id}
                                                    onTerminated={() => {
                                                        setActiveSessionId(
                                                            null,
                                                        );
                                                        void refetchSessions();
                                                    }}
                                                    disabled={
                                                        activeSession.status ===
                                                            'expired' ||
                                                        activeSession.status ===
                                                            'terminated'
                                                    }
                                                />
                                            </div>

                                            {activeSession.status !==
                                                'active' && (
                                                <Alert>
                                                    <AlertDescription>
                                                        Session is{' '}
                                                        {activeSession.status}.
                                                        Viewer will connect
                                                        automatically once it
                                                        becomes active.
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            <div className="rounded-lg border p-2">
                                                <GuacamoleViewer
                                                    sessionId={activeSession.id}
                                                    isActive={
                                                        activeSession.status ===
                                                        'active'
                                                    }
                                                    protocol={activeSession.protocol.toUpperCase()}
                                                    vmIpAddress={
                                                        activeSession.vm_ip_address
                                                    }
                                                />
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Launch Session Dialog ── */}
            <Dialog
                open={isLaunchDialogOpen}
                onOpenChange={(open) => {
                    if (!launchLoading) {
                        setIsLaunchDialogOpen(open);
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            Launch Session —{' '}
                            {selectedLaunchVm?.name ||
                                `VM ${selectedLaunchVm?.vmid}`}
                        </DialogTitle>
                        <DialogDescription>
                            {useExisting
                                ? 'This will connect to the existing VM directly.'
                                : 'This will launch a new cloned VM session.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-2">
                        {selectedLaunchVm && (
                            <div className="rounded-md bg-muted p-3 text-sm">
                                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                                    <span>VMID:</span>
                                    <span className="font-mono font-medium text-foreground">
                                        {selectedLaunchVm.vmid}
                                    </span>
                                    <span>Node:</span>
                                    <span className="font-medium text-foreground">
                                        {selectedLaunchVm.node_name}
                                    </span>
                                    <span>Server:</span>
                                    <span className="font-medium text-foreground">
                                        {selectedLaunchVm.server_name}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="launch-duration">
                                Session Duration
                            </Label>
                            <Select
                                value={launchDuration.toString()}
                                onValueChange={(value) =>
                                    setLaunchDuration(Number(value))
                                }
                                disabled={launchLoading}
                            >
                                <SelectTrigger id="launch-duration">
                                    <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DURATION_OPTIONS.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value.toString()}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="use-existing"
                                checked={useExisting}
                                onCheckedChange={(checked: boolean) => {
                                    setUseExisting(checked);
                                }}
                                disabled={
                                    launchLoading ||
                                    selectedLaunchVm?.is_template === true
                                }
                            />
                            <Label htmlFor="use-existing" className="text-sm">
                                Use existing VM (no clone)
                            </Label>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="launch-protocol">
                                Connection Protocol
                            </Label>
                            <Select
                                value={launchProtocol}
                                onValueChange={setLaunchProtocol}
                                disabled={launchLoading || protocolDisabled}
                            >
                                <SelectTrigger id="launch-protocol">
                                    <SelectValue placeholder="Select protocol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="rdp">
                                        RDP (Remote Desktop)
                                    </SelectItem>
                                    <SelectItem value="vnc">VNC</SelectItem>
                                    <SelectItem value="ssh">SSH</SelectItem>
                                </SelectContent>
                            </Select>
                            {protocolDisabled && (
                                <p className="text-xs text-muted-foreground">
                                    Protocol is locked for template-based
                                    launches.
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center justify-between gap-2">
                                <Label htmlFor="connection-profile">
                                    Connection Profile{' '}
                                    <span className="text-xs text-muted-foreground">
                                        (optional)
                                    </span>
                                </Label>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/connection-preferences">
                                        <Settings2 className="mr-1 h-4 w-4" />
                                        Edit Profiles
                                    </Link>
                                </Button>
                            </div>

                            <Select
                                value={selectedConnectionProfile}
                                onValueChange={setSelectedConnectionProfile}
                                disabled={launchLoading}
                            >
                                <SelectTrigger id="connection-profile">
                                    <SelectValue placeholder="Use protocol default" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem
                                        value={NO_PROFILE_SELECTED_VALUE}
                                    >
                                        {defaultLaunchProfile
                                            ? perVmDefaultProfile.isAdmin
                                                ? `Use Admin Default (${defaultLaunchProfile.profile_name}) ★`
                                                : `Use default (${defaultLaunchProfile.profile_name}) ★`
                                            : 'Use protocol default'}
                                    </SelectItem>

                                    {launchProfiles.map((profile) => (
                                        <SelectItem
                                            key={profile.profile_name}
                                            value={profile.profile_name}
                                        >
                                            {profile.profile_name}
                                            {profile.is_default ? ' ★' : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="save-as-vm-default"
                                    checked={saveAsVmDefault}
                                    onCheckedChange={(checked) =>
                                        setSaveAsVmDefault(checked === true)
                                    }
                                />
                                <Label
                                    htmlFor="save-as-vm-default"
                                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Set as default for this VM
                                </Label>
                            </div>

                            <p className="text-xs text-muted-foreground">
                                If you don&apos;t choose one, the starred
                                default profile is used automatically.
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="launch-username">
                                Username{' '}
                                <span className="text-xs text-muted-foreground">
                                    (optional)
                                </span>
                            </Label>
                            <Input
                                id="launch-username"
                                value={launchUsername}
                                onChange={(event) =>
                                    setLaunchUsername(event.target.value)
                                }
                                placeholder="VM login username"
                                disabled={launchLoading}
                                autoComplete="off"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="launch-password">
                                Password{' '}
                                <span className="text-xs text-muted-foreground">
                                    (optional)
                                </span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="launch-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={launchPassword}
                                    onChange={(event) =>
                                        setLaunchPassword(event.target.value)
                                    }
                                    placeholder="VM login password"
                                    disabled={launchLoading}
                                    autoComplete="off"
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                                    onClick={() =>
                                        setShowPassword((prev) => !prev)
                                    }
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="launch-snapshot">
                                Return to Snapshot{' '}
                                <span className="text-xs text-muted-foreground">
                                    (optional)
                                </span>
                            </Label>
                            <Select
                                value={
                                    launchReturnSnapshot || NO_SNAPSHOT_VALUE
                                }
                                onValueChange={(value) =>
                                    setLaunchReturnSnapshot(
                                        value === NO_SNAPSHOT_VALUE
                                            ? ''
                                            : value,
                                    )
                                }
                                disabled={launchLoading || snapshotsLoading}
                            >
                                <SelectTrigger id="launch-snapshot">
                                    <SelectValue
                                        placeholder={
                                            snapshotsLoading
                                                ? 'Loading snapshots...'
                                                : 'No snapshot (default)'
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={NO_SNAPSHOT_VALUE}>
                                        No snapshot (default)
                                    </SelectItem>
                                    {vmSnapshots
                                        .filter(
                                            (snapshot) =>
                                                snapshot.name !== 'current',
                                        )
                                        .map((snapshot) => (
                                            <SelectItem
                                                key={snapshot.name}
                                                value={snapshot.name}
                                            >
                                                {snapshot.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {launchError && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {launchError}
                                </AlertDescription>
                            </Alert>
                        )}

                        {launchLoading && (
                            <Alert>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <AlertDescription>
                                    {useExisting
                                        ? 'Connecting to VM and preparing remote desktop...'
                                        : 'Provisioning VM and preparing remote desktop...'}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsLaunchDialogOpen(false)}
                            disabled={launchLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleLaunchSession}
                            disabled={launchLoading}
                        >
                            {launchLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {launchLoading
                                ? 'Launching...'
                                : useExisting
                                  ? 'Connect'
                                  : 'Launch'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Add / Edit Server Dialog ── */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingServer
                                ? 'Edit Proxmox Server'
                                : 'Add Proxmox Server'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingServer
                                ? 'Update server configuration.'
                                : 'Register a new Proxmox VE cluster.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="Production Cluster"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                                disabled={formLoading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">
                                Description (optional)
                            </Label>
                            <Input
                                id="description"
                                placeholder="Main datacenter cluster"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                                disabled={formLoading}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                                <Label htmlFor="host">Host</Label>
                                <Input
                                    id="host"
                                    placeholder="192.168.1.100"
                                    value={formData.host}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            host: e.target.value,
                                        })
                                    }
                                    disabled={formLoading}
                                />
                            </div>
                            <div>
                                <Label htmlFor="port">Port</Label>
                                <Input
                                    id="port"
                                    type="number"
                                    value={formData.port}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            port: Number(e.target.value),
                                        })
                                    }
                                    disabled={formLoading}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="token_id">API Token ID</Label>
                            <Input
                                id="token_id"
                                placeholder="user@pam!token-name"
                                value={formData.token_id}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        token_id: e.target.value,
                                    })
                                }
                                disabled={formLoading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="token_secret">
                                API Token Secret
                            </Label>
                            <Input
                                id="token_secret"
                                type="password"
                                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                value={formData.token_secret}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        token_secret: e.target.value,
                                    })
                                }
                                disabled={formLoading}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="verify_ssl"
                                checked={formData.verify_ssl}
                                onCheckedChange={(checked: boolean) =>
                                    setFormData({
                                        ...formData,
                                        verify_ssl: checked,
                                    })
                                }
                                disabled={formLoading}
                            />
                            <Label htmlFor="verify_ssl">
                                Verify SSL Certificate
                            </Label>
                        </div>
                        {formError && (
                            <Alert variant="destructive">
                                <AlertDescription>{formError}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDialogOpen(false);
                                setEditingServer(null);
                                setFormData(initialFormData);
                            }}
                            disabled={formLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveServer}
                            disabled={formLoading}
                        >
                            {formLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {formLoading
                                ? 'Testing Connection...'
                                : editingServer
                                  ? 'Save Changes'
                                  : 'Add Server'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Delete Confirmation Dialog ── */}
            <Dialog
                open={!!deleteServer}
                onOpenChange={() => setDeleteServer(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Server</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "
                            {deleteServer?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteServer(null)}
                            disabled={deleteLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteServer}
                            disabled={deleteLoading}
                        >
                            {deleteLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Bulk Camera Assign Dialog ── */}
            <Dialog
                open={bulkAssignDialogOpen}
                onOpenChange={(open) => {
                    if (!bulkAssignSaving) {
                        setBulkAssignDialogOpen(open);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bulk Assign Cameras</DialogTitle>
                        <DialogDescription>
                            Assign {selectedCameraIds.length} selected camera(s)
                            to a running VM.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="bulk-assign-vm">Target VM</Label>

                            {bulkAssignLoadingVms ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Loading running VMs...
                                </div>
                            ) : (
                                <Select
                                    value={bulkAssignVmKey}
                                    onValueChange={setBulkAssignVmKey}
                                >
                                    <SelectTrigger id="bulk-assign-vm">
                                        <SelectValue placeholder="Select a running VM..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {bulkAssignVms.map((vm) => (
                                            <SelectItem
                                                key={`${vm.vmid}-${vm.server_id}`}
                                                value={`${vm.vmid}-${vm.server_id}`}
                                            >
                                                {vm.display_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        {selectedBulkAssignVm && (
                            <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                                <p>
                                    <strong>VM:</strong>{' '}
                                    {selectedBulkAssignVm.name}
                                </p>
                                <p>
                                    <strong>Node:</strong>{' '}
                                    {selectedBulkAssignVm.node} (
                                    {selectedBulkAssignVm.server_name})
                                </p>
                                <p>
                                    <strong>IP:</strong>{' '}
                                    {selectedBulkAssignVm.ip_address ??
                                        'Not available'}
                                </p>
                            </div>
                        )}

                        {bulkAssignError && (
                            <Alert variant="destructive">
                                <AlertDescription>
                                    {bulkAssignError}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setBulkAssignDialogOpen(false)}
                            disabled={bulkAssignSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                void handleBulkAssignCameras();
                            }}
                            disabled={!canSubmitBulkAssign}
                        >
                            {bulkAssignSaving && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Assign Cameras
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── USB Attach Dialog ── */}
            <AttachDialog
                device={attachDialogDevice}
                open={!!attachDialogDevice}
                onClose={() => setAttachDialogDevice(null)}
                onAttach={handleAttachHardwareDevice}
                loading={hardwareActionLoading}
            />

            {/* ── Camera Attach Dialog ── */}
            <CameraAttachDialog
                camera={cameraAttachTarget}
                open={!!cameraAttachTarget}
                onClose={() => setCameraAttachTarget(null)}
                onAttach={handleAttachCamera}
                loading={cameraActionLoading}
            />
        </AppLayout>
    );
}
