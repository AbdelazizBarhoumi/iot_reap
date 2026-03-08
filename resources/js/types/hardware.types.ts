/**
 * USB/IP Hardware Gateway TypeScript interfaces.
 */

export type UsbDeviceStatus = 'available' | 'bound' | 'attached' | 'disconnected' | 'pending_attach';
export type UsbReservationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'active' | 'completed';

/**
 * Gateway node (USB/IP agent container).
 */
export interface GatewayNode {
  id: number;
  name: string;
  ip: string;
  port: number;
  online: boolean;
  is_verified: boolean;
  proxmox_vmid: number | null;
  proxmox_node: string | null;
  proxmox_camera_api_url: string | null;
  description: string | null;
  last_seen_at: string | null;
  devices_count: number;
  devices?: UsbDevice[];
  created_at: string;
  updated_at: string;
}

/**
 * USB device connected to a gateway node.
 */
export interface UsbDevice {
  id: number;
  gateway_node_id: number;
  gateway_node_name?: string;
  gateway_node_ip?: string;
  busid: string;
  vendor_id: string;
  product_id: string;
  name: string;
  is_camera: boolean;
  has_camera_registration: boolean;
  camera_id: number | null;
  status: UsbDeviceStatus;
  status_label: string;
  attached_to: string | null;
  attached_vm_ip: string | null;
  attached_session_id: string | null;
  // Pending attachment fields (for when VM was not running at attach time)
  pending_vmid: number | null;
  pending_node: string | null;
  pending_server_id: number | null;
  pending_vm_ip: string | null;
  pending_vm_name: string | null;
  pending_since: string | null;
  queue_count: number;
  has_active_reservation: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Queue entry for a USB device.
 */
export interface UsbDeviceQueueEntry {
  id: number;
  usb_device_id: number;
  session_id: string;
  user_id: string;
  position: number;
  queued_at: string | null;
  notified_at: string | null;
  is_notified: boolean;
  is_next: boolean;
  device?: UsbDevice;
  user?: { id: string; name: string };
  created_at: string;
}

/**
 * User info for reservations.
 */
export interface ReservationUser {
  id: string;
  name: string;
  email: string;
}

/**
 * Reservation for a USB device.
 */
export interface UsbDeviceReservation {
  id: number;
  usb_device_id: number;
  user_id: string;
  approved_by: string | null;
  status: UsbReservationStatus;
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
  // convenience flags returned by API
  is_admin_block: boolean;
  // alias for TypeScript consumers that expected a `reason` property
  reason?: string | null;
  admin_notes: string | null;
  priority: number;
  is_pending: boolean;
  is_approved: boolean;
  is_active: boolean;
  can_modify: boolean;
  device?: UsbDevice;
  user?: ReservationUser;
  approver?: ReservationUser | null;
  created_at: string;
  updated_at: string;
}

/**
 * Response from device discovery.
 */
export interface DiscoverySummary {
  nodes_checked: number;
  nodes_online: number;
  devices_found: number;
  devices_removed: number;
}

/**
 * Request payload for creating a gateway node.
 */
export interface CreateGatewayNodeRequest {
  name: string;
  ip: string;
  port?: number;
}

/**
 * Request payload for attaching a device.
 * For session-based attachment: provide session_id
 * For direct VM attachment (admin): provide vmid, node, server_id, vm_ip
 */
export interface AttachDeviceRequest {
  session_id?: string;
  vm_ip?: string;
  vm_name?: string;
  vmid?: number;
  node?: string;       // Proxmox node name
  server_id?: number;  // ProxmoxServer id
}

/**
 * Request payload for creating a reservation.
 */
export interface CreateReservationRequest {
  usb_device_id: number;
  start_at: string;
  end_at: string;
  purpose?: string;
}

/**
 * Request payload for admin approving a reservation.
 */
export interface ApproveReservationRequest {
  approved_start_at?: string;
  approved_end_at?: string;
  admin_notes?: string;
}

/**
 * Request payload for admin creating a device block.
 */
export interface CreateAdminBlockRequest {
  usb_device_id: number;
  start_at: string;
  end_at: string;
  notes?: string;
}

/**
 * Request payload for updating a gateway node.
 */
export interface UpdateGatewayNodeRequest {
  name?: string;
  description?: string;
}

/**
 * Available device entry returned by the session hardware endpoint.
 * Contains device data plus attach eligibility info.
 */
export interface AvailableDeviceEntry {
  device: UsbDevice;
  can_attach: boolean;
  is_attached_to_me: boolean;
  queue_position: number | null;
  queue_length: number;
  reason: string | null;
  gateway_verified?: boolean;
}

/**
 * Session hardware summary for the session page.
 */
export interface SessionHardwareSummary {
  attached_devices: UsbDevice[];
  queue_entries: UsbDeviceQueueEntry[];
  available_devices: AvailableDeviceEntry[];
}

/**
 * Running VM retrieved from Proxmox for device attachment.
 * Used in the admin hardware page to select a target VM.
 */
export interface RunningVm {
  vmid: number;
  name: string;
  ip_address: string | null;
  node: string;
  server_id: number;
  server_name: string;
  display_name: string;
}
