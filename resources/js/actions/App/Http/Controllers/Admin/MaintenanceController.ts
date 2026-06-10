import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\MaintenanceController::index
 * @see app/Http/Controllers/Admin/MaintenanceController.php:19
 * @route '/admin/maintenance'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/maintenance',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\MaintenanceController::index
 * @see app/Http/Controllers/Admin/MaintenanceController.php:19
 * @route '/admin/maintenance'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\MaintenanceController::index
 * @see app/Http/Controllers/Admin/MaintenanceController.php:19
 * @route '/admin/maintenance'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\MaintenanceController::index
 * @see app/Http/Controllers/Admin/MaintenanceController.php:19
 * @route '/admin/maintenance'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\MaintenanceController::index
 * @see app/Http/Controllers/Admin/MaintenanceController.php:19
 * @route '/admin/maintenance'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\MaintenanceController::index
 * @see app/Http/Controllers/Admin/MaintenanceController.php:19
 * @route '/admin/maintenance'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\MaintenanceController::index
 * @see app/Http/Controllers/Admin/MaintenanceController.php:19
 * @route '/admin/maintenance'
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
* @see \App\Http\Controllers\Admin\MaintenanceController::inMaintenance
 * @see app/Http/Controllers/Admin/MaintenanceController.php:185
 * @route '/admin/maintenance/in-maintenance'
 */
export const inMaintenance = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: inMaintenance.url(options),
    method: 'get',
})

inMaintenance.definition = {
    methods: ["get","head"],
    url: '/admin/maintenance/in-maintenance',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\MaintenanceController::inMaintenance
 * @see app/Http/Controllers/Admin/MaintenanceController.php:185
 * @route '/admin/maintenance/in-maintenance'
 */
inMaintenance.url = (options?: RouteQueryOptions) => {
    return inMaintenance.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\MaintenanceController::inMaintenance
 * @see app/Http/Controllers/Admin/MaintenanceController.php:185
 * @route '/admin/maintenance/in-maintenance'
 */
inMaintenance.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: inMaintenance.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\MaintenanceController::inMaintenance
 * @see app/Http/Controllers/Admin/MaintenanceController.php:185
 * @route '/admin/maintenance/in-maintenance'
 */
inMaintenance.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: inMaintenance.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\MaintenanceController::inMaintenance
 * @see app/Http/Controllers/Admin/MaintenanceController.php:185
 * @route '/admin/maintenance/in-maintenance'
 */
    const inMaintenanceForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: inMaintenance.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\MaintenanceController::inMaintenance
 * @see app/Http/Controllers/Admin/MaintenanceController.php:185
 * @route '/admin/maintenance/in-maintenance'
 */
        inMaintenanceForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: inMaintenance.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\MaintenanceController::inMaintenance
 * @see app/Http/Controllers/Admin/MaintenanceController.php:185
 * @route '/admin/maintenance/in-maintenance'
 */
        inMaintenanceForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: inMaintenance.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    inMaintenance.form = inMaintenanceForm
/**
* @see \App\Http\Controllers\Admin\MaintenanceController::updateDescription
 * @see app/Http/Controllers/Admin/MaintenanceController.php:155
 * @route '/admin/maintenance/description'
 */
export const updateDescription = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateDescription.url(options),
    method: 'post',
})

updateDescription.definition = {
    methods: ["post"],
    url: '/admin/maintenance/description',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\MaintenanceController::updateDescription
 * @see app/Http/Controllers/Admin/MaintenanceController.php:155
 * @route '/admin/maintenance/description'
 */
updateDescription.url = (options?: RouteQueryOptions) => {
    return updateDescription.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\MaintenanceController::updateDescription
 * @see app/Http/Controllers/Admin/MaintenanceController.php:155
 * @route '/admin/maintenance/description'
 */
updateDescription.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateDescription.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\MaintenanceController::updateDescription
 * @see app/Http/Controllers/Admin/MaintenanceController.php:155
 * @route '/admin/maintenance/description'
 */
    const updateDescriptionForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateDescription.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\MaintenanceController::updateDescription
 * @see app/Http/Controllers/Admin/MaintenanceController.php:155
 * @route '/admin/maintenance/description'
 */
        updateDescriptionForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateDescription.url(options),
            method: 'post',
        })
    
    updateDescription.form = updateDescriptionForm
