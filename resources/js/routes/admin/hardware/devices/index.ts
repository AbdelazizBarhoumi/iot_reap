import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\HardwareController::dedicate
 * @see app/Http/Controllers/HardwareController.php:1026
 * @route '/admin/hardware/devices/{device}/dedicate'
 */
export const dedicate = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: dedicate.url(args, options),
    method: 'post',
})

dedicate.definition = {
    methods: ["post"],
    url: '/admin/hardware/devices/{device}/dedicate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\HardwareController::dedicate
 * @see app/Http/Controllers/HardwareController.php:1026
 * @route '/admin/hardware/devices/{device}/dedicate'
 */
dedicate.url = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return dedicate.definition.url
            .replace('{device}', parsedArgs.device.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::dedicate
 * @see app/Http/Controllers/HardwareController.php:1026
 * @route '/admin/hardware/devices/{device}/dedicate'
 */
dedicate.post = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: dedicate.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\HardwareController::dedicate
 * @see app/Http/Controllers/HardwareController.php:1026
 * @route '/admin/hardware/devices/{device}/dedicate'
 */
    const dedicateForm = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: dedicate.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HardwareController::dedicate
 * @see app/Http/Controllers/HardwareController.php:1026
 * @route '/admin/hardware/devices/{device}/dedicate'
 */
        dedicateForm.post = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: dedicate.url(args, options),
            method: 'post',
        })
    
    dedicate.form = dedicateForm
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
const devices = {
    dedicate: Object.assign(dedicate, dedicate),
removeDedication: Object.assign(removeDedication, removeDedication),
}

export default devices