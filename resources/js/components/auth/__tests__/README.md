# Auth Component Tests

This directory contains comprehensive tests for authentication-related components and hooks.

## Test Files

### ProtectedRoute.test.tsx

Tests the `ProtectedRoute` component which provides client-side route protection for authenticated users.

**Test Coverage:**

- ✅ Renders children for authenticated users
- ✅ Redirects unauthenticated users to login (default and custom routes)
- ✅ Handles fallback component display during redirect
- ✅ Gracefully handles missing or malformed auth props
- ✅ Does not render protected content for unauthenticated users

**Key Mocking:**

- `@inertiajs/react` - Mocks `usePage` and `router.visit` functions
- Uses proper TypeScript interfaces for User types
- Handles both authenticated and unauthenticated states

### useAuth.test.ts (in hooks/**tests**)

Tests the `useAuth` hook which provides access to user authentication state and logout functionality.

**Test Coverage:**

- ✅ Returns authenticated user when available
- ✅ Provides setUser, clear, and logout functions
- ✅ Logout calls both setUser(null) and clear() in correct order
- ✅ Hook stability and memoization of functions
- ✅ Handles multiple concurrent logout calls safely
- ✅ Works correctly when no user is authenticated

**Key Mocking:**

- `@/store/authStore` - Mocks Zustand auth store with all methods
- Tests hook behavior with various user states
- Verifies proper function call order and memoization

## Testing Framework

- **Test Runner**: Vitest
- **Component Testing**: @testing-library/react
- **Mocking**: Vitest's vi.mock()
- **API Mocking**: MSW (Mock Service Worker) handlers available

## Running Tests

```bash
# Run all auth tests
npm test -- resources/js/components/auth/__tests__/ resources/js/hooks/__tests__/useAuth.test.ts

# Run specific test file
npm test -- resources/js/components/auth/__tests__/ProtectedRoute.test.tsx

# Run with watch mode
npm test -- --watch resources/js/components/auth/__tests__/
```

## Key Testing Patterns

1. **Component Testing**: Uses `render()` and `screen` queries from Testing Library
2. **Hook Testing**: Uses `renderHook()` and `act()` for hook-specific testing
3. **Mocking**: Comprehensive mocking of external dependencies (Inertia, Zustand)
4. **TypeScript**: Full TypeScript support with proper interface usage
5. **Edge Cases**: Tests handle malformed props, concurrent operations, and edge states

## Notes

- Tests follow IoT-REAP project conventions (TypeScript interfaces, session-based auth)
- MSW handlers in `/test/mocks/handlers.ts` provide auth endpoints for integration testing
- Tests are compatible with the session-based authentication approach used in the project
- All tests follow the AAA pattern: Arrange, Act, Assert
