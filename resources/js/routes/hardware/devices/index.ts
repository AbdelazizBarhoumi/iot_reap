import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\HardwareController::bind
 * @see app/Http/Controllers/HardwareController.php:123
 * @route '/hardware/devices/{device}/bind'
 */
export const bind = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bind.url(args, options),
    method: 'post',
})

bind.definition = {
    methods: ["post"],
    url: '/hardware/devices/{device}/bind',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\HardwareController::bind
 * @see app/Http/Controllers/HardwareController.php:123
 * @route '/hardware/devices/{device}/bind'
 */
bind.url = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return bind.definition.url
            .replace('{device}', parsedArgs.device.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::bind
 * @see app/Http/Controllers/HardwareController.php:123
 * @route '/hardware/devices/{device}/bind'
 */
bind.post = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bind.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\HardwareController::bind
 * @see app/Http/Controllers/HardwareController.php:123
 * @route '/hardware/devices/{device}/bind'
 */
    const bindForm = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: bind.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HardwareController::bind
 * @see app/Http/Controllers/HardwareController.php:123
 * @route '/hardware/devices/{device}/bind'
 */
        bindForm.post = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: bind.url(args, options),
            method: 'post',
        })
    
    bind.form = bindForm
/**
* @see \App\Http\Controllers\HardwareController::unbind
 * @see app/Http/Controllers/HardwareController.php:151
 * @route '/hardware/devices/{device}/unbind'
 */
export const unbind = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unbind.url(args, options),
    method: 'post',
})

unbind.definition = {
    methods: ["post"],
    url: '/hardware/devices/{device}/unbind',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\HardwareController::unbind
 * @see app/Http/Controllers/HardwareController.php:151
 * @route '/hardware/devices/{device}/unbind'
 */
unbind.url = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return unbind.definition.url
            .replace('{device}', parsedArgs.device.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::unbind
 * @see app/Http/Controllers/HardwareController.php:151
 * @route '/hardware/devices/{device}/unbind'
 */
unbind.post = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unbind.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\HardwareController::unbind
 * @see app/Http/Controllers/HardwareController.php:151
 * @route '/hardware/devices/{device}/unbind'
 */
    const unbindForm = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: unbind.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HardwareController::unbind
 * @see app/Http/Controllers/HardwareController.php:151
 * @route '/hardware/devices/{device}/unbind'
 */
        unbindForm.post = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: unbind.url(args, options),
            method: 'post',
        })
    
    unbind.form = unbindForm
/**
* @see \App\Http\Controllers\HardwareController::attach
 * @see app/Http/Controllers/HardwareController.php:186
 * @route '/hardware/devices/{device}/attach'
 */
export const attach = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: attach.url(args, options),
    method: 'post',
})

attach.definition = {
    methods: ["post"],
    url: '/hardware/devices/{device}/attach',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\HardwareController::attach
 * @see app/Http/Controllers/HardwareController.php:186
 * @route '/hardware/devices/{device}/attach'
 */
attach.url = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return attach.definition.url
            .replace('{device}', parsedArgs.device.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::attach
 * @see app/Http/Controllers/HardwareController.php:186
 * @route '/hardware/devices/{device}/attach'
 */
attach.post = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: attach.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\HardwareController::attach
 * @see app/Http/Controllers/HardwareController.php:186
 * @route '/hardware/devices/{device}/attach'
 */
    const attachForm = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: attach.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HardwareController::attach
 * @see app/Http/Controllers/HardwareController.php:186
 * @route '/hardware/devices/{device}/attach'
 */
        attachForm.post = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: attach.url(args, options),
            method: 'post',
        })
    
    attach.form = attachForm
/**
* @see \App\Http\Controllers\HardwareController::detach
 * @see app/Http/Controllers/HardwareController.php:249
 * @route '/hardware/devices/{device}/detach'
 */
export const detach = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: detach.url(args, options),
    method: 'post',
})

