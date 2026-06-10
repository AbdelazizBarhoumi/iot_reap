import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\HardwareController::index
 * @see app/Http/Controllers/HardwareController.php:54
 * @route '/hardware'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/hardware',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\HardwareController::index
 * @see app/Http/Controllers/HardwareController.php:54
 * @route '/hardware'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::index
 * @see app/Http/Controllers/HardwareController.php:54
 * @route '/hardware'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\HardwareController::index
 * @see app/Http/Controllers/HardwareController.php:54
 * @route '/hardware'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\HardwareController::index
 * @see app/Http/Controllers/HardwareController.php:54
 * @route '/hardware'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\HardwareController::index
 * @see app/Http/Controllers/HardwareController.php:54
 * @route '/hardware'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\HardwareController::index
 * @see app/Http/Controllers/HardwareController.php:54
 * @route '/hardware'
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
* @see \App\Http\Controllers\HardwareController::devices
 * @see app/Http/Controllers/HardwareController.php:73
 * @route '/hardware/devices'
 */
export const devices = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: devices.url(options),
    method: 'get',
})

devices.definition = {
    methods: ["get","head"],
    url: '/hardware/devices',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\HardwareController::devices
 * @see app/Http/Controllers/HardwareController.php:73
 * @route '/hardware/devices'
 */
devices.url = (options?: RouteQueryOptions) => {
    return devices.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::devices
 * @see app/Http/Controllers/HardwareController.php:73
 * @route '/hardware/devices'
 */
devices.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: devices.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\HardwareController::devices
 * @see app/Http/Controllers/HardwareController.php:73
 * @route '/hardware/devices'
 */
devices.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: devices.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\HardwareController::devices
 * @see app/Http/Controllers/HardwareController.php:73
 * @route '/hardware/devices'
 */
    const devicesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: devices.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\HardwareController::devices
 * @see app/Http/Controllers/HardwareController.php:73
 * @route '/hardware/devices'
 */
        devicesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: devices.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\HardwareController::devices
 * @see app/Http/Controllers/HardwareController.php:73
 * @route '/hardware/devices'
 */
        devicesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: devices.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    devices.form = devicesForm
/**
* @see \App\Http\Controllers\HardwareController::refresh
 * @see app/Http/Controllers/HardwareController.php:87
 * @route '/hardware/refresh'
 */
export const refresh = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refresh.url(options),
    method: 'post',
})

refresh.definition = {
    methods: ["post"],
    url: '/hardware/refresh',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\HardwareController::refresh
 * @see app/Http/Controllers/HardwareController.php:87
 * @route '/hardware/refresh'
 */
refresh.url = (options?: RouteQueryOptions) => {
    return refresh.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::refresh
 * @see app/Http/Controllers/HardwareController.php:87
 * @route '/hardware/refresh'
 */
refresh.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refresh.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\HardwareController::refresh
 * @see app/Http/Controllers/HardwareController.php:87
 * @route '/hardware/refresh'
 */
    const refreshForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: refresh.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HardwareController::refresh
 * @see app/Http/Controllers/HardwareController.php:87
 * @route '/hardware/refresh'
 */
        refreshForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: refresh.url(options),
            method: 'post',
        })
    
    refresh.form = refreshForm
/**
* @see \App\Http\Controllers\HardwareController::refreshNode
 * @see app/Http/Controllers/HardwareController.php:101
 * @route '/hardware/nodes/{node}/refresh'
 */
export const refreshNode = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refreshNode.url(args, options),
    method: 'post',
})

