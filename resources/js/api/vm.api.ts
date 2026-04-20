/**
 * VM Session and Template API module.
 * Sprint 2 - Phase 2 (Updated: removed /api/ prefix, uses web routes)
 */
import type { AxiosResponse } from 'axios';
import type {
    ApiResponse,
    AssignVMToTrainingUnitRequest,
    ConnectionProfile,
    CreateVMSessionRequest,
    ExtendSessionRequest,
    GuacamoleTokenResponse,
    TrainingUnitVMAssignment,
    ProxmoxNode,
    ProxmoxVM,
    ProxmoxVMInfo,
    TerminateSessionRequest,
    VMSession,
    VMSnapshot,
} from '../types/vm.types';
import client from './client';
/**
 * VM Session API
 */
export const vmSessionApi = {
    // helper for endpoint responses that sometimes wrap return values in
    // `{ data: ... }` and sometimes return the resource directly.  the
    // backend historically was inconsistent (index wraps, show/create do
    // not), so be forgiving here so the frontend never receives `undefined`.
    async unwrap<T>(axiosPromise: Promise<AxiosResponse<unknown>>): Promise<T> {
        const res = await axiosPromise;
        const payload = res.data as unknown;
        // some endpoints wrap responses in `{ data: ... }` while others
        // return the resource directly.  guard against both forms without
        // resorting to `any`.
        if (
            payload &&
            typeof payload === 'object' &&
            'data' in (payload as Record<string, unknown>)
        ) {
            return (payload as { data: T }).data;
        }
        return payload as T;
    },
    /**
     * Get all sessions for the current user.
     * `index` returns a wrapped payload, so we still access `.data` directly.
     */
    async list(): Promise<VMSession[]> {
        const response =
            await client.get<ApiResponse<VMSession[]>>('/sessions');
        return response.data.data;
    },
    /**
     * Get a specific session by ID.
     */
    async get(sessionId: string): Promise<VMSession> {
        return this.unwrap<VMSession>(client.get(`/sessions/${sessionId}`));
    },
    /**
     * Create a new VM session.
     */
    async create(data: CreateVMSessionRequest): Promise<VMSession> {
        return this.unwrap<VMSession>(client.post('/sessions', data));
    },
    /**
     * Terminate/delete a session.
     */
    async terminate(
        sessionId: string,
        options?: TerminateSessionRequest,
    ): Promise<void> {
        await client.delete(`/sessions/${sessionId}`, { data: options });
    },
    /**
     * Extend a session by a number of minutes.
     */
    async extend(
        sessionId: string,
        data?: ExtendSessionRequest,
    ): Promise<VMSession> {
        return this.unwrap<VMSession>(
            client.post(
                `/sessions/${sessionId}/extend`,
                data ?? { minutes: 30 },
            ),
        );
    },
    /**
     * Fetch a one-time Guacamole auth token for an active session.
     */
    async getGuacamoleToken(
        sessionId: string,
    ): Promise<GuacamoleTokenResponse> {
        const response = await client.get<GuacamoleTokenResponse>(
            `/sessions/${sessionId}/guacamole-token`,
        );
        return response.data;
    },
    /**
     * List available VM snapshots for a session.
     */
    async listSnapshots(sessionId: string): Promise<VMSnapshot[]> {
        const response = await client.get<ApiResponse<VMSnapshot[]>>(
            `/sessions/${sessionId}/snapshots`,
        );
        return response.data.data;
    },
};
/**
 * Connection Preferences API
 */
export const connectionPreferencesApi = {
    /**
     * Get all connection profiles for the current user, grouped by protocol.
     */
    async getAll(): Promise<{
        rdp: ConnectionProfile[];
        vnc: ConnectionProfile[];
        ssh: ConnectionProfile[];
    }> {
        const response = await client.get<
            ApiResponse<{
                rdp: ConnectionProfile[];
                vnc: ConnectionProfile[];
                ssh: ConnectionProfile[];
            }>
        >('/connection-preferences');
        return response.data.data;
    },
    /**
     * Get connection preferences for a specific protocol.
     */
    async getByProtocol(
        protocol: string,
    ): Promise<{ protocol: string; parameters: Record<string, string> }> {
        const response = await client.get<
            ApiResponse<{
                protocol: string;
                parameters: Record<string, string>;
            }>
        >(`/connection-preferences/${protocol}`);
        return response.data.data;
    },
    /**
     * Save connection preferences for a specific protocol.
     */
    async save(
        protocol: string,
        parameters: Record<string, string | boolean | number>,
    ): Promise<{ protocol: string; parameters: Record<string, string> }> {
        const response = await client.put<
            ApiResponse<{
                protocol: string;
                parameters: Record<string, string>;
            }>
        >(`/connection-preferences/${protocol}`, { parameters });
        return response.data.data;
    },

    /**
     * Get the per-VM preferred profile for a specific VM and protocol.
     */
    async getPerVMDefault(
        vmId: number,
        protocol: string,
    ): Promise<{ vm_id: number; protocol: string; preferred_profile_name: string | null }> {
        const response = await client.get<
            ApiResponse<{
                vm_id: number;
                protocol: string;
                preferred_profile_name: string | null;
            }>
        >(`/connection-preferences/vm/${vmId}/${protocol}`);
        return response.data.data;
    },

    /**
     * Set the preferred profile for a specific VM and protocol.
     */
    async setPerVMDefault(
        vmId: number,
        protocol: string,
        profileName: string,
    ): Promise<{ vm_id: number; protocol: string; preferred_profile_name: string }> {
        const response = await client.post<
            ApiResponse<{
                vm_id: number;
                protocol: string;
                preferred_profile_name: string;
            }>
        >(`/connection-preferences/vm/${vmId}/${protocol}/default`, {
            profile_name: profileName,
        });
        return response.data.data;
    },

    /**
     * Clear the per-VM preferred profile (revert to protocol default).
     */
    async deletePerVMDefault(vmId: number, protocol: string): Promise<void> {
        await client.delete(`/connection-preferences/vm/${vmId}/${protocol}/default`);
    },
};
/**
 * VM Template API (public endpoints)
 */
