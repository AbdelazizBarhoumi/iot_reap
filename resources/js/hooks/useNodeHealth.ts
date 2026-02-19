/**
 * Hook for fetching Proxmox node health (admin).
 * Polls every 30 seconds for real-time stats.
 * Sprint 2 - Phase 2
 */

import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../api/vm.api';
import type { ProxmoxNode } from '../types/vm.types';

interface UseNodeHealthResult {
  nodes: ProxmoxNode[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const POLL_INTERVAL = 30000; // 30 seconds

export function useNodeHealth(): UseNodeHealthResult {
  const [nodes, setNodes] = useState<ProxmoxNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNodes = useCallback(async () => {
    try {
      const data = await adminApi.getNodes();
      setNodes(data);
      setError(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load nodes';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNodes();

    // Poll every 30 seconds
    const interval = setInterval(fetchNodes, POLL_INTERVAL);

    // Cleanup interval on unmount - no memory leaks
    return () => {
      clearInterval(interval);
    };
  }, [fetchNodes]);

  return { nodes, loading, error, refetch: fetchNodes };
}
