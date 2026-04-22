import { Link } from '@inertiajs/react';
import {
    BanknoteIcon,
    Bell,
    CalendarCheck,
    CheckCircle,
    Clapperboard,
    ClipboardList,
    LayoutGrid,
    MessageSquareWarning,
    Monitor,
    Network,
    RotateCcw,
    Users,
    Video,
    Wrench,
} from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import admin from '@/routes/admin';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';
/**
 * Admin-only sidebar navigation.
 * Only rendered for the admin role — other roles use the header layout.
 * Admin has full access: VM dashboard, studio, training, and admin functions.
 */
const overviewNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: admin.dashboard.url(),
        icon: LayoutGrid,
    },

    {
        title: 'Users',
        href: admin.users.index.url(),
        icon: Users,
    },
];
const operationsNavItems: NavItem[] = [
    {
        title: 'Infrastructure',
        href: admin.infrastructure.url(),
        icon: Network,
    },
    {
        title: 'Cameras',
        href: '/admin/cameras',
        icon: Video,
    },
    {
        title: 'Maintenance',
        href: admin.maintenance.index.url(),
        icon: Wrench,
    },
];
const monitoringNavItems: NavItem[] = [
    {
        title: 'System Alerts',
        href: admin.alerts.index.url(),
        icon: Bell,
    },
    {
        title: 'Activity Logs',
        href: admin.activityLogs.index.url(),
        icon: ClipboardList,
    },
    {
        title: 'Forum Moderation',
        href: admin.forum.flagged.url(),
        icon: MessageSquareWarning,
    },
    {
        title: 'Video Processing',
        href: '/admin/videos',
        icon: Clapperboard,
    },
];
const contentNavItems: NavItem[] = [
    {
        title: 'Path Reviews',
        href: admin.trainingPaths.index.url(),
        icon: CheckCircle,
    },
    {
        title: 'VM Assignments',
        href: admin.vmAssignments.index.url(),
        icon: Monitor,
    },
    {
        title: 'Lab Reservations',
        href: admin.reservations.page.url(),
        icon: CalendarCheck,
    },
    {
        title: 'Payouts',
        href: admin.payouts.index.url(),
        icon: BanknoteIcon,
    },
    {
        title: 'Refunds',
        href: admin.refunds.index.url(),
        icon: RotateCcw,
    },
];
export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={admin.dashboard.url()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={overviewNavItems} label="Core" />
                <NavMain items={operationsNavItems} label="Operations" />
                <NavMain items={monitoringNavItems} label="Monitoring" />
                <NavMain items={contentNavItems} label="Content Management" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
