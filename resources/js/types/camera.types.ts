/**
 * Camera TypeScript interfaces.
 * Sprint 4 — Camera streaming & PTZ control + Reservations
 */
export type CameraType = 'usb' | 'ip' | 'esp32_cam';
export type CameraStatus = 'active' | 'inactive' | 'error';
export type CameraPTZDirection = 'up' | 'down' | 'left' | 'right';
export type CameraReservationStatus =
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'cancelled'
    | 'active'
    | 'completed';
/**
 * Stream URLs generated from the camera's stream_key.
 */
export interface CameraStreamUrls {
    hls: string;
    webrtc: string;
}
/**
 * Stream quality settings for the camera.
 */
export interface CameraStreamSettings {
    width: number;
    height: number;
    framerate: number;
    input_format: string;
    resolution_label: string;
}
/**
 * Available resolution preset.
 */
export interface CameraResolutionPreset {
    width: number;
    height: number;
    label: string;
    recommended_framerate: number;
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
    robot_id: number | null;
    robot_name?: string;
    gateway_node_id: number | null;
    gateway_name?: string;
    usb_device_id: number | null;
    assigned_vm_id: number | null;
    is_usb_camera: boolean;
    source_name: string; // Robot name or Gateway name
    name: string;
    stream_key: string;
    type: CameraType;
    type_label: string;
    status: CameraStatus;
    status_label: string;
    ptz_capable: boolean;
    stream_settings: CameraStreamSettings;
    stream_urls: CameraStreamUrls;
    control?: CameraControlInfo;
    is_controlled: boolean;
    has_active_reservation: boolean;
    /** reservation id overlapping now, present when `has_active_reservation` is true */
    active_reservation_id?: number;
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
// ─── Camera Reservation Types ───
/**
 * Camera reservation as returned by the API.
 */
export interface CameraReservation {
    id: number;
    camera_id: number;
    user_id: string;
    approved_by: string | null;
    status: CameraReservationStatus;
    status_label: string;
    status_color: string;
    requested_start_at: string;
    requested_end_at: string;
    approved_start_at: string | null;
    approved_end_at: string | null;
    effective_start_at: string | null;
    effective_end_at: string | null;
    duration_minutes: number;
    actual_start_at: string | null;
    actual_end_at: string | null;
    purpose: string | null;
    reason: string | null;
    is_admin_block: boolean;
    admin_notes?: string;
    priority: number;
    is_pending: boolean;
    is_approved: boolean;
    is_active: boolean;
    can_modify: boolean;
    camera?: Camera;
    user?: {
        id: string;
        name: string;
        email: string;
    };
    approver?: {
        id: string;
        name: string;
    } | null;
    created_at: string;
    updated_at: string;
}
/**
 * Request payload for creating a camera reservation.
 */
export interface CreateCameraReservationRequest {
    camera_id: number;
    start_at: string;
    end_at: string;
    purpose?: string;
}
/**
 * Request payload for admin approving a camera reservation.
 */
export interface ApproveCameraReservationRequest {
    approved_start_at?: string;
    approved_end_at?: string;
    admin_notes?: string;
}
/**
 * Request payload for admin creating a camera block.
 */
export interface CreateAdminCameraBlockRequest {
    camera_id: number;
    start_at: string;
    end_at: string;
    notes?: string;
}

