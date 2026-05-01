import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import FinancePage from '../FinancePage';

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
    router: {
        post: vi.fn(),
    },
}));

vi.mock('@/layouts/app-layout', () => ({
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

describe('FinancePage', () => {
    const baseProps = {
        activeTab: 'payouts' as const,
        payouts: [
            {
                id: '1',
                teacher: {
                    id: 't-1',
                    name: 'Amina Teacher',
                    email: 'amina@example.com',
                },
                amount: 120,
                status: 'pending' as const,
                requestedAt: '2026-04-30T10:00:00Z',
                processedAt: null,
            },
        ],
        payoutStats: {
            pending: 1,
            totalPending: 120,
            paidThisMonth: 500,
        },
        payoutPagination: {
            current_page: 1,
            last_page: 1,
            per_page: 20,
            total: 1,
        },
        refunds: [
            {
                id: '10',
                user: {
                    id: 'u-1',
                    name: 'Omar Student',
                    email: 'omar@example.com',
                },
                trainingPath: {
                    id: 5,
                    title: 'Industrial Safety Basics',
                },
                amount: 35,
                formattedAmount: '$35.00',
                reason: 'Changed learning track',
                status: 'pending' as const,
                requestedAt: '2026-04-29T10:00:00Z',
                processedAt: null,
            },
        ],
        refundStats: {
            pending: 1,
            approved: 0,
            rejected: 0,
            totalRefunded: 0,
        },
        refundPagination: {
            current_page: 1,
            last_page: 1,
            per_page: 20,
            total: 1,
        },
    };

    it('shows payouts by default and switches to refunds', async () => {
        const user = userEvent.setup();

        render(<FinancePage {...baseProps} />);

        expect(
            screen.getByRole('heading', { name: /payouts & refunds/i }),
        ).toBeInTheDocument();
        expect(screen.getByText('Amina Teacher')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /export payouts/i })).toBeInTheDocument();

        await user.click(screen.getByRole('tab', { name: /refunds/i }));

        expect(screen.getByText('Omar Student')).toBeInTheDocument();
        expect(screen.getByText('Industrial Safety Basics')).toBeInTheDocument();
    });
});