import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\ArticleController::show
 * @see app/Http/Controllers/ArticleController.php:26
 * @route '/teaching/trainingUnits/{trainingUnitId}/article'
 */
export const show = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/teaching/trainingUnits/{trainingUnitId}/article',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ArticleController::show
 * @see app/Http/Controllers/ArticleController.php:26
 * @route '/teaching/trainingUnits/{trainingUnitId}/article'
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
* @see \App\Http\Controllers\ArticleController::show
 * @see app/Http/Controllers/ArticleController.php:26
 * @route '/teaching/trainingUnits/{trainingUnitId}/article'
 */
show.get = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ArticleController::show
 * @see app/Http/Controllers/ArticleController.php:26
 * @route '/teaching/trainingUnits/{trainingUnitId}/article'
 */
show.head = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ArticleController::show
 * @see app/Http/Controllers/ArticleController.php:26
 * @route '/teaching/trainingUnits/{trainingUnitId}/article'
 */
    const showForm = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ArticleController::show
 * @see app/Http/Controllers/ArticleController.php:26
 * @route '/teaching/trainingUnits/{trainingUnitId}/article'
 */
        showForm.get = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ArticleController::show
 * @see app/Http/Controllers/ArticleController.php:26
 * @route '/teaching/trainingUnits/{trainingUnitId}/article'
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
* @see \App\Http\Controllers\ArticleController::upsert
 * @see app/Http/Controllers/ArticleController.php:47
 * @route '/teaching/trainingUnits/{trainingUnitId}/article'
 */
export const upsert = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upsert.url(args, options),
    method: 'post',
})

upsert.definition = {
    methods: ["post"],
    url: '/teaching/trainingUnits/{trainingUnitId}/article',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ArticleController::upsert
 * @see app/Http/Controllers/ArticleController.php:47
 * @route '/teaching/trainingUnits/{trainingUnitId}/article'
 */
upsert.url = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return upsert.definition.url
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ArticleController::upsert
 * @see app/Http/Controllers/ArticleController.php:47
 * @route '/teaching/trainingUnits/{trainingUnitId}/article'
 */
upsert.post = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upsert.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ArticleController::upsert
 * @see app/Http/Controllers/ArticleController.php:47
 * @route '/teaching/trainingUnits/{trainingUnitId}/article'
 */
    const upsertForm = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: upsert.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ArticleController::upsert
 * @see app/Http/Controllers/ArticleController.php:47
 * @route '/teaching/trainingUnits/{trainingUnitId}/article'
 */
        upsertForm.post = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: upsert.url(args, options),
            method: 'post',
        })
    
    upsert.form = upsertForm
/**
* @see \App\Http\Controllers\ArticleController::destroy
 * @see app/Http/Controllers/ArticleController.php:63
 * @route '/teaching/trainingUnits/{trainingUnitId}/article'
 */
export const destroy = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/teaching/trainingUnits/{trainingUnitId}/article',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ArticleController::destroy
 * @see app/Http/Controllers/ArticleController.php:63
 * @route '/teaching/trainingUnits/{trainingUnitId}/article'
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
* @see \App\Http\Controllers\ArticleController::destroy
 * @see app/Http/Controllers/ArticleController.php:63
 * @route '/teaching/trainingUnits/{trainingUnitId}/article'
 */
destroy.delete = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\ArticleController::destroy
 * @see app/Http/Controllers/ArticleController.php:63
 * @route '/teaching/trainingUnits/{trainingUnitId}/article'
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
* @see \App\Http\Controllers\ArticleController::destroy
 * @see app/Http/Controllers/ArticleController.php:63
 * @route '/teaching/trainingUnits/{trainingUnitId}/article'
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
const article = {
    show: Object.assign(show, show),
upsert: Object.assign(upsert, upsert),
destroy: Object.assign(destroy, destroy),
}

export default article