import { usePage } from '@inertiajs/react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import type { AppLayoutProps } from '@/types';
/**
 * Role-aware layout switcher.
 * - Admin → sidebar layout (management panel)
 * - Everyone else → header/navbar layout (clean product feel)
 */
export default function AppLayout({
    children,
    breadcrumbs,
    ...props
}: AppLayoutProps) {
    const { auth } = usePage().props;
    const isAdmin = auth.user?.role === 'admin';
    if (isAdmin) {
        return (
            <AppSidebarLayout breadcrumbs={breadcrumbs} {...props}>
                {children}
            </AppSidebarLayout>
        );
    }
    return (
        <AppHeaderLayout breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AppHeaderLayout>
    );
}
