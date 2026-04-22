import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EarningsPage from '../earnings';

const { payoutApiMock, routerMock } = vi.hoisted(() => ({
    payoutApiMock: {
        getMyPayouts: vi.fn(),
        requestPayout: vi.fn(),
    },
    routerMock: {
        get: vi.fn(),
    },
}));

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: ({
        href,
        children,
        ...props
    }: {
        href: string;
        children: ReactNode;
    }) => (
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
    RevenueChart: ({ title }: { title: string }) => <div>{title}</div>,
    PeriodSelector: () => <div>Period Selector</div>,
}));

vi.mock('@/api/payout.api', () => ({
    payoutApi: payoutApiMock,
}));

vi.mock('@/routes/teaching', () => ({
    default: {
        index: { url: () => '/teaching' },
        analytics: {
            index: { url: () => '/teaching/analytics' },
            earnings: {
                url: () => '/teaching/analytics/earnings',
                export: { url: () => '/teaching/analytics/earnings/export' },
            },
        },
    },
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('EarningsPage', () => {
    const summary = {
        total_revenue: 750,
        previous_revenue: 500,
        change_percentage: 50,
        start_date: '2026-04-01',
        end_date: '2026-04-22',
        period: '30d' as const,
    };

    const revenueByTrainingPath = [
        {
            id: 1,
            title: 'Industrial Automation',
            sales_count: 12,
            revenue: 750,
            thumbnail_url: null,
        },
    ];

    const revenueChart = [
        {
            date: '2026-04-20',
            revenue: 250,
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        payoutApiMock.getMyPayouts
            .mockResolvedValueOnce({
                data: [],
                available_balance: 220,
                available_balance_cents: 22000,
            })
            .mockResolvedValueOnce({
                data: [
                    {
                        id: 10,
                        amount: 100,
                        amount_cents: 10000,
                        currency: 'USD',
                        status: 'pending',
                        status_label: 'Pending',
                        payout_method: 'stripe',
                        payout_details: null,
                        rejection_reason: null,
                        admin_notes: null,
                        requestedAt: new Date().toISOString(),
                        approvedAt: null,
                        processedAt: null,
                        completedAt: null,
                    },
                ],
                available_balance: 120,
                available_balance_cents: 12000,
            });
        payoutApiMock.requestPayout.mockResolvedValue({
            id: 10,
            amount: 100,
            amount_cents: 10000,
            currency: 'USD',
            status: 'pending',
            status_label: 'Pending',
            payout_method: 'stripe',
            payout_details: null,
            rejection_reason: null,
            admin_notes: null,
            requestedAt: new Date().toISOString(),
            approvedAt: null,
            processedAt: null,
            completedAt: null,
        });
    });

    it('submits a payout request and refreshes payout history', async () => {
        const user = userEvent.setup();

        render(
            <EarningsPage
                summary={summary}
                revenueByTrainingPath={revenueByTrainingPath}
                revenueChart={revenueChart}
                period="30d"
            />,
        );

        await waitFor(() => {
            expect(payoutApiMock.getMyPayouts).toHaveBeenCalledTimes(1);
        });

        const amountInput =
            await screen.findByPlaceholderText(/amount in usd/i);
        await user.type(amountInput, '100');
        await user.click(
            screen.getByRole('button', { name: /request payout/i }),
        );

        await waitFor(() => {
            expect(payoutApiMock.requestPayout).toHaveBeenCalledWith({
                amount: 100,
                payout_method: 'stripe',
            });
        });

        await waitFor(() => {
            expect(payoutApiMock.getMyPayouts).toHaveBeenCalledTimes(2);
        });

        await waitFor(() => {
            expect(
                screen.getByText(/recent payout requests/i),
            ).toBeInTheDocument();
            expect(screen.getAllByText(/\$100\.00/).length).toBeGreaterThan(0);
        });
    });
});
