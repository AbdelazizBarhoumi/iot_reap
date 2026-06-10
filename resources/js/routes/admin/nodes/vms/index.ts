import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::start
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:123
 * @route '/admin/nodes/{node}/vms/{vmid}/start'
 */
export const start = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: start.url(args, options),
    method: 'post',
})

start.definition = {
    methods: ["post"],
    url: '/admin/nodes/{node}/vms/{vmid}/start',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::start
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:123
 * @route '/admin/nodes/{node}/vms/{vmid}/start'
 */
start.url = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions) => {
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

    return start.definition.url
            .replace('{node}', parsedArgs.node.toString())
            .replace('{vmid}', parsedArgs.vmid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::start
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:123
 * @route '/admin/nodes/{node}/vms/{vmid}/start'
 */
start.post = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: start.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::start
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:123
 * @route '/admin/nodes/{node}/vms/{vmid}/start'
 */
    const startForm = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: start.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::start
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:123
 * @route '/admin/nodes/{node}/vms/{vmid}/start'
 */
        startForm.post = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: start.url(args, options),
            method: 'post',
        })
    
    start.form = startForm
/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::stop
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:157
 * @route '/admin/nodes/{node}/vms/{vmid}/stop'
 */
export const stop = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stop.url(args, options),
    method: 'post',
})

stop.definition = {
    methods: ["post"],
    url: '/admin/nodes/{node}/vms/{vmid}/stop',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::stop
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:157
 * @route '/admin/nodes/{node}/vms/{vmid}/stop'
 */
stop.url = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions) => {
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

    return stop.definition.url
            .replace('{node}', parsedArgs.node.toString())
            .replace('{vmid}', parsedArgs.vmid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::stop
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:157
 * @route '/admin/nodes/{node}/vms/{vmid}/stop'
 */
stop.post = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stop.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::stop
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:157
 * @route '/admin/nodes/{node}/vms/{vmid}/stop'
 */
    const stopForm = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: stop.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::stop
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:157
 * @route '/admin/nodes/{node}/vms/{vmid}/stop'
 */
        stopForm.post = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: stop.url(args, options),
            method: 'post',
        })
    
    stop.form = stopForm
/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::reboot
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:190
 * @route '/admin/nodes/{node}/vms/{vmid}/reboot'
 */
export const reboot = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reboot.url(args, options),
    method: 'post',
})

reboot.definition = {
    methods: ["post"],
    url: '/admin/nodes/{node}/vms/{vmid}/reboot',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::reboot
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:190
 * @route '/admin/nodes/{node}/vms/{vmid}/reboot'
 */
reboot.url = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions) => {
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

    return reboot.definition.url
            .replace('{node}', parsedArgs.node.toString())
            .replace('{vmid}', parsedArgs.vmid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::reboot
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:190
 * @route '/admin/nodes/{node}/vms/{vmid}/reboot'
 */
reboot.post = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reboot.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::reboot
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:190
 * @route '/admin/nodes/{node}/vms/{vmid}/reboot'
 */
    const rebootForm = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reboot.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::reboot
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:190
 * @route '/admin/nodes/{node}/vms/{vmid}/reboot'
 */
        rebootForm.post = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reboot.url(args, options),
            method: 'post',
        })
    
    reboot.form = rebootForm
/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::shutdown
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:223
 * @route '/admin/nodes/{node}/vms/{vmid}/shutdown'
 */
export const shutdown = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: shutdown.url(args, options),
    method: 'post',
})

shutdown.definition = {
    methods: ["post"],
    url: '/admin/nodes/{node}/vms/{vmid}/shutdown',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::shutdown
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:223
 * @route '/admin/nodes/{node}/vms/{vmid}/shutdown'
 */
shutdown.url = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions) => {
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

    return shutdown.definition.url
            .replace('{node}', parsedArgs.node.toString())
            .replace('{vmid}', parsedArgs.vmid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::shutdown
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:223
 * @route '/admin/nodes/{node}/vms/{vmid}/shutdown'
 */
shutdown.post = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: shutdown.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::shutdown
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:223
 * @route '/admin/nodes/{node}/vms/{vmid}/shutdown'
 */
    const shutdownForm = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: shutdown.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::shutdown
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:223
 * @route '/admin/nodes/{node}/vms/{vmid}/shutdown'
 */
        shutdownForm.post = (args: { node: number | { id: number }, vmid: string | number } | [node: number | { id: number }, vmid: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: shutdown.url(args, options),
            method: 'post',
        })
    
    shutdown.form = shutdownForm
const vms = {
    start: Object.assign(start, start),
stop: Object.assign(stop, stop),
reboot: Object.assign(reboot, reboot),
shutdown: Object.assign(shutdown, shutdown),
}

export default vms