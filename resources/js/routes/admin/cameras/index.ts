import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import reservations from './reservations'
/**
* @see \App\Http\Controllers\Admin\AdminCameraController::index
 * @see app/Http/Controllers/Admin/AdminCameraController.php:42
 * @route '/admin/cameras'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/cameras',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminCameraController::index
 * @see app/Http/Controllers/Admin/AdminCameraController.php:42
 * @route '/admin/cameras'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminCameraController::index
 * @see app/Http/Controllers/Admin/AdminCameraController.php:42
 * @route '/admin/cameras'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminCameraController::index
 * @see app/Http/Controllers/Admin/AdminCameraController.php:42
 * @route '/admin/cameras'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminCameraController::index
 * @see app/Http/Controllers/Admin/AdminCameraController.php:42
 * @route '/admin/cameras'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminCameraController::index
 * @see app/Http/Controllers/Admin/AdminCameraController.php:42
 * @route '/admin/cameras'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminCameraController::index
 * @see app/Http/Controllers/Admin/AdminCameraController.php:42
 * @route '/admin/cameras'
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
* @see \App\Http\Controllers\Admin\AdminCameraController::assign
 * @see app/Http/Controllers/Admin/AdminCameraController.php:78
 * @route '/admin/cameras/{camera}/assign'
 */
export const assign = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: assign.url(args, options),
    method: 'put',
})

assign.definition = {
    methods: ["put"],
    url: '/admin/cameras/{camera}/assign',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\AdminCameraController::assign
 * @see app/Http/Controllers/Admin/AdminCameraController.php:78
 * @route '/admin/cameras/{camera}/assign'
 */
assign.url = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { camera: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { camera: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    camera: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        camera: typeof args.camera === 'object'
                ? args.camera.id
                : args.camera,
                }

    return assign.definition.url
            .replace('{camera}', parsedArgs.camera.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminCameraController::assign
 * @see app/Http/Controllers/Admin/AdminCameraController.php:78
 * @route '/admin/cameras/{camera}/assign'
 */
assign.put = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: assign.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Admin\AdminCameraController::assign
 * @see app/Http/Controllers/Admin/AdminCameraController.php:78
 * @route '/admin/cameras/{camera}/assign'
 */
    const assignForm = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: assign.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminCameraController::assign
 * @see app/Http/Controllers/Admin/AdminCameraController.php:78
 * @route '/admin/cameras/{camera}/assign'
 */
        assignForm.put = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: assign.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    assign.form = assignForm
/**
* @see \App\Http\Controllers\Admin\AdminCameraController::unassign
 * @see app/Http/Controllers/Admin/AdminCameraController.php:105
 * @route '/admin/cameras/{camera}/assign'
 */
export const unassign = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: unassign.url(args, options),
    method: 'delete',
})

unassign.definition = {
    methods: ["delete"],
    url: '/admin/cameras/{camera}/assign',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AdminCameraController::unassign
 * @see app/Http/Controllers/Admin/AdminCameraController.php:105
 * @route '/admin/cameras/{camera}/assign'
 */
unassign.url = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { camera: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { camera: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    camera: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        camera: typeof args.camera === 'object'
                ? args.camera.id
                : args.camera,
                }

    return unassign.definition.url
            .replace('{camera}', parsedArgs.camera.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminCameraController::unassign
 * @see app/Http/Controllers/Admin/AdminCameraController.php:105
 * @route '/admin/cameras/{camera}/assign'
 */
unassign.delete = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: unassign.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\AdminCameraController::unassign
 * @see app/Http/Controllers/Admin/AdminCameraController.php:105
 * @route '/admin/cameras/{camera}/assign'
 */
    const unassignForm = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: unassign.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminCameraController::unassign
 * @see app/Http/Controllers/Admin/AdminCameraController.php:105
 * @route '/admin/cameras/{camera}/assign'
 */
        unassignForm.delete = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: unassign.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    unassign.form = unassignForm
/**
* @see \App\Http\Controllers\Admin\AdminCameraController::bulkAssign
 * @see app/Http/Controllers/Admin/AdminCameraController.php:139
 * @route '/admin/cameras/bulk-assign'
 */
export const bulkAssign = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkAssign.url(options),
    method: 'post',
})

bulkAssign.definition = {
    methods: ["post"],
    url: '/admin/cameras/bulk-assign',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminCameraController::bulkAssign
 * @see app/Http/Controllers/Admin/AdminCameraController.php:139
 * @route '/admin/cameras/bulk-assign'
 */
bulkAssign.url = (options?: RouteQueryOptions) => {
    return bulkAssign.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminCameraController::bulkAssign
 * @see app/Http/Controllers/Admin/AdminCameraController.php:139
 * @route '/admin/cameras/bulk-assign'
 */
bulkAssign.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkAssign.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminCameraController::bulkAssign
 * @see app/Http/Controllers/Admin/AdminCameraController.php:139
 * @route '/admin/cameras/bulk-assign'
 */
    const bulkAssignForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: bulkAssign.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminCameraController::bulkAssign
 * @see app/Http/Controllers/Admin/AdminCameraController.php:139
 * @route '/admin/cameras/bulk-assign'
 */
        bulkAssignForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: bulkAssign.url(options),
            method: 'post',
        })
    
    bulkAssign.form = bulkAssignForm
/**
* @see \App\Http\Controllers\Admin\AdminCameraController::activate
 * @see app/Http/Controllers/Admin/AdminCameraController.php:197
 * @route '/admin/cameras/{camera}/activate'
 */
export const activate = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: activate.url(args, options),
    method: 'put',
})

