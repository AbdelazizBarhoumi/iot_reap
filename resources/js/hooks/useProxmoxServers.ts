/**
 * Hook for fetching active Proxmox servers for cluster selection.
 * Sprint 2.5 - Multi-server support
 */

import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import type { ProxmoxServer } from '../types/vm.types';

interface UseProxmoxServersReturn {
  servers: ProxmoxServer[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProxmoxServers(): UseProxmoxServersReturn {
  const [servers, setServers] = useState<ProxmoxServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<{ data: ProxmoxServer[] }>('/api/proxmox-servers/active');
      setServers(response.data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch Proxmox servers';
      setError(message);
      setServers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  return {
    servers,
    loading,
    error,
    refetch: fetchServers,
  };
}
