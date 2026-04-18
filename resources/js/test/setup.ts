import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './mocks/server';

// Mock ResizeObserver for Radix UI components
if (!global.ResizeObserver) {
    class ResizeObserverMock {
        observe() {}
        unobserve() {}
        disconnect() {}
    }
    global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
}

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
// Reset handlers after each test
afterEach(() => {
    cleanup();
    server.resetHandlers();
});
// Close server after all tests
afterAll(() => server.close());

