/**
 * Admin USB Device Reservations Page.
 * Manage reservation requests and device blocking.
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
  RefreshCw,
  Usb,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { adminReservationApi, hardwareApi } from '@/api/hardware.api';
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
import type { UsbDevice, UsbDeviceReservation, UsbReservationStatus } from '@/types/hardware.types';

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

function ReservationCard({ reservation, onApprove, onReject, actionLoading }: ReservationCardProps) {
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
                {reservation.device?.name || `Device #${reservation.usb_device_id}`}
              </CardTitle>
              <CardDescription>
                Requested by {reservation.user?.name || 'Unknown User'}
              </CardDescription>
            </div>
          </div>
          <Badge className={`${STATUS_COLORS[reservation.status]} text-white`}>
            {reservation.is_admin_block ? 'Admin Block' : reservation.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Requested Period:</span>
            <span>
              {formatDateTime(reservation.requested_start_at)} — {formatDateTime(reservation.requested_end_at)}
            </span>
          </div>
          {(reservation.approved_start_at || reservation.approved_end_at) && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Approved Period:</span>
              <span>
                {formatDateTime(reservation.approved_start_at)} — {formatDateTime(reservation.approved_end_at)}
              </span>
            </div>
          )}
          {reservation.reason && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reason:</span>
              <span className="max-w-[200px] truncate">{reservation.reason}</span>
            </div>
          )}
          {reservation.admin_notes && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Admin Notes:</span>
              <span className="max-w-[200px] truncate">{reservation.admin_notes}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Submitted:</span>
            <span>{formatDateTime(reservation.created_at)}</span>
          </div>
        </div>

        {isPending && (
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReject(reservation.id)}
              disabled={actionLoading}
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button
              size="sm"
              onClick={() => onApprove(reservation.id)}
              disabled={actionLoading}
            >
              <Check className="h-4 w-4 mr-1" />
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

function ApproveDialog({ reservation, open, onClose, onConfirm, loading }: ApproveDialogProps) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (reservation) {
      // Pre-fill with requested times
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStart(reservation.requested_start_at?.slice(0, 16) || '');
       
      setEnd(reservation.requested_end_at?.slice(0, 16) || '');
      setNotes('');
    }
  }, [reservation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (start && end) {
      await onConfirm(start, end, notes);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Reservation</DialogTitle>
          <DialogDescription>
            Set the approved time period for this device reservation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="approve-start">Start Time</Label>
              <Input
                id="approve-start"
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="approve-end">End Time</Label>
              <Input
                id="approve-end"
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="approve-notes">Admin Notes (optional)</Label>
              <Input
                id="approve-notes"
                placeholder="Any notes for the user..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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
  open: boolean;
  onClose: () => void;
  onConfirm: (deviceId: number, start: string, end: string, notes: string) => Promise<void>;
  loading: boolean;
}

function BlockDialog({ devices, open, onClose, onConfirm, loading }: BlockDialogProps) {
  const [deviceId, setDeviceId] = useState<string>('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deviceId && start && end) {
      await onConfirm(parseInt(deviceId, 10), start, end, notes);
      setDeviceId('');
      setStart('');
      setEnd('');
      setNotes('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Block Device</DialogTitle>
          <DialogDescription>
            Block a device from being reserved or attached during a time period.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="block-device">Device</Label>
              <Select value={deviceId} onValueChange={setDeviceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a device..." />
                </SelectTrigger>
                <SelectContent>
                  {devices.map((device) => (
                    <SelectItem key={device.id} value={device.id.toString()}>
                      {device.name} ({device.vendor_id}:{device.product_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              <Label htmlFor="block-notes">Notes (optional)</Label>
              <Input
                id="block-notes"
                placeholder="Reason for blocking..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !deviceId}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Lock className="h-4 w-4 mr-1" />
              Block Device
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
                  <Skeleton className="h-5 w-40 mb-1" />
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
  const [reservations, setReservations] = useState<UsbDeviceReservation[]>([]);
  const [devices, setDevices] = useState<UsbDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  // Dialog states
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<UsbDeviceReservation | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [reservationsData, devicesData] = await Promise.all([
        adminReservationApi.getAll(),
        hardwareApi.getDevices(),
      ]);
      setReservations(reservationsData);
      setDevices(devicesData);
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

  const handleApproveConfirm = async (start: string, end: string, notes: string) => {
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

  const handleBlockConfirm = async (
    deviceId: number,
    start: string,
    end: string,
    notes: string,
  ) => {
    setActionLoading(true);
    try {
      await adminReservationApi.createBlock({
        usb_device_id: deviceId,
        start_at: new Date(start).toISOString(),
        end_at: new Date(end).toISOString(),
        notes: notes || undefined,
      });
      await fetchData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Block failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter reservations by tab
  const filteredReservations = reservations.filter((r) => {
    if (activeTab === 'pending') return r.status === 'pending';
    if (activeTab === 'approved') return r.status === 'approved' || r.status === 'active';
    if (activeTab === 'blocks') return r.is_admin_block;
    if (activeTab === 'history') return ['rejected', 'cancelled', 'completed'].includes(r.status);
    return true;
  });

  const pendingCount = reservations.filter((r) => r.status === 'pending').length;
  const approvedCount = reservations.filter(
    (r) => r.status === 'approved' || r.status === 'active',
  ).length;
  const blocksCount = reservations.filter((r) => r.is_admin_block).length;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Device Reservations" />
      <div className="min-h-screen bg-background">
        <div className="container py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 text-info">
              <Usb className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold text-foreground">Device Reservations</h1>
              <p className="text-muted-foreground">Manage USB device reservation requests and blocking</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="bg-info text-info-foreground hover:bg-info/90" size="sm" onClick={() => setBlockDialogOpen(true)}>
              <Lock className="h-4 w-4 mr-2" />
              Block Device
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
            <TabsTrigger value="history" className="gap-2">
              <Calendar className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {loading ? (
              <LoadingSkeleton />
            ) : filteredReservations.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">
                    {activeTab === 'pending' && 'No pending reservations'}
                    {activeTab === 'approved' && 'No approved reservations'}
                    {activeTab === 'blocks' && 'No active device blocks'}
                    {activeTab === 'history' && 'No reservation history'}
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
        reservation={selectedReservation}
        open={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
        onConfirm={handleApproveConfirm}
        loading={actionLoading}
      />

      <BlockDialog
        devices={devices}
        open={blockDialogOpen}
        onClose={() => setBlockDialogOpen(false)}
        onConfirm={handleBlockConfirm}
        loading={actionLoading}
      />
    </AppLayout>
  );
}
