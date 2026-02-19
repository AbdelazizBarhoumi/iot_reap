/**
 * Hook for fetching VMs on a Proxmox node.
 * Includes loading, error handling, and refresh.
 * Sprint 2.5
 */

import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../api/vm.api';
import type { ProxmoxVM } from '../types/vm.types';

interface UseNodeVMsResult {
  vms: ProxmoxVM[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  startVM: (vmid: number) => Promise<void>;
  stopVM: (vmid: number) => Promise<void>;
  rebootVM: (vmid: number) => Promise<void>;
  shutdownVM: (vmid: number) => Promise<void>;
  actionLoading: number | null;
}

const POLL_INTERVAL = 15000; // 15 seconds for VMs (more responsive)

export function useNodeVMs(nodeId: number | null): UseNodeVMsResult {
  const [vms, setVms] = useState<ProxmoxVM[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchVMs = useCallback(async () => {
    if (!nodeId) return;
    
    try {
      setLoading(true);
      const data = await adminApi.getNodeVMs(nodeId);
      setVms(data);
      setError(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load VMs';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [nodeId]);

  useEffect(() => {
    if (!nodeId) {
      setVms([]);
      return;
    }

    fetchVMs();

    // Poll for updates
    const interval = setInterval(fetchVMs, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [nodeId, fetchVMs]);

  const startVM = useCallback(async (vmid: number) => {
    if (!nodeId) return;
    setActionLoading(vmid);
    try {
      await adminApi.startVM(nodeId, vmid);
      await fetchVMs();
    } finally {
      setActionLoading(null);
    }
  }, [nodeId, fetchVMs]);

  const stopVM = useCallback(async (vmid: number) => {
    if (!nodeId) return;
    setActionLoading(vmid);
    try {
      await adminApi.stopVM(nodeId, vmid);
      await fetchVMs();
    } finally {
      setActionLoading(null);
    }
  }, [nodeId, fetchVMs]);

  const rebootVM = useCallback(async (vmid: number) => {
    if (!nodeId) return;
    setActionLoading(vmid);
    try {
      await adminApi.rebootVM(nodeId, vmid);
      await fetchVMs();
    } finally {
      setActionLoading(null);
    }
  }, [nodeId, fetchVMs]);

  const shutdownVM = useCallback(async (vmid: number) => {
    if (!nodeId) return;
    setActionLoading(vmid);
    try {
      await adminApi.shutdownVM(nodeId, vmid);
      await fetchVMs();
    } finally {
      setActionLoading(null);
    }
  }, [nodeId, fetchVMs]);

  return {
    vms,
    loading,
    error,
    refetch: fetchVMs,
    startVM,
    stopVM,
    rebootVM,
    shutdownVM,
    actionLoading,
  };
}
