/**
 * Node Health Card component.
 * Displays Proxmox node status with CPU/RAM gauges.
 * Sprint 2 - Phase 2
 */

import { Server } from 'lucide-react';
import type { ProxmoxNode } from '../types/vm.types';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface NodeHealthCardProps {
  node: ProxmoxNode;
}

const STATUS_COLORS = {
  online: 'bg-green-500',
  offline: 'bg-red-500',
  maintenance: 'bg-yellow-500',
};

const STATUS_TEXT_COLORS = {
  online: 'text-green-600',
  offline: 'text-red-600',
  maintenance: 'text-yellow-600',
};

function getLoadColor(percent: number): string {
  if (percent < 60) return 'bg-green-500';
  if (percent < 80) return 'bg-amber-500';
  return 'bg-red-500';
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h`;
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;
  const color = getLoadColor(percent);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function NodeHealthCard({ node }: NodeHealthCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">{node.name}</CardTitle>
          </div>
          <Badge
            variant="outline"
            className={`${STATUS_TEXT_COLORS[node.status]} border-current capitalize`}
          >
            <span className={`w-2 h-2 rounded-full mr-1.5 ${STATUS_COLORS[node.status]}`} />
            {node.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {node.status === 'online' && (
          <>
            <ProgressBar
              value={node.cpu_percent ?? 0}
              max={100}
              label="CPU"
            />
            <ProgressBar
              value={node.ram_used_mb ?? 0}
              max={node.ram_total_mb ?? 0}
              label={`RAM (${Math.round((node.ram_used_mb ?? 0) / 1024)}/${Math.round((node.ram_total_mb ?? 0) / 1024)} GB)`}
            />
          </>
        )}

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-muted-foreground">Active VMs:</div>
          <div className="font-medium">{node.active_vm_count} / {node.max_vms}</div>
          
          {node.status === 'online' && node.uptime_seconds !== undefined && (
            <>
              <div className="text-muted-foreground">Uptime:</div>
              <div className="font-medium">{formatUptime(node.uptime_seconds)}</div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
