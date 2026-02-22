/**
 * VM Session and Template TypeScript interfaces.
 * Sprint 2 - Phase 2
 */

export type VMSessionStatus = 'pending' | 'provisioning' | 'active' | 'expiring' | 'expired' | 'failed' | 'terminated';
export type VMSessionType = 'ephemeral' | 'persistent';
export type VMTemplateOSType = 'windows' | 'linux' | 'kali';
export type VMTemplateProtocol = 'rdp' | 'vnc' | 'ssh';

/**
 * Connection profile for Guacamole preferences (multi-profile support).
 */
export interface ConnectionProfile {
  profile_name: string;
  is_default: boolean;
  parameters: Record<string, string>;
}

/**
 * Connection profiles grouped by protocol.
 */
export interface ConnectionProfilesResponse {
  rdp: ConnectionProfile[];
  vnc: ConnectionProfile[];
  ssh: ConnectionProfile[];
}

export interface VMTemplate {
  id: number;
  name: string;
  os_type: VMTemplateOSType;
  protocol: VMTemplateProtocol;
  cpu_cores: number;
  ram_mb: number;
  disk_gb: number;
  tags: string[];
  is_active: boolean;
  created_at: string;
}

export interface VMSession {
  id: string;
  status: VMSessionStatus;
  session_type: VMSessionType;
  template: {
    id: number;
    name: string;
    os_type: VMTemplateOSType;
    protocol: VMTemplateProtocol;
    cpu_cores: number;
    ram_mb: number;
    disk_gb: number;
  };
  node_name: string;
  expires_at: string;
  time_remaining_seconds: number;
  vm_ip_address: string | null;
  guacamole_connection_id: string | null;
  guacamole_url: string | null;
  created_at: string;
}

export interface ProxmoxNode {
  id: number;
  name: string;
  hostname: string;
  status: 'online' | 'offline' | 'maintenance';
  max_vms: number;
  active_vm_count: number;
  // Indicates whether the parent Proxmox server/cluster is active (admin-only flag)
  server_active?: boolean;
  // Human-friendly name of the server/cluster (if available)
  server_name?: string | null;
  cpu_percent?: number;
  ram_used_mb?: number;
  ram_total_mb?: number;
  uptime_seconds?: number;
  created_at: string;
}

/**
 * Proxmox Server (Cluster) interface.
 * Sprint 2.5 - Multi-server support
 */
export interface ProxmoxServer {
  id: number;
  name: string;
  description: string | null;
  host: string;
}

/**
 * Full Proxmox Server response for admin views.
 */
export interface ProxmoxServerAdmin extends ProxmoxServer {
  port: number;
  realm: string;
  verify_ssl: boolean;
  is_active: boolean;
  api_url: string;
  nodes_count?: number;
  active_sessions_count?: number;
  total_sessions_count?: number;
  created_by_user?: {
    id: string;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Proxmox VM from direct API (not our VMSession).
 * Represents actual VMs on a Proxmox node.
 */
export interface ProxmoxVM {
  vmid: number;
  name: string;
  status: 'running' | 'stopped' | 'paused';
  cpu_usage: number;          // percentage (0-100)
  mem_usage: number;          // bytes used
  maxmem: number;             // total bytes
  uptime: number;             // seconds
  template?: number;          // template VMID if cloned
  pid?: number | null;        // process ID if running
}

/**
 * VM from the Proxmox browser endpoint (GET /api/proxmox-vms).
 * Lightweight listing enriched with node/server context.
 */
export interface ProxmoxVMInfo {
  vmid: number;
  name: string;
  status: string;
  maxmem: number;
  cpus: number;
  maxdisk: number;
  uptime: number;
  is_template: boolean;
  node_id: number;
  node_name: string;
  server_id: number;
  server_name: string;
}

export interface CreateVMSessionRequest {
  template_id?: number;
  vmid?: number;
  node_id?: number;
  vm_name?: string;
  os_type?: string;
  protocol?: string;
  duration_minutes: number;
  session_type: VMSessionType;
  proxmox_server_id?: number;
  username?: string;
  password?: string;
  connection_preference_protocol?: string;
  return_snapshot?: string;
  // when true, the session will connect to the supplied VMID directly
  // instead of cloning it as a new ephemeral VM. only used by dashboard.
  use_existing?: boolean;
}

export interface CreateVMTemplateRequest {
  name: string;
  os_type: VMTemplateOSType;
  protocol: VMTemplateProtocol;
  template_vmid: number;
  cpu_cores: number;
  ram_mb: number;
  disk_gb: number;
  tags?: string[];
  is_active?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

/**
 * Guacamole token response from GET /api/sessions/{id}/guacamole-token
 */
export interface GuacamoleTokenResponse {
  token: string;
  viewer_url: string;
  tunnel_url: string;
  connection_id: string;
  data_source: string;
  expires_in: number;
  guacamole_url: string;
}

/**
 * VM snapshot from GET /api/sessions/{id}/snapshots
 */
export interface VMSnapshot {
  name: string;
  description: string;
  snaptime?: number;
  parent?: string;
}
/**
 * Connection preference configuration per protocol.
 */
export interface ConnectionPreference {
  protocol: string;
  parameters: Record<string, string | boolean | number>;
}
/**
 * Extend session request body.
 */
export interface ExtendSessionRequest {
  minutes?: number;
}

/**
 * Terminate session request body.
 */
export interface TerminateSessionRequest {
  stop_vm?: boolean;
  return_snapshot?: string | null;
}