/**
 * Proxmox VM Browser API (available to all authenticated users)
 */
export const proxmoxVMApi = {
    /**
     * List all VMs from active Proxmox servers with node/server context.
     */
    async list(): Promise<ProxmoxVMInfo[]> {
        const response =
            await client.get<ApiResponse<ProxmoxVMInfo[]>>('/proxmox-vms');
        return response.data.data;
    },
    /**
     * List snapshots for a specific Proxmox VM (before session creation).
     */
    async listSnapshots(
        serverId: number,
        nodeId: number,
        vmid: number,
    ): Promise<VMSnapshot[]> {
        const response = await client.get<ApiResponse<VMSnapshot[]>>(
            `/proxmox-vms/${serverId}/${nodeId}/${vmid}/snapshots`,
        );
        return response.data.data;
    },
};
/**
 * Admin API (admin-only endpoints)
 */
export const adminApi = {
    /**
     * Get all Proxmox nodes with stats.
     */
    async getNodes(): Promise<ProxmoxNode[]> {
        const response =
            await client.get<ApiResponse<ProxmoxNode[]>>('/admin/nodes');
        return response.data.data;
    },
    /**
     * Get all VMs on a node (running + stopped).
     */
    async getNodeVMs(nodeId: number): Promise<ProxmoxVM[]> {
        const response = await client.get<ApiResponse<ProxmoxVM[]>>(
            `/admin/nodes/${nodeId}/vms`,
        );
        return response.data.data;
    },
    /**
     * Start a VM on a node.
     */
    async startVM(nodeId: number, vmid: number): Promise<void> {
        await client.post(`/admin/nodes/${nodeId}/vms/${vmid}/start`);
    },
    /**
     * Stop a VM on a node (hard stop).
     */
    async stopVM(nodeId: number, vmid: number): Promise<void> {
        await client.post(`/admin/nodes/${nodeId}/vms/${vmid}/stop`);
    },
    /**
     * Reboot a VM on a node.
     */
    async rebootVM(nodeId: number, vmid: number): Promise<void> {
        await client.post(`/admin/nodes/${nodeId}/vms/${vmid}/reboot`);
    },
    /**
     * Shutdown a VM gracefully.
     */
    async shutdownVM(nodeId: number, vmid: number): Promise<void> {
        await client.post(`/admin/nodes/${nodeId}/vms/${vmid}/shutdown`);
    },
};

/**
 * TrainingUnit VM Assignment API (teacher/admin workflow)
 */
export const trainingUnitVMAssignmentApi = {
    /**
     * Get available VMs for assignment (from Proxmox).
     */
    async getAvailableVMs(): Promise<ProxmoxVMInfo[]> {
        const response = await client.get<ApiResponse<ProxmoxVMInfo[]>>(
            '/teaching/trainingUnit-assignments/available-vms',
        );
        return response.data.data;
    },

    /**
     * Assign a VM to a trainingUnit (teacher action).
     */
    async assign(data: AssignVMToTrainingUnitRequest): Promise<TrainingUnitVMAssignment> {
        const response = await client.post<ApiResponse<TrainingUnitVMAssignment>>(
            '/teaching/trainingUnit-assignments',
            data,
        );
        return response.data.data;
    },

    /**
     * Get teacher's VM assignments.
     */
    async getMyAssignments(): Promise<TrainingUnitVMAssignment[]> {
        const response = await client.get<ApiResponse<TrainingUnitVMAssignment[]>>(
            '/teaching/trainingUnit-assignments/my-assignments',
        );
        return response.data.data;
    },

    /**
     * Get assignment for a specific trainingUnit.
     */
    async getForTrainingUnit(trainingUnitId: number): Promise<TrainingUnitVMAssignment | null> {
        const response = await client.get<
            ApiResponse<TrainingUnitVMAssignment | null>
        >(`/teaching/trainingUnits/${trainingUnitId}/vm-assignment`);
        return response.data.data;
    },

    /**
     * Remove an assignment (teacher can remove pending, admin can remove any).
     */
    async remove(assignmentId: number): Promise<void> {
        await client.delete(`/teaching/trainingUnit-assignments/${assignmentId}`);
    },

    /**
     * Get pending assignments (admin).
     */
    async getPending(): Promise<TrainingUnitVMAssignment[]> {
        const response = await client.get<ApiResponse<TrainingUnitVMAssignment[]>>(
            '/admin/trainingUnit-assignments/pending',
        );
        return response.data.data;
    },

    /**
     * Approve an assignment (admin).
     */
    async approve(
        assignmentId: number,
        adminNotes?: string,
    ): Promise<TrainingUnitVMAssignment> {
        const response = await client.post<ApiResponse<TrainingUnitVMAssignment>>(
            `/admin/trainingUnit-assignments/${assignmentId}/approve`,
            { admin_notes: adminNotes },
        );
        return response.data.data;
    },

    /**
     * Reject an assignment (admin).
     */
    async reject(
        assignmentId: number,
        adminNotes: string,
    ): Promise<TrainingUnitVMAssignment> {
        const response = await client.post<ApiResponse<TrainingUnitVMAssignment>>(
            `/admin/trainingUnit-assignments/${assignmentId}/reject`,
            { admin_notes: adminNotes },
        );
        return response.data.data;
    },
};

