import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::index
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:30
 * @route '/admin/trainingPaths'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/trainingPaths',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::index
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:30
 * @route '/admin/trainingPaths'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::index
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:30
 * @route '/admin/trainingPaths'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::index
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:30
 * @route '/admin/trainingPaths'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::index
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:30
 * @route '/admin/trainingPaths'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::index
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:30
 * @route '/admin/trainingPaths'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::index
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:30
 * @route '/admin/trainingPaths'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::approve
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:64
 * @route '/admin/trainingPaths/{trainingPath}/approve'
 */
export const approve = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/admin/trainingPaths/{trainingPath}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::approve
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:64
 * @route '/admin/trainingPaths/{trainingPath}/approve'
 */
approve.url = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingPath: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { trainingPath: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    trainingPath: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPath: typeof args.trainingPath === 'object'
                ? args.trainingPath.id
                : args.trainingPath,
                }

    return approve.definition.url
            .replace('{trainingPath}', parsedArgs.trainingPath.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::approve
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:64
 * @route '/admin/trainingPaths/{trainingPath}/approve'
 */
approve.post = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::approve
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:64
 * @route '/admin/trainingPaths/{trainingPath}/approve'
 */
    const approveForm = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: approve.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::approve
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:64
 * @route '/admin/trainingPaths/{trainingPath}/approve'
 */
        approveForm.post = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: approve.url(args, options),
            method: 'post',
        })
    
    approve.form = approveForm
/**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::reject
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:77
 * @route '/admin/trainingPaths/{trainingPath}/reject'
 */
export const reject = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/admin/trainingPaths/{trainingPath}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::reject
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:77
 * @route '/admin/trainingPaths/{trainingPath}/reject'
 */
reject.url = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingPath: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { trainingPath: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    trainingPath: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPath: typeof args.trainingPath === 'object'
                ? args.trainingPath.id
                : args.trainingPath,
                }

    return reject.definition.url
            .replace('{trainingPath}', parsedArgs.trainingPath.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::reject
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:77
 * @route '/admin/trainingPaths/{trainingPath}/reject'
 */
reject.post = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::reject
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:77
 * @route '/admin/trainingPaths/{trainingPath}/reject'
 */
    const rejectForm = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reject.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::reject
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:77
 * @route '/admin/trainingPaths/{trainingPath}/reject'
 */
        rejectForm.post = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reject.url(args, options),
            method: 'post',
        })
    
    reject.form = rejectForm
/**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::feature
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:93
 * @route '/admin/trainingPaths/{trainingPath}/feature'
 */
export const feature = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: feature.url(args, options),
    method: 'post',
})

feature.definition = {
    methods: ["post"],
    url: '/admin/trainingPaths/{trainingPath}/feature',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::feature
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:93
 * @route '/admin/trainingPaths/{trainingPath}/feature'
 */
feature.url = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingPath: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { trainingPath: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    trainingPath: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPath: typeof args.trainingPath === 'object'
                ? args.trainingPath.id
                : args.trainingPath,
                }

    return feature.definition.url
            .replace('{trainingPath}', parsedArgs.trainingPath.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::feature
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:93
 * @route '/admin/trainingPaths/{trainingPath}/feature'
 */
feature.post = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: feature.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::feature
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:93
 * @route '/admin/trainingPaths/{trainingPath}/feature'
 */
    const featureForm = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: feature.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::feature
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:93
 * @route '/admin/trainingPaths/{trainingPath}/feature'
 */
        featureForm.post = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: feature.url(args, options),
            method: 'post',
        })
    
    feature.form = featureForm
/**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::unfeature
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:112
 * @route '/admin/trainingPaths/{trainingPath}/feature'
 */
export const unfeature = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: unfeature.url(args, options),
    method: 'delete',
})

unfeature.definition = {
    methods: ["delete"],
    url: '/admin/trainingPaths/{trainingPath}/feature',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::unfeature
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:112
 * @route '/admin/trainingPaths/{trainingPath}/feature'
 */
unfeature.url = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingPath: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { trainingPath: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    trainingPath: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPath: typeof args.trainingPath === 'object'
                ? args.trainingPath.id
                : args.trainingPath,
                }

    return unfeature.definition.url
            .replace('{trainingPath}', parsedArgs.trainingPath.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::unfeature
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:112
 * @route '/admin/trainingPaths/{trainingPath}/feature'
 */
unfeature.delete = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: unfeature.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::unfeature
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:112
 * @route '/admin/trainingPaths/{trainingPath}/feature'
 */
    const unfeatureForm = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: unfeature.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::unfeature
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:112
 * @route '/admin/trainingPaths/{trainingPath}/feature'
 */
        unfeatureForm.delete = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: unfeature.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    unfeature.form = unfeatureForm
/**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::updateFeaturedOrder
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:128
 * @route '/admin/trainingPaths/featured/order'
 */
export const updateFeaturedOrder = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateFeaturedOrder.url(options),
    method: 'put',
})

updateFeaturedOrder.definition = {
    methods: ["put"],
    url: '/admin/trainingPaths/featured/order',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::updateFeaturedOrder
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:128
 * @route '/admin/trainingPaths/featured/order'
 */
updateFeaturedOrder.url = (options?: RouteQueryOptions) => {
    return updateFeaturedOrder.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::updateFeaturedOrder
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:128
 * @route '/admin/trainingPaths/featured/order'
 */
updateFeaturedOrder.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateFeaturedOrder.url(options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::updateFeaturedOrder
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:128
 * @route '/admin/trainingPaths/featured/order'
 */
    const updateFeaturedOrderForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateFeaturedOrder.url({
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::updateFeaturedOrder
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:128
 * @route '/admin/trainingPaths/featured/order'
 */
        updateFeaturedOrderForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateFeaturedOrder.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateFeaturedOrder.form = updateFeaturedOrderForm
const AdminTrainingPathController = { index, approve, reject, feature, unfeature, updateFeaturedOrder }

export default AdminTrainingPathController