import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import AnalyticsPage from '../analytics';

const { completionFunnelMock, routerMock } = vi.hoisted(() => ({
    completionFunnelMock: vi.fn(),
    routerMock: {
        get: vi.fn(),
    },
}));

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
    router: routerMock,
}));

vi.mock('@/layouts/app-layout', () => ({
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/analytics', () => ({
    KPICard: ({ title, value }: { title: string; value: number | string }) => (
        <div>
            {title}: {value}
        </div>
    ),
    EnrollmentChart: ({ title }: { title: string }) => <div>{title}</div>,
    RevenueChart: ({ title }: { title: string }) => <div>{title}</div>,
    PeriodSelector: () => <div>Period Selector</div>,
}));

vi.mock('@/components/analytics/CompletionFunnel', () => ({
    CompletionFunnel: (props: { title: string; data: Array<{ stage: string; count: number; percentage: number }> }) => {
        completionFunnelMock(props);
        return <div>{props.title}</div>;
    },
}));

vi.mock('@/components/teaching/TeachingWorkspaceTabs', () => ({
    TeachingWorkspaceTabs: () => <div>Teaching Workspace Tabs</div>,
}));

vi.mock('@/routes/teaching', () => ({
    default: {
        index: { url: () => '/teaching' },
        analytics: {
            index: { url: () => '/teaching/analytics' },
            earnings: { url: () => '/teaching/analytics/earnings' },
        },
    },
}));

describe('AnalyticsPage', () => {
    it('caps the completion funnel at 100% and bases it on enrollments', () => {
        render(
            <AnalyticsPage
                kpis={{
                    total_students: 12,
                    total_enrollments: 1,
                    enrollments_change: 0,
                    total_completions: 152,
                    completions_change: 0,
                    total_revenue: 0,
                    revenue_change: 0,
                    quiz_pass_rate: 0,
                    avg_video_minutes: 0,
                    period: '30d',
                }}
                enrollmentChart={[]}
                revenueChart={[]}
                topTrainingPaths={[]}
                period="30d"
            />,
        );

        expect(
            screen.getByText('Operator Completion Funnel'),
        ).toBeInTheDocument();
        expect(completionFunnelMock).toHaveBeenCalled();

        const props = completionFunnelMock.mock.calls.at(-1)?.[0];
        expect(props.data).toEqual([
            { stage: 'Enrolled', count: 1, percentage: 100 },
            { stage: 'Active', count: 1, percentage: 85 },
            { stage: 'In Progress', count: 1, percentage: 65 },
            { stage: 'Completed', count: 1, percentage: 100 },
        ]);
    });

    it('zeros funnel percentages when there are no enrollments', () => {
        render(
            <AnalyticsPage
                kpis={{
                    total_students: 0,
                    total_enrollments: 0,
                    enrollments_change: 0,
                    total_completions: 152,
                    completions_change: 0,
                    total_revenue: 0,
                    revenue_change: 0,
                    quiz_pass_rate: 0,
                    avg_video_minutes: 0,
                    period: '30d',
                }}
                enrollmentChart={[]}
                revenueChart={[]}
                topTrainingPaths={[]}
                period="30d"
            />,
        );

        const props = completionFunnelMock.mock.calls.at(-1)?.[0];
        expect(props.data).toEqual([
            { stage: 'Enrolled', count: 0, percentage: 0 },
            { stage: 'Active', count: 0, percentage: 0 },
            { stage: 'In Progress', count: 0, percentage: 0 },
            { stage: 'Completed', count: 0, percentage: 0 },
        ]);
    });
});