refreshNode.definition = {
    methods: ["post"],
    url: '/hardware/nodes/{node}/refresh',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\HardwareController::refreshNode
 * @see app/Http/Controllers/HardwareController.php:101
 * @route '/hardware/nodes/{node}/refresh'
 */
refreshNode.url = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { node: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { node: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    node: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        node: typeof args.node === 'object'
                ? args.node.id
                : args.node,
                }

    return refreshNode.definition.url
            .replace('{node}', parsedArgs.node.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::refreshNode
 * @see app/Http/Controllers/HardwareController.php:101
 * @route '/hardware/nodes/{node}/refresh'
 */
refreshNode.post = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refreshNode.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\HardwareController::refreshNode
 * @see app/Http/Controllers/HardwareController.php:101
 * @route '/hardware/nodes/{node}/refresh'
 */
    const refreshNodeForm = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: refreshNode.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HardwareController::refreshNode
 * @see app/Http/Controllers/HardwareController.php:101
 * @route '/hardware/nodes/{node}/refresh'
 */
        refreshNodeForm.post = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: refreshNode.url(args, options),
            method: 'post',
        })
    
    refreshNode.form = refreshNodeForm
/**
* @see \App\Http\Controllers\HardwareController::healthCheck
 * @see app/Http/Controllers/HardwareController.php:881
 * @route '/hardware/nodes/{node}/health'
 */
export const healthCheck = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: healthCheck.url(args, options),
    method: 'post',
})

healthCheck.definition = {
    methods: ["post"],
    url: '/hardware/nodes/{node}/health',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\HardwareController::healthCheck
 * @see app/Http/Controllers/HardwareController.php:881
 * @route '/hardware/nodes/{node}/health'
 */
healthCheck.url = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { node: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { node: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    node: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        node: typeof args.node === 'object'
                ? args.node.id
                : args.node,
                }

    return healthCheck.definition.url
            .replace('{node}', parsedArgs.node.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::healthCheck
 * @see app/Http/Controllers/HardwareController.php:881
 * @route '/hardware/nodes/{node}/health'
 */
healthCheck.post = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: healthCheck.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\HardwareController::healthCheck
 * @see app/Http/Controllers/HardwareController.php:881
 * @route '/hardware/nodes/{node}/health'
 */
    const healthCheckForm = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: healthCheck.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HardwareController::healthCheck
 * @see app/Http/Controllers/HardwareController.php:881
 * @route '/hardware/nodes/{node}/health'
 */
        healthCheckForm.post = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: healthCheck.url(args, options),
            method: 'post',
        })
    
    healthCheck.form = healthCheckForm
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
/**
* @see \App\Http\Controllers\HardwareController::storeNode
 * @see app/Http/Controllers/HardwareController.php:754
 * @route '/admin/hardware/nodes'
 */
export const storeNode = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeNode.url(options),
    method: 'post',
})

storeNode.definition = {
    methods: ["post"],
    url: '/admin/hardware/nodes',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\HardwareController::storeNode
 * @see app/Http/Controllers/HardwareController.php:754
 * @route '/admin/hardware/nodes'
 */
storeNode.url = (options?: RouteQueryOptions) => {
    return storeNode.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::storeNode
 * @see app/Http/Controllers/HardwareController.php:754
 * @route '/admin/hardware/nodes'
 */
storeNode.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeNode.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\HardwareController::storeNode
 * @see app/Http/Controllers/HardwareController.php:754
 * @route '/admin/hardware/nodes'
 */
    const storeNodeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: storeNode.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HardwareController::storeNode
 * @see app/Http/Controllers/HardwareController.php:754
 * @route '/admin/hardware/nodes'
 */
        storeNodeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: storeNode.url(options),
            method: 'post',
        })
    
    storeNode.form = storeNodeForm
/**
* @see \App\Http\Controllers\HardwareController::updateNode
 * @see app/Http/Controllers/HardwareController.php:790
 * @route '/admin/hardware/nodes/{node}'
 */
export const updateNode = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateNode.url(args, options),
    method: 'patch',
})

