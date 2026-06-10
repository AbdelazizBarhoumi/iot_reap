import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
import nodes from './nodes'
import devices from './devices'
/**
* @see \App\Http\Controllers\HardwareController::discover
 * @see app/Http/Controllers/HardwareController.php:898
 * @route '/admin/hardware/discover'
 */
export const discover = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: discover.url(options),
    method: 'post',
})

discover.definition = {
    methods: ["post"],
    url: '/admin/hardware/discover',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\HardwareController::discover
 * @see app/Http/Controllers/HardwareController.php:898
 * @route '/admin/hardware/discover'
 */
discover.url = (options?: RouteQueryOptions) => {
    return discover.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::discover
 * @see app/Http/Controllers/HardwareController.php:898
 * @route '/admin/hardware/discover'
 */
discover.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: discover.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\HardwareController::discover
 * @see app/Http/Controllers/HardwareController.php:898
 * @route '/admin/hardware/discover'
 */
    const discoverForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: discover.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HardwareController::discover
 * @see app/Http/Controllers/HardwareController.php:898
 * @route '/admin/hardware/discover'
 */
        discoverForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: discover.url(options),
            method: 'post',
        })
    
    discover.form = discoverForm
/**
* @see \App\Http\Controllers\HardwareController::status
 * @see app/Http/Controllers/HardwareController.php:934
 * @route '/admin/hardware/status'
 */
export const status = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: status.url(options),
    method: 'post',
})

status.definition = {
    methods: ["post"],
    url: '/admin/hardware/status',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\HardwareController::status
 * @see app/Http/Controllers/HardwareController.php:934
 * @route '/admin/hardware/status'
 */
status.url = (options?: RouteQueryOptions) => {
    return status.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::status
 * @see app/Http/Controllers/HardwareController.php:934
 * @route '/admin/hardware/status'
 */
status.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: status.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\HardwareController::status
 * @see app/Http/Controllers/HardwareController.php:934
 * @route '/admin/hardware/status'
 */
    const statusForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: status.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HardwareController::status
 * @see app/Http/Controllers/HardwareController.php:934
 * @route '/admin/hardware/status'
 */
        statusForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: status.url(options),
            method: 'post',
        })
    
    status.form = statusForm
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
const hardware = {
    nodes: Object.assign(nodes, nodes),
discover: Object.assign(discover, discover),
status: Object.assign(status, status),
runningVms: Object.assign(runningVms, runningVms),
dedicatedDevices: Object.assign(dedicatedDevices, dedicatedDevices),
devices: Object.assign(devices, devices),
}

export default hardware