/**
* @see \App\Http\Controllers\Admin\MaintenanceController::setUsbDeviceMaintenance
 * @see app/Http/Controllers/Admin/MaintenanceController.php:73
 * @route '/admin/maintenance/usb-devices/{device}'
 */
export const setUsbDeviceMaintenance = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setUsbDeviceMaintenance.url(args, options),
    method: 'post',
})

setUsbDeviceMaintenance.definition = {
    methods: ["post"],
    url: '/admin/maintenance/usb-devices/{device}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\MaintenanceController::setUsbDeviceMaintenance
 * @see app/Http/Controllers/Admin/MaintenanceController.php:73
 * @route '/admin/maintenance/usb-devices/{device}'
 */
setUsbDeviceMaintenance.url = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { device: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { device: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    device: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        device: typeof args.device === 'object'
                ? args.device.id
                : args.device,
                }

    return setUsbDeviceMaintenance.definition.url
            .replace('{device}', parsedArgs.device.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\MaintenanceController::setUsbDeviceMaintenance
 * @see app/Http/Controllers/Admin/MaintenanceController.php:73
 * @route '/admin/maintenance/usb-devices/{device}'
 */
setUsbDeviceMaintenance.post = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setUsbDeviceMaintenance.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\MaintenanceController::setUsbDeviceMaintenance
 * @see app/Http/Controllers/Admin/MaintenanceController.php:73
 * @route '/admin/maintenance/usb-devices/{device}'
 */
    const setUsbDeviceMaintenanceForm = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: setUsbDeviceMaintenance.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\MaintenanceController::setUsbDeviceMaintenance
 * @see app/Http/Controllers/Admin/MaintenanceController.php:73
 * @route '/admin/maintenance/usb-devices/{device}'
 */
        setUsbDeviceMaintenanceForm.post = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: setUsbDeviceMaintenance.url(args, options),
            method: 'post',
        })
    
    setUsbDeviceMaintenance.form = setUsbDeviceMaintenanceForm
/**
* @see \App\Http\Controllers\Admin\MaintenanceController::clearUsbDeviceMaintenance
 * @see app/Http/Controllers/Admin/MaintenanceController.php:99
 * @route '/admin/maintenance/usb-devices/{device}'
 */
export const clearUsbDeviceMaintenance = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: clearUsbDeviceMaintenance.url(args, options),
    method: 'delete',
})

