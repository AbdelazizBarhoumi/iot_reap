import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::index
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:33
 * @route '/admin/nodes'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/nodes',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::index
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:33
 * @route '/admin/nodes'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::index
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:33
 * @route '/admin/nodes'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::index
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:33
 * @route '/admin/nodes'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::index
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:33
 * @route '/admin/nodes'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::index
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:33
 * @route '/admin/nodes'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::index
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:33
 * @route '/admin/nodes'
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
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::getVMs
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:70
 * @route '/admin/nodes/{node}/vms'
 */
export const getVMs = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getVMs.url(args, options),
    method: 'get',
})

getVMs.definition = {
    methods: ["get","head"],
    url: '/admin/nodes/{node}/vms',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::getVMs
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:70
 * @route '/admin/nodes/{node}/vms'
 */
getVMs.url = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return getVMs.definition.url
            .replace('{node}', parsedArgs.node.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::getVMs
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:70
 * @route '/admin/nodes/{node}/vms'
 */
getVMs.get = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getVMs.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::getVMs
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:70
 * @route '/admin/nodes/{node}/vms'
 */
getVMs.head = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getVMs.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::getVMs
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:70
 * @route '/admin/nodes/{node}/vms'
 */
    const getVMsForm = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: getVMs.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::getVMs
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:70
 * @route '/admin/nodes/{node}/vms'
 */
        getVMsForm.get = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getVMs.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::getVMs
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:70
 * @route '/admin/nodes/{node}/vms'
 */
        getVMsForm.head = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getVMs.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    getVMs.form = getVMsForm
/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::startVM
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:123
 * @route '/admin/nodes/{node}/vms/{vmid}/start'
 */
export const startVM = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: startVM.url(args, options),
    method: 'post',
})

startVM.definition = {
    methods: ["post"],
    url: '/admin/nodes/{node}/vms/{vmid}/start',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::startVM
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:123
 * @route '/admin/nodes/{node}/vms/{vmid}/start'
 */
startVM.url = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    node: args[0],
                    vmid: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        node: typeof args.node === 'object'
                ? args.node.id
                : args.node,
                                vmid: args.vmid,
                }

    return startVM.definition.url
            .replace('{node}', parsedArgs.node.toString())
            .replace('{vmid}', parsedArgs.vmid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::startVM
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:123
 * @route '/admin/nodes/{node}/vms/{vmid}/start'
 */
startVM.post = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: startVM.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::startVM
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:123
 * @route '/admin/nodes/{node}/vms/{vmid}/start'
 */
    const startVMForm = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: startVM.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::startVM
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:123
 * @route '/admin/nodes/{node}/vms/{vmid}/start'
 */
        startVMForm.post = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: startVM.url(args, options),
            method: 'post',
        })
    
    startVM.form = startVMForm
/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::stopVM
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:157
 * @route '/admin/nodes/{node}/vms/{vmid}/stop'
 */
export const stopVM = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stopVM.url(args, options),
    method: 'post',
})

stopVM.definition = {
    methods: ["post"],
    url: '/admin/nodes/{node}/vms/{vmid}/stop',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::stopVM
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:157
 * @route '/admin/nodes/{node}/vms/{vmid}/stop'
 */
stopVM.url = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    node: args[0],
                    vmid: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        node: typeof args.node === 'object'
                ? args.node.id
                : args.node,
                                vmid: args.vmid,
                }

    return stopVM.definition.url
            .replace('{node}', parsedArgs.node.toString())
            .replace('{vmid}', parsedArgs.vmid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::stopVM
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:157
 * @route '/admin/nodes/{node}/vms/{vmid}/stop'
 */
stopVM.post = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stopVM.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::stopVM
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:157
 * @route '/admin/nodes/{node}/vms/{vmid}/stop'
 */
    const stopVMForm = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: stopVM.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::stopVM
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:157
 * @route '/admin/nodes/{node}/vms/{vmid}/stop'
 */
        stopVMForm.post = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: stopVM.url(args, options),
            method: 'post',
        })
    
    stopVM.form = stopVMForm
/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::rebootVM
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:190
 * @route '/admin/nodes/{node}/vms/{vmid}/reboot'
 */
export const rebootVM = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: rebootVM.url(args, options),
    method: 'post',
})

rebootVM.definition = {
    methods: ["post"],
    url: '/admin/nodes/{node}/vms/{vmid}/reboot',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::rebootVM
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:190
 * @route '/admin/nodes/{node}/vms/{vmid}/reboot'
 */
rebootVM.url = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    node: args[0],
                    vmid: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        node: typeof args.node === 'object'
                ? args.node.id
                : args.node,
                                vmid: args.vmid,
                }

    return rebootVM.definition.url
            .replace('{node}', parsedArgs.node.toString())
            .replace('{vmid}', parsedArgs.vmid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::rebootVM
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:190
 * @route '/admin/nodes/{node}/vms/{vmid}/reboot'
 */
rebootVM.post = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: rebootVM.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::rebootVM
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:190
 * @route '/admin/nodes/{node}/vms/{vmid}/reboot'
 */
    const rebootVMForm = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: rebootVM.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::rebootVM
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:190
 * @route '/admin/nodes/{node}/vms/{vmid}/reboot'
 */
        rebootVMForm.post = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: rebootVM.url(args, options),
            method: 'post',
        })
    
    rebootVM.form = rebootVMForm
/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::shutdownVM
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:223
 * @route '/admin/nodes/{node}/vms/{vmid}/shutdown'
 */
export const shutdownVM = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: shutdownVM.url(args, options),
    method: 'post',
})

shutdownVM.definition = {
    methods: ["post"],
    url: '/admin/nodes/{node}/vms/{vmid}/shutdown',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::shutdownVM
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:223
 * @route '/admin/nodes/{node}/vms/{vmid}/shutdown'
 */
shutdownVM.url = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    node: args[0],
                    vmid: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        node: typeof args.node === 'object'
                ? args.node.id
                : args.node,
                                vmid: args.vmid,
                }

    return shutdownVM.definition.url
            .replace('{node}', parsedArgs.node.toString())
            .replace('{vmid}', parsedArgs.vmid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::shutdownVM
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:223
 * @route '/admin/nodes/{node}/vms/{vmid}/shutdown'
 */
shutdownVM.post = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: shutdownVM.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::shutdownVM
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:223
 * @route '/admin/nodes/{node}/vms/{vmid}/shutdown'
 */
    const shutdownVMForm = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: shutdownVM.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::shutdownVM
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:223
 * @route '/admin/nodes/{node}/vms/{vmid}/shutdown'
 */
        shutdownVMForm.post = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: shutdownVM.url(args, options),
            method: 'post',
        })
    
    shutdownVM.form = shutdownVMForm
const ProxmoxNodeController = { index, getVMs, startVM, stopVM, rebootVM, shutdownVM }

export default ProxmoxNodeController