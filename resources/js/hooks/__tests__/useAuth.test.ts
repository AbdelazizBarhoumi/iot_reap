import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useAuthStore } from '@/store/authStore';
import type { User } from '@/types/auth';
import { useAuth } from '../useAuth';
// Mock the auth store
vi.mock('@/store/authStore', () => ({
    useAuthStore: vi.fn(),
}));
const mockUseAuthStore = vi.mocked(useAuthStore);
describe('useAuth Hook', () => {
    const mockUser: User = {
        id: '1',
        name: 'Test Engineer',
        email: 'engineer@test.com',
        role: 'engineer',
        email_verified_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
    };
    const mockSetUser = vi.fn();
    const mockClear = vi.fn();
    beforeEach(() => {
        vi.clearAllMocks();
    });
    describe('when user is authenticated', () => {
        beforeEach(() => {
            mockUseAuthStore.mockImplementation((selector) => {
                const state = {
                    user: mockUser,
                    setUser: mockSetUser,
                    clear: mockClear,
                    isAuthenticated: () => true,
                };
                return selector(state);
            });
        });
        it('returns the authenticated user', () => {
            const { result } = renderHook(() => useAuth());
            expect(result.current.user).toEqual(mockUser);
        });
        it('provides setUser function', () => {
            const { result } = renderHook(() => useAuth());
            expect(result.current.setUser).toBe(mockSetUser);
        });
        it('provides clear function', () => {
            const { result } = renderHook(() => useAuth());
            expect(result.current.clear).toBe(mockClear);
        });
        it('provides logout function that calls setUser with null and clear', () => {
            const { result } = renderHook(() => useAuth());
            act(() => {
                result.current.logout();
            });
            expect(mockSetUser).toHaveBeenCalledWith(null);
            expect(mockClear).toHaveBeenCalled();
        });
    });
    describe('when user is not authenticated', () => {
        beforeEach(() => {
            mockUseAuthStore.mockImplementation((selector) => {
                const state = {
                    user: null,
                    setUser: mockSetUser,
                    clear: mockClear,
                    isAuthenticated: () => false,
                };
                return selector(state);
            });
        });
        it('returns null user', () => {
            const { result } = renderHook(() => useAuth());
            expect(result.current.user).toBeNull();
        });
        it('still provides all functions', () => {
            const { result } = renderHook(() => useAuth());
            expect(result.current.setUser).toBe(mockSetUser);
            expect(result.current.clear).toBe(mockClear);
            expect(typeof result.current.logout).toBe('function');
        });
        it('logout function works even when no user is present', () => {
            const { result } = renderHook(() => useAuth());
            act(() => {
                result.current.logout();
            });
            expect(mockSetUser).toHaveBeenCalledWith(null);
            expect(mockClear).toHaveBeenCalled();
        });
    });
    describe('logout function behavior', () => {
        beforeEach(() => {
            mockUseAuthStore.mockImplementation((selector) => {
                const state = {
                    user: mockUser,
                    setUser: mockSetUser,
                    clear: mockClear,
                    isAuthenticated: () => true,
                };
                return selector(state);
            });
        });
        it('is memoized and stable across re-renders', () => {
            const { result, rerender } = renderHook(() => useAuth());
            const firstLogout = result.current.logout;
            rerender();
            expect(result.current.logout).toBe(firstLogout);
        });
        it('calls functions in correct order for logout', () => {
            const { result } = renderHook(() => useAuth());
            act(() => {
                result.current.logout();
            });
            expect(mockSetUser).toHaveBeenCalledWith(null);
            expect(mockClear).toHaveBeenCalled();
            // Verify call order - setUser should be called before clear
            const setUserCall = mockSetUser.mock.invocationCallOrder[0];
            const clearCall = mockClear.mock.invocationCallOrder[0];
            expect(setUserCall).toBeLessThan(clearCall);
        });
    });
    describe('hook consistency', () => {
        it('returns consistent function references when dependencies do not change', () => {
            mockUseAuthStore.mockImplementation((selector) => {
                const state = {
                    user: mockUser,
                    setUser: mockSetUser,
                    clear: mockClear,
                    isAuthenticated: () => true,
                };
                return selector(state);
            });
            const { result, rerender } = renderHook(() => useAuth());
            const initialSetUser = result.current.setUser;
            const initialClear = result.current.clear;
            const initialLogout = result.current.logout;
            rerender();
            expect(result.current.setUser).toBe(initialSetUser);
            expect(result.current.clear).toBe(initialClear);
            expect(result.current.logout).toBe(initialLogout);
        });
        it('handles user state changes correctly', () => {
            let currentUser: User | null = mockUser;
            mockUseAuthStore.mockImplementation((selector) => {
                const state = {
                    user: currentUser,
                    setUser: (user: User | null) => {
                        currentUser = user;
                        mockSetUser(user);
                    },
                    clear: mockClear,
                    isAuthenticated: () => !!currentUser,
                };
                return selector(state);
            });
            const { result, rerender } = renderHook(() => useAuth());
            expect(result.current.user).toEqual(mockUser);
            // Simulate user logging out
            act(() => {
                currentUser = null;
            });
            rerender();
            expect(result.current.user).toBeNull();
        });
    });
    describe('multiple concurrent calls', () => {
        beforeEach(() => {
            mockUseAuthStore.mockImplementation((selector) => {
                const state = {
                    user: mockUser,
                    setUser: mockSetUser,
                    clear: mockClear,
                    isAuthenticated: () => true,
                };
                return selector(state);
            });
        });
        it('handles multiple logout calls safely', () => {
            const { result } = renderHook(() => useAuth());
            act(() => {
                result.current.logout();
                result.current.logout();
                result.current.logout();
            });
            // Should call each function exactly 3 times
            expect(mockSetUser).toHaveBeenCalledTimes(3);
            expect(mockClear).toHaveBeenCalledTimes(3);
            // All calls should be with null for setUser
            mockSetUser.mock.calls.forEach((call) => {
                expect(call[0]).toBeNull();
            });
        });
    });
});

