import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ProxmoxVMBrowserController::index
 * @see app/Http/Controllers/ProxmoxVMBrowserController.php:31
 * @route '/proxmox-vms'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/proxmox-vms',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProxmoxVMBrowserController::index
 * @see app/Http/Controllers/ProxmoxVMBrowserController.php:31
 * @route '/proxmox-vms'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProxmoxVMBrowserController::index
 * @see app/Http/Controllers/ProxmoxVMBrowserController.php:31
 * @route '/proxmox-vms'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProxmoxVMBrowserController::index
 * @see app/Http/Controllers/ProxmoxVMBrowserController.php:31
 * @route '/proxmox-vms'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ProxmoxVMBrowserController::index
 * @see app/Http/Controllers/ProxmoxVMBrowserController.php:31
 * @route '/proxmox-vms'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ProxmoxVMBrowserController::index
 * @see app/Http/Controllers/ProxmoxVMBrowserController.php:31
 * @route '/proxmox-vms'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ProxmoxVMBrowserController::index
 * @see app/Http/Controllers/ProxmoxVMBrowserController.php:31
 * @route '/proxmox-vms'
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
* @see \App\Http\Controllers\ProxmoxVMBrowserController::snapshots
 * @see app/Http/Controllers/ProxmoxVMBrowserController.php:99
 * @route '/proxmox-vms/{server}/{node}/{vmid}/snapshots'
 */
export const snapshots = (args: { server: string | number, node: string | number, vmid: string | number } | [server: string | number, node: string | number, vmid: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: snapshots.url(args, options),
    method: 'get',
})

snapshots.definition = {
    methods: ["get","head"],
    url: '/proxmox-vms/{server}/{node}/{vmid}/snapshots',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProxmoxVMBrowserController::snapshots
 * @see app/Http/Controllers/ProxmoxVMBrowserController.php:99
 * @route '/proxmox-vms/{server}/{node}/{vmid}/snapshots'
 */
snapshots.url = (args: { server: string | number, node: string | number, vmid: string | number } | [server: string | number, node: string | number, vmid: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    server: args[0],
                    node: args[1],
                    vmid: args[2],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        server: args.server,
                                node: args.node,
                                vmid: args.vmid,
                }

    return snapshots.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace('{node}', parsedArgs.node.toString())
            .replace('{vmid}', parsedArgs.vmid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProxmoxVMBrowserController::snapshots
 * @see app/Http/Controllers/ProxmoxVMBrowserController.php:99
 * @route '/proxmox-vms/{server}/{node}/{vmid}/snapshots'
 */
snapshots.get = (args: { server: string | number, node: string | number, vmid: string | number } | [server: string | number, node: string | number, vmid: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: snapshots.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProxmoxVMBrowserController::snapshots
 * @see app/Http/Controllers/ProxmoxVMBrowserController.php:99
 * @route '/proxmox-vms/{server}/{node}/{vmid}/snapshots'
 */
snapshots.head = (args: { server: string | number, node: string | number, vmid: string | number } | [server: string | number, node: string | number, vmid: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: snapshots.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ProxmoxVMBrowserController::snapshots
 * @see app/Http/Controllers/ProxmoxVMBrowserController.php:99
 * @route '/proxmox-vms/{server}/{node}/{vmid}/snapshots'
 */
    const snapshotsForm = (args: { server: string | number, node: string | number, vmid: string | number } | [server: string | number, node: string | number, vmid: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: snapshots.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ProxmoxVMBrowserController::snapshots
 * @see app/Http/Controllers/ProxmoxVMBrowserController.php:99
 * @route '/proxmox-vms/{server}/{node}/{vmid}/snapshots'
 */
        snapshotsForm.get = (args: { server: string | number, node: string | number, vmid: string | number } | [server: string | number, node: string | number, vmid: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: snapshots.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ProxmoxVMBrowserController::snapshots
 * @see app/Http/Controllers/ProxmoxVMBrowserController.php:99
 * @route '/proxmox-vms/{server}/{node}/{vmid}/snapshots'
 */
        snapshotsForm.head = (args: { server: string | number, node: string | number, vmid: string | number } | [server: string | number, node: string | number, vmid: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: snapshots.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    snapshots.form = snapshotsForm
const ProxmoxVMBrowserController = { index, snapshots }

export default ProxmoxVMBrowserController