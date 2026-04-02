import { AppContent } from '@/components/app-content';
import { AppFooter } from '@/components/app-footer';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';
export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent
                variant="sidebar"
                className="flex flex-col overflow-x-hidden"
            >
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div className="flex-1">{children}</div>
                <AppFooter />
            </AppContent>
        </AppShell>
    );
}

