import { Link } from '@inertiajs/react';
import {
    CalendarCheck,
    CheckCircle,
    Cpu,
    LayoutGrid,
    Network,
    Server,
    Usb,
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
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

/**
 * Admin-only sidebar navigation.
 * Only rendered for the admin role — other roles use the header layout.
 */

const overviewNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Infrastructure',
        href: '/admin/infrastructure',
        icon: Network,
    },
];

const managementNavItems: NavItem[] = [
    {
        title: 'Proxmox Servers',
        href: '/admin/proxmox-servers',
        icon: Server,
    },
    {
        title: 'Nodes & VMs',
        href: '/admin/nodes',
        icon: Cpu,
    },
    {
        title: 'Hardware Gateways',
        href: '/hardware',
        icon: Usb,
    },
];

const contentNavItems: NavItem[] = [
    {
        title: 'Course Approvals',
        href: '/admin/courses',
        icon: CheckCircle,
    },
    {
        title: 'Reservations',
        href: '/admin/reservations-page',
        icon: CalendarCheck,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={overviewNavItems} label="Overview" />
                <NavMain items={managementNavItems} label="Management" />
                <NavMain items={contentNavItems} label="Content & Scheduling" />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
