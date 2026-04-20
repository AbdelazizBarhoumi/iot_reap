/**
 * User Management Types
 */
export type UserRole = 'engineer' | 'teacher' | 'admin';
export interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    role_label: string;
    teacher_approved_at: string | null;
    teacher_approved_by: string | null;
    is_teacher_approved: boolean;
    requires_teacher_approval: boolean;
    email_verified_at: string | null;
    two_factor_enabled: boolean;
    suspended_at: string | null;
    suspended_reason: string | null;
    is_suspended: boolean;
    last_login_at: string | null;
    last_login_ip?: string;
    created_at: string;
    updated_at: string;
    // Optional relations
    training_path_enrollments?: TrainingPathEnrollmentSummary[];
    vm_sessions?: VMSessionSummary[];
}
export interface TrainingPathEnrollmentSummary {
    id: string;
    training_path_id: string;
    training_path_title: string;
    progress_percentage: number;
    enrolled_at: string;
    completed_at: string | null;
}
export interface VMSessionSummary {
    id: string;
    vm_name: string;
    status: string;
    started_at: string;
    ended_at: string | null;
}
export interface UserFilters {
    search: string;
    role: string;
    status: string;
}
export interface UserStats {
    total: number;
    by_role: Record<UserRole, number>;
    recently_active: AdminUser[];
}
export interface RoleOption {
    value: UserRole;
    label: string;
}
export interface PaginatedUsers {
    data: AdminUser[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

