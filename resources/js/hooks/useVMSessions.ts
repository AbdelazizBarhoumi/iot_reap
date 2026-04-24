/**
 * Hook for managing VM sessions.
 * Sprint 2 - Phase 2
 */
import { useCallback, useEffect, useState } from 'react';
import { vmSessionApi } from '../api/vm.api';
import type { CreateVMSessionRequest, VMSession } from '../types/vm.types';
interface UseVMSessionsResult {
    sessions: VMSession[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    createSession: (data: CreateVMSessionRequest) => Promise<VMSession>;
    terminateSession: (sessionId: string) => Promise<void>;
}
export function useVMSessions(
    params?: Record<string, string | number | boolean>,
): UseVMSessionsResult {
    const [sessions, setSessions] = useState<VMSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fetchSessions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await vmSessionApi.list(params);
            setSessions(data);
        } catch (e) {
            const message =
                e instanceof Error ? e.message : 'Failed to load sessions';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(params)]);
    const createSession = useCallback(
        async (data: CreateVMSessionRequest): Promise<VMSession> => {
            const session = await vmSessionApi.create(data);
            await fetchSessions();
            return session;
        },
        [fetchSessions],
    );
    const terminateSession = useCallback(
        async (sessionId: string): Promise<void> => {
            await vmSessionApi.terminate(sessionId);
            await fetchSessions();
        },
        [fetchSessions],
    );
    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);
    return {
        sessions,
        loading,
        error,
        refetch: fetchSessions,
        createSession,
        terminateSession,
    };
}
/**
 * Hook for fetching a single VM session.
 */
export function useVMSession(sessionId?: string) {
    const [session, setSession] = useState<VMSession | null>(null);
    const [loading, setLoading] = useState<boolean>(!!sessionId);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        if (!sessionId) {
            setSession(null);
            setLoading(false);
            setError(null);
            return;
        }

        async function fetchSession() {
            const id = sessionId;
            if (!id) {
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const data = await vmSessionApi.get(id);
                if (mounted) {
                    setSession(data);
                }
            } catch (e) {
                if (mounted) {
                    const message =
                        e instanceof Error
                            ? e.message
                            : 'Failed to load session';
                    setError(message);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        fetchSession();
        return () => {
            mounted = false;
        };
    }, [sessionId]);

    return { session, loading, error };
}

