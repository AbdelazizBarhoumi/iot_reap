/**
 * Camera API module.
 * Sprint 4 — Camera streaming & PTZ control + Reservations
 */

import type {
  Camera,
  CameraActionResponse,
  CameraListResponse,
  CameraPTZDirection,
  CameraReservation,
  CameraResolutionPreset,
  CreateCameraReservationRequest,
  ApproveCameraReservationRequest,
  CreateAdminCameraBlockRequest,
} from '../types/camera.types';
import client from './client';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface ActionResponse {
  success: boolean;
  message: string;
  data?: CameraReservation;
}

/**
 * Session Camera API — all camera operations scoped to a VM session.
 */
export const cameraApi = {
  /**
   * List all cameras with their control state for a session.
   */
  async list(sessionId: string): Promise<Camera[]> {
    const response = await client.get<CameraListResponse>(
      `/sessions/${sessionId}/cameras`,
    );
    return response.data.data;
  },

  /**
   * Get a single camera detail.
   */
  async get(sessionId: string, cameraId: number): Promise<Camera> {
    const response = await client.get<CameraActionResponse>(
      `/sessions/${sessionId}/cameras/${cameraId}`,
    );
    return response.data.data;
  },

  /**
   * Acquire exclusive PTZ control of a camera.
   */
  async acquireControl(sessionId: string, cameraId: number): Promise<Camera> {
    const response = await client.post<CameraActionResponse>(
      `/sessions/${sessionId}/cameras/${cameraId}/control`,
    );
    return response.data.data;
  },

  /**
   * Release PTZ control of a camera.
   */
  async releaseControl(sessionId: string, cameraId: number): Promise<Camera> {
    const response = await client.delete<CameraActionResponse>(
      `/sessions/${sessionId}/cameras/${cameraId}/control`,
    );
    return response.data.data;
  },

  /**
   * Send a PTZ move command to a controlled camera.
   */
  async move(sessionId: string, cameraId: number, direction: CameraPTZDirection): Promise<void> {
    await client.post(`/sessions/${sessionId}/cameras/${cameraId}/move`, {
      direction,
    });
  },

  /**
   * Get available resolution presets for cameras.
   */
  async getResolutions(sessionId: string): Promise<CameraResolutionPreset[]> {
    const response = await client.get<ApiResponse<CameraResolutionPreset[]>>(
      `/sessions/${sessionId}/cameras/resolutions`,
    );
    return response.data.data;
  },

  /**
   * Change camera resolution. Pass 'auto' or a specific preset.
   * Restarts the stream with new settings.
   */
  async changeResolution(
    sessionId: string,
    cameraId: number,
    preset: CameraResolutionPreset | 'auto',
  ): Promise<Camera> {
    const body = preset === 'auto'
      ? { mode: 'auto' }
      : {
          mode: 'manual',
          width: preset.width,
          height: preset.height,
          framerate: preset.recommended_framerate,
        };
    const response = await client.put<CameraActionResponse>(
      `/sessions/${sessionId}/cameras/${cameraId}/resolution`,
      body,
    );
    return response.data.data;
  },
};

// ─── Camera Reservation API (User-facing) ───

export const cameraReservationApi = {
  /**
   * List current user's camera reservations.
   */
  async getMyReservations(): Promise<CameraReservation[]> {
    const response = await client.get<ApiResponse<CameraReservation[]>>('/camera-reservations');
    return response.data.data;
  },

  /**
   * Create a new camera reservation request.
   */
  async create(data: CreateCameraReservationRequest): Promise<ActionResponse> {
    const response = await client.post<ActionResponse>('/camera-reservations', data);
    return response.data;
  },

  /**
   * Cancel a camera reservation.
   */
  async cancel(reservationId: number): Promise<ActionResponse> {
    const response = await client.post<ActionResponse>(`/camera-reservations/${reservationId}/cancel`);
    return response.data;
  },

  /**
   * Get reservations for a specific camera (calendar view).
   */
  async getCameraCalendar(cameraId: number, start?: string, end?: string): Promise<CameraReservation[]> {
    const params: Record<string, string> = {};
    if (start) params.start = start;
    if (end) params.end = end;
    const response = await client.get<ApiResponse<CameraReservation[]>>(
      `/camera-reservations/cameras/${cameraId}/calendar`,
      { params },
    );
    return response.data.data;
  },
};

// ─── Admin Camera API ───

export const adminCameraApi = {
  /**
   * List all cameras with reservation info (admin).
   */
  async getCameras(): Promise<Camera[]> {
    const response = await client.get<ApiResponse<Camera[]>>('/admin/cameras');
    return response.data.data;
  },

  /**
   * Get all camera reservations with optional status filter.
   */
  async getReservations(status?: string): Promise<CameraReservation[]> {
    const params = status ? { status } : {};
    const response = await client.get<ApiResponse<CameraReservation[]>>(
      '/admin/cameras/reservations',
      { params },
    );
    return response.data.data;
  },

  /**
   * Get pending camera reservations.
   */
  async getPending(): Promise<CameraReservation[]> {
    const response = await client.get<ApiResponse<CameraReservation[]>>('/admin/cameras/reservations/pending');
    return response.data.data;
  },

  /**
   * Get upcoming camera reservations.
   */
  async getUpcoming(): Promise<{ active: CameraReservation[]; upcoming: CameraReservation[] }> {
    const response = await client.get<{ active: CameraReservation[]; upcoming: CameraReservation[] }>(
      '/admin/cameras/reservations/upcoming',
    );
    return response.data;
  },

  /**
   * Approve a camera reservation.
   */
  async approve(reservationId: number, data: ApproveCameraReservationRequest): Promise<ActionResponse> {
    const response = await client.post<ActionResponse>(
      `/admin/cameras/reservations/${reservationId}/approve`,
      data,
    );
    return response.data;
  },

  /**
   * Reject a camera reservation.
   */
  async reject(reservationId: number, adminNotes?: string): Promise<ActionResponse> {
    const response = await client.post<ActionResponse>(
      `/admin/cameras/reservations/${reservationId}/reject`,
      { admin_notes: adminNotes },
    );
    return response.data;
  },

  /**
   * Create an admin block for a camera.
   */
  async createBlock(data: CreateAdminCameraBlockRequest): Promise<ActionResponse> {
    const response = await client.post<ActionResponse>('/admin/cameras/reservations/block', data);
    return response.data;
  },

  /**
   * Cancel a reservation. Admin convenience wrapper around the user-facing endpoint.
   */
  async cancelReservation(reservationId: number): Promise<ActionResponse> {
    const response = await client.post<ActionResponse>(
      `/camera-reservations/${reservationId}/cancel`
    );
    return response.data;
  },
};
