/**
 * USB/IP Hardware Gateway API module.
 */

import type {
  AttachDeviceRequest,
  CreateGatewayNodeRequest,
  CreateReservationRequest,
  ApproveReservationRequest,
  CreateAdminBlockRequest,
  UpdateGatewayNodeRequest,
  DiscoverySummary,
  GatewayNode,
  RunningVm,
  UsbDevice,
  UsbDeviceQueueEntry,
  UsbDeviceReservation,
  SessionHardwareSummary,
} from '../types/hardware.types';
import client from './client';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface ActionResponse {
  success: boolean;
  message: string;
  device?: UsbDevice;
  node?: GatewayNode;
  summary?: DiscoverySummary;
}

/**
 * Hardware Gateway API
 */
export const hardwareApi = {
  /**
   * Get all gateway nodes with their devices.
   */
  async getNodes(): Promise<GatewayNode[]> {
    const response = await client.get<ApiResponse<GatewayNode[]>>('/hardware');
    return response.data.data;
  },

  /**
   * Get all USB devices across all nodes.
   */
  async getDevices(): Promise<UsbDevice[]> {
    const response = await client.get<ApiResponse<UsbDevice[]>>('/hardware/devices');
    return response.data.data;
  },

  /**
   * Refresh device list from all gateway nodes.
   */
  async refreshAll(): Promise<ActionResponse> {
    const response = await client.post<ActionResponse>('/hardware/refresh');
    return response.data;
  },

  /**
   * Refresh devices from a specific gateway node.
   */
  async refreshNode(nodeId: number): Promise<ActionResponse> {
    const response = await client.post<ActionResponse>(`/hardware/nodes/${nodeId}/refresh`);
    return response.data;
  },

  /**
   * Check health of a specific gateway node.
   */
  async checkHealth(nodeId: number): Promise<ActionResponse> {
    const response = await client.post<ActionResponse>(`/hardware/nodes/${nodeId}/health`);
    return response.data;
  },

  /**
   * Bind a USB device for USB/IP sharing.
   */
  async bindDevice(deviceId: number): Promise<ActionResponse> {
    const response = await client.post<ActionResponse>(`/hardware/devices/${deviceId}/bind`);
    return response.data;
  },

  /**
   * Unbind a USB device from USB/IP sharing.
   */
  async unbindDevice(deviceId: number): Promise<ActionResponse> {
    const response = await client.post<ActionResponse>(`/hardware/devices/${deviceId}/unbind`);
    return response.data;
  },

  /**
   * Attach a USB device to a VM or session.
   */
  async attachDevice(deviceId: number, data: AttachDeviceRequest): Promise<ActionResponse> {
    const response = await client.post<ActionResponse>(`/hardware/devices/${deviceId}/attach`, data);
    return response.data;
  },

  /**
   * Detach a USB device from a VM.
   */
  async detachDevice(deviceId: number): Promise<ActionResponse> {
    const response = await client.post<ActionResponse>(`/hardware/devices/${deviceId}/detach`);
    return response.data;
  },

  /**
   * Cancel a pending USB device attachment.
   */
  async cancelPendingAttachment(deviceId: number): Promise<ActionResponse> {
    const response = await client.post<ActionResponse>(`/hardware/devices/${deviceId}/cancel-pending`);
    return response.data;
  },

  // Admin endpoints

  /**
   * Create a new gateway node (admin only).
   */
  async createNode(data: CreateGatewayNodeRequest): Promise<ActionResponse> {
    const response = await client.post<ActionResponse>('/admin/hardware/nodes', data);
    return response.data;
  },

  /**
   * Delete a gateway node (admin only).
   */
  async deleteNode(nodeId: number): Promise<ActionResponse> {
    const response = await client.delete<ActionResponse>(`/admin/hardware/nodes/${nodeId}`);
    return response.data;
  },

  /**
   * Discover gateway nodes from Proxmox LXC containers (admin only).
   */
  async discoverGateways(): Promise<ActionResponse & { gateways?: GatewayNode[] }> {
    const response = await client.post<ActionResponse & { gateways?: GatewayNode[] }>('/admin/hardware/discover');
    return response.data;
  },

  /**
   * Refresh online status of all known gateways.
   */
  async refreshGatewayStatus(): Promise<ActionResponse & { data?: GatewayNode[] }> {
    const response = await client.post<ActionResponse & { data?: GatewayNode[] }>('/admin/hardware/status');
    return response.data;
  },

  /**
   * Update a gateway node (admin only).
   */
  async updateNode(nodeId: number, data: UpdateGatewayNodeRequest): Promise<ActionResponse> {
    const response = await client.put<ActionResponse>(`/admin/hardware/nodes/${nodeId}`, data);
    return response.data;
  },

  /**
   * Verify/unverify a gateway node (admin only).
   */
  async verifyNode(nodeId: number, verified: boolean): Promise<ActionResponse> {
    const response = await client.post<ActionResponse>(`/admin/hardware/nodes/${nodeId}/verify`, { is_verified: verified });
    return response.data;
  },

  /**
   * Get list of running VMs from all Proxmox servers (admin only).
   * Used for selecting a target VM when attaching devices from the infrastructure page.
   */
  async getRunningVms(): Promise<RunningVm[]> {
    const response = await client.get<ApiResponse<RunningVm[]>>('/admin/hardware/running-vms');
    return response.data.data;
  },
};

