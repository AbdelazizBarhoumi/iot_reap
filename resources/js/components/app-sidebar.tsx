import { Link } from '@inertiajs/react';
import {
    Activity,
    BanknoteIcon,
    BookOpen,
    CalendarCheck,
    CheckCircle,
    GraduationCap,
    LayoutGrid,
    Monitor,
    Network,
    PenTool,
    RotateCcw,
    Users,
    Usb,
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
import { dashboard } from '@/routes';
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
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Analytics',
        href: '/admin/dashboard',
        icon: Activity,
    },
    {
        title: 'Infrastructure',
        href: '/admin/infrastructure',
        icon: Network,
    },
    {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
    },
];
const managementNavItems: NavItem[] = [
    {
        title: 'Hardware Gateways',
        href: '/hardware',
        icon: Usb,
    },
    {
        title: 'Maintenance',
        href: '/admin/maintenance',
        icon: Wrench,
    },
];
const contentNavItems: NavItem[] = [
    {
        title: 'Path Reviews',
        href: '/admin/trainingPaths',
        icon: CheckCircle,
    },
    {
        title: 'VM Assignments',
        href: '/admin/vm-assignments',
        icon: Monitor,
    },
    {
        title: 'Lab Reservations',
        href: '/admin/reservations-page',
        icon: CalendarCheck,
    },
    {
        title: 'Payouts',
        href: '/admin/payouts',
        icon: BanknoteIcon,
    },
    {
        title: 'Refunds',
        href: '/admin/refunds',
        icon: RotateCcw,
    },
];
const learningNavItems: NavItem[] = [
    {
        title: 'Training Paths',
        href: '/trainingPaths',
        icon: GraduationCap,
    },
    {
        title: 'My Training',
        href: '/my-trainingPaths',
        icon: BookOpen,
    },
    {
        title: 'Content Studio',
        href: '/teaching',
        icon: PenTool,
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
                <NavMain items={overviewNavItems} label="Operations" />
                <NavMain items={managementNavItems} label="Infrastructure" />
                <NavMain items={contentNavItems} label="Studio" />
                <NavMain items={learningNavItems} label="Academy" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}