detach.definition = {
    methods: ["post"],
    url: '/hardware/devices/{device}/detach',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\HardwareController::detach
 * @see app/Http/Controllers/HardwareController.php:249
 * @route '/hardware/devices/{device}/detach'
 */
detach.url = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return detach.definition.url
            .replace('{device}', parsedArgs.device.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::detach
 * @see app/Http/Controllers/HardwareController.php:249
 * @route '/hardware/devices/{device}/detach'
 */
detach.post = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: detach.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\HardwareController::detach
 * @see app/Http/Controllers/HardwareController.php:249
 * @route '/hardware/devices/{device}/detach'
 */
    const detachForm = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: detach.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HardwareController::detach
 * @see app/Http/Controllers/HardwareController.php:249
 * @route '/hardware/devices/{device}/detach'
 */
        detachForm.post = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: detach.url(args, options),
            method: 'post',
        })
    
    detach.form = detachForm
/**
* @see \App\Http\Controllers\HardwareController::cancelPending
 * @see app/Http/Controllers/HardwareController.php:277
 * @route '/hardware/devices/{device}/cancel-pending'
 */
export const cancelPending = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancelPending.url(args, options),
    method: 'post',
})

cancelPending.definition = {
    methods: ["post"],
    url: '/hardware/devices/{device}/cancel-pending',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\HardwareController::cancelPending
 * @see app/Http/Controllers/HardwareController.php:277
 * @route '/hardware/devices/{device}/cancel-pending'
 */
cancelPending.url = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return cancelPending.definition.url
            .replace('{device}', parsedArgs.device.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::cancelPending
 * @see app/Http/Controllers/HardwareController.php:277
 * @route '/hardware/devices/{device}/cancel-pending'
 */
cancelPending.post = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancelPending.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\HardwareController::cancelPending
 * @see app/Http/Controllers/HardwareController.php:277
 * @route '/hardware/devices/{device}/cancel-pending'
 */
    const cancelPendingForm = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: cancelPending.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HardwareController::cancelPending
 * @see app/Http/Controllers/HardwareController.php:277
 * @route '/hardware/devices/{device}/cancel-pending'
 */
        cancelPendingForm.post = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: cancelPending.url(args, options),
            method: 'post',
        })
    
    cancelPending.form = cancelPendingForm
/**
* @see \App\Http\Controllers\HardwareController::convertToCamera
 * @see app/Http/Controllers/HardwareController.php:307
 * @route '/hardware/devices/{device}/convert-to-camera'
 */
export const convertToCamera = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: convertToCamera.url(args, options),
    method: 'post',
})

convertToCamera.definition = {
    methods: ["post"],
    url: '/hardware/devices/{device}/convert-to-camera',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\HardwareController::convertToCamera
 * @see app/Http/Controllers/HardwareController.php:307
 * @route '/hardware/devices/{device}/convert-to-camera'
 */
convertToCamera.url = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return convertToCamera.definition.url
            .replace('{device}', parsedArgs.device.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::convertToCamera
 * @see app/Http/Controllers/HardwareController.php:307
 * @route '/hardware/devices/{device}/convert-to-camera'
 */
convertToCamera.post = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: convertToCamera.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\HardwareController::convertToCamera
 * @see app/Http/Controllers/HardwareController.php:307
 * @route '/hardware/devices/{device}/convert-to-camera'
 */
    const convertToCameraForm = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: convertToCamera.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HardwareController::convertToCamera
 * @see app/Http/Controllers/HardwareController.php:307
 * @route '/hardware/devices/{device}/convert-to-camera'
 */
        convertToCameraForm.post = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: convertToCamera.url(args, options),
            method: 'post',
        })
    
    convertToCamera.form = convertToCameraForm
/**
* @see \App\Http\Controllers\HardwareController::activateCamera
 * @see app/Http/Controllers/HardwareController.php:481
 * @route '/hardware/devices/{device}/activate-camera'
 */
export const activateCamera = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: activateCamera.url(args, options),
    method: 'post',
})

