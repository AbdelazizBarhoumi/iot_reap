/**
 * Route generation utilities used by auto-generated routes
 */

export type QueryParamValue = string | number | boolean | null | undefined;

export type RouteQueryOptions = {
    query?: Record<string, QueryParamValue>;
    mergeQuery?: Record<string, QueryParamValue>;
};

export type RouteDefinition<T extends string | readonly string[] = string> = {
    url: string;
} & (T extends readonly string[] ? { methods: T } : { method: T });

export type RouteFormDefinition<T extends string | readonly string[] = string> = {
    action: string;
} & (T extends readonly string[] ? { methods: T } : { method: T });

/**
 * Convert query options to URL query string
 */
export function queryParams(options?: RouteQueryOptions): string {
    if (!options?.query && !options?.mergeQuery) {
        return '';
    }

    const params = options.query || options.mergeQuery || {};
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value !== null && value !== undefined && value !== '') {
            searchParams.append(key, String(value));
        }
    }

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
}

/**
 * Apply default values to URL parameters
 * Accepts undefined so generated optional-param routes don't error
 */
export function applyUrlDefaults<T extends Record<string, unknown>>(
    args: T | undefined,
): T {
    return (args ?? {}) as T;
}

/**
 * Validate that required parameters are provided
 */
export function validateParameters(
    args: Record<string, QueryParamValue> | undefined,
    requiredParams: string[],
): void {
    if (!args) return;

    for (const param of requiredParams) {
        if (!args[param]) {
            console.warn(`Missing required parameter: ${param}`);
        }
    }
}

/**
 * Create a form definition from a route definition
 */
export function createFormDefinition<T extends string>(
    url: string,
    method: T,
): RouteFormDefinition<T> {
    return {
        action: url,
        method,
    } as unknown as RouteFormDefinition<T>;
}