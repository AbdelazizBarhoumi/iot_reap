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
}: VMListCardProps) {
  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-4">
          <p className="text-red-600 text-sm">{error}</p>
          <Button variant="outline" size="sm" onClick={onRefresh} className="mt-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading && vms.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading VMs...</span>
        </CardContent>
      </Card>
    );
  }

  if (vms.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <MonitorOff className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No VMs on this node</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Virtual Machines ({vms.length})</CardTitle>
          <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {vms.map((vm) => (
          <div
            key={vm.vmid}
            className="border rounded-lg p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">{vm.name || `VM ${vm.vmid}`}</span>
                <Badge variant="secondary" className="text-xs">
                  ID: {vm.vmid}
                </Badge>
                <Badge
                  variant="outline"
                  className={`${STATUS_TEXT_COLORS[vm.status]} border-current capitalize`}
                >
                  <span className={`w-2 h-2 rounded-full mr-1.5 ${STATUS_COLORS[vm.status]}`} />
                  {vm.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
              <div>
                <span className="block text-foreground font-medium">
                  {vm.cpu_usage.toFixed(1)}%
                </span>
                CPU
              </div>
              <div>
                <span className="block text-foreground font-medium">
                  {formatBytes(vm.mem_usage)} / {formatBytes(vm.maxmem)}
                </span>
                Memory
              </div>
              <div>
                <span className="block text-foreground font-medium">
                  {formatUptime(vm.uptime)}
                </span>
                Uptime
              </div>
              <div className="flex items-center gap-1 justify-end">
                {vm.status === 'stopped' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStart(vm.vmid)}
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
                      onClick={() => onReboot(vm.vmid)}
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
                      onClick={() => onShutdown(vm.vmid)}
                      disabled={actionLoading === vm.vmid}
                      title="Shutdown (graceful)"
                    >
                      <Power className="h-4 w-4 text-orange-600" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStop(vm.vmid)}
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
