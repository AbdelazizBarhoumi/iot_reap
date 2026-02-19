/**
 * Launch VM Modal component.
 * Allows user to configure and launch a VM session.
 * Sprint 2.5 - Updated with multi-server support
 */

import { Loader2, Server } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useProxmoxServers } from '../hooks/useProxmoxServers';
import type { VMTemplate, VMSessionType } from '../types/vm.types';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface LaunchVMModalProps {
  template: VMTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLaunch: (templateId: number, durationMinutes: number, sessionType: VMSessionType, proxmoxServerId?: number) => Promise<void>;
}

const DURATION_OPTIONS = [
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 240, label: '4 hours' },
];

export function LaunchVMModal({ template, open, onOpenChange, onLaunch }: LaunchVMModalProps) {
  const [duration, setDuration] = useState<number>(60);
  const [sessionType, setSessionType] = useState<VMSessionType>('ephemeral');
  const [selectedServerId, setSelectedServerId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { servers, loading: serversLoading, error: serversError } = useProxmoxServers();

  // Auto-select server when only one is available
  useEffect(() => {
    if (servers.length === 1) {
      setSelectedServerId(servers[0].id);
    } else if (servers.length === 0) {
      setSelectedServerId(undefined);
    }
  }, [servers]);

  const handleLaunch = async () => {
    if (!template) return;

    setLoading(true);
    setError(null);

    try {
      await onLaunch(template.id, duration, sessionType, selectedServerId);
      onOpenChange(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to launch VM';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      setError(null);
      onOpenChange(newOpen);
    }
  };

  if (!template) return null;

  const showServerSelector = servers.length > 1;
  const noServersAvailable = servers.length === 0 && !serversLoading;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Launch {template.name}</DialogTitle>
          <DialogDescription>
            Configure your VM session. The VM will be provisioned based on the selected template.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Server Selector - only shown when multiple servers available */}
          {showServerSelector && (
            <div className="grid gap-2">
              <Label htmlFor="server">Proxmox Cluster</Label>
              <Select
                value={selectedServerId?.toString() ?? ''}
                onValueChange={(value) => setSelectedServerId(Number(value))}
                disabled={loading || serversLoading}
              >
                <SelectTrigger id="server">
                  <SelectValue placeholder="Select cluster" />
                </SelectTrigger>
                <SelectContent>
                  {servers.map((server) => (
                    <SelectItem key={server.id} value={server.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4" />
                        <span>{server.name}</span>
                        {server.description && (
                          <span className="text-muted-foreground text-xs">({server.description})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Show selected server info when only one server (auto-selected) */}
          {servers.length === 1 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Server className="h-4 w-4" />
              <span>Cluster: {servers[0].name}</span>
            </div>
          )}

          {/* No servers warning */}
          {noServersAvailable && (
            <Alert variant="destructive">
              <AlertDescription>
                No Proxmox servers are available. Please contact an administrator.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Label htmlFor="duration">Session Duration</Label>
            <Select
              value={duration.toString()}
              onValueChange={(value) => setDuration(Number(value))}
              disabled={loading}
            >
              <SelectTrigger id="duration">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="session-type">Session Type</Label>
            <Select
              value={sessionType}
              onValueChange={(value) => setSessionType(value as VMSessionType)}
              disabled={loading}
            >
              <SelectTrigger id="session-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ephemeral">
                  Ephemeral (auto-delete after expiry)
                </SelectItem>
                <SelectItem value="persistent">
                  Persistent (manual cleanup required)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted p-3 rounded-md text-sm">
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <span>OS:</span>
              <span className="font-medium text-foreground capitalize">{template.os_type}</span>
              <span>Protocol:</span>
              <span className="font-medium text-foreground uppercase">{template.protocol}</span>
              <span>Resources:</span>
              <span className="font-medium text-foreground">
                {template.cpu_cores} CPU, {template.ram_mb / 1024}GB RAM
              </span>
            </div>
          </div>

          {(error || serversError) && (
            <Alert variant="destructive">
              <AlertDescription>{error || serversError}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleLaunch} disabled={loading || noServersAvailable || serversLoading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Launching...' : 'Launch VM'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
