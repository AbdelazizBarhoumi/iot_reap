import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\TeachingController::edit
 * @see app/Http/Controllers/TeachingController.php:330
 * @route '/teaching/{trainingPathId}/module/{moduleId}/trainingUnit/{trainingUnitId}'
 */
export const edit = (args: { trainingPathId: string | number, moduleId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, moduleId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/teaching/{trainingPathId}/module/{moduleId}/trainingUnit/{trainingUnitId}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TeachingController::edit
 * @see app/Http/Controllers/TeachingController.php:330
 * @route '/teaching/{trainingPathId}/module/{moduleId}/trainingUnit/{trainingUnitId}'
 */
edit.url = (args: { trainingPathId: string | number, moduleId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, moduleId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    trainingPathId: args[0],
                    moduleId: args[1],
                    trainingUnitId: args[2],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPathId: args.trainingPathId,
                                moduleId: args.moduleId,
                                trainingUnitId: args.trainingUnitId,
                }

    return edit.definition.url
            .replace('{trainingPathId}', parsedArgs.trainingPathId.toString())
            .replace('{moduleId}', parsedArgs.moduleId.toString())
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeachingController::edit
 * @see app/Http/Controllers/TeachingController.php:330
 * @route '/teaching/{trainingPathId}/module/{moduleId}/trainingUnit/{trainingUnitId}'
 */
edit.get = (args: { trainingPathId: string | number, moduleId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, moduleId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TeachingController::edit
 * @see app/Http/Controllers/TeachingController.php:330
 * @route '/teaching/{trainingPathId}/module/{moduleId}/trainingUnit/{trainingUnitId}'
 */
edit.head = (args: { trainingPathId: string | number, moduleId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, moduleId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TeachingController::edit
 * @see app/Http/Controllers/TeachingController.php:330
 * @route '/teaching/{trainingPathId}/module/{moduleId}/trainingUnit/{trainingUnitId}'
 */
    const editForm = (args: { trainingPathId: string | number, moduleId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, moduleId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TeachingController::edit
 * @see app/Http/Controllers/TeachingController.php:330
 * @route '/teaching/{trainingPathId}/module/{moduleId}/trainingUnit/{trainingUnitId}'
 */
        editForm.get = (args: { trainingPathId: string | number, moduleId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, moduleId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TeachingController::edit
 * @see app/Http/Controllers/TeachingController.php:330
 * @route '/teaching/{trainingPathId}/module/{moduleId}/trainingUnit/{trainingUnitId}'
 */
        editForm.head = (args: { trainingPathId: string | number, moduleId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, moduleId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    edit.form = editForm
/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::vmAssignment
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:60
 * @route '/teaching/trainingUnits/{trainingUnitId}/vm-assignment'
 */
export const vmAssignment = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: vmAssignment.url(args, options),
    method: 'get',
})

vmAssignment.definition = {
    methods: ["get","head"],
    url: '/teaching/trainingUnits/{trainingUnitId}/vm-assignment',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::vmAssignment
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:60
 * @route '/teaching/trainingUnits/{trainingUnitId}/vm-assignment'
 */
vmAssignment.url = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return vmAssignment.definition.url
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::vmAssignment
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:60
 * @route '/teaching/trainingUnits/{trainingUnitId}/vm-assignment'
 */
vmAssignment.get = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: vmAssignment.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::vmAssignment
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:60
 * @route '/teaching/trainingUnits/{trainingUnitId}/vm-assignment'
 */
vmAssignment.head = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: vmAssignment.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::vmAssignment
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:60
 * @route '/teaching/trainingUnits/{trainingUnitId}/vm-assignment'
 */
    const vmAssignmentForm = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: vmAssignment.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::vmAssignment
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:60
 * @route '/teaching/trainingUnits/{trainingUnitId}/vm-assignment'
 */
        vmAssignmentForm.get = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: vmAssignment.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TrainingUnitVMAssignmentController::vmAssignment
 * @see app/Http/Controllers/TrainingUnitVMAssignmentController.php:60
 * @route '/teaching/trainingUnits/{trainingUnitId}/vm-assignment'
 */
        vmAssignmentForm.head = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: vmAssignment.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    vmAssignment.form = vmAssignmentForm
const trainingUnit = {
    edit: Object.assign(edit, edit),
vmAssignment: Object.assign(vmAssignment, vmAssignment),
}

export default trainingUnit