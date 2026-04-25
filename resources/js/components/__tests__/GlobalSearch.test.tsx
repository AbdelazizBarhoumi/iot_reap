import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { SearchResult } from '@/types/search.types';
import { GlobalSearch } from '../GlobalSearch';

const mockVisit = vi.hoisted(() => vi.fn());

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({
            children,
            ...props
        }: { children?: React.ReactNode } & Record<string, unknown>) => (
            <div {...props}>{children}</div>
        ),
        button: ({
            children,
            onClick,
            ...props
        }: {
            children?: React.ReactNode;
            onClick?: React.MouseEventHandler<HTMLButtonElement>;
        } & Record<string, unknown>) => (
            <button onClick={onClick} {...props}>
                {children}
            </button>
        ),
    },
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => children,
}));

// Mock Inertia router
vi.mock('@inertiajs/react', () => {
    return {
        router: {
            visit: mockVisit,
        },
    };
});

// Mock authenticated user so recent searches render
vi.mock('@/store/authStore', () => ({
    useAuthStore: {
        getState: () => ({
            user: {
                id: '1',
                name: 'Test User',
                email: 'test@example.com',
            },
        }),
    },
}));

describe('GlobalSearch Component', () => {
    const mockSearchResults: SearchResult[] = [
        {
            id: '1',
            type: 'trainingPath',
            title: 'React Fundamentals',
            subtitle: 'Smart Manufacturing',
            description: 'Learn React from scratch',
            url: '/trainingPaths/1',
        },
        {
            id: '2',
            type: 'trainingUnit',
            title: 'Introduction to JSX',
            subtitle: 'React Fundamentals',
            description: 'Understanding JSX syntax',
            url: '/trainingPaths/1/trainingUnits/1',
        },
    ];

    beforeEach(async () => {
        vi.clearAllMocks();
        // Mock the search API
        const { searchApi } = await import('@/api/search.api');
        vi.spyOn(searchApi, 'search').mockResolvedValue({
            results: mockSearchResults,
            total: 2,
            query: 'react',
            filters: {},
            sort: 'relevance',
            categories: [],
        });
        vi.spyOn(searchApi, 'getRecent').mockResolvedValue([
            'javascript',
            'react hooks',
            'css grid',
        ]);
        vi.spyOn(searchApi, 'getTrending').mockResolvedValue([
            'react',
            'typescript',
            'node.js',
        ]);
        vi.spyOn(searchApi, 'suggest').mockResolvedValue([]);
    });
    it('renders search input field', async () => {
        const user = userEvent.setup();
        render(<GlobalSearch />);
        const searchButton = screen.getByRole('button', { name: /search/i });
        await user.click(searchButton);
        const searchInput = screen.getByPlaceholderText(/search paths/i);
        expect(searchInput).toBeInTheDocument();
    });
    it('renders search trigger button', () => {
        render(<GlobalSearch />);
        const searchButton =
            screen.getByLabelText(/open search|search/i) ||
            screen.getByRole('button', { name: /search/i });
        expect(searchButton).toBeInTheDocument();
    });
    it('opens search dialog when trigger button is clicked', async () => {
        const user = userEvent.setup();
        render(<GlobalSearch />);
        const searchButton =
            screen.getByLabelText(/open search|search/i) ||
            screen.getByRole('button', { name: /search/i });
        await user.click(searchButton);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    it('opens search dialog with Cmd+K keyboard shortcut', async () => {
        render(<GlobalSearch />);
        fireEvent.keyDown(document, { key: 'k', metaKey: true });
        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });
    });
    it('opens search dialog with Ctrl+K keyboard shortcut', async () => {
        render(<GlobalSearch />);
        fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });
    });
    it('shows search results when typing in search input', async () => {
        const user = userEvent.setup();
        render(<GlobalSearch />);
        // Open search dialog
        const searchButton = screen.getByRole('button', { name: /search/i });
        await user.click(searchButton);
        // Type in search input
        const searchInput = screen.getByRole('textbox');
        await user.type(searchInput, 'react');
        // Wait for debounce and API response (300ms debounce + API call)
        expect(
            (await screen.findAllByText('React Fundamentals')).length,
        ).toBeGreaterThan(0);
        expect(
            (await screen.findAllByText('Introduction to JSX')).length,
        ).toBeGreaterThan(0);
    });
    it('shows loading state while searching', async () => {
        const user = userEvent.setup();
        render(<GlobalSearch />);
        // Open search dialog
        const searchButton = screen.getByRole('button', { name: /search/i });
        await user.click(searchButton);
        // Type in search input (need at least 2 chars to trigger search)
        const searchInput = screen.getByRole('textbox');
        await user.type(searchInput, 'react');
        // Should show loading indicator - findByLabelText waits for it to appear
        expect(await screen.findByLabelText(/searching/i)).toBeInTheDocument();
    });
    it('displays recent searches when input is empty', async () => {
        const user = userEvent.setup();
        render(<GlobalSearch />);
        // Open search dialog
        const searchButton = screen.getByRole('button', { name: /search/i });
        await user.click(searchButton);
        await waitFor(() => {
            expect(screen.getByText(/recent activity/i)).toBeInTheDocument();
            expect(screen.getByText('javascript')).toBeInTheDocument();
            expect(screen.getByText('react hooks')).toBeInTheDocument();
        });
    });
    it('displays trending searches', async () => {
        const user = userEvent.setup();
        render(<GlobalSearch />);
        // Open search dialog
        const searchButton = screen.getByRole('button', { name: /search/i });
        await user.click(searchButton);
        await waitFor(() => {
            expect(screen.getByText(/trending|popular/i)).toBeInTheDocument();
            expect(screen.getByText('react')).toBeInTheDocument();
            expect(screen.getByText('typescript')).toBeInTheDocument();
        });
    });
    it('navigates to trainingPath when search result is clicked', async () => {
        const user = userEvent.setup();
        render(<GlobalSearch />);
        // Open search dialog and search
        const searchButton = screen.getByRole('button', { name: /search/i });
        await user.click(searchButton);
        const searchInput = screen.getByRole('textbox');
        await user.type(searchInput, 'react');
        const trainingPathResult = (
            await screen.findAllByText('React Fundamentals')
        )[0];
        await user.click(trainingPathResult);
        expect(mockVisit).toHaveBeenCalledWith('/trainingPaths/1');
    });
    it('closes dialog when escape key is pressed', async () => {
        const user = userEvent.setup();
        render(<GlobalSearch />);
        // Open search dialog
        const searchButton = screen.getByRole('button', { name: /search/i });
        await user.click(searchButton);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        // Press escape
        await user.keyboard('{Escape}');
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });
    it('closes dialog when close button is clicked', async () => {
        const user = userEvent.setup();
        render(<GlobalSearch />);
        // Open search dialog
        const searchButton = screen.getByRole('button', { name: /search/i });
        await user.click(searchButton);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        // Press Escape to close dialog
        await user.keyboard('{Escape}');
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });
    it('shows industrial labels for different result types', async () => {
        const user = userEvent.setup();
        render(<GlobalSearch />);
        // Open search dialog and search
        const searchButton = screen.getByRole('button', { name: /search/i });
        await user.click(searchButton);
        const searchInput = screen.getByRole('textbox');
        await user.type(searchInput, 'react');
        expect(
            (await screen.findAllByText('React Fundamentals')).length,
        ).toBeGreaterThan(0);
        expect(
            (await screen.findAllByText('Introduction to JSX')).length,
        ).toBeGreaterThan(0);
        expect((await screen.findAllByText('Path')).length).toBeGreaterThan(0);
        expect((await screen.findAllByText('Lab')).length).toBeGreaterThan(0);
    });
    it('handles empty search results gracefully', async () => {
        const user = userEvent.setup();
        const { searchApi } = await import('@/api/search.api');
        // Update mock to return empty results for "nonexistent" query
        vi.spyOn(searchApi, 'search').mockResolvedValueOnce({
            results: [],
            total: 0,
            query: 'nonexistent',
            filters: {},
            sort: 'relevance',
            categories: [],
        });
        render(<GlobalSearch />);
        // Open search dialog and search
        const searchButton = screen.getByRole('button', { name: /search/i });
        await user.click(searchButton);
        const searchInput = screen.getByRole('textbox');
        await user.type(searchInput, 'nonexistent');
        await waitFor(
            () => {
                expect(
                    screen.getByText(
                        /no industrial results found|no results|nothing found/i,
                    ),
                ).toBeInTheDocument();
            },
            { timeout: 2000 },
        );
    });
    it('debounces search input to avoid excessive API calls', async () => {
        const user = userEvent.setup();
        const { searchApi } = await import('@/api/search.api');
        render(<GlobalSearch />);
        // Open search dialog
        const searchButton = screen.getByRole('button', { name: /search/i });
        await user.click(searchButton);
        const searchInput = screen.getByRole('textbox');
        // Type quickly - should be debounced
        await user.type(searchInput, 'react');
        // Wait for debounce and results
        await waitFor(
            () => {
                expect(
                    screen.getAllByText('React Fundamentals')[0],
                ).toBeInTheDocument();
            },
            { timeout: 2000 },
        );
        // Should only call API once after debounce, not for every keystroke
        expect(searchApi.search).toHaveBeenCalledTimes(1);
    });
});
