import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminCameraController::cameras
 * @see app/Http/Controllers/Admin/AdminCameraController.php:42
 * @route '/admin/cameras'
 */
export const cameras = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: cameras.url(options),
    method: 'get',
})

cameras.definition = {
    methods: ["get","head"],
    url: '/admin/cameras',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminCameraController::cameras
 * @see app/Http/Controllers/Admin/AdminCameraController.php:42
 * @route '/admin/cameras'
 */
cameras.url = (options?: RouteQueryOptions) => {
    return cameras.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminCameraController::cameras
 * @see app/Http/Controllers/Admin/AdminCameraController.php:42
 * @route '/admin/cameras'
 */
cameras.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: cameras.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminCameraController::cameras
 * @see app/Http/Controllers/Admin/AdminCameraController.php:42
 * @route '/admin/cameras'
 */
cameras.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: cameras.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminCameraController::cameras
 * @see app/Http/Controllers/Admin/AdminCameraController.php:42
 * @route '/admin/cameras'
 */
    const camerasForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: cameras.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminCameraController::cameras
 * @see app/Http/Controllers/Admin/AdminCameraController.php:42
 * @route '/admin/cameras'
 */
        camerasForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: cameras.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminCameraController::cameras
 * @see app/Http/Controllers/Admin/AdminCameraController.php:42
 * @route '/admin/cameras'
 */
        camerasForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: cameras.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    cameras.form = camerasForm
/**
* @see \App\Http\Controllers\Admin\AdminCameraController::assignToVm
 * @see app/Http/Controllers/Admin/AdminCameraController.php:78
 * @route '/admin/cameras/{camera}/assign'
 */
export const assignToVm = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: assignToVm.url(args, options),
    method: 'put',
})

assignToVm.definition = {
    methods: ["put"],
    url: '/admin/cameras/{camera}/assign',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\AdminCameraController::assignToVm
 * @see app/Http/Controllers/Admin/AdminCameraController.php:78
 * @route '/admin/cameras/{camera}/assign'
 */
assignToVm.url = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return assignToVm.definition.url
            .replace('{camera}', parsedArgs.camera.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminCameraController::assignToVm
 * @see app/Http/Controllers/Admin/AdminCameraController.php:78
 * @route '/admin/cameras/{camera}/assign'
 */
assignToVm.put = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: assignToVm.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Admin\AdminCameraController::assignToVm
 * @see app/Http/Controllers/Admin/AdminCameraController.php:78
 * @route '/admin/cameras/{camera}/assign'
 */
    const assignToVmForm = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: assignToVm.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminCameraController::assignToVm
 * @see app/Http/Controllers/Admin/AdminCameraController.php:78
 * @route '/admin/cameras/{camera}/assign'
 */
        assignToVmForm.put = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: assignToVm.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    assignToVm.form = assignToVmForm
/**
* @see \App\Http\Controllers\Admin\AdminCameraController::unassignFromVm
 * @see app/Http/Controllers/Admin/AdminCameraController.php:105
 * @route '/admin/cameras/{camera}/assign'
 */
export const unassignFromVm = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: unassignFromVm.url(args, options),
    method: 'delete',
})

