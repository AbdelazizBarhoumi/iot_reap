import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import queue from './queue'
/**
* @see \App\Http\Controllers\SessionHardwareController::index
 * @see app/Http/Controllers/SessionHardwareController.php:40
 * @route '/sessions/{session}/hardware'
 */
export const index = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/sessions/{session}/hardware',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SessionHardwareController::index
 * @see app/Http/Controllers/SessionHardwareController.php:40
 * @route '/sessions/{session}/hardware'
 */
index.url = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { session: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { session: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    session: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        session: typeof args.session === 'object'
                ? args.session.id
                : args.session,
                }

    return index.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionHardwareController::index
 * @see app/Http/Controllers/SessionHardwareController.php:40
 * @route '/sessions/{session}/hardware'
 */
index.get = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SessionHardwareController::index
 * @see app/Http/Controllers/SessionHardwareController.php:40
 * @route '/sessions/{session}/hardware'
 */
index.head = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SessionHardwareController::index
 * @see app/Http/Controllers/SessionHardwareController.php:40
 * @route '/sessions/{session}/hardware'
 */
    const indexForm = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SessionHardwareController::index
 * @see app/Http/Controllers/SessionHardwareController.php:40
 * @route '/sessions/{session}/hardware'
 */
        indexForm.get = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SessionHardwareController::index
 * @see app/Http/Controllers/SessionHardwareController.php:40
 * @route '/sessions/{session}/hardware'
 */
        indexForm.head = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\SessionHardwareController::attach
 * @see app/Http/Controllers/SessionHardwareController.php:139
 * @route '/sessions/{session}/hardware/devices/{device}/attach'
 */
export const attach = (args: { session: string | { id: string }, device: number | { id: number } } | [session: string | { id: string }, device: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: attach.url(args, options),
    method: 'post',
})

attach.definition = {
    methods: ["post"],
    url: '/sessions/{session}/hardware/devices/{device}/attach',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SessionHardwareController::attach
 * @see app/Http/Controllers/SessionHardwareController.php:139
 * @route '/sessions/{session}/hardware/devices/{device}/attach'
 */
attach.url = (args: { session: string | { id: string }, device: number | { id: number } } | [session: string | { id: string }, device: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    session: args[0],
                    device: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        session: typeof args.session === 'object'
                ? args.session.id
                : args.session,
                                device: typeof args.device === 'object'
                ? args.device.id
                : args.device,
                }

    return attach.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace('{device}', parsedArgs.device.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionHardwareController::attach
 * @see app/Http/Controllers/SessionHardwareController.php:139
 * @route '/sessions/{session}/hardware/devices/{device}/attach'
 */
attach.post = (args: { session: string | { id: string }, device: number | { id: number } } | [session: string | { id: string }, device: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: attach.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\SessionHardwareController::attach
 * @see app/Http/Controllers/SessionHardwareController.php:139
 * @route '/sessions/{session}/hardware/devices/{device}/attach'
 */
    const attachForm = (args: { session: string | { id: string }, device: number | { id: number } } | [session: string | { id: string }, device: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: attach.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SessionHardwareController::attach
 * @see app/Http/Controllers/SessionHardwareController.php:139
 * @route '/sessions/{session}/hardware/devices/{device}/attach'
 */
        attachForm.post = (args: { session: string | { id: string }, device: number | { id: number } } | [session: string | { id: string }, device: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: attach.url(args, options),
            method: 'post',
        })
    
    attach.form = attachForm
/**
* @see \App\Http\Controllers\SessionHardwareController::detach
 * @see app/Http/Controllers/SessionHardwareController.php:336
 * @route '/sessions/{session}/hardware/devices/{device}/detach'
 */
export const detach = (args: { session: string | { id: string }, device: number | { id: number } } | [session: string | { id: string }, device: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: detach.url(args, options),
    method: 'post',
})

detach.definition = {
    methods: ["post"],
    url: '/sessions/{session}/hardware/devices/{device}/detach',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SessionHardwareController::detach
 * @see app/Http/Controllers/SessionHardwareController.php:336
 * @route '/sessions/{session}/hardware/devices/{device}/detach'
 */
detach.url = (args: { session: string | { id: string }, device: number | { id: number } } | [session: string | { id: string }, device: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    session: args[0],
                    device: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        session: typeof args.session === 'object'
                ? args.session.id
                : args.session,
                                device: typeof args.device === 'object'
                ? args.device.id
                : args.device,
                }

    return detach.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace('{device}', parsedArgs.device.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionHardwareController::detach
 * @see app/Http/Controllers/SessionHardwareController.php:336
 * @route '/sessions/{session}/hardware/devices/{device}/detach'
 */
detach.post = (args: { session: string | { id: string }, device: number | { id: number } } | [session: string | { id: string }, device: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: detach.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\SessionHardwareController::detach
 * @see app/Http/Controllers/SessionHardwareController.php:336
 * @route '/sessions/{session}/hardware/devices/{device}/detach'
 */
    const detachForm = (args: { session: string | { id: string }, device: number | { id: number } } | [session: string | { id: string }, device: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: detach.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SessionHardwareController::detach
 * @see app/Http/Controllers/SessionHardwareController.php:336
 * @route '/sessions/{session}/hardware/devices/{device}/detach'
 */
        detachForm.post = (args: { session: string | { id: string }, device: number | { id: number } } | [session: string | { id: string }, device: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: detach.url(args, options),
            method: 'post',
        })
    
    detach.form = detachForm
const hardware = {
    index: Object.assign(index, index),
attach: Object.assign(attach, attach),
detach: Object.assign(detach, detach),
queue: Object.assign(queue, queue),
}

export default hardware