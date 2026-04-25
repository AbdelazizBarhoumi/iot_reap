import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
type Props = {
    children: ReactNode;
    variant?: 'header' | 'sidebar';
};
/**
 * Skip to main content link for keyboard accessibility.
 * Visually hidden until focused, then appears at top of page.
 */
function SkipLink() {
    return (
        <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none"
        >
            Skip to main content
        </a>
    );
}
export function AppShell({ children, variant = 'header' }: Props) {
    const isOpen = usePage().props.sidebarOpen;
    if (variant === 'header') {
        return (
            <div className="flex min-h-screen w-full flex-col">
                <SkipLink />
                {children}
            </div>
        );
    }
    return (
        <SidebarProvider defaultOpen={isOpen}>
            <SkipLink />
            {children}
        </SidebarProvider>
    );
}
