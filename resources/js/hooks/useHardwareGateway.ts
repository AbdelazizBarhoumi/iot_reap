/**
 * Hook for fetching and managing USB/IP hardware gateway data.
 * Provides data fetching, polling, and device operations.
 */
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { hardwareApi } from '../api/hardware.api';
import type {
    AttachDeviceRequest,
    GatewayNode,
    UsbDevice,
    UpdateCameraSettingsRequest,
} from '../types/hardware.types';
// Axios error responses don't have a stable interface; define what we care about
interface ApiError {
    response?: { data?: { message?: string } };
    message?: string;
}
interface UseHardwareGatewayResult {
    nodes: GatewayNode[];
    devices: UsbDevice[];
    loading: boolean;
    error: string | null;
    actionLoading: boolean;
    refetch: () => Promise<void>;
    refreshAll: () => Promise<boolean>;
    refreshNode: (nodeId: number) => Promise<boolean>;
    checkHealth: (nodeId: number) => Promise<boolean>;
    bindDevice: (deviceId: number) => Promise<boolean>;
    unbindDevice: (deviceId: number) => Promise<boolean>;
    attachDevice: (
        deviceId: number,
        data: AttachDeviceRequest,
    ) => Promise<boolean>;
    detachDevice: (deviceId: number) => Promise<boolean>;
    cancelPendingAttachment: (deviceId: number) => Promise<boolean>;
    markAsCamera: (deviceId: number) => Promise<boolean>;
    activateCamera: (deviceId: number) => Promise<boolean>;
    updateCameraSettings: (
        deviceId: number,
        data: UpdateCameraSettingsRequest,
    ) => Promise<boolean>;
    removeCamera: (deviceId: number) => Promise<boolean>;
    discoverGateways: () => Promise<boolean>;
    verifyNode: (nodeId: number, verified: boolean) => Promise<boolean>;
}
const POLL_INTERVAL = 15000; // 15 seconds
export function useHardwareGateway(): UseHardwareGatewayResult {
    const [nodes, setNodes] = useState<GatewayNode[]>([]);
    const [devices, setDevices] = useState<UsbDevice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const fetchData = useCallback(async () => {
        try {
            const nodesData = await hardwareApi.getNodes();
            setNodes(nodesData);
            // Extract devices from nodes or fetch separately
            const allDevices = nodesData.flatMap((node) => node.devices || []);
            setDevices(allDevices);
            setError(null);
        } catch (e) {
            const message =
                e instanceof Error ? e.message : 'Failed to load hardware data';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);
    const refreshAll = useCallback(async (): Promise<boolean> => {
        setActionLoading(true);
        setError(null);
        try {
            const result = await hardwareApi.refreshAll();
            if (result.success) {
                toast.success('All gateways refreshed');
            } else {
                const errorMsg = result.message || 'Refresh failed';
                toast.error(errorMsg);
                setError(errorMsg);
            }
            // always reload nodes so UI stays in sync (offline marking may have occurred)
            await fetchData();
            return result.success;
        } catch (e: unknown) {
            // try to surface server-provided message if available
            let message: string =
                e instanceof Error ? e.message : 'Refresh failed';
            const serverMsg = (e as ApiError)?.response?.data?.message;
            if (serverMsg) {
                message = serverMsg;
            }
            toast.error(message);
            setError(message);
            await fetchData();
            return false;
        } finally {
            setActionLoading(false);
        }
    }, [fetchData]);
    const refreshNode = useCallback(
        async (nodeId: number): Promise<boolean> => {
            setActionLoading(true);
            setError(null);
            try {
                const result = await hardwareApi.refreshNode(nodeId);
                if (result.success) {
                    toast.success('Gateway refreshed');
                } else {
                    const errorMsg = result.message || 'Refresh failed';
                    toast.error(errorMsg);
                    setError(errorMsg);
                }
                // even on failure we may have marked the node offline, so re-fetch
                await fetchData();
                return result.success;
            } catch (e: unknown) {
                let message: string =
                    e instanceof Error ? e.message : 'Refresh failed';
                const serverMsg = (e as ApiError)?.response?.data?.message;
                if (serverMsg) {
                    message = serverMsg;
                }
                toast.error(message);
                setError(message);
                await fetchData();
                return false;
            } finally {
                setActionLoading(false);
            }
        },
        [fetchData],
    );
    const checkHealth = useCallback(
        async (nodeId: number): Promise<boolean> => {
            setActionLoading(true);
            setError(null);
            try {
                const result = await hardwareApi.checkHealth(nodeId);
                if (result.success) {
                    toast.success(
                        result.message ||
                            (result.online
                                ? 'Gateway is online'
                                : 'Gateway is offline'),
                    );
                    await fetchData();
                    return true;
                }

                const errorMsg = result.message || 'Health check failed';
                toast.error(errorMsg);
                setError(errorMsg);
                return false;
            } catch (e) {
                const message =
                    e instanceof Error ? e.message : 'Health check failed';
                toast.error(message);
                setError(message);
                return false;
            } finally {
                setActionLoading(false);
            }
        },
        [fetchData],
    );
    const bindDevice = useCallback(
        async (deviceId: number): Promise<boolean> => {
            setActionLoading(true);
            setError(null);
            try {
                const result = await hardwareApi.bindDevice(deviceId);
                if (result.success) {
                    toast.success('Device bound successfully');
                    await fetchData();
                    return true;
                }
                const errorMsg = result.message || 'Bind failed';
                toast.error(errorMsg);
                setError(errorMsg);
                return false;
            } catch (e) {
                const message = e instanceof Error ? e.message : 'Bind failed';
                toast.error(message);
                setError(message);
                return false;
            } finally {
                setActionLoading(false);
            }
        },
        [fetchData],
    );
    const unbindDevice = useCallback(
        async (deviceId: number): Promise<boolean> => {
            setActionLoading(true);
            setError(null);
            try {
                const result = await hardwareApi.unbindDevice(deviceId);
                if (result.success) {
                    toast.success('Device unbound successfully');
                    await fetchData();
                    return true;
                }
                const errorMsg = result.message || 'Unbind failed';
                toast.error(errorMsg);
                setError(errorMsg);
                return false;
            } catch (e) {
                const message =
                    e instanceof Error ? e.message : 'Unbind failed';
                toast.error(message);
                setError(message);
                return false;
            } finally {
                setActionLoading(false);
            }
        },
        [fetchData],
    );
    const attachDevice = useCallback(
        async (
            deviceId: number,
            data: AttachDeviceRequest,
        ): Promise<boolean> => {
            setActionLoading(true);
            setError(null);
            try {
                const result = await hardwareApi.attachDevice(deviceId, data);
                if (result.success) {
                    toast.success('Device attached successfully');
                    await fetchData();
                    return true;
                }
                const errorMsg = result.message || 'Attach failed';
                toast.error(errorMsg);
                setError(errorMsg);
                return false;
            } catch (e) {
                const message =
                    e instanceof Error ? e.message : 'Attach failed';
                toast.error(message);
                setError(message);
                return false;
            } finally {
                setActionLoading(false);
            }
        },
        [fetchData],
    );
    const detachDevice = useCallback(
        async (deviceId: number): Promise<boolean> => {
            setActionLoading(true);
            setError(null);
            try {
                const result = await hardwareApi.detachDevice(deviceId);
                if (result.success) {
                    toast.success('Device detached successfully');
                    await fetchData();
                    return true;
                }
                const errorMsg = result.message || 'Detach failed';
                toast.error(errorMsg);
                setError(errorMsg);
                return false;
            } catch (e) {
                const message =
                    e instanceof Error ? e.message : 'Detach failed';
                toast.error(message);
                setError(message);
                return false;
            } finally {
                setActionLoading(false);
            }
        },
        [fetchData],
    );
    const cancelPendingAttachment = useCallback(
        async (deviceId: number): Promise<boolean> => {
            setActionLoading(true);
            setError(null);
            try {
                const result =
                    await hardwareApi.cancelPendingAttachment(deviceId);
                if (result.success) {
                    toast.success('Pending attachment cancelled');
                    await fetchData();
                    return true;
                }
                const errorMsg = result.message || 'Cancel failed';
                toast.error(errorMsg);
                setError(errorMsg);
                return false;
            } catch (e) {
                const message =
                    e instanceof Error ? e.message : 'Cancel failed';
                toast.error(message);
                setError(message);
                return false;
            } finally {
                setActionLoading(false);
            }
        },
        [fetchData],
    );
    const discoverGateways = useCallback(async (): Promise<boolean> => {
        setActionLoading(true);
        setError(null);
        try {
            const result = await hardwareApi.discoverGateways();
            if (result.success) {
                toast.success('Gateway discovery completed');
            } else {
                const errorMsg = result.message || 'Discovery failed';
                toast.error(errorMsg);
                setError(errorMsg);
            }
            await fetchData();
            return result.success;
        } catch (e: unknown) {
            let message: string =
                e instanceof Error ? e.message : 'Discovery failed';
            const serverMsg = (e as ApiError)?.response?.data?.message;
            if (serverMsg) {
                message = serverMsg;
            }
            toast.error(message);
            setError(message);
            await fetchData();
            return false;
        } finally {
            setActionLoading(false);
        }
    }, [fetchData]);
    const verifyNode = useCallback(
        async (nodeId: number, verified: boolean): Promise<boolean> => {
            setActionLoading(true);
            setError(null);
            try {
                const result = await hardwareApi.verifyNode(nodeId, verified);
                if (result.success) {
                    toast.success(
                        verified ? 'Gateway verified' : 'Gateway unverified',
                    );
                    await fetchData();
                    return true;
                }
                const errorMsg = result.message || 'Verify failed';
                toast.error(errorMsg);
                setError(errorMsg);
                return false;
            } catch (e) {
                const message =
                    e instanceof Error ? e.message : 'Verify failed';
                toast.error(message);
                setError(message);
                return false;
            } finally {
                setActionLoading(false);
            }
        },
        [fetchData],
    );
    const markAsCamera = useCallback(
        async (deviceId: number): Promise<boolean> => {
            setActionLoading(true);
            setError(null);
            try {
                const result = await hardwareApi.convertToCamera(deviceId);
                if (result.success) {
                    toast.success('Device registered as camera');
                    await fetchData();
                    return true;
                }
                const errorMsg = result.message || 'Failed to register camera';
                toast.error(errorMsg);
                setError(errorMsg);
                return false;
            } catch (e) {
                const message =
                    e instanceof Error
                        ? e.message
                        : 'Failed to register camera';
                toast.error(message);
                setError(message);
                return false;
            } finally {
                setActionLoading(false);
            }
        },
        [fetchData],
    );
    const activateCamera = useCallback(
        async (deviceId: number): Promise<boolean> => {
            setActionLoading(true);
            setError(null);
            try {
                const result = await hardwareApi.activateCamera(deviceId);
                if (result.success) {
                    toast.success('Camera stream activated');
                    await fetchData();
                    return true;
                }
                const errorMsg = result.message || 'Failed to activate camera';
                toast.error(errorMsg);
                setError(errorMsg);
                return false;
            } catch (e) {
                const message =
                    e instanceof Error
                        ? e.message
                        : 'Failed to activate camera';
                toast.error(message);
                setError(message);
                return false;
            } finally {
                setActionLoading(false);
            }
        },
        [fetchData],
    );
    const updateCameraSettings = useCallback(
        async (
            deviceId: number,
            data: UpdateCameraSettingsRequest,
        ): Promise<boolean> => {
            setActionLoading(true);
            setError(null);
            try {
                const result = await hardwareApi.updateCameraSettings(
                    deviceId,
                    data,
                );
                if (result.success) {
                    toast.success('Camera settings updated');
                    await fetchData();
                    return true;
                }
                const errorMsg = result.message || 'Failed to update camera';
                toast.error(errorMsg);
                setError(errorMsg);
                return false;
            } catch (e) {
                const message =
                    e instanceof Error ? e.message : 'Failed to update camera';
                toast.error(message);
                setError(message);
                return false;
            } finally {
                setActionLoading(false);
            }
        },
        [fetchData],
    );
    const removeCamera = useCallback(
        async (deviceId: number): Promise<boolean> => {
            setActionLoading(true);
            setError(null);
            try {
                const result = await hardwareApi.removeCamera(deviceId);
                if (result.success) {
                    toast.success('Camera registration removed');
                    await fetchData();
                    return true;
                }
                const errorMsg = result.message || 'Failed to remove camera';
                toast.error(errorMsg);
                setError(errorMsg);
                return false;
            } catch (e) {
                const message =
                    e instanceof Error ? e.message : 'Failed to remove camera';
                toast.error(message);
                setError(message);
                return false;
            } finally {
                setActionLoading(false);
            }
        },
        [fetchData],
    );
    useEffect(() => {
        fetchData();
        // Poll every 15 seconds
        const interval = setInterval(fetchData, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchData]);
    return {
        nodes,
        devices,
        loading,
        error,
        actionLoading,
        refetch: fetchData,
        refreshAll,
        refreshNode,
        checkHealth,
        bindDevice,
        unbindDevice,
        attachDevice,
        detachDevice,
        cancelPendingAttachment,
        markAsCamera,
        activateCamera,
        updateCameraSettings,
        removeCamera,
        discoverGateways,
        verifyNode,
    };
}
