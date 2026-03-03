/**
 * Camera TypeScript interfaces.
 * Sprint 4 — Camera streaming & PTZ control
 */

export type CameraType = 'usb' | 'ip' | 'esp32_cam';
export type CameraStatus = 'active' | 'inactive' | 'error';
export type CameraPTZDirection = 'up' | 'down' | 'left' | 'right';

/**
 * Stream URLs generated from the camera's stream_key.
 */
export interface CameraStreamUrls {
  hls: string;
  webrtc: string;
}

/**
 * Active control info — who currently controls this camera.
 */
export interface CameraControlInfo {
  session_id: string;
  acquired_at: string; // ISO 8601
}

/**
 * Camera resource as returned by the API.
 */
export interface Camera {
  id: number;
  robot_id: number;
  robot_name: string;
  name: string;
  stream_key: string;
  type: CameraType;
  type_label: string;
  status: CameraStatus;
  status_label: string;
  ptz_capable: boolean;
  stream_urls: CameraStreamUrls;
  control?: CameraControlInfo;
  is_controlled: boolean;
  created_at: string;
}

/**
 * API response wrapper for camera lists.
 */
export interface CameraListResponse {
  data: Camera[];
}

/**
 * API response for single camera operations.
 */
export interface CameraActionResponse {
  data: Camera;
  message: string;
}

/**
 * PTZ move request body.
 */
export interface CameraMoveRequest {
  direction: CameraPTZDirection;
}