unassignFromVm.definition = {
    methods: ["delete"],
    url: '/admin/cameras/{camera}/assign',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AdminCameraController::unassignFromVm
 * @see app/Http/Controllers/Admin/AdminCameraController.php:105
 * @route '/admin/cameras/{camera}/assign'
 */
unassignFromVm.url = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return unassignFromVm.definition.url
            .replace('{camera}', parsedArgs.camera.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminCameraController::unassignFromVm
 * @see app/Http/Controllers/Admin/AdminCameraController.php:105
 * @route '/admin/cameras/{camera}/assign'
 */
unassignFromVm.delete = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: unassignFromVm.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\AdminCameraController::unassignFromVm
 * @see app/Http/Controllers/Admin/AdminCameraController.php:105
 * @route '/admin/cameras/{camera}/assign'
 */
    const unassignFromVmForm = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: unassignFromVm.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminCameraController::unassignFromVm
 * @see app/Http/Controllers/Admin/AdminCameraController.php:105
 * @route '/admin/cameras/{camera}/assign'
 */
        unassignFromVmForm.delete = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: unassignFromVm.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    unassignFromVm.form = unassignFromVmForm
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
/**
* @see \App\Http\Controllers\Admin\AdminCameraController::index
 * @see app/Http/Controllers/Admin/AdminCameraController.php:291
 * @route '/admin/cameras/reservations'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/cameras/reservations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminCameraController::index
 * @see app/Http/Controllers/Admin/AdminCameraController.php:291
 * @route '/admin/cameras/reservations'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminCameraController::index
 * @see app/Http/Controllers/Admin/AdminCameraController.php:291
 * @route '/admin/cameras/reservations'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminCameraController::index
 * @see app/Http/Controllers/Admin/AdminCameraController.php:291
 * @route '/admin/cameras/reservations'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminCameraController::index
 * @see app/Http/Controllers/Admin/AdminCameraController.php:291
 * @route '/admin/cameras/reservations'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminCameraController::index
 * @see app/Http/Controllers/Admin/AdminCameraController.php:291
 * @route '/admin/cameras/reservations'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminCameraController::index
 * @see app/Http/Controllers/Admin/AdminCameraController.php:291
 * @route '/admin/cameras/reservations'
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
* @see \App\Http\Controllers\Admin\AdminCameraController::pending
 * @see app/Http/Controllers/Admin/AdminCameraController.php:263
 * @route '/admin/cameras/reservations/pending'
 */
export const pending = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pending.url(options),
    method: 'get',
})

pending.definition = {
    methods: ["get","head"],
    url: '/admin/cameras/reservations/pending',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminCameraController::pending
 * @see app/Http/Controllers/Admin/AdminCameraController.php:263
 * @route '/admin/cameras/reservations/pending'
 */
pending.url = (options?: RouteQueryOptions) => {
    return pending.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminCameraController::pending
 * @see app/Http/Controllers/Admin/AdminCameraController.php:263
 * @route '/admin/cameras/reservations/pending'
 */
pending.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pending.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminCameraController::pending
 * @see app/Http/Controllers/Admin/AdminCameraController.php:263
 * @route '/admin/cameras/reservations/pending'
 */
pending.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: pending.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminCameraController::pending
 * @see app/Http/Controllers/Admin/AdminCameraController.php:263
 * @route '/admin/cameras/reservations/pending'
 */
    const pendingForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: pending.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminCameraController::pending
 * @see app/Http/Controllers/Admin/AdminCameraController.php:263
 * @route '/admin/cameras/reservations/pending'
 */
        pendingForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: pending.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminCameraController::pending
 * @see app/Http/Controllers/Admin/AdminCameraController.php:263
 * @route '/admin/cameras/reservations/pending'
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
* @see \App\Http\Controllers\Admin\AdminCameraController::upcoming
 * @see app/Http/Controllers/Admin/AdminCameraController.php:457
 * @route '/admin/cameras/reservations/upcoming'
 */
export const upcoming = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: upcoming.url(options),
    method: 'get',
})

