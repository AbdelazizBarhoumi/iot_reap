import { useState, useEffect, useCallback } from 'react';
import * as adminApi from '@/api/admin.api';

export function useAdminDashboard() {
    const [dashboard, setDashboard] =
        useState<adminApi.AnalyticsDashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboard = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await adminApi.getAdminDashboard();
            setDashboard(data);
            setError(null);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to load dashboard',
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    return { dashboard, loading, error, refetch: fetchDashboard };
}

export function useAdminKPIs() {
    const [kpis, setKpis] = useState<adminApi.KPI[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchKPIs = async () => {
            try {
                setLoading(true);
                const { data } = await adminApi.getKPIs();
                setKpis(data);
                setError(null);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : 'Failed to load KPIs',
                );
            } finally {
                setLoading(false);
            }
        };

        fetchKPIs();
    }, []);

    return { kpis, loading, error };
}

export function useSystemHealth() {
    const [health, setHealth] = useState<adminApi.HealthStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                setLoading(true);
                const { data } = await adminApi.getHealthStatus();
                setHealth(data);
                setError(null);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to load health status',
                );
            } finally {
                setLoading(false);
            }
        };

        fetchHealth();
    }, []);

    return { health, loading, error };
}

export function usePendingTrainingPaths() {
    const [trainingPaths, setTrainingPaths] = useState<
        adminApi.TrainingPathApproval[]
    >([]);
    const [featuredTrainingPaths, setFeaturedTrainingPaths] = useState<
        adminApi.TrainingPathApproval[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTrainingPaths = useCallback(async () => {
        try {
            setLoading(true);
            const response = await adminApi.getPendingTrainingPaths();

            // response.data expected shape: { data: TrainingPathApproval[], featured: TrainingPathApproval[] }
            const all = Array.isArray(response.data.data)
                ? response.data.data
                : [];
            const featured = Array.isArray(response.data.featured)
                ? response.data.featured
                : [];

            setTrainingPaths(all);
            setFeaturedTrainingPaths(featured);
            setError(null);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to load pending trainingPaths',
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTrainingPaths();
    }, [fetchTrainingPaths]);

    const approve = async (trainingPathId: string) => {
        try {
            await adminApi.approveTrainingPath(trainingPathId);
            setTrainingPaths((prev) =>
                prev.map((c) =>
                    c.id === trainingPathId ? { ...c, status: 'approved' } : c,
                ),
            );
            setError(null);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Failed to approve trainingPath';
            setError(message);
            throw err;
        }
    };

    const reject = async (trainingPathId: string, reason: string) => {
        try {
            await adminApi.rejectTrainingPath(trainingPathId, reason);
            setTrainingPaths((prev) =>
                prev.map((c) =>
                    c.id === trainingPathId ? { ...c, status: 'rejected' } : c,
                ),
            );
            setError(null);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Failed to reject trainingPath';
            setError(message);
            throw err;
        }
    };

    const feature = async (trainingPathId: string) => {
        try {
            await adminApi.featureTrainingPath(trainingPathId);
            // refresh lists from server to keep authoritative state
            await fetchTrainingPaths();
            setError(null);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Failed to feature trainingPath';
            setError(message);
            throw err;
        }
    };

    const unfeature = async (trainingPathId: string) => {
        try {
            await adminApi.unfeatureTrainingPath(trainingPathId);
            // refresh lists from server to keep authoritative state
            await fetchTrainingPaths();
            setError(null);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Failed to unfeature trainingPath';
            setError(message);
            throw err;
        }
    };

    const updateFeaturedOrder = async (order: string[]) => {
        try {
            await adminApi.updateFeaturedTrainingPathOrder(order);
            // optimistic local update: reorder featuredTrainingPaths according to order
            setFeaturedTrainingPaths((prev) => {
                const byId = new Map(prev.map((p) => [p.id, p]));
                return order.map((id) => byId.get(id)).filter(Boolean) as adminApi.TrainingPathApproval[];
            });
            setError(null);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Failed to update featured training path order';
            setError(message);
            throw err;
        }
    };

    return {
        trainingPaths,
        featuredTrainingPaths,
        loading,
        error,
        refetch: fetchTrainingPaths,
        approve,
        reject,
        feature,
        unfeature,
        updateFeaturedOrder,
    };
}

export function useProxmoxServers() {
    const [servers, setServers] = useState<adminApi.ProxmoxServer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchServers = async () => {
            try {
                setLoading(true);
                const { data } = await adminApi.getProxmoxServers();
                setServers(data);
                setError(null);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to load Proxmox servers',
                );
            } finally {
                setLoading(false);
            }
        };

        fetchServers();
    }, []);

    const create = async (serverData: Partial<adminApi.ProxmoxServer>) => {
        try {
            setLoading(true);
            const { data } = await adminApi.createProxmoxServer(serverData);
            setServers([...servers, data]);
            setError(null);
            return data;
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Failed to create server';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const testConnection = async (
        serverData: Partial<adminApi.ProxmoxServer>,
    ) => {
        try {
            await adminApi.testProxmoxConnection(serverData);
            setError(null);
            return true;
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Connection failed';
            setError(message);
            throw err;
        }
    };

    const sync = async (serverId: string) => {
        try {
            await adminApi.syncProxmoxNodes(serverId);
            setError(null);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Failed to sync nodes';
            setError(message);
            throw err;
        }
    };

    return { servers, loading, error, create, testConnection, sync };
}

export function useAdminNodes() {
    const [nodes, setNodes] = useState<adminApi.Node[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNodes = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await adminApi.getNodes();
            setNodes(data);
            setError(null);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to load nodes',
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNodes();
    }, [fetchNodes]);

    return { nodes, loading, error, refetch: fetchNodes };
}
