/**
 * Admin API Module
 * Handles all admin dashboard and management operations
 */

import client from './client';

// ==================== ANALYTICS ====================

export interface KPI {
    label: string;
    value: number;
    change_percent: number;
    trend: 'up' | 'down' | 'stable';
}

export interface HealthStatus {
    service: string;
    status: 'healthy' | 'degraded' | 'down';
    last_check: string;
    response_time_ms: number;
}

export interface AnalyticsDashboard {
    kpis: KPI[];
    health_status: HealthStatus[];
    active_users: number;
    total_revenue: number;
    training_path_approval_queue: number;
}

/**
 * Get admin dashboard
 */
export const getAdminDashboard = () =>
    client.get<AnalyticsDashboard>(`/admin/dashboard`);

/**
 * Get KPIs
 */
export const getKPIs = () => client.get<KPI[]>(`/admin/analytics/kpis`);

/**
 * Get system health status
 */
export const getHealthStatus = () =>
    client.get<HealthStatus[]>(`/admin/analytics/health`);

// ==================== COURSE APPROVALS ====================

export interface TrainingPathApproval {
    id: string;
    title: string;
    description: string;
    teacher_name: string;
    status: 'pending' | 'approved' | 'rejected' | 'draft' | 'pending_review';
    submitted_at: string;
    reviewed_at: string | null;
    category: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
    duration?: string;
    thumbnail?: string | null;
    thumbnail_url?: string | null;
    modules?: Array<{
        id?: string;
        title?: string;
        trainingUnits?: Array<{
            id?: string;
            title?: string;
            type?: string;
            duration?: string;
            content?: string;
        }>;
    }>;
    students?: number;
    rating: number;
    instructor?: { name: string } | string;
    adminFeedback?: string | null;
}

export interface PendingTrainingPathsResponse {
    data: TrainingPathApproval[];
    featured: TrainingPathApproval[];
}

/**
 * Get trainingPaths pending approval
 */
export const getPendingTrainingPaths = () =>
    client.get<PendingTrainingPathsResponse>(`/admin/trainingPaths`);

/**
 * Approve a trainingPath
 */
export const approveTrainingPath = (trainingPathId: string) =>
    client.post(`/admin/trainingPaths/${trainingPathId}/approve`, {});

/**
 * Reject a trainingPath
 */
export const rejectTrainingPath = (trainingPathId: string, reason: string) =>
    client.post(`/admin/trainingPaths/${trainingPathId}/reject`, { reason });

/**
 * Mark trainingPath as featured
 */
export const featureTrainingPath = (trainingPathId: string) =>
    client.post(`/admin/trainingPaths/${trainingPathId}/feature`, {});

/**
 * Unfeature trainingPath
 */
export const unfeatureTrainingPath = (trainingPathId: string) =>
    client.delete(`/admin/trainingPaths/${trainingPathId}/feature`);

/**
 * Update featured trainingPath order
 */
export const updateFeaturedTrainingPathOrder = (order: string[]) =>
    client.put(`/admin/trainingPaths/featured/order`, { order });

// ==================== VM ASSIGNMENTS ====================

export interface VMAssignment {
    id: string;
    training_unit_id: string;
    template_id: string;
    max_concurrent: number;
    status: 'pending' | 'approved' | 'rejected';
    requested_at: string;
    reviewed_at: string | null;
}

/**
 * Get pending VM assignments
 */
export const getPendingVMAssignments = () =>
    client.get<VMAssignment[]>(`/admin/vm-assignments`);

// ==================== PROXMOX SERVERS ====================

export interface ProxmoxServer {
    id: string;
    name: string;
    host: string;
    port: number;
    status: 'active' | 'inactive' | 'error';
    nodes_count: number;
    vms_count: number;
    created_at: string;
}

export interface Node {
    id: string;
    node_name: string;
    cpu_used: number;
    cpu_total: number;
    memory_used: number;
    memory_total: number;
    disk_used: number;
    disk_total: number;
    uptime_seconds: number;
    status: 'online' | 'offline';
}

/**
 * Get all Proxmox servers
 */
export const getProxmoxServers = () =>
    client.get<ProxmoxServer[]>(`/admin/proxmox-servers`);

/**
 * Get a specific Proxmox server
 */
export const getProxmoxServer = (serverId: string) =>
    client.get<ProxmoxServer>(`/admin/proxmox-servers/${serverId}`);

/**
 * Test Proxmox server connection
 */
export const testProxmoxConnection = (serverData: Partial<ProxmoxServer>) =>
    client.post(`/admin/proxmox-servers/test`, serverData);

/**
 * Create Proxmox server
 */
export const createProxmoxServer = (serverData: Partial<ProxmoxServer>) =>
    client.post<ProxmoxServer>(`/admin/proxmox-servers`, serverData);

/**
 * Update Proxmox server
 */
export const updateProxmoxServer = (
    serverId: string,
    serverData: Partial<ProxmoxServer>,
) =>
    client.patch<ProxmoxServer>(
        `/admin/proxmox-servers/${serverId}`,
        serverData,
    );

/**
 * Inactivate Proxmox server
 */
export const inactivateProxmoxServer = (serverId: string) =>
    client.post(`/admin/proxmox-servers/${serverId}/inactivate`, {});

/**
 * Delete Proxmox server
 */
export const deleteProxmoxServer = (serverId: string) =>
    client.delete(`/admin/proxmox-servers/${serverId}`);

/**
 * Sync nodes from Proxmox server
 */
export const syncProxmoxNodes = (serverId: string) =>
    client.post(`/admin/proxmox-servers/${serverId}/sync-nodes`, {});

// ==================== NODES ====================

/**
 * Get all nodes
 */
export const getNodes = () => client.get<Node[]>(`/admin/nodes`);

/**
 * Get VMs on a node
 */
export const getNodeVMs = (nodeName: string) =>
    client.get<Record<string, unknown>[]>(`/admin/nodes/${nodeName}/vms`);

/**
 * Start VM
 */
export const startVM = (nodeName: string, vmid: number) =>
    client.post(`/admin/nodes/${nodeName}/vms/${vmid}/start`, {});

/**
 * Stop VM
 */
export const stopVM = (nodeName: string, vmid: number) =>
    client.post(`/admin/nodes/${nodeName}/vms/${vmid}/stop`, {});

/**
 * Reboot VM
 */
export const rebootVM = (nodeName: string, vmid: number) =>
    client.post(`/admin/nodes/${nodeName}/vms/${vmid}/reboot`, {});

/**
 * Shutdown VM
 */
export const shutdownVM = (nodeName: string, vmid: number) =>
    client.post(`/admin/nodes/${nodeName}/vms/${vmid}/shutdown`, {});
