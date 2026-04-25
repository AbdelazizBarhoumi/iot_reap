/**
 * Hook for managing USB hardware devices within a VM session.
 * Provides attach/detach and queue operations scoped to a session.
 */
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { sessionHardwareApi } from '@/api/hardware.api';
import { getHttpErrorMessage } from '@/lib/http-errors';
import type {
    UsbDevice,
    UsbDeviceQueueEntry,
    AvailableDeviceEntry,
    SessionHardwareSummary,
} from '@/types/hardware.types';
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
    const [availableDevices, setAvailableDevices] = useState<
        AvailableDeviceEntry[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const applySummary = useCallback((summary: SessionHardwareSummary) => {
        setAttachedDevices(summary.attached_devices ?? []);
        setQueueEntries(summary.queue_entries ?? []);
        setAvailableDevices(summary.available_devices ?? []);
    }, []);

    const fetchData = useCallback(async () => {
        if (!sessionId || !enabled) {
            setLoading(false);
            return;
        }
        try {
            const summary = await sessionHardwareApi.getSummary(sessionId);
            applySummary(summary);
            setError(null);
        } catch (e) {
            const message = getHttpErrorMessage(
                e,
                'Failed to load hardware data',
            );
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [sessionId, enabled, applySummary]);

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
                const result = await sessionHardwareApi.attachDevice(
                    sessionId,
                    deviceId,
                );
                if (result.success) {
                    toast.success('USB device attached successfully');
                    await fetchData();

                    return true;
                }
                const errorMsg = result.message || 'Attach failed';
                toast.error(errorMsg);
                setError(errorMsg);
                await fetchData();
                return false;
            } catch (e) {
                const message = getHttpErrorMessage(e, 'Attach failed');
                toast.error(message);
                setError(message);
                await fetchData();
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
                const result = await sessionHardwareApi.detachDevice(
                    sessionId,
                    deviceId,
                );
                if (result.success) {
                    toast.success('USB device detached successfully');
                    await fetchData();
                    return true;
                }
                const errorMsg = result.message || 'Detach failed';
                toast.error(errorMsg);
                setError(errorMsg);
                await fetchData();
                return false;
            } catch (e) {
                const message = getHttpErrorMessage(e, 'Detach failed');
                toast.error(message);
                setError(message);
                await fetchData();
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
                const result = await sessionHardwareApi.joinQueue(
                    sessionId,
                    deviceId,
                );
                if (result.success) {
                    toast.success('Joined device queue');
                    await fetchData();
                    return true;
                }
                const errorMsg = result.message || 'Queue operation failed';
                toast.error(errorMsg);
                setError(errorMsg);
                await fetchData();
                return false;
            } catch (e) {
                const message = getHttpErrorMessage(
                    e,
                    'Queue operation failed',
                );
                toast.error(message);
                setError(message);
                await fetchData();
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
                const result = await sessionHardwareApi.leaveQueue(
                    sessionId,
                    deviceId,
                );
                if (result.success) {
                    toast.success('Left device queue');
                    await fetchData();
                    return true;
                }
                const errorMsg = result.message || 'Leave queue failed';
                toast.error(errorMsg);
                setError(errorMsg);
                await fetchData();
                return false;
            } catch (e) {
                const message = getHttpErrorMessage(e, 'Leave queue failed');
                toast.error(message);
                setError(message);
                await fetchData();
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
