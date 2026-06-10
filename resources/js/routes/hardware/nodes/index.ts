import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\HardwareController::refresh
 * @see app/Http/Controllers/HardwareController.php:101
 * @route '/hardware/nodes/{node}/refresh'
 */
export const refresh = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refresh.url(args, options),
    method: 'post',
})

refresh.definition = {
    methods: ["post"],
    url: '/hardware/nodes/{node}/refresh',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\HardwareController::refresh
 * @see app/Http/Controllers/HardwareController.php:101
 * @route '/hardware/nodes/{node}/refresh'
 */
refresh.url = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { node: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { node: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    node: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        node: typeof args.node === 'object'
                ? args.node.id
                : args.node,
                }

    return refresh.definition.url
            .replace('{node}', parsedArgs.node.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::refresh
 * @see app/Http/Controllers/HardwareController.php:101
 * @route '/hardware/nodes/{node}/refresh'
 */
refresh.post = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refresh.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\HardwareController::refresh
 * @see app/Http/Controllers/HardwareController.php:101
 * @route '/hardware/nodes/{node}/refresh'
 */
    const refreshForm = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: refresh.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HardwareController::refresh
 * @see app/Http/Controllers/HardwareController.php:101
 * @route '/hardware/nodes/{node}/refresh'
 */
        refreshForm.post = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: refresh.url(args, options),
            method: 'post',
        })
    
    refresh.form = refreshForm
/**
* @see \App\Http\Controllers\HardwareController::health
 * @see app/Http/Controllers/HardwareController.php:881
 * @route '/hardware/nodes/{node}/health'
 */
export const health = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: health.url(args, options),
    method: 'post',
})

health.definition = {
    methods: ["post"],
    url: '/hardware/nodes/{node}/health',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\HardwareController::health
 * @see app/Http/Controllers/HardwareController.php:881
 * @route '/hardware/nodes/{node}/health'
 */
health.url = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { node: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { node: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    node: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        node: typeof args.node === 'object'
                ? args.node.id
                : args.node,
                }

    return health.definition.url
            .replace('{node}', parsedArgs.node.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::health
 * @see app/Http/Controllers/HardwareController.php:881
 * @route '/hardware/nodes/{node}/health'
 */
health.post = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: health.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\HardwareController::health
 * @see app/Http/Controllers/HardwareController.php:881
 * @route '/hardware/nodes/{node}/health'
 */
    const healthForm = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: health.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HardwareController::health
 * @see app/Http/Controllers/HardwareController.php:881
 * @route '/hardware/nodes/{node}/health'
 */
        healthForm.post = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: health.url(args, options),
            method: 'post',
        })
    
    health.form = healthForm
const nodes = {
    refresh: Object.assign(refresh, refresh),
health: Object.assign(health, health),
}

export default nodes