/**
 * USB/IP Hardware Gateway Dashboard.
 * Displays gateway nodes and USB devices with management controls.
 */

import { Head, usePage } from '@inertiajs/react';
import { AlertCircle, HardDrive, Plug, PlugZap, RefreshCw, Search, Server, ShieldCheck, ShieldAlert, Unplug, Usb } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useHardwareGateway } from '@/hooks/useHardwareGateway';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { GatewayNode, UsbDevice } from '@/types/hardware.types';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Hardware', href: '/hardware' },
];

function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'available':
      return 'default';
    case 'bound':
      return 'secondary';
    case 'attached':
      return 'destructive';
    default:
      return 'outline';
  }
}

interface AttachDialogProps {
  device: UsbDevice | null;
  open: boolean;
  onClose: () => void;
  onAttach: (deviceId: number, vmIp: string, vmName: string) => Promise<void>;
  loading: boolean;
}

function AttachDialog({ device, open, onClose, onAttach, loading }: AttachDialogProps) {
  const [vmIp, setVmIp] = useState('');
  const [vmName, setVmName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (device && vmIp && vmName) {
      await onAttach(device.id, vmIp, vmName);
      setVmIp('');
      setVmName('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Attach Device to VM</DialogTitle>
          <DialogDescription>
            Connect <strong>{device?.name}</strong> to a virtual machine via USB/IP.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="vm-ip">VM IP Address</Label>
              <Input
                id="vm-ip"
                placeholder="192.168.50.10"
                value={vmIp}
                onChange={(e) => setVmIp(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vm-name">VM Name</Label>
              <Input
                id="vm-name"
                placeholder="Windows-VM-1"
                value={vmName}
                onChange={(e) => setVmName(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !vmIp || !vmName}>
              {loading ? 'Attaching...' : 'Attach'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DeviceRowProps {
  device: UsbDevice;
  onBind: () => void;
  onUnbind: () => void;
  onAttach: () => void;
  onDetach: () => void;
  loading: boolean;
}

function DeviceRow({ device, onBind, onUnbind, onAttach, onDetach, loading }: DeviceRowProps) {
  return (
    <tr className="border-b">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <Usb className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{device.name}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {device.vendor_id}:{device.product_id}
        </div>
      </td>
      <td className="py-3 px-4">
        <code className="text-xs bg-muted px-1 py-0.5 rounded">{device.busid}</code>
      </td>
      <td className="py-3 px-4">
        <Badge variant={getStatusBadgeVariant(device.status)}>
          {device.status_label}
        </Badge>
      </td>
      <td className="py-3 px-4">
        {device.attached_to ? (
          <span className="text-sm">{device.attached_to}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="py-3 px-4">
        <div className="flex gap-2">
          {device.status === 'available' && (
            <Button size="sm" variant="outline" onClick={onBind} disabled={loading}>
              <Plug className="h-3 w-3 mr-1" />
              Bind
            </Button>
          )}
          {device.status === 'bound' && (
            <>
              <Button size="sm" onClick={onAttach} disabled={loading}>
                <PlugZap className="h-3 w-3 mr-1" />
                Attach
              </Button>
              <Button size="sm" variant="outline" onClick={onUnbind} disabled={loading}>
                <Unplug className="h-3 w-3 mr-1" />
                Unbind
              </Button>
            </>
          )}
          {device.status === 'attached' && (
            <Button size="sm" variant="destructive" onClick={onDetach} disabled={loading}>
              <Unplug className="h-3 w-3 mr-1" />
              Detach
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

interface GatewayNodeCardProps {
  node: GatewayNode;
  onRefresh: () => void;
  onBindDevice: (deviceId: number) => void;
  onUnbindDevice: (deviceId: number) => void;
  onAttachDevice: (device: UsbDevice) => void;
  onDetachDevice: (deviceId: number) => void;
  onVerify?: (verified: boolean) => void;
  loading: boolean;
  isAdmin: boolean;
}

function GatewayNodeCard({
  node,
  onRefresh,
  onBindDevice,
  onUnbindDevice,
  onAttachDevice,
  onDetachDevice,
  onVerify,
  loading,
  isAdmin,
}: GatewayNodeCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${node.online ? 'bg-green-100' : 'bg-red-100'}`}>
              <Server className={`h-5 w-5 ${node.online ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div>
              <CardTitle className="text-lg">{node.name}</CardTitle>
              <CardDescription>
                {node.ip}:{node.port}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={node.online ? 'default' : 'destructive'}>
              {node.online ? 'Online' : 'Offline'}
            </Badge>
            {node.is_verified ? (
              <Badge variant="outline" className="text-green-600 border-green-400">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-600 border-amber-400">
                <ShieldAlert className="h-3 w-3 mr-1" />
                Unverified
              </Badge>
            )}
            {isAdmin && onVerify && (
              <Button
                size="sm"
                variant={node.is_verified ? 'outline' : 'default'}
                onClick={() => onVerify(!node.is_verified)}
                disabled={loading}
              >
                {node.is_verified ? 'Unverify' : 'Verify'}
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={onRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!node.is_verified ? (
          <div className="text-center py-8 text-muted-foreground">
            <ShieldAlert className="h-8 w-8 mx-auto mb-2 text-amber-500" />
            <p>Container not verified</p>
            <p className="text-sm mt-1">Verify this container to view and manage USB devices</p>
          </div>
        ) : !node.devices || node.devices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <HardDrive className="h-8 w-8 mx-auto mb-2" />
            <p>No USB devices detected</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="py-2 px-4">Device</th>
                  <th className="py-2 px-4">Bus ID</th>
                  <th className="py-2 px-4">Status</th>
                  <th className="py-2 px-4">Attached To</th>
                  <th className="py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {node.devices.map((device) => (
                  <DeviceRow
                    key={device.id}
                    device={device}
                    onBind={() => onBindDevice(device.id)}
                    onUnbind={() => onUnbindDevice(device.id)}
                    onAttach={() => onAttachDevice(device)}
                    onDetach={() => onDetachDevice(device.id)}
                    loading={loading}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function HardwarePage() {
  const { auth } = usePage().props;
  const isAdmin = auth.user?.role === 'admin';

  const {
    nodes,
    loading,
    error,
    actionLoading,
    refetch,
    refreshAll,
    refreshNode,
    bindDevice,
    unbindDevice,
    attachDevice,
    detachDevice,
    discoverGateways,
    verifyNode,
  } = useHardwareGateway();

  const [attachDialogDevice, setAttachDialogDevice] = useState<UsbDevice | null>(null);

  const handleAttach = async (deviceId: number, vmIp: string, vmName: string) => {
    await attachDevice(deviceId, { vm_ip: vmIp, vm_name: vmName });
  };

  const onlineCount = nodes.filter((n) => n.online).length;
  const totalDevices = nodes.reduce((sum, n) => sum + (n.devices?.length || 0), 0);
  const attachedDevices = nodes.reduce(
    (sum, n) => sum + (n.devices?.filter((d) => d.status === 'attached').length || 0),
    0
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Hardware Gateway" />
      <div className="flex h-full flex-1 flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Heading
              title="USB/IP Hardware Gateway"
              description="Manage USB devices across gateway nodes"
            />
            {!loading && (
              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                <span>{onlineCount} of {nodes.length} gateways online</span>
                <span>{totalDevices} devices detected</span>
                <span>{attachedDevices} devices attached</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Button
                onClick={() => discoverGateways()}
                disabled={loading || actionLoading}
              >
                <Search className={`h-4 w-4 mr-2 ${actionLoading ? 'animate-pulse' : ''}`} />
                Discover Gateways
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => refreshAll()}
              disabled={loading || actionLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${actionLoading ? 'animate-spin' : ''}`} />
              Refresh All
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Gateway Nodes */}
        {loading && nodes.length === 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-[300px]" />
            ))}
          </div>
        ) : nodes.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Server className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Gateway Nodes</h3>
                <p className="text-muted-foreground mb-4">
                  No USB/IP gateway nodes have been configured yet.
                </p>
                {isAdmin ? (
                  <Button onClick={() => discoverGateways()} disabled={actionLoading}>
                    <Search className={`h-4 w-4 mr-2 ${actionLoading ? 'animate-pulse' : ''}`} />
                    Discover Gateways from Proxmox
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Contact an administrator to add gateway nodes.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {nodes.map((node) => (
              <GatewayNodeCard
                key={node.id}
                node={node}
                onRefresh={() => refreshNode(node.id)}
                onBindDevice={bindDevice}
                onUnbindDevice={unbindDevice}
                onAttachDevice={setAttachDialogDevice}
                onDetachDevice={detachDevice}
                onVerify={(verified) => verifyNode(node.id, verified)}
                loading={actionLoading}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center">
          Device list auto-refreshes every 15 seconds
        </p>
      </div>

      {/* Attach Dialog */}
      <AttachDialog
        device={attachDialogDevice}
        open={!!attachDialogDevice}
        onClose={() => setAttachDialogDevice(null)}
        onAttach={handleAttach}
        loading={actionLoading}
      />
    </AppLayout>
  );
}
