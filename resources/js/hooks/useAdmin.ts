import { useState, useEffect, useCallback } from 'react';
import * as adminApi from '@/api/admin.api';

export function useAdminDashboard() {
  const [dashboard, setDashboard] = useState<adminApi.AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await adminApi.getAdminDashboard();
      setDashboard(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
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
        setError(err instanceof Error ? err.message : 'Failed to load KPIs');
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
        setError(err instanceof Error ? err.message : 'Failed to load health status');
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  return { health, loading, error };
}

export function usePendingTrainingPaths() {
  const [trainingPaths, setTrainingPaths] = useState<adminApi.TrainingPathApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrainingPaths = async () => {
      try {
        setLoading(true);
        const response = await adminApi.getPendingTrainingPaths();
        setTrainingPaths(Array.isArray(response.data.data) ? response.data.data : []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load pending trainingPaths');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainingPaths();
  }, []);

  const approve = async (trainingPathId: string) => {
    try {
      await adminApi.approveTrainingPath(trainingPathId);
      setTrainingPaths(trainingPaths.map(c => c.id === trainingPathId ? { ...c, status: 'approved' } : c));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to approve trainingPath';
      setError(message);
      throw err;
    }
  };

  const reject = async (trainingPathId: string, reason: string) => {
    try {
      await adminApi.rejectTrainingPath(trainingPathId, reason);
      setTrainingPaths(trainingPaths.map(c => c.id === trainingPathId ? { ...c, status: 'rejected' } : c));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reject trainingPath';
      setError(message);
      throw err;
    }
  };

  const feature = async (trainingPathId: string) => {
    try {
      await adminApi.featureTrainingPath(trainingPathId);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to feature trainingPath';
      setError(message);
      throw err;
    }
  };

  const unfeature = async (trainingPathId: string) => {
    try {
      await adminApi.unfeatureTrainingPath(trainingPathId);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to unfeature trainingPath';
      setError(message);
      throw err;
    }
  };

  return { trainingPaths, loading, error, approve, reject, feature, unfeature };
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
        setError(err instanceof Error ? err.message : 'Failed to load Proxmox servers');
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
      const message = err instanceof Error ? err.message : 'Failed to create server';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (serverData: Partial<adminApi.ProxmoxServer>) => {
    try {
      await adminApi.testProxmoxConnection(serverData);
      setError(null);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      setError(message);
      throw err;
    }
  };

  const sync = async (serverId: string) => {
    try {
      await adminApi.syncProxmoxNodes(serverId);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sync nodes';
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
      setError(err instanceof Error ? err.message : 'Failed to load nodes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  return { nodes, loading, error, refetch: fetchNodes };
}
