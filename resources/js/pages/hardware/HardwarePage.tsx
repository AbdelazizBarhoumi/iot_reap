/**
 * USB/IP Hardware Gateway Dashboard.
 * Displays gateway nodes and USB devices with management controls.
 */

import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertCircle, Camera, Check, Clock, HardDrive, Loader2, Plug, PlugZap, RefreshCw, Search, Server, ShieldCheck, ShieldAlert, Unplug, Usb, Cpu, Video, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { adminCameraApi } from '@/api/camera.api';

// minimal error shape we care about from axios responses
interface ApiError {
  response?: { data?: { message?: string } };
  message?: string;
}
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
import type { Camera as CameraType, CameraReservation } from '@/types/camera.types';
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
    case 'pending_attach':
      return 'bg-amber-500/10 text-amber-600 border-amber-400/30';
    case 'disconnected':
      return 'bg-destructive/10 text-destructive border-destructive/30';
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
  onCancelPending: () => void;
  onMarkAsCamera: () => void;
  onRemoveCamera: () => void;
  loading: boolean;
}

function DeviceRow({ device, onBind, onUnbind, onAttach, onDetach, onCancelPending, onMarkAsCamera, onRemoveCamera, loading }: DeviceRowProps) {
  const isCamera = device.is_camera;
  const hasRegistration = device.has_camera_registration;

  return (
    <tr className="border-b">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          {isCamera ? (
            <Camera className="h-4 w-4 text-purple-500" />
          ) : (
            <Usb className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="font-medium">{device.name}</span>
          {hasRegistration && (
            <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-300 text-xs">
              Camera
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {device.vendor_id}:{device.product_id}
        </div>
      </td>
      <td className="py-3 px-4">
        <code className="text-xs bg-muted px-1 py-0.5 rounded">{device.busid}</code>
      </td>
      <td className="py-3 px-4">
        {hasRegistration ? (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-300">
            Streaming Device
          </Badge>
        ) : (
          <Badge variant="outline" className={getStatusBadgeClass(device.status)}>
            {device.status === 'pending_attach' ? (
              <span className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                {device.status_label}
              </span>
            ) : (
              device.status_label
            )}
          </Badge>
        )}
      </td>
      <td className="py-3 px-4">
        {hasRegistration ? (
          <span className="text-sm text-purple-600">See Cameras section</span>
        ) : device.status === 'pending_attach' && device.pending_vmid ? (
          <span className="text-sm text-amber-600">
            Waiting for VM #{device.pending_vmid}
            {device.pending_vm_name && ` (${device.pending_vm_name})`}
          </span>
        ) : device.attached_to ? (
          <span className="text-sm">{device.attached_to}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="py-3 px-4">
        {hasRegistration ? (
          <Button size="sm" variant="outline" onClick={onRemoveCamera} disabled={loading} className="text-destructive border-destructive/30 hover:bg-destructive/10">
            <Camera className="h-3 w-3 mr-1" />
            Remove Camera
          </Button>
        ) : (
          <div className="flex gap-2">
            {/* Mark as Camera button - always available */}
            <Button size="sm" variant="outline" onClick={onMarkAsCamera} disabled={loading} className="text-purple-600 border-purple-300 hover:bg-purple-50">
              <Camera className="h-3 w-3 mr-1" />
              Mark as Camera
            </Button>
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
            {device.status === 'pending_attach' && (
              <Button size="sm" variant="outline" onClick={onCancelPending} disabled={loading} className="text-amber-600 border-amber-300 hover:bg-amber-50">
                <X className="h-3 w-3 mr-1" />
                Cancel Pending
              </Button>
            )}
          </div>
        )}
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
  onCancelPending: (deviceId: number) => void;
  onMarkAsCamera: (deviceId: number) => void;
  onRemoveCamera: (deviceId: number) => void;
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
  onCancelPending,
  onMarkAsCamera,
  onRemoveCamera,
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
                    onCancelPending={() => onCancelPending(device.id)}
                    onMarkAsCamera={() => onMarkAsCamera(device.id)}
                    onRemoveCamera={() => onRemoveCamera(device.id)}
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

// ─── Camera Attach Dialog ───

interface CameraAttachDialogProps {
  camera: CameraType | null;
  open: boolean;
  onClose: () => void;
  onAttach: (cameraId: number, vmId: number, vmName: string) => Promise<void>;
  loading: boolean;
}

function CameraAttachDialog({ camera, open, onClose, onAttach, loading }: CameraAttachDialogProps) {
  const [selectedVmId, setSelectedVmId] = useState<string>('');
  const [runningVms, setRunningVms] = useState<RunningVm[]>([]);
  const [loadingVms, setLoadingVms] = useState(false);
  const [vmError, setVmError] = useState<string | null>(null);

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
            setVmError('No running VMs found. Make sure VMs are powered on.');
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
    if (camera && selectedVmId) {
      const selectedVm = runningVms.find(vm => `${vm.vmid}-${vm.server_id}` === selectedVmId);
      if (selectedVm) {
        await onAttach(camera.id, selectedVm.vmid, selectedVm.name);
        setSelectedVmId('');
        onClose();
      }
    }
  };

  const selectedVm = runningVms.find(vm => `${vm.vmid}-${vm.server_id}` === selectedVmId);
  const canSubmit = camera && selectedVm && !loading;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Attach Camera to VM</DialogTitle>
          <DialogDescription>
            Reserve <strong>{camera?.name}</strong> for exclusive use by a virtual machine.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cam-vm-select">Select Running VM</Label>
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
                  <SelectTrigger id="cam-vm-select">
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
              {loading ? 'Attaching...' : 'Attach Camera'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Camera Row ───

function getCameraStatusClass(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-success/10 text-success border-success/30';
    case 'inactive':
      return 'bg-muted text-muted-foreground';
    case 'error':
      return 'bg-destructive/10 text-destructive border-destructive/30';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

interface CameraRowProps {
  camera: CameraType;
  onAttach: () => void;
  onDetach: () => void;
  loading: boolean;
  isAdmin: boolean;
}

function CameraRow({ camera, onAttach, onDetach, loading, isAdmin }: CameraRowProps) {

  const hasReservation = camera.is_controlled || camera.has_active_reservation;

  return (
    <tr className="border-b">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <Camera className={`h-4 w-4 ${camera.is_usb_camera ? 'text-purple-500' : 'text-muted-foreground'}`} />
          <span className="font-medium">{camera.name}</span>
          {camera.is_usb_camera && (
            <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-300 text-xs">
              USB
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {camera.type_label} {camera.ptz_capable ? '• PTZ' : ''}
        </div>
      </td>
      <td className="py-3 px-4">
        <code className="text-xs bg-muted px-1 py-0.5 rounded">{camera.stream_key}</code>
      </td>
      <td className="py-3 px-4">
        <Badge variant="outline" className={getCameraStatusClass(camera.status)}>
          {camera.status_label}
        </Badge>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm">{camera.source_name}</span>
      </td>
      <td className="py-3 px-4">
        {hasReservation && camera.control ? (
          <span className="text-sm text-amber-600">Session #{camera.control.session_id.slice(0, 8)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="py-3 px-4">
        <div className="flex gap-2 items-center">
          {isAdmin && !hasReservation && camera.status === 'active' && (
            <Button size="sm" onClick={onAttach} disabled={loading}>
              <PlugZap className="h-3 w-3 mr-1" />
              Attach
            </Button>
          )}
          {isAdmin && hasReservation && (
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

// ─── Camera Card ───

interface CameraCardProps {
  cameras: CameraType[];
  pendingReservations: CameraReservation[];
  loading: boolean;
  onRefresh: () => void;
  onAttachCamera: (camera: CameraType) => void;
  onDetachCamera: (cameraId: number) => void;
  onApproveReservation: (reservationId: number) => void;
  onRejectReservation: (reservationId: number) => void;
  isAdmin: boolean;
}

function CameraCard({
  cameras,
  pendingReservations,
  loading,
  onRefresh,
  onAttachCamera,
  onDetachCamera,
  onApproveReservation,
  onRejectReservation,
  isAdmin,
}: CameraCardProps) {
  // Handle loading state - show skeleton instead of stale data
  const activeCameras = loading ? 0 : cameras.filter(c => c.status === 'active').length;
  const attachedCameras = loading ? 0 : cameras.filter(c => c.is_controlled).length;
  const cameraCount = loading ? '...' : cameras.length.toString();

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-all">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-heading text-lg">Cameras</CardTitle>
              <CardDescription>
                {loading ? (
                  <span className="text-muted-foreground">Loading cameras...</span>
                ) : (
                  <>{activeCameras}/{cameraCount} active &middot; {attachedCameras} attached</>
                )}
              </CardDescription>
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pending reservations (admin only) */}
        {isAdmin && pendingReservations.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Reservations ({pendingReservations.length})
            </h4>
            <div className="space-y-2">
              {pendingReservations.map((res) => (
                <div key={res.id} className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50/50 dark:bg-yellow-950/10 border-yellow-200 dark:border-yellow-900/30">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                      Pending
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">
                        {res.camera?.name ?? `Camera #${res.camera_id}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {res.user?.name} &middot;{' '}
                        {new Date(res.requested_start_at).toLocaleDateString()} &ndash;{' '}
                        {new Date(res.requested_end_at).toLocaleDateString()}
                        {res.purpose && ` \u00b7 ${res.purpose}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 hover:bg-green-50"
                      onClick={() => onApproveReservation(res.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => onRejectReservation(res.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Camera table */}
        {cameras.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Camera className="h-8 w-8 mx-auto mb-2" />
            <p className="font-heading font-medium">No cameras configured</p>
            <p className="text-sm mt-1">Run the camera seeder or register cameras via API</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="py-2 px-4">Camera</th>
                  <th className="py-2 px-4">Stream Key</th>
                  <th className="py-2 px-4">Status</th>
                  <th className="py-2 px-4">Source</th>
                  <th className="py-2 px-4">Attached To</th>
                  <th className="py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cameras.map((cam) => (
                  <CameraRow
                    key={cam.id}
                    camera={cam}
                    onAttach={() => onAttachCamera(cam)}
                    onDetach={() => onDetachCamera(cam.id)}
                    loading={loading}
                    isAdmin={isAdmin}
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

  const [attachDialogDevice, setAttachDialogDevice] = useState<UsbDevice | null>(null);

  // Camera state - start with loading=true since we fetch immediately
  const [cameras, setCameras] = useState<CameraType[]>([]);
  const [pendingCameraReservations, setPendingCameraReservations] = useState<CameraReservation[]>([]);
  const [camerasLoading, setCamerasLoading] = useState(true);
  const [cameraAttachTarget, setCameraAttachTarget] = useState<CameraType | null>(null);
  const [cameraActionLoading, setCameraActionLoading] = useState(false);

  const fetchCameras = useCallback(async () => {
    setCamerasLoading(true);
    try {
      const [cams, pending] = await Promise.all([
        adminCameraApi.getCameras(),
        adminCameraApi.getPending(),
      ]);
      setCameras(cams);
      setPendingCameraReservations(pending);
    } catch (err) {
      console.error('Failed to fetch cameras:', err);
    } finally {
      setCamerasLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCameras();
  }, [fetchCameras]);

  // Wrapper for markAsCamera that also refreshes cameras list
  const handleMarkAsCamera = async (deviceId: number) => {
    const success = await markAsCamera(deviceId);
    if (success) {
      // Refresh cameras list to show the newly created camera
      await fetchCameras();
    }
  };

  // Wrapper for removeCamera that also refreshes cameras list
  const handleRemoveCamera = async (deviceId: number) => {
    const success = await removeCamera(deviceId);
    if (success) {
      // Refresh cameras list to remove the deleted camera
      await fetchCameras();
    }
  };

  const handleAttach = async (deviceId: number, vmIp: string, vmName: string, vmid: number, node: string, serverId: number) => {
    await attachDevice(deviceId, { vm_ip: vmIp, vm_name: vmName, vmid, node, server_id: serverId });
  };

  // Camera attach — creates an immediate admin block reservation
  const handleCameraAttach = async (cameraId: number, _vmId: number, vmName: string) => {
    setCameraActionLoading(true);
    try {
      const now = new Date();
      const end = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year block
      await adminCameraApi.createBlock({
        camera_id: cameraId,
        start_at: now.toISOString(),
        end_at: end.toISOString(),
        notes: `Permanently attached to VM: ${vmName}`,
      });
      await fetchCameras();
    } catch (err: unknown) {
      // show a user-friendly toast message
      console.error('Failed to attach camera:', err);
      let message: string = 'Failed to attach camera';
      const serverMsg = (err as ApiError)?.response?.data?.message;
      if (serverMsg) {
        message = serverMsg;
      } else if ((err as ApiError)?.message) {
        message = (err as ApiError).message!;
      }
      toast.error(message);
    } finally {
      setCameraActionLoading(false);
    }
  };

  // Camera detach — would cancel the active reservation/block
  const handleCameraDetach = async (cameraId: number) => {
    setCameraActionLoading(true);
    try {
      const cam = cameras.find((c) => c.id === cameraId);
      if (!cam || !cam.active_reservation_id) {
        throw new Error('No active reservation found for camera');
      }

      // call cancel endpoint (admin wrapper or generic)
      await adminCameraApi.cancelReservation(cam.active_reservation_id);
      await fetchCameras();
      toast.success('Camera detached successfully');
    } catch (err: unknown) {
      console.error('Failed to detach camera:', err);
      let message: string = 'Failed to detach camera';
      const serverMsg = (err as ApiError)?.response?.data?.message;
      if (serverMsg) {
        message = serverMsg;
      } else if ((err as ApiError)?.message) {
        message = (err as ApiError).message!;
      }
      toast.error(message);
    } finally {
      setCameraActionLoading(false);
    }
  };

  const handleApproveCameraReservation = async (reservationId: number) => {
    try {
      await adminCameraApi.approve(reservationId, {});
      await fetchCameras();
    } catch (err) {
      console.error('Failed to approve camera reservation:', err);
    }
  };

  const handleRejectCameraReservation = async (reservationId: number) => {
    try {
      await adminCameraApi.reject(reservationId);
      await fetchCameras();
    } catch (err) {
      console.error('Failed to reject camera reservation:', err);
    }
  };

  const handleRefreshAll = () => {
    refreshAll();
    fetchCameras();
  };

  const onlineCount = nodes.filter((n) => n.online).length;
  const totalDevices = nodes.reduce((sum, n) => sum + (n.devices?.length || 0), 0);
  const attachedDevices = nodes.reduce(
    (sum, n) => sum + (n.devices?.filter((d) => d.status === 'attached').length || 0),
    0
  );
  // Use camerasLoading to avoid showing stale counts while loading
  const activeCameras = camerasLoading ? 0 : cameras.filter((c) => c.status === 'active').length;
  const attachedCameras = camerasLoading ? 0 : cameras.filter((c) => c.is_controlled).length;
  const cameraCountDisplay = camerasLoading ? '...' : cameras.length.toString();

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
              <p className="text-muted-foreground">Manage USB devices and cameras across gateway nodes</p>
              {!loading && (
                <div className="flex flex-wrap gap-4 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${onlineCount > 0 ? 'bg-success' : 'bg-muted'}`} />
                    {onlineCount}/{nodes.length} gateways online
                  </span>
                  <span>{totalDevices} USB devices</span>
                  <span>{attachedDevices} attached</span>
                  <span className="border-l pl-4">
                    {camerasLoading ? (
                      <span className="text-muted-foreground/50">Loading cameras...</span>
                    ) : (
                      <>{activeCameras}/{cameraCountDisplay} cameras active</>
                    )}
                  </span>
                  <span>{attachedCameras} reserved</span>
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
              onClick={() => handleRefreshAll()}
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
                onCancelPending={cancelPendingAttachment}
                onMarkAsCamera={handleMarkAsCamera}
                onRemoveCamera={handleRemoveCamera}
                onVerify={(verified) => verifyNode(node.id, verified)}
                loading={actionLoading}
                isAdmin={isAdmin}
              />
              </motion.div>
            ))}
          </div>
        )}

        {/* Camera Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <CameraCard
            cameras={cameras}
            pendingReservations={pendingCameraReservations}
            loading={camerasLoading || cameraActionLoading}
            onRefresh={fetchCameras}
            onAttachCamera={setCameraAttachTarget}
            onDetachCamera={handleCameraDetach}
            onApproveReservation={handleApproveCameraReservation}
            onRejectReservation={handleRejectCameraReservation}
            isAdmin={isAdmin}
          />
        </motion.div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center">
          Device list auto-refreshes every 15 seconds
        </p>
      </div>

      {/* USB Attach Dialog */}
      <AttachDialog
        device={attachDialogDevice}
        open={!!attachDialogDevice}
        onClose={() => setAttachDialogDevice(null)}
        onAttach={handleAttach}
        loading={actionLoading}
      />

      {/* Camera Attach Dialog */}
      <CameraAttachDialog
        camera={cameraAttachTarget}
        open={!!cameraAttachTarget}
        onClose={() => setCameraAttachTarget(null)}
        onAttach={handleCameraAttach}
        loading={cameraActionLoading}
      />
    </AppLayout>
  );
}
