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
} & (T extends readonly string[] ? {
    methods: T;
} : {
    method: T;
});
export type RouteFormDefinition<T extends string | readonly string[] = string> = {
    action: string;
} & (T extends readonly string[] ? {
    methods: T;
} : {
    method: T;
});
/**
 * Convert query options to URL query string
 */
export declare function queryParams(options?: RouteQueryOptions): string;
/**
 * Apply default values to URL parameters
 */
export declare function applyUrlDefaults<T extends Record<string, unknown>>(args: T): T;
/**
 * Validate that required parameters are provided
 */
export declare function validateParameters(args: Record<string, QueryParamValue> | undefined, requiredParams: string[]): void;
/**
 * Create a form definition from a route definition
 */
export declare function createFormDefinition<T extends string>(url: string, method: T): any;
