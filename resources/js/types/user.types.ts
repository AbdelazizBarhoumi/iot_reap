/**
 * User Management Types
 */
export type UserRole = 'engineer' | 'teacher' | 'admin' | 'security_officer';
export interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    role_label: string;
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
    course_enrollments?: CourseEnrollmentSummary[];
    vm_sessions?: VMSessionSummary[];
}
export interface CourseEnrollmentSummary {
    id: string;
    course_id: string;
    course_title: string;
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

