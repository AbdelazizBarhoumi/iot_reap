/**
 * Hook for fetching VMs from Proxmox servers.
 * Returns lightweight VM list with node/server context.
 * Sprint 3 - VM Browser
 */
import { useCallback, useEffect, useState } from 'react';
import { proxmoxVMApi } from '../api/vm.api';
import type { ProxmoxVMInfo } from '../types/vm.types';
interface UseProxmoxVMsResult {
    vms: ProxmoxVMInfo[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}
export function useProxmoxVMs(): UseProxmoxVMsResult {
    const [vms, setVMs] = useState<ProxmoxVMInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fetchVMs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await proxmoxVMApi.list();
            setVMs(data);
        } catch (e) {
            const message =
                e instanceof Error
                    ? e.message
                    : 'Failed to load VMs from Proxmox';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchVMs();
    }, [fetchVMs]);
    return { vms, loading, error, refetch: fetchVMs };
}

