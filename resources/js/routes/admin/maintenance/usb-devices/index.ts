import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\MaintenanceController::set
 * @see app/Http/Controllers/Admin/MaintenanceController.php:73
 * @route '/admin/maintenance/usb-devices/{device}'
 */
export const set = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: set.url(args, options),
    method: 'post',
})

set.definition = {
    methods: ["post"],
    url: '/admin/maintenance/usb-devices/{device}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\MaintenanceController::set
 * @see app/Http/Controllers/Admin/MaintenanceController.php:73
 * @route '/admin/maintenance/usb-devices/{device}'
 */
set.url = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return set.definition.url
            .replace('{device}', parsedArgs.device.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\MaintenanceController::set
 * @see app/Http/Controllers/Admin/MaintenanceController.php:73
 * @route '/admin/maintenance/usb-devices/{device}'
 */
set.post = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: set.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\MaintenanceController::set
 * @see app/Http/Controllers/Admin/MaintenanceController.php:73
 * @route '/admin/maintenance/usb-devices/{device}'
 */
    const setForm = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: set.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\MaintenanceController::set
 * @see app/Http/Controllers/Admin/MaintenanceController.php:73
 * @route '/admin/maintenance/usb-devices/{device}'
 */
        setForm.post = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: set.url(args, options),
            method: 'post',
        })
    
    set.form = setForm
/**
* @see \App\Http\Controllers\Admin\MaintenanceController::clear
 * @see app/Http/Controllers/Admin/MaintenanceController.php:99
 * @route '/admin/maintenance/usb-devices/{device}'
 */
export const clear = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: clear.url(args, options),
    method: 'delete',
})

clear.definition = {
    methods: ["delete"],
    url: '/admin/maintenance/usb-devices/{device}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\MaintenanceController::clear
 * @see app/Http/Controllers/Admin/MaintenanceController.php:99
 * @route '/admin/maintenance/usb-devices/{device}'
 */
clear.url = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return clear.definition.url
            .replace('{device}', parsedArgs.device.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\MaintenanceController::clear
 * @see app/Http/Controllers/Admin/MaintenanceController.php:99
 * @route '/admin/maintenance/usb-devices/{device}'
 */
clear.delete = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: clear.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\MaintenanceController::clear
 * @see app/Http/Controllers/Admin/MaintenanceController.php:99
 * @route '/admin/maintenance/usb-devices/{device}'
 */
    const clearForm = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: clear.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\MaintenanceController::clear
 * @see app/Http/Controllers/Admin/MaintenanceController.php:99
 * @route '/admin/maintenance/usb-devices/{device}'
 */
        clearForm.delete = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: clear.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    clear.form = clearForm
const usbDevices = {
    set: Object.assign(set, set),
clear: Object.assign(clear, clear),
}

export default usbDevices