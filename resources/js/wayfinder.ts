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
    method?: T extends readonly string[] ? T[number] : T;
    methods?: T extends readonly string[] ? T : readonly T[];
};

export type RouteFormDefinition<T extends string | readonly string[] = string> = {
    action: string;
    method?: T extends readonly string[] ? T[number] : T;
    methods?: T extends readonly string[] ? T : readonly T[];
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
    args: Record<string, QueryParamValue> | undefined,
): Record<string, QueryParamValue> {
    return args || {};
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
