import { Link } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    MessageSquare,
    Terminal,
    Wallet,
} from 'lucide-react';
import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import teaching from '@/routes/teaching';

type TeachingWorkspaceTab =
    | 'analytics'
    | 'training-paths'
    | 'vm-assignments'
    | 'inbox'
    | 'payouts';

interface TeachingWorkspaceTabsProps {
    activeTab: TeachingWorkspaceTab;
    /** Optional header content rendered above the tabs for the active workspace */
    header?: ReactNode;
}

const resolveHref = (resolver: () => string, fallback: string) => {
    try {
        const href = resolver();
        return href && href.length > 0 ? href : fallback;
    } catch {
        return fallback;
    }
};

const tabs: Array<{
    id: TeachingWorkspaceTab;
    label: string;
    href: string;
    icon: ElementType;
}> = [
    {
        id: 'analytics',
        label: 'Analytics',
        href: resolveHref(
            () => teaching.analytics.index.url(),
            '/teaching/analytics',
        ),
        icon: BarChart3,
    },
    {
        id: 'training-paths',
        label: 'Training Paths',
        href: '/teaching/training-paths',
        icon: BookOpen,
    },
    {
        id: 'vm-assignments',
        label: 'VM Assignments',
        href: resolveHref(
            () => teaching.trainingUnitAssignments.my.url(),
            '/teaching/trainingUnit-assignments/my-assignments',
        ),
        icon: Terminal,
    },
    {
        id: 'inbox',
        label: 'Inbox',
        href: resolveHref(
            () => teaching.forum.inbox.url(),
            '/teaching/forum/inbox',
        ),
        icon: MessageSquare,
    },
    {
        id: 'payouts',
        label: 'Payouts',
        href: resolveHref(
            () => teaching.analytics.earnings.url(),
            '/teaching/analytics/earnings',
        ),
        icon: Wallet,
    },
];

export function TeachingWorkspaceTabs({
    activeTab,
    header,
}: TeachingWorkspaceTabsProps) {
    return (
        <div>
            {header ? (
                <div className="mb-4 flex items-center justify-between gap-3">
                    {header}
                </div>
            ) : null}

            <div className="mb-6 overflow-x-auto rounded-xl border bg-card/50 p-2">
                <div className="flex min-w-max items-center gap-2">
                    {tabs.map((tab) => {
                        const isActive = tab.id === activeTab;

                        return (
                            <Link
                                key={tab.id}
                                href={tab.href}
                                className={cn(
                                    'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                )}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
