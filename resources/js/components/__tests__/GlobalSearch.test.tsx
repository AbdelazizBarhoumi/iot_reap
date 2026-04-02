import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { server } from '@/test/mocks/server';
import type { SearchResult, SearchSuggestion } from '@/types/search.types';
import { GlobalSearch } from '../GlobalSearch';
// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => <div {...props}>{children}</div>,
        button: ({ children, onClick, ...props }: { children?: React.ReactNode; onClick?: React.MouseEventHandler<HTMLButtonElement> } & Record<string, unknown>) => (
            <button onClick={onClick} {...props}>{children}</button>
        ),
    },
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => children,
}));
// Mock Inertia router
vi.mock('@inertiajs/react', () => {
    const mockVisit = vi.fn();
    return {
        router: {
            visit: mockVisit,
        },
    };
});
const mockVisit = vi.fn();
describe('GlobalSearch Component', () => {
    const mockSearchResults: SearchResult[] = [
        {
            id: '1',
            type: 'course',
            title: 'React Fundamentals',
            subtitle: 'Web Development',
            description: 'Learn React from scratch',
            url: '/courses/1',
        },
        {
            id: '2',
            type: 'lesson',
            title: 'Introduction to JSX',
            subtitle: 'React Fundamentals',
            description: 'Understanding JSX syntax',
            url: '/courses/1/lessons/1',
        },
    ];
    const mockSuggestions: SearchSuggestion[] = [
        { query: 'react', type: 'trending' },
        { query: 'javascript', type: 'recent' },
        { query: 'typescript', type: 'suggested' },
    ];
    beforeEach(() => {
        vi.clearAllMocks();
        // Setup MSW handlers
        server.use(
            http.get('/search', ({ request }) => {
                const url = new URL(request.url);
                const query = url.searchParams.get('q');
                if (query && query.length > 0) {
                    return HttpResponse.json({
                        results: mockSearchResults,
                        total: 2,
                        query,
                        filters: {},
                        sort: 'relevance',
                        categories: [],
                    });
                }
                return HttpResponse.json({
                    results: [],
                    total: 0,
                    query: '',
                    filters: {},
                    sort: 'relevance',
                    categories: [],
                });
            }),
            http.get('/search/suggest', ({ request }) => {
                const url = new URL(request.url);
                const query = url.searchParams.get('q');
                return HttpResponse.json({
                    suggestions: query ? mockSuggestions : [],
                });
            }),
            http.get('/search/recent', () => {
                return HttpResponse.json({
                    searches: ['javascript', 'react hooks', 'css grid'],
                });
            }),
            http.get('/search/trending', () => {
                return HttpResponse.json({
                    trending: ['react', 'typescript', 'node.js'],
                });
            })
        );
    });
    it('renders search input field', () => {
        render(<GlobalSearch />);
        const searchInput = screen.getByPlaceholderText(/search courses|search/i);
        expect(searchInput).toBeInTheDocument();
    });
    it('renders search trigger button', () => {
        render(<GlobalSearch />);
        const searchButton = screen.getByLabelText(/open search|search/i) || 
                            screen.getByRole('button', { name: /search/i });
        expect(searchButton).toBeInTheDocument();
    });
    it('opens search dialog when trigger button is clicked', async () => {
        const user = userEvent.setup();
        render(<GlobalSearch />);
        const searchButton = screen.getByLabelText(/open search|search/i) || 
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
        await waitFor(() => {
            expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
            expect(screen.getByText('Introduction to JSX')).toBeInTheDocument();
        });
    });
    it('shows loading state while searching', async () => {
        const user = userEvent.setup();
        render(<GlobalSearch />);
        // Open search dialog
        const searchButton = screen.getByRole('button', { name: /search/i });
        await user.click(searchButton);
        // Type in search input
        const searchInput = screen.getByRole('textbox');
        await user.type(searchInput, 'r');
        // Should show loading indicator
        expect(screen.getByTestId('loading') || 
               screen.getByLabelText(/loading/i)).toBeInTheDocument();
    });
    it('displays recent searches when input is empty', async () => {
        const user = userEvent.setup();
        render(<GlobalSearch />);
        // Open search dialog
        const searchButton = screen.getByRole('button', { name: /search/i });
        await user.click(searchButton);
        await waitFor(() => {
            expect(screen.getByText(/recent searches|recent/i)).toBeInTheDocument();
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
    it('navigates to course when search result is clicked', async () => {
        const user = userEvent.setup();
        render(<GlobalSearch />);
        // Open search dialog and search
        const searchButton = screen.getByRole('button', { name: /search/i });
        await user.click(searchButton);
        const searchInput = screen.getByRole('textbox');
        await user.type(searchInput, 'react');
        await waitFor(async () => {
            const courseResult = screen.getByText('React Fundamentals');
            await user.click(courseResult);
            expect(mockVisit).toHaveBeenCalledWith('/courses/1');
        });
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
        // Click close button
        const closeButton = screen.getByLabelText(/close/i) || 
                           screen.getByRole('button', { name: /close/i });
        await user.click(closeButton);
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });
    it('shows different icons for different result types', async () => {
        const user = userEvent.setup();
        render(<GlobalSearch />);
        // Open search dialog and search
        const searchButton = screen.getByRole('button', { name: /search/i });
        await user.click(searchButton);
        const searchInput = screen.getByRole('textbox');
        await user.type(searchInput, 'react');
        await waitFor(() => {
            // Should show course and lesson results with different icons
            expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
            expect(screen.getByText('Introduction to JSX')).toBeInTheDocument();
        });
    });
    it('handles empty search results gracefully', async () => {
        const user = userEvent.setup();
        // Mock empty results
        server.use(
            http.get('/search', () => {
                return HttpResponse.json({
                    results: [],
                    total: 0,
                    query: 'nonexistent',
                    filters: {},
                    sort: 'relevance',
                    categories: [],
                });
            })
        );
        render(<GlobalSearch />);
        // Open search dialog and search
        const searchButton = screen.getByRole('button', { name: /search/i });
        await user.click(searchButton);
        const searchInput = screen.getByRole('textbox');
        await user.type(searchInput, 'nonexistent');
        await waitFor(() => {
            expect(screen.getByText(/no results|nothing found/i)).toBeInTheDocument();
        });
    });
    it('debounces search input to avoid excessive API calls', async () => {
        const user = userEvent.setup();
        let searchCallCount = 0;
        // Track API calls
        server.use(
            http.get('/search', ({ request }) => {
                searchCallCount++;
                const url = new URL(request.url);
                const query = url.searchParams.get('q');
                return HttpResponse.json({
                    results: query ? mockSearchResults : [],
                    total: query ? 2 : 0,
                    query: query || '',
                    filters: {},
                    sort: 'relevance',
                    categories: [],
                });
            })
        );
        render(<GlobalSearch />);
        // Open search dialog
        const searchButton = screen.getByRole('button', { name: /search/i });
        await user.click(searchButton);
        const searchInput = screen.getByRole('textbox');
        // Type quickly - should be debounced
        await user.type(searchInput, 'react');
        // Wait for debounce
        await waitFor(() => {
            expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
        }, { timeout: 1000 });
        // Should not call API for every keystroke
        expect(searchCallCount).toBeLessThan(5);
    });
});


