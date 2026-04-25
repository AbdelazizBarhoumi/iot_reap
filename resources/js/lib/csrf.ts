/**
 * CSRF Token Utilities
 *
 * Centralized CSRF token handling for all API requests.
 * Laravel provides the XSRF-TOKEN cookie which is read by this module.
 */
/**
 * Extract CSRF token from meta tag (server-rendered pages).
 */
export function getMetaCsrfToken(): string | null {
    const meta = document.querySelector<HTMLMetaElement>(
        'meta[name="csrf-token"]',
    );
    return meta?.content ?? null;
}
/**
 * Extract CSRF token from cookie (for SPA/XHR requests).
 * Laravel sets XSRF-TOKEN cookie which should be sent as X-XSRF-TOKEN header.
 */
export function getCookieCsrfToken(): string | null {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'XSRF-TOKEN') {
            // Laravel URL-encodes the token
            return decodeURIComponent(value);
        }
    }
    return null;
}
/**
 * Get the CSRF token from the best available source.
 * Prefers meta tag (more reliable) over cookie.
 */
export function getCsrfToken(): string | null {
    return getMetaCsrfToken() ?? getCookieCsrfToken();
}
/**
 * Get headers object with CSRF token for fetch requests.
 */
export function getCsrfHeaders(): Record<string, string> {
    const token = getCsrfToken();
    if (!token) {
        console.warn('[CSRF] No CSRF token found. Request may fail.');
        return {};
    }
    return {
        'X-CSRF-TOKEN': token,
        'X-XSRF-TOKEN': token,
    };
}
/**
 * Add CSRF token to existing headers.
 */
export function withCsrf(headers: HeadersInit = {}): HeadersInit {
    const csrfHeaders = getCsrfHeaders();
    if (headers instanceof Headers) {
        Object.entries(csrfHeaders).forEach(([key, value]) => {
            (headers as Headers).set(key, value);
        });
        return headers;
    }
    return { ...headers, ...csrfHeaders };
}
