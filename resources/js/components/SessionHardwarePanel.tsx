/**
 * SessionHardwarePanel — Panel showing USB devices attached to a session.
 * 
 * Features:
 * - List attached devices with detach button
 * - List available devices with attach button
 * - Show queue status when device is in use
 * - Queue/dequeue functionality
 * - Show blocking reasons with reservation request link
 */

import { Link } from '@inertiajs/react';
import { Usb, Plug, Unplug, Clock, Loader2, AlertCircle, RefreshCw, ShieldAlert, CalendarClock, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSessionHardware } from '@/hooks/useSessionHardware';
import type { UsbDevice } from '@/types/hardware.types';

interface SessionHardwarePanelProps {
  sessionId: string;
  isActive: boolean;
}


interface DeviceRowProps {
  device: UsbDevice;
  onAttach?: () => void;
  onDetach?: () => void;
  onJoinQueue?: () => void;
  onLeaveQueue?: () => void;
  isAttached?: boolean;
  isInQueue?: boolean;
  queuePosition?: number;
  actionLoading?: boolean;
  canAttach?: boolean;
  gatewayVerified?: boolean;
  reason?: string | null;
  reservedUntil?: string | null;
}

function DeviceRow({
  device,
  onAttach,
  onDetach,
  onJoinQueue,
  onLeaveQueue,
  isAttached = false,
  isInQueue = false,
  queuePosition,
  actionLoading = false,
  canAttach = false,
  gatewayVerified = true,
  reason,
  reservedUntil,
}: DeviceRowProps) {
  // Check if device is blocked due to reservation
  const isReserved = reason?.toLowerCase().includes('reserved');

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Usb className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div className="min-w-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm font-medium truncate max-w-[140px]">
                  {device.name}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p>{device.name}</p>
                <p className="text-xs text-muted-foreground">
                  {device.vendor_id}:{device.product_id}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <p className="text-xs text-muted-foreground">
            {device.gateway_node_name || `Gateway ${device.gateway_node_id}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {isInQueue && queuePosition !== undefined && (
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            #{queuePosition}
          </Badge>
        )}

        {!gatewayVerified && !isAttached && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-xs text-amber-600 border-amber-400">
                  <ShieldAlert className="h-3 w-3 mr-1" />
                  Unverified
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Gateway not verified by admin. Attach is disabled.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Show reservation block with helpful info */}
        {isReserved && !isAttached && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs text-orange-600 border-orange-400">
                    <CalendarClock className="h-3 w-3 mr-1" />
                    Reserved
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{reason}</p>
                {reservedUntil && (
                  <p className="text-xs mt-1">
                    Until: {new Date(reservedUntil).toLocaleString()}
                  </p>
                )}
                <p className="text-xs mt-1 text-muted-foreground">
                  Request a reservation to use this device
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Show non-reservation reason */}
        {reason && !isReserved && !isAttached && (
          <p className="text-xs text-muted-foreground italic max-w-[120px] truncate">{reason}</p>
        )}

        {isAttached && onDetach && (
          <Button
            size="sm"
            variant="outline"
            onClick={onDetach}
            disabled={actionLoading}
            className="h-7 px-2"
          >
            {actionLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <Unplug className="h-3 w-3 mr-1" />
                Detach
              </>
            )}
          </Button>
        )}

        {!isAttached && !isInQueue && canAttach && onAttach && (
          <Button
            size="sm"
            variant="default"
            onClick={onAttach}
            disabled={actionLoading}
            className="h-7 px-2"
          >
            {actionLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <Plug className="h-3 w-3 mr-1" />
                Attach
              </>
            )}
          </Button>
        )}

        {/* For reserved devices, show request reservation button instead of queue */}
        {!isAttached && !isInQueue && !canAttach && isReserved && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="h-7 px-2"
                >
                  <Link href="/my-reservations">
                    <CalendarClock className="h-3 w-3 mr-1" />
                    Reserve
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Request a reservation for this device</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {!isAttached && !isInQueue && !canAttach && device.status === 'attached' && !isReserved && onJoinQueue && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="default"
                  onClick={onJoinQueue}
                  disabled={actionLoading}
                  className="h-7 px-2"
                >
                  {actionLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <Clock className="h-3 w-3 mr-1" />
                      Queue
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Join queue ({device.queue_count ?? 0} waiting)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {isInQueue && onLeaveQueue && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onLeaveQueue}
            disabled={actionLoading}
            className="h-7 px-2 text-destructive"
          >
            {actionLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              'Leave'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-7 w-16" />
        </div>
      ))}
    </div>
  );
}

export function SessionHardwarePanel({ sessionId, isActive }: SessionHardwarePanelProps) {
  const [loadingDeviceId, setLoadingDeviceId] = useState<number | null>(null);

  const {
    attachedDevices,
    queueEntries,
    availableDevices,
    loading,
    error,
    actionLoading,
    refetch,
    attachDevice,
    detachDevice,
    joinQueue,
    leaveQueue,
  } = useSessionHardware(sessionId, { enabled: isActive });

  const handleAttach = async (deviceId: number) => {
    setLoadingDeviceId(deviceId);
    await attachDevice(deviceId);
    setLoadingDeviceId(null);
  };

  const handleDetach = async (deviceId: number) => {
    setLoadingDeviceId(deviceId);
    await detachDevice(deviceId);
    setLoadingDeviceId(null);
  };

  const handleJoinQueue = async (deviceId: number) => {
    setLoadingDeviceId(deviceId);
    await joinQueue(deviceId);
    setLoadingDeviceId(null);
  };

  const handleLeaveQueue = async (deviceId: number) => {
    setLoadingDeviceId(deviceId);
    await leaveQueue(deviceId);
    setLoadingDeviceId(null);
  };

  // queue position helper was unused; removed to satisfy lint

  // Check if user is in queue for a device
  const isInQueueFor = (deviceId: number): boolean => {
    return queueEntries.some((e) => e.usb_device_id === deviceId);
  };

  // Devices that can be attached directly (bound + can_attach + verified)
  const freeDevices = availableDevices.filter(
    (entry) => entry.can_attach && !entry.is_attached_to_me,
  );

  // Bound devices that can't be attached (unverified gateway or reservation block)
  const blockedDevices = availableDevices.filter(
    (entry) =>
      !entry.can_attach &&
      !entry.is_attached_to_me &&
      entry.device.status === 'bound',
  );

  // Devices that are in use by others (attached + not mine + not already queued)
  const inUseDevices = availableDevices.filter(
    (entry) =>
      !entry.can_attach &&
      !entry.is_attached_to_me &&
      entry.device.status === 'attached' &&
      !isInQueueFor(entry.device.id),
  );

  // Devices user is queued for
  const queuedDevices = queueEntries.map((entry) => ({
    ...entry,
    device: availableDevices.find((d) => d.device.id === entry.usb_device_id)?.device || entry.device,
  }));

  if (!isActive) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Usb className="h-5 w-5" />
            USB Devices
          </CardTitle>
          <CardDescription>Hardware available for this session</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            USB devices can only be attached when the session is active.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Usb className="h-5 w-5" />
              USB Devices
            </CardTitle>
            <CardDescription>Attach hardware to your VM</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={loading || actionLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {loading && <LoadingSkeleton />}

        {!loading && (
          <>
            {/* Attached Devices Section */}
            {attachedDevices.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                  Attached ({attachedDevices.length})
                </p>
                <div className="space-y-0">
                  {attachedDevices.map((device) => (
                    <DeviceRow
                      key={device.id}
                      device={device}
                      isAttached
                      onDetach={() => handleDetach(device.id)}
                      actionLoading={loadingDeviceId === device.id}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Queued Section */}
            {queuedDevices.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                  In Queue ({queuedDevices.length})
                </p>
                <div className="space-y-0">
                  {queuedDevices.map((entry) =>
                    entry.device ? (
                      <DeviceRow
                        key={entry.id}
                        device={entry.device}
                        isInQueue
                        queuePosition={entry.position}
                        onLeaveQueue={() => handleLeaveQueue(entry.usb_device_id)}
                        actionLoading={loadingDeviceId === entry.usb_device_id}
                      />
                    ) : null,
                  )}
                </div>
              </div>
            )}

            {/* Available Devices Section */}
            {freeDevices.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                  Available ({freeDevices.length})
                </p>
                <div className="space-y-0">
                  {freeDevices.map((entry) => (
                    <DeviceRow
                      key={entry.device.id}
                      device={entry.device}
                      canAttach
                      gatewayVerified
                      onAttach={() => handleAttach(entry.device.id)}
                      actionLoading={loadingDeviceId === entry.device.id}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Blocked Devices (bound but unverified or reserved) */}
            {blockedDevices.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                  Bound — Not Attachable ({blockedDevices.length})
                </p>
                <div className="space-y-0">
                  {blockedDevices.map((entry) => (
                    <DeviceRow
                      key={entry.device.id}
                      device={entry.device}
                      canAttach={false}
                      gatewayVerified={entry.gateway_verified ?? false}
                      reason={entry.reason}
                      actionLoading={loadingDeviceId === entry.device.id}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* In Use by Others Section */}
            {inUseDevices.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                  In Use ({inUseDevices.length})
                </p>
                <div className="space-y-0">
                  {inUseDevices.map((entry) => (
                    <DeviceRow
                      key={entry.device.id}
                      device={entry.device}
                      onJoinQueue={() => handleJoinQueue(entry.device.id)}
                      actionLoading={loadingDeviceId === entry.device.id}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {attachedDevices.length === 0 &&
              freeDevices.length === 0 &&
              blockedDevices.length === 0 &&
              inUseDevices.length === 0 &&
              queuedDevices.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No USB devices available
                </p>
              )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
