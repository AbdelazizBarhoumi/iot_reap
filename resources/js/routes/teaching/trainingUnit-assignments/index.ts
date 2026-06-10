import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::availableVms
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:48
 * @route '/teaching/trainingUnit-assignments/available-vms'
 */
export const availableVms = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: availableVms.url(options),
    method: 'get',
})

availableVms.definition = {
    methods: ["get","head"],
    url: '/teaching/trainingUnit-assignments/available-vms',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::availableVms
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:48
 * @route '/teaching/trainingUnit-assignments/available-vms'
 */
availableVms.url = (options?: RouteQueryOptions) => {
    return availableVms.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::availableVms
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:48
 * @route '/teaching/trainingUnit-assignments/available-vms'
 */
availableVms.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: availableVms.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::availableVms
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:48
 * @route '/teaching/trainingUnit-assignments/available-vms'
 */
availableVms.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: availableVms.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::availableVms
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:48
 * @route '/teaching/trainingUnit-assignments/available-vms'
 */
    const availableVmsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: availableVms.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::availableVms
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:48
 * @route '/teaching/trainingUnit-assignments/available-vms'
 */
        availableVmsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: availableVms.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::availableVms
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:48
 * @route '/teaching/trainingUnit-assignments/available-vms'
 */
        availableVmsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: availableVms.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    availableVms.form = availableVmsForm
/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::store
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:76
 * @route '/teaching/trainingUnit-assignments'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/teaching/trainingUnit-assignments',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::store
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:76
 * @route '/teaching/trainingUnit-assignments'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::store
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:76
 * @route '/teaching/trainingUnit-assignments'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::store
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:76
 * @route '/teaching/trainingUnit-assignments'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::store
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:76
 * @route '/teaching/trainingUnit-assignments'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::my
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:186
 * @route '/teaching/trainingUnit-assignments/my-assignments'
 */
export const my = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: my.url(options),
    method: 'get',
})

my.definition = {
    methods: ["get","head"],
    url: '/teaching/trainingUnit-assignments/my-assignments',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::my
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:186
 * @route '/teaching/trainingUnit-assignments/my-assignments'
 */
my.url = (options?: RouteQueryOptions) => {
    return my.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::my
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:186
 * @route '/teaching/trainingUnit-assignments/my-assignments'
 */
my.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: my.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::my
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:186
 * @route '/teaching/trainingUnit-assignments/my-assignments'
 */
my.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: my.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::my
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:186
 * @route '/teaching/trainingUnit-assignments/my-assignments'
 */
    const myForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: my.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::my
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:186
 * @route '/teaching/trainingUnit-assignments/my-assignments'
 */
        myForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: my.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::my
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:186
 * @route '/teaching/trainingUnit-assignments/my-assignments'
 */
        myForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: my.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    my.form = myForm
/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::destroy
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:164
 * @route '/teaching/trainingUnit-assignments/{assignment}'
 */
export const destroy = (args: { assignment: number | { id: number } } | [assignment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/teaching/trainingUnit-assignments/{assignment}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::destroy
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:164
 * @route '/teaching/trainingUnit-assignments/{assignment}'
 */
destroy.url = (args: { assignment: number | { id: number } } | [assignment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { assignment: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { assignment: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    assignment: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        assignment: typeof args.assignment === 'object'
                ? args.assignment.id
                : args.assignment,
                }

    return destroy.definition.url
            .replace('{assignment}', parsedArgs.assignment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::destroy
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:164
 * @route '/teaching/trainingUnit-assignments/{assignment}'
 */
destroy.delete = (args: { assignment: number | { id: number } } | [assignment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::destroy
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:164
 * @route '/teaching/trainingUnit-assignments/{assignment}'
 */
    const destroyForm = (args: { assignment: number | { id: number } } | [assignment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::destroy
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:164
 * @route '/teaching/trainingUnit-assignments/{assignment}'
 */
        destroyForm.delete = (args: { assignment: number | { id: number } } | [assignment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const trainingUnitAssignments = {
    availableVms: Object.assign(availableVms, availableVms),
store: Object.assign(store, store),
my: Object.assign(my, my),
destroy: Object.assign(destroy, destroy),
}

export default trainingUnitAssignments