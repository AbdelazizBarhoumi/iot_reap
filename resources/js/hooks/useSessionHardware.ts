/**
 * Hook for managing USB hardware devices within a VM session.
 * Provides attach/detach and queue operations scoped to a session.
 */

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { sessionHardwareApi } from '@/api/hardware.api';
import type { UsbDevice, UsbDeviceQueueEntry, AvailableDeviceEntry } from '@/types/hardware.types';

interface UseSessionHardwareResult {
  attachedDevices: UsbDevice[];
  queueEntries: UsbDeviceQueueEntry[];
  availableDevices: AvailableDeviceEntry[];
  loading: boolean;
  error: string | null;
  actionLoading: boolean;
  refetch: () => Promise<void>;
  attachDevice: (deviceId: number) => Promise<boolean>;
  detachDevice: (deviceId: number) => Promise<boolean>;
  joinQueue: (deviceId: number) => Promise<boolean>;
  leaveQueue: (deviceId: number) => Promise<boolean>;
}

interface UseSessionHardwareOptions {
  /** Polling interval in milliseconds. Set to 0 to disable polling. */
  pollInterval?: number;
  /** Only fetch when session is active. */
  enabled?: boolean;
}

const DEFAULT_POLL_INTERVAL = 10000; // 10 seconds

export function useSessionHardware(
  sessionId: string | undefined,
  options: UseSessionHardwareOptions = {},
): UseSessionHardwareResult {
  const { pollInterval = DEFAULT_POLL_INTERVAL, enabled = true } = options;

  const [attachedDevices, setAttachedDevices] = useState<UsbDevice[]>([]);
  const [queueEntries, setQueueEntries] = useState<UsbDeviceQueueEntry[]>([]);
  const [availableDevices, setAvailableDevices] = useState<AvailableDeviceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!sessionId || !enabled) {
      setLoading(false);
      return;
    }

    try {
      const summary = await sessionHardwareApi.getSummary(sessionId);
      setAttachedDevices(summary.attached_devices ?? []);
      setQueueEntries(summary.queue_entries ?? []);
      setAvailableDevices(summary.available_devices ?? []);
      setError(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load hardware data';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [sessionId, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Polling
  useEffect(() => {
    if (!sessionId || !enabled || pollInterval <= 0) return;

    const interval = setInterval(fetchData, pollInterval);
    return () => clearInterval(interval);
  }, [sessionId, enabled, pollInterval, fetchData]);

  const attachDevice = useCallback(
    async (deviceId: number): Promise<boolean> => {
      if (!sessionId) return false;

      setActionLoading(true);
      setError(null); // Clear previous error
      try {
        const result = await sessionHardwareApi.attachDevice(sessionId, deviceId);
        if (result.success) {
          // Check if this was an async operation
          if ('async' in result && result.async) {
            // Async mode: device attachment is in progress
            // Frontend should listen for WebSocket events for progress
            toast.info('USB device attachment started...', {
              description: 'This may take up to 2 minutes for Windows VMs. Progress updates will appear automatically.',
              duration: 8000,
            });
            // Don't wait - the polling will pick up state changes
            await fetchData();
            return true;
          }
          // Sync mode: immediate success
          toast.success('USB device attached successfully');
          await fetchData();
          return true;
        }
        const errorMsg = result.message || 'Attach failed';
        toast.error(errorMsg);
        setError(errorMsg);
        return false;
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Attach failed';
        toast.error(message);
        setError(message);
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [sessionId, fetchData],
  );

  const detachDevice = useCallback(
    async (deviceId: number): Promise<boolean> => {
      if (!sessionId) return false;

      setActionLoading(true);
      setError(null); // Clear previous error
      try {
        const result = await sessionHardwareApi.detachDevice(sessionId, deviceId);
        if (result.success) {
          toast.success('USB device detached successfully');
          await fetchData();
          return true;
        }
        const errorMsg = result.message || 'Detach failed';
        toast.error(errorMsg);
        setError(errorMsg);
        return false;
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Detach failed';
        toast.error(message);
        setError(message);
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [sessionId, fetchData],
  );

  const joinQueue = useCallback(
    async (deviceId: number): Promise<boolean> => {
      if (!sessionId) return false;

      setActionLoading(true);
      setError(null); // Clear previous error
      try {
        const result = await sessionHardwareApi.joinQueue(sessionId, deviceId);
        if (result.success) {
          toast.success('Joined device queue');
          await fetchData();
          return true;
        }
        const errorMsg = result.message || 'Queue operation failed';
        toast.error(errorMsg);
        setError(errorMsg);
        return false;
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Queue operation failed';
        toast.error(message);
        setError(message);
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [sessionId, fetchData],
  );

  const leaveQueue = useCallback(
    async (deviceId: number): Promise<boolean> => {
      if (!sessionId) return false;

      setActionLoading(true);
      setError(null); // Clear previous error
      try {
        const result = await sessionHardwareApi.leaveQueue(sessionId, deviceId);
        if (result.success) {
          toast.success('Left device queue');
          await fetchData();
          return true;
        }
        const errorMsg = result.message || 'Leave queue failed';
        toast.error(errorMsg);
        setError(errorMsg);
        return false;
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Leave queue failed';
        toast.error(message);
        setError(message);
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [sessionId, fetchData],
  );

  return {
    attachedDevices,
    queueEntries,
    availableDevices,
    loading,
    error,
    actionLoading,
    refetch: fetchData,
    attachDevice,
    detachDevice,
    joinQueue,
    leaveQueue,
  };
}
