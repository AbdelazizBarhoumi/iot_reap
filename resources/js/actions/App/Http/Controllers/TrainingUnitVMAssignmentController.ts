import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::pending
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:28
 * @route '/admin/trainingUnit-assignments/pending'
 */
export const pending = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pending.url(options),
    method: 'get',
})

pending.definition = {
    methods: ["get","head"],
    url: '/admin/trainingUnit-assignments/pending',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::pending
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:28
 * @route '/admin/trainingUnit-assignments/pending'
 */
pending.url = (options?: RouteQueryOptions) => {
    return pending.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::pending
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:28
 * @route '/admin/trainingUnit-assignments/pending'
 */
pending.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pending.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::pending
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:28
 * @route '/admin/trainingUnit-assignments/pending'
 */
pending.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: pending.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::pending
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:28
 * @route '/admin/trainingUnit-assignments/pending'
 */
    const pendingForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: pending.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::pending
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:28
 * @route '/admin/trainingUnit-assignments/pending'
 */
        pendingForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: pending.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::pending
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:28
 * @route '/admin/trainingUnit-assignments/pending'
 */
        pendingForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: pending.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    pending.form = pendingForm
/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::approve
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:106
 * @route '/admin/trainingUnit-assignments/{assignment}/approve'
 */
export const approve = (args: { assignment: number | { id: number } } | [assignment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/admin/trainingUnit-assignments/{assignment}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::approve
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:106
 * @route '/admin/trainingUnit-assignments/{assignment}/approve'
 */
approve.url = (args: { assignment: number | { id: number } } | [assignment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return approve.definition.url
            .replace('{assignment}', parsedArgs.assignment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::approve
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:106
 * @route '/admin/trainingUnit-assignments/{assignment}/approve'
 */
approve.post = (args: { assignment: number | { id: number } } | [assignment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::approve
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:106
 * @route '/admin/trainingUnit-assignments/{assignment}/approve'
 */
    const approveForm = (args: { assignment: number | { id: number } } | [assignment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: approve.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::approve
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:106
 * @route '/admin/trainingUnit-assignments/{assignment}/approve'
 */
        approveForm.post = (args: { assignment: number | { id: number } } | [assignment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: approve.url(args, options),
            method: 'post',
        })
    
    approve.form = approveForm
/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::reject
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:135
 * @route '/admin/trainingUnit-assignments/{assignment}/reject'
 */
export const reject = (args: { assignment: number | { id: number } } | [assignment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/admin/trainingUnit-assignments/{assignment}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::reject
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:135
 * @route '/admin/trainingUnit-assignments/{assignment}/reject'
 */
reject.url = (args: { assignment: number | { id: number } } | [assignment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return reject.definition.url
            .replace('{assignment}', parsedArgs.assignment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::reject
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:135
 * @route '/admin/trainingUnit-assignments/{assignment}/reject'
 */
reject.post = (args: { assignment: number | { id: number } } | [assignment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::reject
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:135
 * @route '/admin/trainingUnit-assignments/{assignment}/reject'
 */
    const rejectForm = (args: { assignment: number | { id: number } } | [assignment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reject.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::reject
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:135
 * @route '/admin/trainingUnit-assignments/{assignment}/reject'
 */
        rejectForm.post = (args: { assignment: number | { id: number } } | [assignment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reject.url(args, options),
            method: 'post',
        })
    
    reject.form = rejectForm
/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::availableVMs
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:48
 * @route '/teaching/trainingUnit-assignments/available-vms'
 */
export const availableVMs = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: availableVMs.url(options),
    method: 'get',
})

availableVMs.definition = {
    methods: ["get","head"],
    url: '/teaching/trainingUnit-assignments/available-vms',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::availableVMs
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:48
 * @route '/teaching/trainingUnit-assignments/available-vms'
 */
availableVMs.url = (options?: RouteQueryOptions) => {
    return availableVMs.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::availableVMs
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:48
 * @route '/teaching/trainingUnit-assignments/available-vms'
 */
availableVMs.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: availableVMs.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::availableVMs
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:48
 * @route '/teaching/trainingUnit-assignments/available-vms'
 */
availableVMs.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: availableVMs.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::availableVMs
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:48
 * @route '/teaching/trainingUnit-assignments/available-vms'
 */
    const availableVMsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: availableVMs.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::availableVMs
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:48
 * @route '/teaching/trainingUnit-assignments/available-vms'
 */
        availableVMsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: availableVMs.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::availableVMs
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:48
 * @route '/teaching/trainingUnit-assignments/available-vms'
 */
        availableVMsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: availableVMs.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    availableVMs.form = availableVMsForm
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
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::myAssignments
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:186
 * @route '/teaching/trainingUnit-assignments/my-assignments'
 */
export const myAssignments = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: myAssignments.url(options),
    method: 'get',
})

myAssignments.definition = {
    methods: ["get","head"],
    url: '/teaching/trainingUnit-assignments/my-assignments',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::myAssignments
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:186
 * @route '/teaching/trainingUnit-assignments/my-assignments'
 */
myAssignments.url = (options?: RouteQueryOptions) => {
    return myAssignments.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::myAssignments
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:186
 * @route '/teaching/trainingUnit-assignments/my-assignments'
 */
myAssignments.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: myAssignments.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::myAssignments
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:186
 * @route '/teaching/trainingUnit-assignments/my-assignments'
 */
myAssignments.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: myAssignments.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::myAssignments
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:186
 * @route '/teaching/trainingUnit-assignments/my-assignments'
 */
    const myAssignmentsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: myAssignments.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::myAssignments
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:186
 * @route '/teaching/trainingUnit-assignments/my-assignments'
 */
        myAssignmentsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: myAssignments.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::myAssignments
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:186
 * @route '/teaching/trainingUnit-assignments/my-assignments'
 */
        myAssignmentsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: myAssignments.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    myAssignments.form = myAssignmentsForm
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
/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::forTrainingUnit
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:60
 * @route '/teaching/trainingUnits/{trainingUnitId}/vm-assignment'
 */
export const forTrainingUnit = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: forTrainingUnit.url(args, options),
    method: 'get',
})

forTrainingUnit.definition = {
    methods: ["get","head"],
    url: '/teaching/trainingUnits/{trainingUnitId}/vm-assignment',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::forTrainingUnit
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:60
 * @route '/teaching/trainingUnits/{trainingUnitId}/vm-assignment'
 */
forTrainingUnit.url = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return forTrainingUnit.definition.url
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::forTrainingUnit
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:60
 * @route '/teaching/trainingUnits/{trainingUnitId}/vm-assignment'
 */
forTrainingUnit.get = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: forTrainingUnit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::forTrainingUnit
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:60
 * @route '/teaching/trainingUnits/{trainingUnitId}/vm-assignment'
 */
forTrainingUnit.head = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: forTrainingUnit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::forTrainingUnit
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:60
 * @route '/teaching/trainingUnits/{trainingUnitId}/vm-assignment'
 */
    const forTrainingUnitForm = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: forTrainingUnit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::forTrainingUnit
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:60
 * @route '/teaching/trainingUnits/{trainingUnitId}/vm-assignment'
 */
        forTrainingUnitForm.get = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: forTrainingUnit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::forTrainingUnit
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:60
 * @route '/teaching/trainingUnits/{trainingUnitId}/vm-assignment'
 */
        forTrainingUnitForm.head = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: forTrainingUnit.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    forTrainingUnit.form = forTrainingUnitForm
const TrainingUnitVMAssignmentController = { pending, approve, reject, availableVMs, store, myAssignments, destroy, forTrainingUnit }

export default TrainingUnitVMAssignmentController