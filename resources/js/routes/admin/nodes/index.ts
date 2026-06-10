import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import vmsAb73f1 from './vms'
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
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::vms
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:70
 * @route '/admin/nodes/{node}/vms'
 */
export const vms = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: vms.url(args, options),
    method: 'get',
})

vms.definition = {
    methods: ["get","head"],
    url: '/admin/nodes/{node}/vms',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::vms
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:70
 * @route '/admin/nodes/{node}/vms'
 */
vms.url = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return vms.definition.url
            .replace('{node}', parsedArgs.node.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::vms
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:70
 * @route '/admin/nodes/{node}/vms'
 */
vms.get = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: vms.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::vms
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:70
 * @route '/admin/nodes/{node}/vms'
 */
vms.head = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: vms.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::vms
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:70
 * @route '/admin/nodes/{node}/vms'
 */
    const vmsForm = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: vms.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::vms
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:70
 * @route '/admin/nodes/{node}/vms'
 */
        vmsForm.get = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: vms.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ProxmoxNodeController::vms
 * @see app/Http/Controllers/Admin/ProxmoxNodeController.php:70
 * @route '/admin/nodes/{node}/vms'
 */
        vmsForm.head = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: vms.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    vms.form = vmsForm
const nodes = {
    index: Object.assign(index, index),
vms: Object.assign(vms, vmsAb73f1),
}

export default nodes