updateNode.definition = {
    methods: ["patch"],
    url: '/admin/hardware/nodes/{node}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\HardwareController::updateNode
 * @see app/Http/Controllers/HardwareController.php:790
 * @route '/admin/hardware/nodes/{node}'
 */
updateNode.url = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { node: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { node: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    node: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        node: typeof args.node === 'object'
                ? args.node.id
                : args.node,
                }

    return updateNode.definition.url
            .replace('{node}', parsedArgs.node.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::updateNode
 * @see app/Http/Controllers/HardwareController.php:790
 * @route '/admin/hardware/nodes/{node}'
 */
updateNode.patch = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateNode.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\HardwareController::updateNode
 * @see app/Http/Controllers/HardwareController.php:790
 * @route '/admin/hardware/nodes/{node}'
 */
    const updateNodeForm = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateNode.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HardwareController::updateNode
 * @see app/Http/Controllers/HardwareController.php:790
 * @route '/admin/hardware/nodes/{node}'
 */
        updateNodeForm.patch = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateNode.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateNode.form = updateNodeForm
/**
* @see \App\Http\Controllers\HardwareController::verifyNode
 * @see app/Http/Controllers/HardwareController.php:819
 * @route '/admin/hardware/nodes/{node}/verify'
 */
export const verifyNode = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verifyNode.url(args, options),
    method: 'post',
})

verifyNode.definition = {
    methods: ["post"],
    url: '/admin/hardware/nodes/{node}/verify',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\HardwareController::verifyNode
 * @see app/Http/Controllers/HardwareController.php:819
 * @route '/admin/hardware/nodes/{node}/verify'
 */
verifyNode.url = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { node: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { node: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    node: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        node: typeof args.node === 'object'
                ? args.node.id
                : args.node,
                }

    return verifyNode.definition.url
            .replace('{node}', parsedArgs.node.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::verifyNode
 * @see app/Http/Controllers/HardwareController.php:819
 * @route '/admin/hardware/nodes/{node}/verify'
 */
verifyNode.post = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verifyNode.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\HardwareController::verifyNode
 * @see app/Http/Controllers/HardwareController.php:819
 * @route '/admin/hardware/nodes/{node}/verify'
 */
    const verifyNodeForm = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: verifyNode.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HardwareController::verifyNode
 * @see app/Http/Controllers/HardwareController.php:819
 * @route '/admin/hardware/nodes/{node}/verify'
 */
        verifyNodeForm.post = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: verifyNode.url(args, options),
            method: 'post',
        })
    
    verifyNode.form = verifyNodeForm
/**
* @see \App\Http\Controllers\HardwareController::destroyNode
 * @see app/Http/Controllers/HardwareController.php:775
 * @route '/admin/hardware/nodes/{node}'
 */
export const destroyNode = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyNode.url(args, options),
    method: 'delete',
})

destroyNode.definition = {
    methods: ["delete"],
    url: '/admin/hardware/nodes/{node}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\HardwareController::destroyNode
 * @see app/Http/Controllers/HardwareController.php:775
 * @route '/admin/hardware/nodes/{node}'
 */
destroyNode.url = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { node: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { node: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    node: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        node: typeof args.node === 'object'
                ? args.node.id
                : args.node,
                }

    return destroyNode.definition.url
            .replace('{node}', parsedArgs.node.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::destroyNode
 * @see app/Http/Controllers/HardwareController.php:775
 * @route '/admin/hardware/nodes/{node}'
 */
destroyNode.delete = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyNode.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\HardwareController::destroyNode
 * @see app/Http/Controllers/HardwareController.php:775
 * @route '/admin/hardware/nodes/{node}'
 */
    const destroyNodeForm = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroyNode.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HardwareController::destroyNode
 * @see app/Http/Controllers/HardwareController.php:775
 * @route '/admin/hardware/nodes/{node}'
 */
        destroyNodeForm.delete = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroyNode.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroyNode.form = destroyNodeForm
/**
* @see \App\Http\Controllers\HardwareController::discoverGateways
 * @see app/Http/Controllers/HardwareController.php:898
 * @route '/admin/hardware/discover'
 */
export const discoverGateways = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: discoverGateways.url(options),
    method: 'post',
})

discoverGateways.definition = {
    methods: ["post"],
    url: '/admin/hardware/discover',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\HardwareController::discoverGateways
 * @see app/Http/Controllers/HardwareController.php:898
 * @route '/admin/hardware/discover'
 */
discoverGateways.url = (options?: RouteQueryOptions) => {
    return discoverGateways.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::discoverGateways
 * @see app/Http/Controllers/HardwareController.php:898
 * @route '/admin/hardware/discover'
 */
discoverGateways.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: discoverGateways.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\HardwareController::discoverGateways
 * @see app/Http/Controllers/HardwareController.php:898
 * @route '/admin/hardware/discover'
 */
    const discoverGatewaysForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: discoverGateways.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HardwareController::discoverGateways
 * @see app/Http/Controllers/HardwareController.php:898
 * @route '/admin/hardware/discover'
 */
        discoverGatewaysForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: discoverGateways.url(options),
            method: 'post',
        })
    
    discoverGateways.form = discoverGatewaysForm
/**
* @see \App\Http\Controllers\HardwareController::refreshGatewayStatus
 * @see app/Http/Controllers/HardwareController.php:934
 * @route '/admin/hardware/status'
 */
export const refreshGatewayStatus = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refreshGatewayStatus.url(options),
    method: 'post',
})

