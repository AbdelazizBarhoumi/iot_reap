/**
 * Standard API response wrapper with data
 */
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success?: boolean;
}
/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
    data: T[];
    links: PaginationLinks;
    meta: PaginationMeta;
}
/**
 * Pagination metadata
 */
export interface PaginationMeta {
    current_page: number;
    from: number | null;
    last_page: number;
    links: PaginationLink[];
    path: string;
    per_page: number;
    to: number | null;
    total: number;
}
/**
 * Pagination links
 */
export interface PaginationLinks {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
}
/**
 * Individual pagination link
 */
export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}
/**
 * API error response structure
 */
export interface ApiErrorResponse {
    message: string;
    errors?: Record<string, string[]>;
    exception?: string;
    file?: string;
    line?: number;
    trace?: Array<{
        file: string;
        line: number;
        function: string;
        class?: string;
    }>;
}
/**
 * Form validation error from Laravel
 */
export interface FormValidationError {
    message: string;
    errors: Record<string, string[]>;
}
/**
 * Check if an error is a validation error
 */
export function isValidationError(
    error: unknown,
): error is FormValidationError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'errors' in error &&
        typeof (error as FormValidationError).errors === 'object'
    );
}
/**
 * Get first validation error message for a field
 */
export function getFieldError(
    errors: Record<string, string[]> | undefined,
    field: string,
): string | undefined {
    return errors?.[field]?.[0];
}
/**
 * Notification message structure for WebSocket
 */
export interface NotificationMessage {
    id: string;
    type: string;
    data: Record<string, unknown>;
    read_at: string | null;
    created_at: string;
}
/**
 * Real-time notification event
 */
export interface NotificationEvent {
    notification: NotificationMessage;
}
/**
 * Simple success/error response
 */
export interface SimpleResponse {
    success: boolean;
    message: string;
}
/**
 * Resource deleted response
 */
export interface DeletedResponse {
    success: boolean;
    message: string;
    deleted_id?: number | string;
}
import type { Auth } from './auth';
/**
 * Shared page props available on all pages (from Inertia)
 */
export interface PageProps {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

