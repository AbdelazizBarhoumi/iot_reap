import { usePage, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import type { User } from '@/types/auth';
interface ProtectedRouteProps {
    children: ReactNode;
    /** Optional fallback component to render if not authenticated */
    fallback?: ReactNode;
    /** Redirect to this route if not authenticated (defaults to login) */
    redirectTo?: string;
}
/**
 * Client-side route guard that ensures user is authenticated.
 *
 * NOTE: In Inertia.js apps, the primary protection is via Laravel middleware.
 * This component provides additional client-side UX (e.g., showing a fallback
 * while redirecting, preventing flash of protected content).
 *
 * @example
 * ```tsx
 * <ProtectedRoute>
 *   <SecretContent />
 * </ProtectedRoute>
 *
 * // With custom fallback
 * <ProtectedRoute fallback={<LoadingSpinner />}>
 *   <Dashboard />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
    children,
    fallback = null,
    redirectTo = '/login',
}: ProtectedRouteProps) {
    const { auth } = usePage().props as { auth: { user: User | null } };
    const user = auth?.user;
    if (!user) {
        // Trigger redirect via Inertia (preserves SPA navigation)
        if (typeof window !== 'undefined') {
            router.visit(redirectTo, { preserveState: false });
        }
        return <>{fallback}</>;
    }
    return <>{children}</>;
}
export default ProtectedRoute;