refreshGatewayStatus.definition = {
    methods: ["post"],
    url: '/admin/hardware/status',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\HardwareController::refreshGatewayStatus
 * @see app/Http/Controllers/HardwareController.php:934
 * @route '/admin/hardware/status'
 */
refreshGatewayStatus.url = (options?: RouteQueryOptions) => {
    return refreshGatewayStatus.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::refreshGatewayStatus
 * @see app/Http/Controllers/HardwareController.php:934
 * @route '/admin/hardware/status'
 */
refreshGatewayStatus.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refreshGatewayStatus.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\HardwareController::refreshGatewayStatus
 * @see app/Http/Controllers/HardwareController.php:934
 * @route '/admin/hardware/status'
 */
    const refreshGatewayStatusForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: refreshGatewayStatus.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HardwareController::refreshGatewayStatus
 * @see app/Http/Controllers/HardwareController.php:934
 * @route '/admin/hardware/status'
 */
        refreshGatewayStatusForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: refreshGatewayStatus.url(options),
            method: 'post',
        })
    
    refreshGatewayStatus.form = refreshGatewayStatusForm
/**
* @see \App\Http\Controllers\HardwareController::runningVms
 * @see app/Http/Controllers/HardwareController.php:954
 * @route '/admin/hardware/running-vms'
 */
export const runningVms = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: runningVms.url(options),
    method: 'get',
})

runningVms.definition = {
    methods: ["get","head"],
    url: '/admin/hardware/running-vms',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\HardwareController::runningVms
 * @see app/Http/Controllers/HardwareController.php:954
 * @route '/admin/hardware/running-vms'
 */
runningVms.url = (options?: RouteQueryOptions) => {
    return runningVms.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::runningVms
 * @see app/Http/Controllers/HardwareController.php:954
 * @route '/admin/hardware/running-vms'
 */
runningVms.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: runningVms.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\HardwareController::runningVms
 * @see app/Http/Controllers/HardwareController.php:954
 * @route '/admin/hardware/running-vms'
 */
runningVms.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: runningVms.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\HardwareController::runningVms
 * @see app/Http/Controllers/HardwareController.php:954
 * @route '/admin/hardware/running-vms'
 */
    const runningVmsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: runningVms.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\HardwareController::runningVms
 * @see app/Http/Controllers/HardwareController.php:954
 * @route '/admin/hardware/running-vms'
 */
        runningVmsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: runningVms.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\HardwareController::runningVms
 * @see app/Http/Controllers/HardwareController.php:954
 * @route '/admin/hardware/running-vms'
 */
        runningVmsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: runningVms.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    runningVms.form = runningVmsForm
/**
* @see \App\Http\Controllers\HardwareController::dedicatedDevices
 * @see app/Http/Controllers/HardwareController.php:1086
 * @route '/admin/hardware/dedicated-devices'
 */
export const dedicatedDevices = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dedicatedDevices.url(options),
    method: 'get',
})

