import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::active
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:384
 * @route '/proxmox-servers/active'
 */
export const active = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: active.url(options),
    method: 'get',
})

active.definition = {
    methods: ["get","head"],
    url: '/proxmox-servers/active',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::active
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:384
 * @route '/proxmox-servers/active'
 */
active.url = (options?: RouteQueryOptions) => {
    return active.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::active
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:384
 * @route '/proxmox-servers/active'
 */
active.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: active.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::active
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:384
 * @route '/proxmox-servers/active'
 */
active.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: active.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::active
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:384
 * @route '/proxmox-servers/active'
 */
    const activeForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: active.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::active
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:384
 * @route '/proxmox-servers/active'
 */
        activeForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: active.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::active
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:384
 * @route '/proxmox-servers/active'
 */
        activeForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: active.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    active.form = activeForm
const proxmoxServers = {
    active: Object.assign(active, active),
}

export default proxmoxServers