clearUsbDeviceMaintenance.definition = {
    methods: ["delete"],
    url: '/admin/maintenance/usb-devices/{device}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\MaintenanceController::clearUsbDeviceMaintenance
 * @see app/Http/Controllers/Admin/MaintenanceController.php:99
 * @route '/admin/maintenance/usb-devices/{device}'
 */
clearUsbDeviceMaintenance.url = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { device: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { device: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    device: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        device: typeof args.device === 'object'
                ? args.device.id
                : args.device,
                }

    return clearUsbDeviceMaintenance.definition.url
            .replace('{device}', parsedArgs.device.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\MaintenanceController::clearUsbDeviceMaintenance
 * @see app/Http/Controllers/Admin/MaintenanceController.php:99
 * @route '/admin/maintenance/usb-devices/{device}'
 */
clearUsbDeviceMaintenance.delete = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: clearUsbDeviceMaintenance.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\MaintenanceController::clearUsbDeviceMaintenance
 * @see app/Http/Controllers/Admin/MaintenanceController.php:99
 * @route '/admin/maintenance/usb-devices/{device}'
 */
    const clearUsbDeviceMaintenanceForm = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: clearUsbDeviceMaintenance.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\MaintenanceController::clearUsbDeviceMaintenance
 * @see app/Http/Controllers/Admin/MaintenanceController.php:99
 * @route '/admin/maintenance/usb-devices/{device}'
 */
        clearUsbDeviceMaintenanceForm.delete = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: clearUsbDeviceMaintenance.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    clearUsbDeviceMaintenance.form = clearUsbDeviceMaintenanceForm
/**
* @see \App\Http\Controllers\Admin\MaintenanceController::setCameraMaintenance
 * @see app/Http/Controllers/Admin/MaintenanceController.php:114
 * @route '/admin/maintenance/cameras/{camera}'
 */
export const setCameraMaintenance = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setCameraMaintenance.url(args, options),
    method: 'post',
})

setCameraMaintenance.definition = {
    methods: ["post"],
    url: '/admin/maintenance/cameras/{camera}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\MaintenanceController::setCameraMaintenance
 * @see app/Http/Controllers/Admin/MaintenanceController.php:114
 * @route '/admin/maintenance/cameras/{camera}'
 */
setCameraMaintenance.url = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return setCameraMaintenance.definition.url
            .replace('{camera}', parsedArgs.camera.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\MaintenanceController::setCameraMaintenance
 * @see app/Http/Controllers/Admin/MaintenanceController.php:114
 * @route '/admin/maintenance/cameras/{camera}'
 */
setCameraMaintenance.post = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setCameraMaintenance.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\MaintenanceController::setCameraMaintenance
 * @see app/Http/Controllers/Admin/MaintenanceController.php:114
 * @route '/admin/maintenance/cameras/{camera}'
 */
    const setCameraMaintenanceForm = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: setCameraMaintenance.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\MaintenanceController::setCameraMaintenance
 * @see app/Http/Controllers/Admin/MaintenanceController.php:114
 * @route '/admin/maintenance/cameras/{camera}'
 */
        setCameraMaintenanceForm.post = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: setCameraMaintenance.url(args, options),
            method: 'post',
        })
    
    setCameraMaintenance.form = setCameraMaintenanceForm
/**
* @see \App\Http\Controllers\Admin\MaintenanceController::clearCameraMaintenance
 * @see app/Http/Controllers/Admin/MaintenanceController.php:140
 * @route '/admin/maintenance/cameras/{camera}'
 */
export const clearCameraMaintenance = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: clearCameraMaintenance.url(args, options),
    method: 'delete',
})

clearCameraMaintenance.definition = {
    methods: ["delete"],
    url: '/admin/maintenance/cameras/{camera}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\MaintenanceController::clearCameraMaintenance
 * @see app/Http/Controllers/Admin/MaintenanceController.php:140
 * @route '/admin/maintenance/cameras/{camera}'
 */
clearCameraMaintenance.url = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return clearCameraMaintenance.definition.url
            .replace('{camera}', parsedArgs.camera.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\MaintenanceController::clearCameraMaintenance
 * @see app/Http/Controllers/Admin/MaintenanceController.php:140
 * @route '/admin/maintenance/cameras/{camera}'
 */
clearCameraMaintenance.delete = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: clearCameraMaintenance.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\MaintenanceController::clearCameraMaintenance
 * @see app/Http/Controllers/Admin/MaintenanceController.php:140
 * @route '/admin/maintenance/cameras/{camera}'
 */
    const clearCameraMaintenanceForm = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: clearCameraMaintenance.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\MaintenanceController::clearCameraMaintenance
 * @see app/Http/Controllers/Admin/MaintenanceController.php:140
 * @route '/admin/maintenance/cameras/{camera}'
 */
        clearCameraMaintenanceForm.delete = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: clearCameraMaintenance.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    clearCameraMaintenance.form = clearCameraMaintenanceForm
const MaintenanceController = { index, inMaintenance, updateDescription, setUsbDeviceMaintenance, clearUsbDeviceMaintenance, setCameraMaintenance, clearCameraMaintenance }

export default MaintenanceController