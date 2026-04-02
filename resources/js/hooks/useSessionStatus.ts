/**
 * Hook for real-time VM session status updates.
 * Sprint 3 — US-12/US-13
 *
 * Polls the session endpoint at a configurable interval and
 * exposes WebSocket-style events (VMSessionReady, VMSessionExpiring)
 * via callback props.  When Laravel Echo is wired up in a future
 * sprint, this hook can be updated to use WebSocket channels instead
 * of polling — the component API stays the same.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { vmSessionApi } from '@/api/vm.api';
import type { VMSession, VMSessionStatus } from '@/types/vm.types';
interface UseSessionStatusOptions {
    /** Polling interval in milliseconds. Default: 5 000 ms. */
    pollInterval?: number;
    /** Called when session transitions to 'active'. */
    onReady?: (session: VMSession) => void;
    /** Called when session is about to expire (≤ 5 min remaining). */
    onExpiring?: (session: VMSession) => void;
    /** Called when session is terminated or failed. */
    onEnded?: (session: VMSession) => void;
}
interface UseSessionStatusResult {
    session: VMSession | null;
    loading: boolean;
    error: string | null;
    /** Force an immediate re-fetch (e.g. after extend). */
    refetch: () => Promise<void>;
}
const EXPIRING_THRESHOLD_SECONDS = 300; // 5 minutes
export function useSessionStatus(
    sessionId: string | undefined,
    options: UseSessionStatusOptions = {},
): UseSessionStatusResult {
    const { pollInterval = 5_000, onReady, onExpiring, onEnded } = options;
    const [session, setSession] = useState<VMSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const prevStatusRef = useRef<VMSessionStatus | null>(null);
    const expiringFiredRef = useRef(false);
    const mountedRef = useRef(true);
    const fetchSession = useCallback(async () => {
        if (!sessionId) {
            // nothing to fetch when no id is available
            return;
        }
        try {
            const data = await vmSessionApi.get(sessionId);
            if (!mountedRef.current) return;
            setSession(data);
            setError(null);
            // Detect status transitions
            const prevStatus = prevStatusRef.current;
            // VMSessionReady: just became active
            if (data.status === 'active' && prevStatus !== 'active') {
                onReady?.(data);
            }
            // VMSessionExpiring: active and ≤ 5 min remaining
            if (
                data.status === 'active' &&
                data.time_remaining_seconds <= EXPIRING_THRESHOLD_SECONDS &&
                !expiringFiredRef.current
            ) {
                expiringFiredRef.current = true;
                onExpiring?.(data);
            }
            // Reset expiring flag if time was extended
            if (data.time_remaining_seconds > EXPIRING_THRESHOLD_SECONDS) {
                expiringFiredRef.current = false;
            }
            // Session ended
            if (
                (data.status === 'terminated' ||
                    data.status === 'expired' ||
                    data.status === 'failed') &&
                prevStatus !== data.status
            ) {
                onEnded?.(data);
            }
            prevStatusRef.current = data.status;
        } catch (err: unknown) {
            if (!mountedRef.current) return;
            // When the server returns 404 it means the session record no longer
            // exists (or the ID was bogus).  This can happen during the rare case
            // where the user navigates here while the session is being deleted (or
            // if we attempted to poll before the record was committed).  Instead of
            // flooding the console with errors we treat it as a terminal event.
            interface AxiosErr {
                response?: { status?: number };
            }
            const status = (err as AxiosErr).response?.status;
            if (status === 404) {
                console.warn(
                    '[useSessionStatus] session not found (404), treating as ended',
                );
                if (session) onEnded?.(session);
                setError(null);
                return;
            }
            const message =
                err instanceof Error
                    ? err.message
                    : 'Failed to fetch session status';
            console.error('[useSessionStatus] fetch error', message, err);
            setError(message);
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    }, [sessionId, onReady, onExpiring, onEnded, session]);
    useEffect(() => {
        if (!sessionId) {
            // nothing to do until we have a valid id
            return;
        }
        mountedRef.current = true;
        expiringFiredRef.current = false;
        prevStatusRef.current = null;
        // Immediate fetch
        fetchSession();
        // Poll at interval
        const intervalId = setInterval(fetchSession, pollInterval);
        return () => {
            mountedRef.current = false;
            clearInterval(intervalId);
        };
    }, [fetchSession, pollInterval, sessionId]);
    return { session, loading, error, refetch: fetchSession };
}

