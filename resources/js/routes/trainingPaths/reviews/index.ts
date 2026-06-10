import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\TrainingPathReviewController::index
 * @see app/Http/Controllers/TrainingPathReviewController.php:20
 * @route '/trainingPaths/{trainingPathId}/reviews'
 */
export const index = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/trainingPaths/{trainingPathId}/reviews',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TrainingPathReviewController::index
 * @see app/Http/Controllers/TrainingPathReviewController.php:20
 * @route '/trainingPaths/{trainingPathId}/reviews'
 */
index.url = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingPathId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    trainingPathId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPathId: args.trainingPathId,
                }

    return index.definition.url
            .replace('{trainingPathId}', parsedArgs.trainingPathId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingPathReviewController::index
 * @see app/Http/Controllers/TrainingPathReviewController.php:20
 * @route '/trainingPaths/{trainingPathId}/reviews'
 */
index.get = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TrainingPathReviewController::index
 * @see app/Http/Controllers/TrainingPathReviewController.php:20
 * @route '/trainingPaths/{trainingPathId}/reviews'
 */
index.head = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TrainingPathReviewController::index
 * @see app/Http/Controllers/TrainingPathReviewController.php:20
 * @route '/trainingPaths/{trainingPathId}/reviews'
 */
    const indexForm = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TrainingPathReviewController::index
 * @see app/Http/Controllers/TrainingPathReviewController.php:20
 * @route '/trainingPaths/{trainingPathId}/reviews'
 */
        indexForm.get = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TrainingPathReviewController::index
 * @see app/Http/Controllers/TrainingPathReviewController.php:20
 * @route '/trainingPaths/{trainingPathId}/reviews'
 */
        indexForm.head = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\TrainingPathReviewController::stats
 * @see app/Http/Controllers/TrainingPathReviewController.php:41
 * @route '/trainingPaths/{trainingPathId}/reviews/stats'
 */
export const stats = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stats.url(args, options),
    method: 'get',
})

stats.definition = {
    methods: ["get","head"],
    url: '/trainingPaths/{trainingPathId}/reviews/stats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TrainingPathReviewController::stats
 * @see app/Http/Controllers/TrainingPathReviewController.php:41
 * @route '/trainingPaths/{trainingPathId}/reviews/stats'
 */
stats.url = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingPathId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    trainingPathId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPathId: args.trainingPathId,
                }

    return stats.definition.url
            .replace('{trainingPathId}', parsedArgs.trainingPathId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingPathReviewController::stats
 * @see app/Http/Controllers/TrainingPathReviewController.php:41
 * @route '/trainingPaths/{trainingPathId}/reviews/stats'
 */
stats.get = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stats.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TrainingPathReviewController::stats
 * @see app/Http/Controllers/TrainingPathReviewController.php:41
 * @route '/trainingPaths/{trainingPathId}/reviews/stats'
 */
stats.head = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: stats.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TrainingPathReviewController::stats
 * @see app/Http/Controllers/TrainingPathReviewController.php:41
 * @route '/trainingPaths/{trainingPathId}/reviews/stats'
 */
    const statsForm = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: stats.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TrainingPathReviewController::stats
 * @see app/Http/Controllers/TrainingPathReviewController.php:41
 * @route '/trainingPaths/{trainingPathId}/reviews/stats'
 */
        statsForm.get = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: stats.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TrainingPathReviewController::stats
 * @see app/Http/Controllers/TrainingPathReviewController.php:41
 * @route '/trainingPaths/{trainingPathId}/reviews/stats'
 */
        statsForm.head = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: stats.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    stats.form = statsForm
/**
* @see \App\Http\Controllers\TrainingPathReviewController::my
 * @see app/Http/Controllers/TrainingPathReviewController.php:51
 * @route '/trainingPaths/{trainingPathId}/reviews/my'
 */
export const my = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: my.url(args, options),
    method: 'get',
})

