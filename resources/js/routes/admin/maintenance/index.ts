import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
import usbDevices from './usb-devices'
import cameras from './cameras'
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
* @see \App\Http\Controllers\Admin\MaintenanceController::description
 * @see app/Http/Controllers/Admin/MaintenanceController.php:155
 * @route '/admin/maintenance/description'
 */
export const description = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: description.url(options),
    method: 'post',
})

description.definition = {
    methods: ["post"],
    url: '/admin/maintenance/description',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\MaintenanceController::description
 * @see app/Http/Controllers/Admin/MaintenanceController.php:155
 * @route '/admin/maintenance/description'
 */
description.url = (options?: RouteQueryOptions) => {
    return description.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\MaintenanceController::description
 * @see app/Http/Controllers/Admin/MaintenanceController.php:155
 * @route '/admin/maintenance/description'
 */
description.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: description.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\MaintenanceController::description
 * @see app/Http/Controllers/Admin/MaintenanceController.php:155
 * @route '/admin/maintenance/description'
 */
    const descriptionForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: description.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\MaintenanceController::description
 * @see app/Http/Controllers/Admin/MaintenanceController.php:155
 * @route '/admin/maintenance/description'
 */
        descriptionForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: description.url(options),
            method: 'post',
        })
    
    description.form = descriptionForm
const maintenance = {
    index: Object.assign(index, index),
inMaintenance: Object.assign(inMaintenance, inMaintenance),
description: Object.assign(description, description),
usbDevices: Object.assign(usbDevices, usbDevices),
cameras: Object.assign(cameras, cameras),
}

export default maintenance