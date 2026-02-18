/**
 * VM Session and Template TypeScript interfaces.
 * Sprint 2 - Phase 2
 */

export type VMSessionStatus = 'pending' | 'provisioning' | 'active' | 'expiring' | 'expired' | 'failed' | 'terminated';
export type VMSessionType = 'ephemeral' | 'persistent';
export type VMTemplateOSType = 'windows' | 'linux' | 'kali';
export type VMTemplateProtocol = 'rdp' | 'vnc' | 'ssh';

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
  cpu_percent?: number;
  ram_used_mb?: number;
  ram_total_mb?: number;
  uptime_seconds?: number;
  created_at: string;
}

export interface CreateVMSessionRequest {
  template_id: number;
  duration_minutes: number;
  session_type: VMSessionType;
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
