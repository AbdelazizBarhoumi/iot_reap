/**
 * VM List Card component.
 * Displays VMs on a node with status and control buttons.
 * Sprint 2.5
 */
import {
    Loader2,
    MonitorOff,
    Play,
    Power,
    RefreshCw,
    Square,
} from 'lucide-react';
import type { ProxmoxVM } from '../types/vm.types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
interface VMListCardProps {
    vms: ProxmoxVM[];
    loading: boolean;
    error: string | null;
    actionLoading: number | null;
    onStart: (vmid: number) => void;
    onStop: (vmid: number) => void;
    onReboot: (vmid: number) => void;
    onShutdown: (vmid: number) => void;
    onRefresh: () => void;
    onSelectVm?: (vm: ProxmoxVM) => void;
}
const STATUS_COLORS = {
    running: 'bg-green-500',
    stopped: 'bg-red-500',
    paused: 'bg-yellow-500',
};
const STATUS_TEXT_COLORS = {
    running: 'text-green-600',
    stopped: 'text-red-600',
    paused: 'text-yellow-600',
};
function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const gb = bytes / 1024 / 1024 / 1024;
    if (gb >= 1) return `${gb.toFixed(1)} GB`;
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(0)} MB`;
}
function formatUptime(seconds: number): string {
    if (seconds === 0) return '-';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}
export function VMListCard({
    vms,
    loading,
    error,
    actionLoading,
    onStart,
    onStop,
    onReboot,
    onShutdown,
    onRefresh,
    onSelectVm,
}: VMListCardProps) {
    if (error) {
        return (
            <Card className="border-red-200">
                <CardContent className="p-4">
                    <p className="text-sm text-red-600">{error}</p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRefresh}
                        className="mt-2"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }
    if (loading && vms.length === 0) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center p-6">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">
                        Loading VMs...
                    </span>
                </CardContent>
            </Card>
        );
    }
    if (vms.length === 0) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <MonitorOff className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No VMs on this node</p>
                </CardContent>
            </Card>
        );
    }
    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                        Virtual Machines ({vms.length})
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRefresh}
                        disabled={loading}
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                        />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {vms.map((vm) => (
                    <div
                        key={vm.vmid}
                        className={`space-y-2 rounded-lg border p-3 transition-colors ${
                            onSelectVm
                                ? 'cursor-pointer hover:border-info/40 hover:bg-info/5'
                                : ''
                        }`}
                        onClick={() => onSelectVm?.(vm)}
                        role={onSelectVm ? 'button' : undefined}
                        tabIndex={onSelectVm ? 0 : undefined}
                        onKeyDown={(event) => {
                            if (!onSelectVm) return;
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                onSelectVm(vm);
                            }
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">
                                    {vm.name || `VM ${vm.vmid}`}
                                </span>
                                <Badge variant="primary" className="text-xs">
                                    ID: {vm.vmid}
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className={`${STATUS_TEXT_COLORS[vm.status]} border-current capitalize`}
                                >
                                    <span
                                        className={`mr-1.5 h-2 w-2 rounded-full ${STATUS_COLORS[vm.status]}`}
                                    />
                                    {vm.status}
                                </Badge>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                            <div>
                                <span className="block font-medium text-foreground">
                                    {vm.cpu_usage.toFixed(1)}%
                                </span>
                                CPU
                            </div>
                            <div>
                                <span className="block font-medium text-foreground">
                                    {formatBytes(vm.mem_usage)} /{' '}
                                    {formatBytes(vm.maxmem)}
                                </span>
                                Memory
                            </div>
                            <div>
                                <span className="block font-medium text-foreground">
                                    {formatUptime(vm.uptime)}
                                </span>
                                Uptime
                            </div>
                            <div className="flex items-center justify-end gap-1">
                                {vm.status === 'stopped' ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onStart(vm.vmid);
                                        }}
                                        disabled={actionLoading === vm.vmid}
                                        title="Start VM"
                                    >
                                        {actionLoading === vm.vmid ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Play className="h-4 w-4 text-green-600" />
                                        )}
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onReboot(vm.vmid);
                                            }}
                                            disabled={actionLoading === vm.vmid}
                                            title="Reboot VM"
                                        >
                                            {actionLoading === vm.vmid ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <RefreshCw className="h-4 w-4 text-amber-600" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onShutdown(vm.vmid);
                                            }}
                                            disabled={actionLoading === vm.vmid}
                                            title="Shutdown (graceful)"
                                        >
                                            <Power className="h-4 w-4 text-orange-600" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onStop(vm.vmid);
                                            }}
                                            disabled={actionLoading === vm.vmid}
                                            title="Stop (force)"
                                        >
                                            <Square className="h-4 w-4 text-red-600" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}


