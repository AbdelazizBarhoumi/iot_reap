import { usePage, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import type { User } from '@/types/auth';
type UserRole = 'engineer' | 'teacher' | 'admin' | 'security_officer';
interface RoleRouteProps {
    children: ReactNode;
    /** Required role(s) to access this content. Can be a single role or array. */
    roles: UserRole | UserRole[];
    /** Optional fallback component when user lacks required role */
    fallback?: ReactNode;
    /** Redirect to this route if unauthorized (optional - defaults to showing fallback) */
    redirectTo?: string;
}
/**
 * Client-side route guard that checks user role.
 *
 * NOTE: In Inertia.js apps, the primary protection is via Laravel's `role` middleware.
 * This component provides additional client-side UX for role-based conditional rendering.
 *
 * @example
 * ```tsx
 * // Single role
 * <RoleRoute roles="admin">
 *   <AdminPanel />
 * </RoleRoute>
 *
 * // Multiple roles
 * <RoleRoute roles={['admin', 'security_officer']}>
 *   <SecurityDashboard />
 * </RoleRoute>
 *
 * // With fallback for unauthorized users
 * <RoleRoute roles="teacher" fallback={<p>Teachers only</p>}>
 *   <CourseCreator />
 * </RoleRoute>
 *
 * // With redirect
 * <RoleRoute roles="admin" redirectTo="/dashboard">
 *   <AdminSettings />
 * </RoleRoute>
 * ```
 */
export function RoleRoute({
    children,
    roles,
    fallback = null,
    redirectTo,
}: RoleRouteProps) {
    const { auth } = usePage().props as { auth: { user: User | null } };
    const user = auth?.user;
    // Not authenticated
    if (!user) {
        if (redirectTo && typeof window !== 'undefined') {
            router.visit('/login', { preserveState: false });
        }
        return <>{fallback}</>;
    }
    // Check if user has any of the required roles
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    const hasRequiredRole = allowedRoles.includes(user.role);
    if (!hasRequiredRole) {
        if (redirectTo && typeof window !== 'undefined') {
            router.visit(redirectTo, { preserveState: false });
            return <>{fallback}</>;
        }
        return <>{fallback}</>;
    }
    return <>{children}</>;
}
export default RoleRoute;



