import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import type { User } from '@/types/auth';
type UserRole = 'engineer' | 'teacher' | 'admin' | 'security_officer';
interface HasRoleProps {
    children: ReactNode;
    /** Required role(s). Can be a single role or array. */
    roles: UserRole | UserRole[];
    /** Optional content to show if user lacks role */
    fallback?: ReactNode;
}
/**
 * Conditionally render content based on user role.
 * Does NOT redirect - just hides/shows content.
 *
 * @example
 * ```tsx
 * <HasRole roles="admin">
 *   <DeleteButton />
 * </HasRole>
 *
 * <HasRole roles={['admin', 'teacher']} fallback={<span>View only</span>}>
 *   <EditButton />
 * </HasRole>
 * ```
 */
export function HasRole({ children, roles, fallback = null }: HasRoleProps) {
    const { auth } = usePage().props as { auth: { user: User | null } };
    const user = auth?.user;
    if (!user) {
        return <>{fallback}</>;
    }
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!allowedRoles.includes(user.role)) {
        return <>{fallback}</>;
    }
    return <>{children}</>;
}
/**
 * Check if the current user is an admin.
 */
export function IsAdmin({
    children,
    fallback = null,
}: Omit<HasRoleProps, 'roles'>) {
    return (
        <HasRole roles="admin" fallback={fallback}>
            {children}
        </HasRole>
    );
}
/**
 * Check if the current user is a teacher.
 */
export function IsTeacher({
    children,
    fallback = null,
}: Omit<HasRoleProps, 'roles'>) {
    return (
        <HasRole roles="teacher" fallback={fallback}>
            {children}
        </HasRole>
    );
}
/**
 * Check if the current user is an engineer.
 */
export function IsEngineer({
    children,
    fallback = null,
}: Omit<HasRoleProps, 'roles'>) {
    return (
        <HasRole roles="engineer" fallback={fallback}>
            {children}
        </HasRole>
    );
}
/**
 * Check if the current user is a security officer.
 */
export function IsSecurityOfficer({
    children,
    fallback = null,
}: Omit<HasRoleProps, 'roles'>) {
    return (
        <HasRole roles="security_officer" fallback={fallback}>
            {children}
        </HasRole>
    );
}
/**
 * Custom hook to get current user role utilities.
 */
export function useRole() {
    const { auth } = usePage().props as { auth: { user: User | null } };
    const user = auth?.user;
    return {
        role: user?.role ?? null,
        isAdmin: user?.role === 'admin',
        isTeacher: user?.role === 'teacher',
        isEngineer: user?.role === 'engineer',
        isSecurityOfficer: user?.role === 'security_officer',
        hasRole: (roles: UserRole | UserRole[]) => {
            if (!user) return false;
            const allowedRoles = Array.isArray(roles) ? roles : [roles];
            return allowedRoles.includes(user.role);
        },
    };
}
export default HasRole;


