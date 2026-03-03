/**
 * Camera API module.
 * Sprint 4 — Camera streaming & PTZ control
 */

import type {
  Camera,
  CameraActionResponse,
  CameraListResponse,
  CameraPTZDirection,
} from '../types/camera.types';
import client from './client';

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
};
