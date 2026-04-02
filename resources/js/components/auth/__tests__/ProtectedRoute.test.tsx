import type { Page } from '@inertiajs/core';
import { router } from '@inertiajs/react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { User } from '@/types/auth';
import { ProtectedRoute } from '../ProtectedRoute';
// Mock Inertia's usePage and router
vi.mock('@inertiajs/react', () => ({
    usePage: vi.fn(),
    router: {
        visit: vi.fn(),
    },
}));
type ProtectedRouteTestPageProps = { auth?: { user?: User | null } };

const mockUsePage = vi.mocked((await import('@inertiajs/react')).usePage as unknown as () => Page<ProtectedRouteTestPageProps>);
const mockRouter = vi.mocked(router);

function createPage(authUser: User | null | undefined) {
    return {
        component: 'TestComponent',
        url: '/test',
        version: null,
        clearHistory: false,
        encryptHistory: false,
        flash: {},
        rememberedState: {},
        props: {
            errors: {},
            auth: { user: authUser },
        },
    } as Page<ProtectedRouteTestPageProps>;
}

describe('ProtectedRoute Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset window mock
        Object.defineProperty(window, 'location', {
            value: { href: 'http://localhost' },
            writable: true,
        });
    });
    const mockUser: User = {
        id: '1',
        name: 'Test Engineer',
        email: 'engineer@test.com',
        role: 'engineer',
        email_verified_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
    };
    describe('when user is authenticated', () => {
        beforeEach(() => {
            mockUsePage.mockReturnValue(createPage(mockUser));
        });
        it('renders children for authenticated users', () => {
            render(
                <ProtectedRoute>
                    <div data-testid="protected-content">Secret Dashboard</div>
                </ProtectedRoute>
            );
            expect(screen.getByTestId('protected-content')).toBeInTheDocument();
            expect(screen.getByText('Secret Dashboard')).toBeInTheDocument();
        });
        it('does not trigger redirect for authenticated users', () => {
            render(
                <ProtectedRoute>
                    <div>Protected content</div>
                </ProtectedRoute>
            );
            expect(mockRouter.visit).not.toHaveBeenCalled();
        });
        it('renders children even with custom redirectTo', () => {
            render(
                <ProtectedRoute redirectTo="/custom-login">
                    <div data-testid="protected-content">Dashboard</div>
                </ProtectedRoute>
            );
            expect(screen.getByTestId('protected-content')).toBeInTheDocument();
            expect(mockRouter.visit).not.toHaveBeenCalled();
        });
    });
    describe('when user is not authenticated', () => {
        beforeEach(() => {
            mockUsePage.mockReturnValue(createPage(null));
        });
        it('does not render children for unauthenticated users', () => {
            render(
                <ProtectedRoute>
                    <div data-testid="protected-content">Secret Dashboard</div>
                </ProtectedRoute>
            );
            expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
            expect(screen.queryByText('Secret Dashboard')).not.toBeInTheDocument();
        });
        it('redirects to default login page when not authenticated', () => {
            render(
                <ProtectedRoute>
                    <div>Protected content</div>
                </ProtectedRoute>
            );
            expect(mockRouter.visit).toHaveBeenCalledWith('/login', {
                preserveState: false,
            });
        });
        it('redirects to custom route when specified', () => {
            render(
                <ProtectedRoute redirectTo="/custom-login">
                    <div>Protected content</div>
                </ProtectedRoute>
            );
            expect(mockRouter.visit).toHaveBeenCalledWith('/custom-login', {
                preserveState: false,
            });
        });
        it('renders fallback when provided', () => {
            render(
                <ProtectedRoute fallback={<div data-testid="loading">Loading...</div>}>
                    <div>Protected content</div>
                </ProtectedRoute>
            );
            expect(screen.getByTestId('loading')).toBeInTheDocument();
            expect(screen.getByText('Loading...')).toBeInTheDocument();
            expect(mockRouter.visit).toHaveBeenCalledWith('/login', {
                preserveState: false,
            });
        });
        it('renders nothing when no fallback is provided', () => {
            const { container } = render(
                <ProtectedRoute>
                    <div>Protected content</div>
                </ProtectedRoute>
            );
            // Should render empty fragment (no content)
            expect(container.firstChild).toBeNull();
            expect(mockRouter.visit).toHaveBeenCalledWith('/login', {
                preserveState: false,
            });
        });
    });
    describe('when auth prop is missing or malformed', () => {
        it('handles missing auth prop gracefully', () => {
            mockUsePage.mockReturnValue({
                ...createPage(undefined),
                props: { errors: {}, auth: undefined },
            });
            render(
                <ProtectedRoute>
                    <div>Protected content</div>
                </ProtectedRoute>
            );
            expect(mockRouter.visit).toHaveBeenCalledWith('/login', {
                preserveState: false,
            });
        });
        it('handles undefined auth.user gracefully', () => {
            mockUsePage.mockReturnValue({
                ...createPage(undefined),
                props: { errors: {}, auth: {} },
            });
            render(
                <ProtectedRoute>
                    <div>Protected content</div>
                </ProtectedRoute>
            );
            expect(mockRouter.visit).toHaveBeenCalledWith('/login', {
                preserveState: false,
            });
        });
    });
    describe('edge cases', () => {
        it('handles rendering gracefully in different environments', () => {
            mockUsePage.mockReturnValue(createPage(null));
            const { container } = render(
                <ProtectedRoute fallback={<div data-testid="fallback">Loading...</div>}>
                    <div>Protected content</div>
                </ProtectedRoute>
            );
            expect(screen.getByTestId('fallback')).toBeInTheDocument();
            expect(container.textContent).toBe('Loading...');
        });
    });
});



