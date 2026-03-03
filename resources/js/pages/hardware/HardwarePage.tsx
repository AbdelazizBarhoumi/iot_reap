/**
 * USB/IP Hardware Gateway Dashboard.
 * Displays gateway nodes and USB devices with management controls.
 */

import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertCircle, HardDrive, Loader2, Plug, PlugZap, RefreshCw, Search, Server, ShieldCheck, ShieldAlert, Unplug, Usb, Cpu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { hardwareApi } from '@/api/hardware.api';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useHardwareGateway } from '@/hooks/useHardwareGateway';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { GatewayNode, RunningVm, UsbDevice } from '@/types/hardware.types';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Hardware', href: '/hardware' },
];

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'available':
      return 'bg-success/10 text-success border-success/30';
    case 'bound':
      return 'bg-warning/10 text-warning border-warning/30';
    case 'attached':
      return 'bg-info/10 text-info border-info/30';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

interface AttachDialogProps {
  device: UsbDevice | null;
  open: boolean;
  onClose: () => void;
  onAttach: (deviceId: number, vmIp: string, vmName: string, vmid: number, node: string, serverId: number) => Promise<void>;
  loading: boolean;
}

function AttachDialog({ device, open, onClose, onAttach, loading }: AttachDialogProps) {
  const [selectedVmId, setSelectedVmId] = useState<string>('');
  const [runningVms, setRunningVms] = useState<RunningVm[]>([]);
  const [loadingVms, setLoadingVms] = useState(false);
  const [vmError, setVmError] = useState<string | null>(null);

  // Fetch running VMs when dialog opens
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadingVms(true);
      setVmError(null);
      setSelectedVmId('');
      
      hardwareApi.getRunningVms()
        .then((vms) => {
          setRunningVms(vms);
          if (vms.length === 0) {
            setVmError('No running VMs found. Make sure VMs are powered on and have the guest agent installed.');
          }
        })
        .catch((err) => {
          setVmError(err.message || 'Failed to load running VMs');
          setRunningVms([]);
        })
        .finally(() => setLoadingVms(false));
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (device && selectedVmId) {
      const selectedVm = runningVms.find(vm => `${vm.vmid}-${vm.server_id}` === selectedVmId);
      if (selectedVm && selectedVm.ip_address) {
        await onAttach(device.id, selectedVm.ip_address, selectedVm.name, selectedVm.vmid, selectedVm.node, selectedVm.server_id);
        setSelectedVmId('');
        onClose();
      }
    }
  };

  const selectedVm = runningVms.find(vm => `${vm.vmid}-${vm.server_id}` === selectedVmId);
  const canSubmit = device && selectedVm && selectedVm.ip_address && !loading;

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
              <Label htmlFor="vm-select">Select Running VM</Label>
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
                <Select value={selectedVmId} onValueChange={setSelectedVmId}>
                  <SelectTrigger id="vm-select">
                    <SelectValue placeholder="Select a VM..." />
                  </SelectTrigger>
                  <SelectContent>
                    {runningVms.map((vm) => (
                      <SelectItem 
                        key={`${vm.vmid}-${vm.server_id}`} 
                        value={`${vm.vmid}-${vm.server_id}`}
                        disabled={!vm.ip_address}
                      >
                        {vm.display_name}
                        {!vm.ip_address && ' (Guest agent not responding)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            {selectedVm && (
              <div className="text-sm text-muted-foreground space-y-1 p-3 bg-muted rounded-md">
                <p><strong>VM:</strong> {selectedVm.name}</p>
                <p><strong>IP:</strong> {selectedVm.ip_address || 'Not available'}</p>
                <p><strong>Node:</strong> {selectedVm.node} ({selectedVm.server_name})</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
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
        <Badge variant="outline" className={getStatusBadgeClass(device.status)}>
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
    <Card className="shadow-card hover:shadow-card-hover transition-all">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${node.online ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
              <Server className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-heading text-lg">{node.name}</CardTitle>
              <CardDescription>
                {node.ip}:{node.port}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={node.online ? 'bg-success/10 text-success border-success/30' : 'bg-destructive/10 text-destructive border-destructive/30'}>
              {node.online ? 'Online' : 'Offline'}
            </Badge>
            {node.is_verified ? (
              <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
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
            <ShieldAlert className="h-8 w-8 mx-auto mb-2 text-warning" />
            <p className="font-heading font-medium">Container not verified</p>
            <p className="text-sm mt-1">Verify this container to view and manage USB devices</p>
          </div>
        ) : !node.devices || node.devices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <HardDrive className="h-8 w-8 mx-auto mb-2" />
            <p className="font-heading font-medium">No USB devices detected</p>
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
    // refetch is provided by the hook but unused in this page
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

  const handleAttach = async (deviceId: number, vmIp: string, vmName: string, vmid: number, node: string, serverId: number) => {
    await attachDevice(deviceId, { vm_ip: vmIp, vm_name: vmName, vmid, node, server_id: serverId });
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 text-info">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold text-foreground">USB/IP Hardware Gateway</h1>
              <p className="text-muted-foreground">Manage USB devices across gateway nodes</p>
              {!loading && (
                <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${onlineCount > 0 ? 'bg-success' : 'bg-muted'}`} />
                    {onlineCount}/{nodes.length} gateways online
                  </span>
                  <span>{totalDevices} devices</span>
                  <span>{attachedDevices} attached</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Button
                className="bg-info text-info-foreground hover:bg-info/90"
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
        </motion.div>

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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-card">
              <CardContent className="py-12">
                <div className="text-center">
                  <Server className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                  <h3 className="font-heading text-lg font-medium mb-2">No Gateway Nodes</h3>
                  <p className="text-muted-foreground mb-4">
                    No USB/IP gateway nodes have been configured yet.
                  </p>
                  {isAdmin ? (
                    <Button className="bg-info text-info-foreground hover:bg-info/90" onClick={() => discoverGateways()} disabled={actionLoading}>
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
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {nodes.map((node, i) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
              >
                <GatewayNodeCard
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
              </motion.div>
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
