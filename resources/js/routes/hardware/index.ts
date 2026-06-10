import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import devices95ecd0 from './devices'
import nodes from './nodes'
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
const hardware = {
    index: Object.assign(index, index),
devices: Object.assign(devices, devices95ecd0),
refresh: Object.assign(refresh, refresh),
nodes: Object.assign(nodes, nodes),
}

export default hardware