/**
 * Route generation utilities used by auto-generated routes
 */

export type RouteQueryOptions = {
    query?: Record<string, any>;
    mergeQuery?: Record<string, any>;
};

export type RouteDefinition<T extends string = string> = {
    url: string;
    method: T;
};

export type RouteFormDefinition<T extends string = string> = {
    action: string;
    method: T;
};

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
 */
export function applyUrlDefaults(
    args: Record<string, any> | undefined,
): Record<string, any> {
    return args || {};
}

/**
 * Validate that required parameters are provided
 */
export function validateParameters(
    args: Record<string, any> | undefined,
    requiredParams: string[],
): void {
    if (!args) return;

    for (const param of requiredParams) {
        if (!args[param]) {
            console.warn(`Missing required parameter: ${param}`);
        }
    }
}