activateCamera.definition = {
    methods: ["post"],
    url: '/hardware/devices/{device}/activate-camera',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\HardwareController::activateCamera
 * @see app/Http/Controllers/HardwareController.php:481
 * @route '/hardware/devices/{device}/activate-camera'
 */
activateCamera.url = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return activateCamera.definition.url
            .replace('{device}', parsedArgs.device.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::activateCamera
 * @see app/Http/Controllers/HardwareController.php:481
 * @route '/hardware/devices/{device}/activate-camera'
 */
activateCamera.post = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: activateCamera.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\HardwareController::activateCamera
 * @see app/Http/Controllers/HardwareController.php:481
 * @route '/hardware/devices/{device}/activate-camera'
 */
    const activateCameraForm = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: activateCamera.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HardwareController::activateCamera
 * @see app/Http/Controllers/HardwareController.php:481
 * @route '/hardware/devices/{device}/activate-camera'
 */
        activateCameraForm.post = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: activateCamera.url(args, options),
            method: 'post',
        })
    
    activateCamera.form = activateCameraForm
/**
* @see \App\Http\Controllers\HardwareController::updateCameraSettings
 * @see app/Http/Controllers/HardwareController.php:605
 * @route '/hardware/devices/{device}/camera-settings'
 */
export const updateCameraSettings = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateCameraSettings.url(args, options),
    method: 'put',
})

updateCameraSettings.definition = {
    methods: ["put"],
    url: '/hardware/devices/{device}/camera-settings',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\HardwareController::updateCameraSettings
 * @see app/Http/Controllers/HardwareController.php:605
 * @route '/hardware/devices/{device}/camera-settings'
 */
updateCameraSettings.url = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return updateCameraSettings.definition.url
            .replace('{device}', parsedArgs.device.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::updateCameraSettings
 * @see app/Http/Controllers/HardwareController.php:605
 * @route '/hardware/devices/{device}/camera-settings'
 */
updateCameraSettings.put = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateCameraSettings.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\HardwareController::updateCameraSettings
 * @see app/Http/Controllers/HardwareController.php:605
 * @route '/hardware/devices/{device}/camera-settings'
 */
    const updateCameraSettingsForm = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateCameraSettings.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HardwareController::updateCameraSettings
 * @see app/Http/Controllers/HardwareController.php:605
 * @route '/hardware/devices/{device}/camera-settings'
 */
        updateCameraSettingsForm.put = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateCameraSettings.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateCameraSettings.form = updateCameraSettingsForm
/**
* @see \App\Http\Controllers\HardwareController::removeCamera
 * @see app/Http/Controllers/HardwareController.php:430
 * @route '/hardware/devices/{device}/camera'
 */
export const removeCamera = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: removeCamera.url(args, options),
    method: 'delete',
})

removeCamera.definition = {
    methods: ["delete"],
    url: '/hardware/devices/{device}/camera',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\HardwareController::removeCamera
 * @see app/Http/Controllers/HardwareController.php:430
 * @route '/hardware/devices/{device}/camera'
 */
removeCamera.url = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return removeCamera.definition.url
            .replace('{device}', parsedArgs.device.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::removeCamera
 * @see app/Http/Controllers/HardwareController.php:430
 * @route '/hardware/devices/{device}/camera'
 */
removeCamera.delete = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: removeCamera.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\HardwareController::removeCamera
 * @see app/Http/Controllers/HardwareController.php:430
 * @route '/hardware/devices/{device}/camera'
 */
    const removeCameraForm = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: removeCamera.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HardwareController::removeCamera
 * @see app/Http/Controllers/HardwareController.php:430
 * @route '/hardware/devices/{device}/camera'
 */
        removeCameraForm.delete = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: removeCamera.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    removeCamera.form = removeCameraForm
const devices = {
    bind: Object.assign(bind, bind),
unbind: Object.assign(unbind, unbind),
attach: Object.assign(attach, attach),
detach: Object.assign(detach, detach),
cancelPending: Object.assign(cancelPending, cancelPending),
convertToCamera: Object.assign(convertToCamera, convertToCamera),
activateCamera: Object.assign(activateCamera, activateCamera),
updateCameraSettings: Object.assign(updateCameraSettings, updateCameraSettings),
removeCamera: Object.assign(removeCamera, removeCamera),
}

export default devices