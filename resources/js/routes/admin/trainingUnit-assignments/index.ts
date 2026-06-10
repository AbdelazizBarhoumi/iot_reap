import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
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
const trainingUnitAssignments = {
    pending: Object.assign(pending, pending),
approve: Object.assign(approve, approve),
reject: Object.assign(reject, reject),
}

export default trainingUnitAssignments