upcoming.definition = {
    methods: ["get","head"],
    url: '/admin/cameras/reservations/upcoming',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminCameraController::upcoming
 * @see app/Http/Controllers/Admin/AdminCameraController.php:457
 * @route '/admin/cameras/reservations/upcoming'
 */
upcoming.url = (options?: RouteQueryOptions) => {
    return upcoming.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminCameraController::upcoming
 * @see app/Http/Controllers/Admin/AdminCameraController.php:457
 * @route '/admin/cameras/reservations/upcoming'
 */
upcoming.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: upcoming.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminCameraController::upcoming
 * @see app/Http/Controllers/Admin/AdminCameraController.php:457
 * @route '/admin/cameras/reservations/upcoming'
 */
upcoming.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: upcoming.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminCameraController::upcoming
 * @see app/Http/Controllers/Admin/AdminCameraController.php:457
 * @route '/admin/cameras/reservations/upcoming'
 */
    const upcomingForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: upcoming.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminCameraController::upcoming
 * @see app/Http/Controllers/Admin/AdminCameraController.php:457
 * @route '/admin/cameras/reservations/upcoming'
 */
        upcomingForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: upcoming.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminCameraController::upcoming
 * @see app/Http/Controllers/Admin/AdminCameraController.php:457
 * @route '/admin/cameras/reservations/upcoming'
 */
        upcomingForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: upcoming.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    upcoming.form = upcomingForm
/**
* @see \App\Http\Controllers\Admin\AdminCameraController::approve
 * @see app/Http/Controllers/Admin/AdminCameraController.php:340
 * @route '/admin/cameras/reservations/{reservation}/approve'
 */
export const approve = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/admin/cameras/reservations/{reservation}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminCameraController::approve
 * @see app/Http/Controllers/Admin/AdminCameraController.php:340
 * @route '/admin/cameras/reservations/{reservation}/approve'
 */
approve.url = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { reservation: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { reservation: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    reservation: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        reservation: typeof args.reservation === 'object'
                ? args.reservation.id
                : args.reservation,
                }

    return approve.definition.url
            .replace('{reservation}', parsedArgs.reservation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminCameraController::approve
 * @see app/Http/Controllers/Admin/AdminCameraController.php:340
 * @route '/admin/cameras/reservations/{reservation}/approve'
 */
approve.post = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminCameraController::approve
 * @see app/Http/Controllers/Admin/AdminCameraController.php:340
 * @route '/admin/cameras/reservations/{reservation}/approve'
 */
    const approveForm = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: approve.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminCameraController::approve
 * @see app/Http/Controllers/Admin/AdminCameraController.php:340
 * @route '/admin/cameras/reservations/{reservation}/approve'
 */
        approveForm.post = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: approve.url(args, options),
            method: 'post',
        })
    
    approve.form = approveForm
/**
* @see \App\Http\Controllers\Admin\AdminCameraController::reject
 * @see app/Http/Controllers/Admin/AdminCameraController.php:388
 * @route '/admin/cameras/reservations/{reservation}/reject'
 */
export const reject = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/admin/cameras/reservations/{reservation}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminCameraController::reject
 * @see app/Http/Controllers/Admin/AdminCameraController.php:388
 * @route '/admin/cameras/reservations/{reservation}/reject'
 */
reject.url = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { reservation: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { reservation: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    reservation: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        reservation: typeof args.reservation === 'object'
                ? args.reservation.id
                : args.reservation,
                }

    return reject.definition.url
            .replace('{reservation}', parsedArgs.reservation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminCameraController::reject
 * @see app/Http/Controllers/Admin/AdminCameraController.php:388
 * @route '/admin/cameras/reservations/{reservation}/reject'
 */
reject.post = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminCameraController::reject
 * @see app/Http/Controllers/Admin/AdminCameraController.php:388
 * @route '/admin/cameras/reservations/{reservation}/reject'
 */
    const rejectForm = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reject.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminCameraController::reject
 * @see app/Http/Controllers/Admin/AdminCameraController.php:388
 * @route '/admin/cameras/reservations/{reservation}/reject'
 */
        rejectForm.post = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reject.url(args, options),
            method: 'post',
        })
    
    reject.form = rejectForm
/**
* @see \App\Http\Controllers\Admin\AdminCameraController::createBlock
 * @see app/Http/Controllers/Admin/AdminCameraController.php:420
 * @route '/admin/cameras/reservations/block'
 */
export const createBlock = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createBlock.url(options),
    method: 'post',
})

createBlock.definition = {
    methods: ["post"],
    url: '/admin/cameras/reservations/block',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminCameraController::createBlock
 * @see app/Http/Controllers/Admin/AdminCameraController.php:420
 * @route '/admin/cameras/reservations/block'
 */
createBlock.url = (options?: RouteQueryOptions) => {
    return createBlock.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminCameraController::createBlock
 * @see app/Http/Controllers/Admin/AdminCameraController.php:420
 * @route '/admin/cameras/reservations/block'
 */
createBlock.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createBlock.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminCameraController::createBlock
 * @see app/Http/Controllers/Admin/AdminCameraController.php:420
 * @route '/admin/cameras/reservations/block'
 */
    const createBlockForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: createBlock.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminCameraController::createBlock
 * @see app/Http/Controllers/Admin/AdminCameraController.php:420
 * @route '/admin/cameras/reservations/block'
 */
        createBlockForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: createBlock.url(options),
            method: 'post',
        })
    
    createBlock.form = createBlockForm
const AdminCameraController = { cameras, assignToVm, unassignFromVm, bulkAssign, activate, deactivate, index, pending, upcoming, approve, reject, createBlock }

export default AdminCameraController