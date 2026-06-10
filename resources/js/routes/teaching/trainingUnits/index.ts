import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\TeachingController::store
 * @see app/Http/Controllers/TeachingController.php:370
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits'
 */
export const store = (args: { trainingPath: number | { id: number }, module: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/teaching/{trainingPath}/modules/{module}/trainingUnits',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TeachingController::store
 * @see app/Http/Controllers/TeachingController.php:370
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits'
 */
store.url = (args: { trainingPath: number | { id: number }, module: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    trainingPath: args[0],
                    module: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPath: typeof args.trainingPath === 'object'
                ? args.trainingPath.id
                : args.trainingPath,
                                module: typeof args.module === 'object'
                ? args.module.id
                : args.module,
                }

    return store.definition.url
            .replace('{trainingPath}', parsedArgs.trainingPath.toString())
            .replace('{module}', parsedArgs.module.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeachingController::store
 * @see app/Http/Controllers/TeachingController.php:370
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits'
 */
store.post = (args: { trainingPath: number | { id: number }, module: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\TeachingController::store
 * @see app/Http/Controllers/TeachingController.php:370
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits'
 */
    const storeForm = (args: { trainingPath: number | { id: number }, module: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TeachingController::store
 * @see app/Http/Controllers/TeachingController.php:370
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits'
 */
        storeForm.post = (args: { trainingPath: number | { id: number }, module: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\TeachingController::reorder
 * @see app/Http/Controllers/TeachingController.php:412
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits/reorder'
 */
export const reorder = (args: { trainingPath: number | { id: number }, module: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: reorder.url(args, options),
    method: 'patch',
})

reorder.definition = {
    methods: ["patch"],
    url: '/teaching/{trainingPath}/modules/{module}/trainingUnits/reorder',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\TeachingController::reorder
 * @see app/Http/Controllers/TeachingController.php:412
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits/reorder'
 */
reorder.url = (args: { trainingPath: number | { id: number }, module: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    trainingPath: args[0],
                    module: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPath: typeof args.trainingPath === 'object'
                ? args.trainingPath.id
                : args.trainingPath,
                                module: typeof args.module === 'object'
                ? args.module.id
                : args.module,
                }

    return reorder.definition.url
            .replace('{trainingPath}', parsedArgs.trainingPath.toString())
            .replace('{module}', parsedArgs.module.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeachingController::reorder
 * @see app/Http/Controllers/TeachingController.php:412
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits/reorder'
 */
reorder.patch = (args: { trainingPath: number | { id: number }, module: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: reorder.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\TeachingController::reorder
 * @see app/Http/Controllers/TeachingController.php:412
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits/reorder'
 */
    const reorderForm = (args: { trainingPath: number | { id: number }, module: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reorder.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TeachingController::reorder
 * @see app/Http/Controllers/TeachingController.php:412
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits/reorder'
 */
        reorderForm.patch = (args: { trainingPath: number | { id: number }, module: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reorder.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    reorder.form = reorderForm
/**
* @see \App\Http\Controllers\TeachingController::update
 * @see app/Http/Controllers/TeachingController.php:384
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits/{trainingUnit}'
 */
export const update = (args: { trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/teaching/{trainingPath}/modules/{module}/trainingUnits/{trainingUnit}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\TeachingController::update
 * @see app/Http/Controllers/TeachingController.php:384
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits/{trainingUnit}'
 */
update.url = (args: { trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    trainingPath: args[0],
                    module: args[1],
                    trainingUnit: args[2],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPath: typeof args.trainingPath === 'object'
                ? args.trainingPath.id
                : args.trainingPath,
                                module: typeof args.module === 'object'
                ? args.module.id
                : args.module,
                                trainingUnit: typeof args.trainingUnit === 'object'
                ? args.trainingUnit.id
                : args.trainingUnit,
                }

    return update.definition.url
            .replace('{trainingPath}', parsedArgs.trainingPath.toString())
            .replace('{module}', parsedArgs.module.toString())
            .replace('{trainingUnit}', parsedArgs.trainingUnit.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeachingController::update
 * @see app/Http/Controllers/TeachingController.php:384
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits/{trainingUnit}'
 */
update.patch = (args: { trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\TeachingController::update
 * @see app/Http/Controllers/TeachingController.php:384
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits/{trainingUnit}'
 */
    const updateForm = (args: { trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TeachingController::update
 * @see app/Http/Controllers/TeachingController.php:384
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits/{trainingUnit}'
 */
        updateForm.patch = (args: { trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\TeachingController::destroy
 * @see app/Http/Controllers/TeachingController.php:398
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits/{trainingUnit}'
 */
export const destroy = (args: { trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/teaching/{trainingPath}/modules/{module}/trainingUnits/{trainingUnit}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\TeachingController::destroy
 * @see app/Http/Controllers/TeachingController.php:398
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits/{trainingUnit}'
 */
destroy.url = (args: { trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    trainingPath: args[0],
                    module: args[1],
                    trainingUnit: args[2],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPath: typeof args.trainingPath === 'object'
                ? args.trainingPath.id
                : args.trainingPath,
                                module: typeof args.module === 'object'
                ? args.module.id
                : args.module,
                                trainingUnit: typeof args.trainingUnit === 'object'
                ? args.trainingUnit.id
                : args.trainingUnit,
                }

    return destroy.definition.url
            .replace('{trainingPath}', parsedArgs.trainingPath.toString())
            .replace('{module}', parsedArgs.module.toString())
            .replace('{trainingUnit}', parsedArgs.trainingUnit.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeachingController::destroy
 * @see app/Http/Controllers/TeachingController.php:398
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits/{trainingUnit}'
 */
destroy.delete = (args: { trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\TeachingController::destroy
 * @see app/Http/Controllers/TeachingController.php:398
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits/{trainingUnit}'
 */
    const destroyForm = (args: { trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TeachingController::destroy
 * @see app/Http/Controllers/TeachingController.php:398
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits/{trainingUnit}'
 */
        destroyForm.delete = (args: { trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const trainingUnits = {
    store: Object.assign(store, store),
reorder: Object.assign(reorder, reorder),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default trainingUnits