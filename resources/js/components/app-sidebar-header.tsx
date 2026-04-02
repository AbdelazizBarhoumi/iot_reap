import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';
export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-white/95 px-6 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 supports-[backdrop-filter]:bg-white/60 md:px-4 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/60">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 text-muted-foreground hover:bg-teal-50 hover:text-foreground dark:hover:bg-teal-900/20" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
        </header>
    );
}


