/**
 * VM Session and Template API module.
 * Sprint 2 - Phase 2
 */

import client from './client';
import type {
  ApiResponse,
  CreateVMSessionRequest,
  CreateVMTemplateRequest,
  ProxmoxNode,
  VMSession,
  VMTemplate,
} from '../types/vm.types';

/**
 * VM Session API
 */
export const vmSessionApi = {
  /**
   * Get all sessions for the current user.
   */
  async list(): Promise<VMSession[]> {
    const response = await client.get<ApiResponse<VMSession[]>>('/sessions');
    return response.data.data;
  },

  /**
   * Get a specific session by ID.
   */
  async get(sessionId: string): Promise<VMSession> {
    const response = await client.get<VMSession>(`/sessions/${sessionId}`);
    return response.data;
  },

  /**
   * Create a new VM session.
   */
  async create(data: CreateVMSessionRequest): Promise<VMSession> {
    const response = await client.post<VMSession>('/sessions', data);
    return response.data;
  },

  /**
   * Terminate/delete a session.
   */
  async terminate(sessionId: string): Promise<void> {
    await client.delete(`/sessions/${sessionId}`);
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
    const response = await client.get<VMTemplate>(`/admin/templates/${templateId}`);
    return response.data;
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
};
