import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\VideoController::index
 * @see app/Http/Controllers/VideoController.php:252
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions'
 */
export const index = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/teaching/trainingUnits/{trainingUnitId}/video/captions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\VideoController::index
 * @see app/Http/Controllers/VideoController.php:252
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions'
 */
index.url = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return index.definition.url
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VideoController::index
 * @see app/Http/Controllers/VideoController.php:252
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions'
 */
index.get = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\VideoController::index
 * @see app/Http/Controllers/VideoController.php:252
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions'
 */
index.head = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\VideoController::index
 * @see app/Http/Controllers/VideoController.php:252
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions'
 */
    const indexForm = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\VideoController::index
 * @see app/Http/Controllers/VideoController.php:252
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions'
 */
        indexForm.get = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\VideoController::index
 * @see app/Http/Controllers/VideoController.php:252
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions'
 */
        indexForm.head = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\VideoController::store
 * @see app/Http/Controllers/VideoController.php:270
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions'
 */
export const store = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/teaching/trainingUnits/{trainingUnitId}/video/captions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\VideoController::store
 * @see app/Http/Controllers/VideoController.php:270
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions'
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
 * @see app/Http/Controllers/VideoController.php:270
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions'
 */
store.post = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\VideoController::store
 * @see app/Http/Controllers/VideoController.php:270
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions'
 */
    const storeForm = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\VideoController::store
 * @see app/Http/Controllers/VideoController.php:270
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions'
 */
        storeForm.post = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\VideoController::destroy
 * @see app/Http/Controllers/VideoController.php:300
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions/{captionId}'
 */
export const destroy = (args: { trainingUnitId: string | number, captionId: string | number } | [trainingUnitId: string | number, captionId: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/teaching/trainingUnits/{trainingUnitId}/video/captions/{captionId}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\VideoController::destroy
 * @see app/Http/Controllers/VideoController.php:300
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions/{captionId}'
 */
destroy.url = (args: { trainingUnitId: string | number, captionId: string | number } | [trainingUnitId: string | number, captionId: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    trainingUnitId: args[0],
                    captionId: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingUnitId: args.trainingUnitId,
                                captionId: args.captionId,
                }

    return destroy.definition.url
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace('{captionId}', parsedArgs.captionId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VideoController::destroy
 * @see app/Http/Controllers/VideoController.php:300
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions/{captionId}'
 */
destroy.delete = (args: { trainingUnitId: string | number, captionId: string | number } | [trainingUnitId: string | number, captionId: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\VideoController::destroy
 * @see app/Http/Controllers/VideoController.php:300
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions/{captionId}'
 */
    const destroyForm = (args: { trainingUnitId: string | number, captionId: string | number } | [trainingUnitId: string | number, captionId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
 * @see app/Http/Controllers/VideoController.php:300
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions/{captionId}'
 */
        destroyForm.delete = (args: { trainingUnitId: string | number, captionId: string | number } | [trainingUnitId: string | number, captionId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const captions = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
destroy: Object.assign(destroy, destroy),
}

export default captions