activate.definition = {
    methods: ["put"],
    url: '/admin/cameras/{camera}/activate',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\AdminCameraController::activate
 * @see app/Http/Controllers/Admin/AdminCameraController.php:197
 * @route '/admin/cameras/{camera}/activate'
 */
activate.url = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { camera: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { camera: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    camera: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        camera: typeof args.camera === 'object'
                ? args.camera.id
                : args.camera,
                }

    return activate.definition.url
            .replace('{camera}', parsedArgs.camera.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminCameraController::activate
 * @see app/Http/Controllers/Admin/AdminCameraController.php:197
 * @route '/admin/cameras/{camera}/activate'
 */
activate.put = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: activate.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Admin\AdminCameraController::activate
 * @see app/Http/Controllers/Admin/AdminCameraController.php:197
 * @route '/admin/cameras/{camera}/activate'
 */
    const activateForm = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: activate.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminCameraController::activate
 * @see app/Http/Controllers/Admin/AdminCameraController.php:197
 * @route '/admin/cameras/{camera}/activate'
 */
        activateForm.put = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: activate.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    activate.form = activateForm
/**
* @see \App\Http\Controllers\Admin\AdminCameraController::deactivate
 * @see app/Http/Controllers/Admin/AdminCameraController.php:235
 * @route '/admin/cameras/{camera}/deactivate'
 */
export const deactivate = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: deactivate.url(args, options),
    method: 'put',
})

deactivate.definition = {
    methods: ["put"],
    url: '/admin/cameras/{camera}/deactivate',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\AdminCameraController::deactivate
 * @see app/Http/Controllers/Admin/AdminCameraController.php:235
 * @route '/admin/cameras/{camera}/deactivate'
 */
deactivate.url = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { camera: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { camera: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    camera: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        camera: typeof args.camera === 'object'
                ? args.camera.id
                : args.camera,
                }

    return deactivate.definition.url
            .replace('{camera}', parsedArgs.camera.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminCameraController::deactivate
 * @see app/Http/Controllers/Admin/AdminCameraController.php:235
 * @route '/admin/cameras/{camera}/deactivate'
 */
deactivate.put = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: deactivate.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Admin\AdminCameraController::deactivate
 * @see app/Http/Controllers/Admin/AdminCameraController.php:235
 * @route '/admin/cameras/{camera}/deactivate'
 */
    const deactivateForm = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: deactivate.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminCameraController::deactivate
 * @see app/Http/Controllers/Admin/AdminCameraController.php:235
 * @route '/admin/cameras/{camera}/deactivate'
 */
        deactivateForm.put = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: deactivate.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    deactivate.form = deactivateForm
const cameras = {
    index: Object.assign(index, index),
assign: Object.assign(assign, assign),
unassign: Object.assign(unassign, unassign),
bulkAssign: Object.assign(bulkAssign, bulkAssign),
activate: Object.assign(activate, activate),
deactivate: Object.assign(deactivate, deactivate),
reservations: Object.assign(reservations, reservations),
}

export default cameras