/**
 * Session Hardware API - for session-scoped device management
 */
export const sessionHardwareApi = {
  /**
   * Get hardware summary for a session (attached devices, queue, available).
   */
  async getSummary(sessionId: string): Promise<SessionHardwareSummary> {
    const response = await client.get<ApiResponse<SessionHardwareSummary>>(`/sessions/${sessionId}/hardware`);
    return response.data.data;
  },

  /**
   * Get available devices for a session.
   */
  async getAvailableDevices(sessionId: string): Promise<UsbDevice[]> {
    const response = await client.get<ApiResponse<UsbDevice[]>>(`/sessions/${sessionId}/hardware/available`);
    return response.data.data;
  },

  /**
   * Attach a device to a session.
   */
  async attachDevice(sessionId: string, deviceId: number): Promise<ActionResponse> {
    const response = await client.post<ActionResponse>(`/sessions/${sessionId}/hardware/devices/${deviceId}/attach`);
    return response.data;
  },

  /**
   * Detach a device from a session.
   */
  async detachDevice(sessionId: string, deviceId: number): Promise<ActionResponse> {
    const response = await client.post<ActionResponse>(`/sessions/${sessionId}/hardware/devices/${deviceId}/detach`);
    return response.data;
  },

  /**
   * Join the queue for a device.
   */
  async joinQueue(sessionId: string, deviceId: number): Promise<ActionResponse & { queue_entry?: UsbDeviceQueueEntry }> {
    const response = await client.post<ActionResponse & { queue_entry?: UsbDeviceQueueEntry }>(`/sessions/${sessionId}/hardware/devices/${deviceId}/queue/join`);
    return response.data;
  },

  /**
   * Leave the queue for a device.
   */
  async leaveQueue(sessionId: string, deviceId: number): Promise<ActionResponse> {
    const response = await client.post<ActionResponse>(`/sessions/${sessionId}/hardware/devices/${deviceId}/queue/leave`);
    return response.data;
  },
};

/**
 * Reservation API - for user reservation requests
 */
export const reservationApi = {
  /**
   * Get user's reservations.
   */
  async getMyReservations(): Promise<UsbDeviceReservation[]> {
    const response = await client.get<ApiResponse<UsbDeviceReservation[]>>('/reservations');
    return response.data.data;
  },

  /**
   * Create a new reservation request.
   */
  async create(data: CreateReservationRequest): Promise<ActionResponse & { reservation?: UsbDeviceReservation }> {
    const response = await client.post<ActionResponse & { reservation?: UsbDeviceReservation }>('/reservations', data);
    return response.data;
  },

  /**
   * Cancel a reservation.
   */
  async cancel(reservationId: number): Promise<ActionResponse> {
    const response = await client.post<ActionResponse>(`/reservations/${reservationId}/cancel`);
    return response.data;
  },
};

/**
 * Admin Reservation API - for admin approval and device blocking
 */
export const adminReservationApi = {
  /**
   * Get all pending reservations.
   */
  async getPending(): Promise<UsbDeviceReservation[]> {
    const response = await client.get<ApiResponse<UsbDeviceReservation[]>>('/admin/reservations/pending');
    return response.data.data;
  },

  /**
   * Get all reservations (with optional status filter).
   */
  async getAll(status?: string): Promise<UsbDeviceReservation[]> {
    const params = status ? { status } : {};
    const response = await client.get<ApiResponse<UsbDeviceReservation[]>>('/admin/reservations', { params });
    return response.data.data;
  },

  /**
   * Approve a reservation.
   */
  async approve(reservationId: number, data: ApproveReservationRequest): Promise<ActionResponse> {
    const response = await client.post<ActionResponse>(`/admin/reservations/${reservationId}/approve`, data);
    return response.data;
  },

  /**
   * Reject a reservation.
   */
  async reject(reservationId: number, adminNotes?: string): Promise<ActionResponse> {
    const response = await client.post<ActionResponse>(`/admin/reservations/${reservationId}/reject`, { admin_notes: adminNotes });
    return response.data;
  },

  /**
   * Create an admin block for a device.
   */
  async createBlock(data: CreateAdminBlockRequest): Promise<ActionResponse & { reservation?: UsbDeviceReservation }> {
    const response = await client.post<ActionResponse & { reservation?: UsbDeviceReservation }>('/admin/reservations/block', data);
    return response.data;
  },
};