dedicatedDevices.definition = {
    methods: ["get","head"],
    url: '/admin/hardware/dedicated-devices',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\HardwareController::dedicatedDevices
 * @see app/Http/Controllers/HardwareController.php:1086
 * @route '/admin/hardware/dedicated-devices'
 */
dedicatedDevices.url = (options?: RouteQueryOptions) => {
    return dedicatedDevices.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::dedicatedDevices
 * @see app/Http/Controllers/HardwareController.php:1086
 * @route '/admin/hardware/dedicated-devices'
 */
dedicatedDevices.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dedicatedDevices.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\HardwareController::dedicatedDevices
 * @see app/Http/Controllers/HardwareController.php:1086
 * @route '/admin/hardware/dedicated-devices'
 */
dedicatedDevices.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dedicatedDevices.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\HardwareController::dedicatedDevices
 * @see app/Http/Controllers/HardwareController.php:1086
 * @route '/admin/hardware/dedicated-devices'
 */
    const dedicatedDevicesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dedicatedDevices.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\HardwareController::dedicatedDevices
 * @see app/Http/Controllers/HardwareController.php:1086
 * @route '/admin/hardware/dedicated-devices'
 */
        dedicatedDevicesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dedicatedDevices.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\HardwareController::dedicatedDevices
 * @see app/Http/Controllers/HardwareController.php:1086
 * @route '/admin/hardware/dedicated-devices'
 */
        dedicatedDevicesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dedicatedDevices.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    dedicatedDevices.form = dedicatedDevicesForm
/**
* @see \App\Http\Controllers\HardwareController::dedicateDevice
 * @see app/Http/Controllers/HardwareController.php:1026
 * @route '/admin/hardware/devices/{device}/dedicate'
 */
export const dedicateDevice = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: dedicateDevice.url(args, options),
    method: 'post',
})

dedicateDevice.definition = {
    methods: ["post"],
    url: '/admin/hardware/devices/{device}/dedicate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\HardwareController::dedicateDevice
 * @see app/Http/Controllers/HardwareController.php:1026
 * @route '/admin/hardware/devices/{device}/dedicate'
 */
dedicateDevice.url = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return dedicateDevice.definition.url
            .replace('{device}', parsedArgs.device.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::dedicateDevice
 * @see app/Http/Controllers/HardwareController.php:1026
 * @route '/admin/hardware/devices/{device}/dedicate'
 */
dedicateDevice.post = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: dedicateDevice.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\HardwareController::dedicateDevice
 * @see app/Http/Controllers/HardwareController.php:1026
 * @route '/admin/hardware/devices/{device}/dedicate'
 */
    const dedicateDeviceForm = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: dedicateDevice.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HardwareController::dedicateDevice
 * @see app/Http/Controllers/HardwareController.php:1026
 * @route '/admin/hardware/devices/{device}/dedicate'
 */
        dedicateDeviceForm.post = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: dedicateDevice.url(args, options),
            method: 'post',
        })
    
    dedicateDevice.form = dedicateDeviceForm
/**
* @see \App\Http\Controllers\HardwareController::removeDedication
 * @see app/Http/Controllers/HardwareController.php:1062
 * @route '/admin/hardware/devices/{device}/dedicate'
 */
export const removeDedication = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: removeDedication.url(args, options),
    method: 'delete',
})

removeDedication.definition = {
    methods: ["delete"],
    url: '/admin/hardware/devices/{device}/dedicate',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\HardwareController::removeDedication
 * @see app/Http/Controllers/HardwareController.php:1062
 * @route '/admin/hardware/devices/{device}/dedicate'
 */
removeDedication.url = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return removeDedication.definition.url
            .replace('{device}', parsedArgs.device.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::removeDedication
 * @see app/Http/Controllers/HardwareController.php:1062
 * @route '/admin/hardware/devices/{device}/dedicate'
 */
removeDedication.delete = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: removeDedication.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\HardwareController::removeDedication
 * @see app/Http/Controllers/HardwareController.php:1062
 * @route '/admin/hardware/devices/{device}/dedicate'
 */
    const removeDedicationForm = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: removeDedication.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HardwareController::removeDedication
 * @see app/Http/Controllers/HardwareController.php:1062
 * @route '/admin/hardware/devices/{device}/dedicate'
 */
        removeDedicationForm.delete = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: removeDedication.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    removeDedication.form = removeDedicationForm
const HardwareController = { index, devices, refresh, refreshNode, healthCheck, bind, unbind, attach, detach, cancelPending, convertToCamera, activateCamera, updateCameraSettings, removeCamera, storeNode, updateNode, verifyNode, destroyNode, discoverGateways, refreshGatewayStatus, runningVms, dedicatedDevices, dedicateDevice, removeDedication }

export default HardwareController