my.definition = {
    methods: ["get","head"],
    url: '/trainingPaths/{trainingPathId}/reviews/my',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TrainingPathReviewController::my
 * @see app/Http/Controllers/TrainingPathReviewController.php:51
 * @route '/trainingPaths/{trainingPathId}/reviews/my'
 */
my.url = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingPathId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    trainingPathId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPathId: args.trainingPathId,
                }

    return my.definition.url
            .replace('{trainingPathId}', parsedArgs.trainingPathId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingPathReviewController::my
 * @see app/Http/Controllers/TrainingPathReviewController.php:51
 * @route '/trainingPaths/{trainingPathId}/reviews/my'
 */
my.get = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: my.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TrainingPathReviewController::my
 * @see app/Http/Controllers/TrainingPathReviewController.php:51
 * @route '/trainingPaths/{trainingPathId}/reviews/my'
 */
my.head = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: my.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TrainingPathReviewController::my
 * @see app/Http/Controllers/TrainingPathReviewController.php:51
 * @route '/trainingPaths/{trainingPathId}/reviews/my'
 */
    const myForm = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: my.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TrainingPathReviewController::my
 * @see app/Http/Controllers/TrainingPathReviewController.php:51
 * @route '/trainingPaths/{trainingPathId}/reviews/my'
 */
        myForm.get = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: my.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TrainingPathReviewController::my
 * @see app/Http/Controllers/TrainingPathReviewController.php:51
 * @route '/trainingPaths/{trainingPathId}/reviews/my'
 */
        myForm.head = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: my.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    my.form = myForm
/**
* @see \App\Http\Controllers\TrainingPathReviewController::store
 * @see app/Http/Controllers/TrainingPathReviewController.php:71
 * @route '/trainingPaths/{trainingPathId}/reviews'
 */
export const store = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/trainingPaths/{trainingPathId}/reviews',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TrainingPathReviewController::store
 * @see app/Http/Controllers/TrainingPathReviewController.php:71
 * @route '/trainingPaths/{trainingPathId}/reviews'
 */
store.url = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingPathId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    trainingPathId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPathId: args.trainingPathId,
                }

    return store.definition.url
            .replace('{trainingPathId}', parsedArgs.trainingPathId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingPathReviewController::store
 * @see app/Http/Controllers/TrainingPathReviewController.php:71
 * @route '/trainingPaths/{trainingPathId}/reviews'
 */
store.post = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\TrainingPathReviewController::store
 * @see app/Http/Controllers/TrainingPathReviewController.php:71
 * @route '/trainingPaths/{trainingPathId}/reviews'
 */
    const storeForm = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TrainingPathReviewController::store
 * @see app/Http/Controllers/TrainingPathReviewController.php:71
 * @route '/trainingPaths/{trainingPathId}/reviews'
 */
        storeForm.post = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\TrainingPathReviewController::update
 * @see app/Http/Controllers/TrainingPathReviewController.php:89
 * @route '/trainingPaths/{trainingPathId}/reviews/{reviewId}'
 */
export const update = (args: { trainingPathId: string | number, reviewId: string | number } | [trainingPathId: string | number, reviewId: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/trainingPaths/{trainingPathId}/reviews/{reviewId}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\TrainingPathReviewController::update
 * @see app/Http/Controllers/TrainingPathReviewController.php:89
 * @route '/trainingPaths/{trainingPathId}/reviews/{reviewId}'
 */
update.url = (args: { trainingPathId: string | number, reviewId: string | number } | [trainingPathId: string | number, reviewId: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    trainingPathId: args[0],
                    reviewId: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPathId: args.trainingPathId,
                                reviewId: args.reviewId,
                }

    return update.definition.url
            .replace('{trainingPathId}', parsedArgs.trainingPathId.toString())
            .replace('{reviewId}', parsedArgs.reviewId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingPathReviewController::update
 * @see app/Http/Controllers/TrainingPathReviewController.php:89
 * @route '/trainingPaths/{trainingPathId}/reviews/{reviewId}'
 */
update.put = (args: { trainingPathId: string | number, reviewId: string | number } | [trainingPathId: string | number, reviewId: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\TrainingPathReviewController::update
 * @see app/Http/Controllers/TrainingPathReviewController.php:89
 * @route '/trainingPaths/{trainingPathId}/reviews/{reviewId}'
 */
    const updateForm = (args: { trainingPathId: string | number, reviewId: string | number } | [trainingPathId: string | number, reviewId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TrainingPathReviewController::update
 * @see app/Http/Controllers/TrainingPathReviewController.php:89
 * @route '/trainingPaths/{trainingPathId}/reviews/{reviewId}'
 */
        updateForm.put = (args: { trainingPathId: string | number, reviewId: string | number } | [trainingPathId: string | number, reviewId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\TrainingPathReviewController::destroy
 * @see app/Http/Controllers/TrainingPathReviewController.php:107
 * @route '/trainingPaths/{trainingPathId}/reviews/{reviewId}'
 */
export const destroy = (args: { trainingPathId: string | number, reviewId: string | number } | [trainingPathId: string | number, reviewId: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/trainingPaths/{trainingPathId}/reviews/{reviewId}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\TrainingPathReviewController::destroy
 * @see app/Http/Controllers/TrainingPathReviewController.php:107
 * @route '/trainingPaths/{trainingPathId}/reviews/{reviewId}'
 */
destroy.url = (args: { trainingPathId: string | number, reviewId: string | number } | [trainingPathId: string | number, reviewId: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    trainingPathId: args[0],
                    reviewId: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPathId: args.trainingPathId,
                                reviewId: args.reviewId,
                }

    return destroy.definition.url
            .replace('{trainingPathId}', parsedArgs.trainingPathId.toString())
            .replace('{reviewId}', parsedArgs.reviewId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingPathReviewController::destroy
 * @see app/Http/Controllers/TrainingPathReviewController.php:107
 * @route '/trainingPaths/{trainingPathId}/reviews/{reviewId}'
 */
destroy.delete = (args: { trainingPathId: string | number, reviewId: string | number } | [trainingPathId: string | number, reviewId: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\TrainingPathReviewController::destroy
 * @see app/Http/Controllers/TrainingPathReviewController.php:107
 * @route '/trainingPaths/{trainingPathId}/reviews/{reviewId}'
 */
    const destroyForm = (args: { trainingPathId: string | number, reviewId: string | number } | [trainingPathId: string | number, reviewId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TrainingPathReviewController::destroy
 * @see app/Http/Controllers/TrainingPathReviewController.php:107
 * @route '/trainingPaths/{trainingPathId}/reviews/{reviewId}'
 */
        destroyForm.delete = (args: { trainingPathId: string | number, reviewId: string | number } | [trainingPathId: string | number, reviewId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const reviews = {
    index: Object.assign(index, index),
stats: Object.assign(stats, stats),
my: Object.assign(my, my),
store: Object.assign(store, store),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default reviews