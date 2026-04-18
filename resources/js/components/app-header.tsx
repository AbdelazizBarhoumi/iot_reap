import { Link, usePage } from '@inertiajs/react';
import {
    CalendarCheck,
    GraduationCap,
    History,
    LayoutGrid,
    Menu,
    PenTool,
    Server,
    Settings2,
    Usb,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { GlobalSearch } from '@/components/GlobalSearch';
import { NotificationBell } from '@/components/NotificationBell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { login, dashboard, home } from '@/routes';
import type { BreadcrumbItem, NavItem } from '@/types';
type Props = {
    breadcrumbs?: BreadcrumbItem[];
};
/**
 * Build nav items based on user role.
 * Engineers see: Dashboard, Sessions, Hardware, My Training, Training Paths
 * Teachers see: Dashboard, Content Studio, Training Paths
 * Security Officers see: Dashboard, Training Paths
 * Admin uses sidebar layout (not this header)
 */
function useNavItems(): NavItem[] {
    const { auth } = usePage().props;
    const role = auth.user?.role;
    const isTeacher =
        role === 'teacher' && !!auth.user?.teacher_approved_at;
    const isEngineer = role === 'engineer';
    const items: NavItem[] = [];

    if (auth.user) {
        items.push({
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        });
    }
    // Engineers see VM sessions, hardware, and their enrolled trainingPaths
    if (isEngineer) {
        items.push(
            {
                title: 'Sessions',
                href: '/sessions',
                icon: History,
            },
            {
                title: 'Hardware',
                href: '/hardware',
                icon: Usb,
            },
            {
                title: 'Reservations',
                href: '/reservations',
                icon: CalendarCheck,
            },
            {
                title: 'My Training',
                href: '/my-trainingPaths',
                icon: GraduationCap,
            },
        );
    }
    // Teachers see Content Studio (their paths) prominently
    if (isTeacher) {
        items.push({
            title: 'Content Studio',
            href: '/teaching',
            icon: PenTool,
        });
    }
    // Everyone can browse trainingPaths
    items.push({
        title: 'Training Paths',
        href: '/trainingPaths',
        icon: GraduationCap,
    });
    return items;
}
const activeItemStyles = 'text-primary dark:text-primary';
export function AppHeader({ breadcrumbs = [] }: Props) {
    const page = usePage();
    const { auth } = page.props;
    const user = auth.user;
    const getInitials = useInitials();
    const { isCurrentUrl } = useCurrentUrl();
    const navItems = useNavItems();
    const [mobileOpen, setMobileOpen] = useState(false);
    // Only engineers/admins use VM sessions, so only they need connection preferences
    const showConnectionPrefs =
        user?.role === 'engineer' || user?.role === 'admin';
    return (
        <>
            <header className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/80 dark:supports-[backdrop-filter]:bg-gray-900/60">
                <div className="mx-auto flex h-16 max-w-screen-2xl items-center px-4 md:px-6 lg:px-8">
                    {/* Mobile Menu Toggle */}
                    <button
                        className="mr-3 text-foreground lg:hidden"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label={
                            mobileOpen
                                ? 'Close navigation menu'
                                : 'Open navigation menu'
                        }
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </button>
                    {/* Logo */}
                    <Link
                        href={user ? dashboard() : home()}
                        prefetch
                        className="flex items-center gap-2"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                            <Server className="h-5 w-5 text-white" />
                        </div>
                        <span className="hidden font-semibold text-foreground sm:inline">
                            IoT-REAP
                        </span>
                    </Link>
                    {/* Desktop Navigation */}
                    <nav className="ml-8 hidden h-full items-center lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch gap-1">
                                {navItems.map((item) => (
                                    <NavigationMenuItem
                                        key={item.title}
                                        className="relative flex h-full items-center"
                                    >
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                'h-9 cursor-pointer gap-2 px-3 font-medium',
                                                isCurrentUrl(item.href)
                                                    ? activeItemStyles
                                                    : 'text-muted-foreground hover:text-white',
                                            )}
                                        >
                                            {item.icon && (
                                                <item.icon className="h-4 w-4" />
                                            )}
                                            {item.title}
                                        </Link>
                                        {isCurrentUrl(item.href) && (
                                            <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-primary" />
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </nav>
                    {/* Right side: search + notifications + quick actions + user menu */}
                    <div className="ml-auto flex items-center gap-2">
                        {/* Global Search */}
                        <GlobalSearch />
                        {/* Notifications */}
                        {user && <NotificationBell />}
                        {showConnectionPrefs && (
                            <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="hidden gap-1.5 text-muted-foreground hover:text-white sm:flex"
                            >
                                <Link href="/connection-preferences">
                                    <Settings2 className="h-4 w-4" />
                                    <span className="hidden md:inline">
                                        Preferences
                                    </span>
                                </Link>
                            </Button>
                        )}
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="size-10 rounded-full p-1"
                                        aria-label="Open user menu"
                                    >
                                        <Avatar className="size-8 overflow-hidden rounded-full">
                                            <AvatarImage
                                                src={user.avatar || undefined}
                                                alt={user.name || 'User'}
                                            />
                                            <AvatarFallback className="rounded-lg bg-primary/10 text-primary dark:bg-primary/90 dark:text-primary/70">
                                                {getInitials(
                                                    user.name || 'User',
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-56"
                                    align="end"
                                >
                                    <UserMenuContent user={user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button
                                size="sm"
                                className="flex-1 bg-primary text-white hover:bg-primary/90"
                                asChild
                            >
                                <Link
                                    href={login()}
                                    onClick={() =>
                                        setMobileOpen(false)
                                    }
                                >
                                    Log in
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
                {/* Mobile Navigation Dropdown */}
                {mobileOpen && (
                    <div className="border-t border-border bg-background lg:hidden">
                        <div className="mx-auto flex flex-col gap-1 px-4 py-3 md:px-6">
                            {navItems.map((item) => (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={cn(
                                        'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                                        isCurrentUrl(item.href)
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-muted-foreground hover:bg-accent hover:text-white',
                                    )}
                                >
                                    {item.icon && (
                                        <item.icon className="h-4 w-4" />
                                    )}
                                    {item.title}
                                </Link>
                            ))}
                            {showConnectionPrefs && (
                                <Link
                                    href="/connection-preferences"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-white sm:hidden"
                                >
                                    <Settings2 className="h-4 w-4" />
                                    Preferences
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </header>
            {breadcrumbs.length > 1 && (
                <div className="flex w-full border-b border-border bg-background/50">
                    <div className="mx-auto flex h-10 w-full max-w-screen-2xl items-center justify-start px-4 text-muted-foreground md:px-6 lg:px-8">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}


