import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import captions from './captions'
/**
* @see \App\Http\Controllers\VideoController::show
 * @see app/Http/Controllers/VideoController.php:34
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
export const show = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/teaching/trainingUnits/{trainingUnitId}/video',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\VideoController::show
 * @see app/Http/Controllers/VideoController.php:34
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
show.url = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingUnitId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    trainingUnitId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingUnitId: args.trainingUnitId,
                }

    return show.definition.url
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VideoController::show
 * @see app/Http/Controllers/VideoController.php:34
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
show.get = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\VideoController::show
 * @see app/Http/Controllers/VideoController.php:34
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
show.head = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\VideoController::show
 * @see app/Http/Controllers/VideoController.php:34
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
    const showForm = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\VideoController::show
 * @see app/Http/Controllers/VideoController.php:34
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
        showForm.get = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\VideoController::show
 * @see app/Http/Controllers/VideoController.php:34
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
        showForm.head = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \App\Http\Controllers\VideoController::status
 * @see app/Http/Controllers/VideoController.php:137
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/status'
 */
export const status = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status.url(args, options),
    method: 'get',
})

status.definition = {
    methods: ["get","head"],
    url: '/teaching/trainingUnits/{trainingUnitId}/video/status',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\VideoController::status
 * @see app/Http/Controllers/VideoController.php:137
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/status'
 */
status.url = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingUnitId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    trainingUnitId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingUnitId: args.trainingUnitId,
                }

    return status.definition.url
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VideoController::status
 * @see app/Http/Controllers/VideoController.php:137
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/status'
 */
status.get = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\VideoController::status
 * @see app/Http/Controllers/VideoController.php:137
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/status'
 */
status.head = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: status.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\VideoController::status
 * @see app/Http/Controllers/VideoController.php:137
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/status'
 */
    const statusForm = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: status.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\VideoController::status
 * @see app/Http/Controllers/VideoController.php:137
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/status'
 */
        statusForm.get = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: status.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\VideoController::status
 * @see app/Http/Controllers/VideoController.php:137
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/status'
 */
        statusForm.head = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: status.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    status.form = statusForm
/**
* @see \App\Http\Controllers\VideoController::store
 * @see app/Http/Controllers/VideoController.php:52
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
export const store = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/teaching/trainingUnits/{trainingUnitId}/video',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\VideoController::store
 * @see app/Http/Controllers/VideoController.php:52
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
store.url = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingUnitId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    trainingUnitId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingUnitId: args.trainingUnitId,
                }

    return store.definition.url
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VideoController::store
 * @see app/Http/Controllers/VideoController.php:52
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
store.post = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\VideoController::store
 * @see app/Http/Controllers/VideoController.php:52
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
    const storeForm = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\VideoController::store
 * @see app/Http/Controllers/VideoController.php:52
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
        storeForm.post = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\VideoController::destroy
 * @see app/Http/Controllers/VideoController.php:82
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
export const destroy = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/teaching/trainingUnits/{trainingUnitId}/video',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\VideoController::destroy
 * @see app/Http/Controllers/VideoController.php:82
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
destroy.url = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingUnitId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    trainingUnitId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingUnitId: args.trainingUnitId,
                }

    return destroy.definition.url
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VideoController::destroy
 * @see app/Http/Controllers/VideoController.php:82
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
destroy.delete = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\VideoController::destroy
 * @see app/Http/Controllers/VideoController.php:82
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
    const destroyForm = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\VideoController::destroy
 * @see app/Http/Controllers/VideoController.php:82
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
        destroyForm.delete = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
/**
* @see \App\Http\Controllers\VideoController::retry
 * @see app/Http/Controllers/VideoController.php:107
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/retry'
 */
export const retry = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: retry.url(args, options),
    method: 'post',
})

retry.definition = {
    methods: ["post"],
    url: '/teaching/trainingUnits/{trainingUnitId}/video/retry',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\VideoController::retry
 * @see app/Http/Controllers/VideoController.php:107
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/retry'
 */
retry.url = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingUnitId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    trainingUnitId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingUnitId: args.trainingUnitId,
                }

    return retry.definition.url
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VideoController::retry
 * @see app/Http/Controllers/VideoController.php:107
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/retry'
 */
retry.post = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: retry.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\VideoController::retry
 * @see app/Http/Controllers/VideoController.php:107
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/retry'
 */
    const retryForm = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: retry.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\VideoController::retry
 * @see app/Http/Controllers/VideoController.php:107
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/retry'
 */
        retryForm.post = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: retry.url(args, options),
            method: 'post',
        })
    
    retry.form = retryForm
const video = {
    show: Object.assign(show, show),
status: Object.assign(status, status),
store: Object.assign(store, store),
destroy: Object.assign(destroy, destroy),
retry: Object.assign(retry, retry),
captions: Object.assign(captions, captions),
}

export default video