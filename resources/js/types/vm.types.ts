/**
 * VM Session and Template TypeScript interfaces.
 * Sprint 2 - Phase 2
 */
export type VMSessionStatus =
    | 'pending'
    | 'provisioning'
    | 'active'
    | 'expiring'
    | 'expired'
    | 'failed'
    | 'terminated';
export type VMProtocol = 'rdp' | 'vnc' | 'ssh';

/** @deprecated Use VMProtocol instead */
export type VMTemplateProtocol = VMProtocol;

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
export interface VMSession {
    id: string;
    status: VMSessionStatus;
    vm_id: number; // proxmox VMID
    // protocol stored directly on session
    protocol: VMProtocol;
    connection_profile_name?: string | null;
    node_name: string;
    expires_at: string;
    time_remaining_seconds: number;
    vm_ip_address: string | null;
    guacamole_connection_id: string | null;
    guacamole_url: string | null;
    created_at: string;
    user?: {
        id?: string;
        name: string;
        email?: string;
    };
    template?: { name: string; id: number };
    node?: { node_name: string; name: string; id: number };
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
    cpu_usage: number; // percentage (0-100)
    mem_usage: number; // bytes used
    maxmem: number; // total bytes
    uptime: number; // seconds
    template?: number; // template VMID if cloned
    pid?: number | null; // process ID if running
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
    vmid: number;
    node_id: number;
    training_unit_id?: number;
    // optional descriptive name; backend allows it to be null
    vm_name?: string;
    os_type?: string;
    protocol?: string;
    duration_minutes: number;
    proxmox_server_id?: number;
    username?: string;
    password?: string;
    connection_preference_protocol?: string;
    connection_preference_profile?: string;
    return_snapshot?: string;
    use_existing?: boolean;
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

// ─────────────────────────────────────────────────────────────────────────────
// TrainingUnit VM Assignment Types
// ─────────────────────────────────────────────────────────────────────────────

export type TrainingUnitVMAssignmentStatus =
    | 'pending'
    | 'approved'
    | 'rejected';

/**
 * TrainingUnit VM Assignment - teacher assigns a VM to a trainingUnit, admin approves.
 */
export interface TrainingUnitVMAssignment {
    id: number;
    training_unit_id: number;
    vm_id: number;
    node_id: number;
    vm_name: string | null;
    status: TrainingUnitVMAssignmentStatus;
    status_label: string;
    status_color: 'yellow' | 'green' | 'red';
    teacher_notes: string | null;
    admin_feedback: string | null;
    is_pending: boolean;
    is_approved: boolean;
    is_rejected: boolean;
    trainingUnit?: {
        id: number;
        title: string;
        type: string;
        module?: {
            id: number;
            title: string;
            trainingPath?: {
                id: number;
                title: string;
                instructor?: {
                    id: string;
                    name: string;
                };
            };
        };
    };
    node?: {
        id: number;
        name: string;
        hostname: string;
        server?: {
            id: number;
            name: string;
        };
    };
    assigned_by?: {
        id: string;
        name: string;
    };
    approved_by?: {
        id: string;
        name: string;
    } | null;
    created_at: string;
    updated_at: string;
}

/**
 * Request to assign a VM to a trainingUnit.
 */
export interface AssignVMToTrainingUnitRequest {
    training_unit_id: number;
    vm_id: number;
    node_id: number;
    vm_name: string;
    teacher_notes?: string;
}

export interface VMReservation {
    id: number;
    node_id: number;
    node_name?: string | null;
    vm_id: number;
    vm_name: string | null;
    user_id: string;
    approved_by: string | null;
    status:
        | 'pending'
        | 'approved'
        | 'rejected'
        | 'cancelled'
        | 'active'
        | 'completed';
    status_label: string;
    requested_start_at: string;
    requested_end_at: string;
    approved_start_at: string | null;
    approved_end_at: string | null;
    purpose: string | null;
    admin_notes: string | null;
    training_path_id: number | null;
    is_backup_for_training_path: boolean;
    training_path?: {
        id: number;
        title: string;
    } | null;
    user?: {
        id: string;
        name: string;
        email?: string;
    };
    approver?: {
        id: string;
        name: string;
    } | null;
    created_at: string;
    updated_at: string;
}

export interface CreateVMReservationRequest {
    node_id: number;
    vm_id: number;
    vm_name?: string;
    training_path_id?: number;
    start_at: string;
    end_at: string;
    purpose?: string;
}

/**
 * VM info for trainingUnit display (after assignment is approved).
 */
export interface TrainingUnitVMInfo {
    vm_id: number;
    node_id: number;
    vm_name: string | null;
}
