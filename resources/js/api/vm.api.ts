/**
 * VM Session and Template API module.
 * Sprint 2 - Phase 2 (Updated: removed /api/ prefix, uses web routes)
 */

import type {
  ApiResponse,
  ConnectionProfile,
  CreateVMSessionRequest,
  CreateVMTemplateRequest,
  ExtendSessionRequest,
  GuacamoleTokenResponse,
  ProxmoxNode,
  ProxmoxVM,
  ProxmoxVMInfo,
  TerminateSessionRequest,
  VMSession,
  VMSnapshot,
  VMTemplate,
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
  async unwrap<T>(axiosPromise: Promise<any>): Promise<T> {
    const res = await axiosPromise;
    const payload = res.data;
    if (payload && typeof payload === 'object' && payload.data !== undefined) {
      return payload.data as T;
    }
    return payload as T;
  },

  /**
   * Get all sessions for the current user.
   * `index` returns a wrapped payload, so we still access `.data` directly.
   */
  async list(): Promise<VMSession[]> {
    const response = await client.get<ApiResponse<VMSession[]>>('/sessions');
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
  async terminate(sessionId: string, options?: TerminateSessionRequest): Promise<void> {
    await client.delete(`/sessions/${sessionId}`, { data: options });
  },

  /**
   * Extend a session by a number of minutes.
   */
  async extend(sessionId: string, data?: ExtendSessionRequest): Promise<VMSession> {
    return this.unwrap<VMSession>(
      client.post(`/sessions/${sessionId}/extend`, data ?? { minutes: 30 }),
    );
  },

  /**
   * Fetch a one-time Guacamole auth token for an active session.
   */
  async getGuacamoleToken(sessionId: string): Promise<GuacamoleTokenResponse> {
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
  async getAll(): Promise<{ rdp: ConnectionProfile[]; vnc: ConnectionProfile[]; ssh: ConnectionProfile[] }> {
    const response = await client.get<ApiResponse<{ rdp: ConnectionProfile[]; vnc: ConnectionProfile[]; ssh: ConnectionProfile[] }>>('/connection-preferences');
    return response.data.data;
  },

  /**
   * Get connection preferences for a specific protocol.
   */
  async getByProtocol(protocol: string): Promise<{ protocol: string; parameters: Record<string, string> }> {
    const response = await client.get<ApiResponse<{ protocol: string; parameters: Record<string, string> }>>(
      `/connection-preferences/${protocol}`,
    );
    return response.data.data;
  },

  /**
   * Save connection preferences for a specific protocol.
   */
  async save(protocol: string, parameters: Record<string, string | boolean | number>): Promise<{ protocol: string; parameters: Record<string, string> }> {
    const response = await client.put<ApiResponse<{ protocol: string; parameters: Record<string, string> }>>(
      `/connection-preferences/${protocol}`,
      { parameters },
    );
    return response.data.data;
  },
};

/**
 * VM Template API (public endpoints)
 */
export const vmTemplateApi = {
  /**
   * Get all active templates.
   */
  async list(): Promise<VMTemplate[]> {
    const response = await client.get<ApiResponse<VMTemplate[]>>('/admin/templates');
    return response.data.data;
  },

  /**
   * Get a specific template by ID.
   */
  async get(templateId: number): Promise<VMTemplate> {
    const response = await client.get<ApiResponse<VMTemplate>>(`/admin/templates/${templateId}`);
    return response.data.data;
  },
};

/**
 * Proxmox VM Browser API (available to all authenticated users)
 */
export const proxmoxVMApi = {
  /**
   * List all VMs from active Proxmox servers with node/server context.
   */
  async list(): Promise<ProxmoxVMInfo[]> {
    const response = await client.get<ApiResponse<ProxmoxVMInfo[]>>('/proxmox-vms');
    return response.data.data;
  },

  /**
   * List snapshots for a specific Proxmox VM (before session creation).
   */
  async listSnapshots(serverId: number, nodeId: number, vmid: number): Promise<VMSnapshot[]> {
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
    const response = await client.get<ApiResponse<ProxmoxNode[]>>('/admin/nodes');
    return response.data.data;
  },

  /**
   * Get all templates (admin view).
   */
  async getTemplates(): Promise<VMTemplate[]> {
    const response = await client.get<ApiResponse<VMTemplate[]>>('/admin/templates');
    return response.data.data;
  },

  /**
   * Create a new template.
   */
  async createTemplate(data: CreateVMTemplateRequest): Promise<VMTemplate> {
    const response = await client.post<VMTemplate>('/admin/templates', data);
    return response.data;
  },

  /**
   * Update a template.
   */
  async updateTemplate(templateId: number, data: Partial<CreateVMTemplateRequest>): Promise<VMTemplate> {
    const response = await client.put<VMTemplate>(`/admin/templates/${templateId}`, data);
    return response.data;
  },

  /**
   * Delete a template.
   */
  async deleteTemplate(templateId: number): Promise<void> {
    await client.delete(`/admin/templates/${templateId}`);
  },

  /**
   * Get all VMs on a node (running + stopped).
   */
  async getNodeVMs(nodeId: number): Promise<ProxmoxVM[]> {
    const response = await client.get<ApiResponse<ProxmoxVM[]>>(`/admin/nodes/${nodeId}/vms`);
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
