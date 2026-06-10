import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\MaintenanceController::set
 * @see app/Http/Controllers/Admin/MaintenanceController.php:114
 * @route '/admin/maintenance/cameras/{camera}'
 */
export const set = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: set.url(args, options),
    method: 'post',
})

set.definition = {
    methods: ["post"],
    url: '/admin/maintenance/cameras/{camera}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\MaintenanceController::set
 * @see app/Http/Controllers/Admin/MaintenanceController.php:114
 * @route '/admin/maintenance/cameras/{camera}'
 */
set.url = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { camera: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { camera: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    camera: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        camera: typeof args.camera === 'object'
                ? args.camera.id
                : args.camera,
                }

    return set.definition.url
            .replace('{camera}', parsedArgs.camera.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\MaintenanceController::set
 * @see app/Http/Controllers/Admin/MaintenanceController.php:114
 * @route '/admin/maintenance/cameras/{camera}'
 */
set.post = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: set.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\MaintenanceController::set
 * @see app/Http/Controllers/Admin/MaintenanceController.php:114
 * @route '/admin/maintenance/cameras/{camera}'
 */
    const setForm = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: set.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\MaintenanceController::set
 * @see app/Http/Controllers/Admin/MaintenanceController.php:114
 * @route '/admin/maintenance/cameras/{camera}'
 */
        setForm.post = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: set.url(args, options),
            method: 'post',
        })
    
    set.form = setForm
/**
* @see \App\Http\Controllers\Admin\MaintenanceController::clear
 * @see app/Http/Controllers/Admin/MaintenanceController.php:140
 * @route '/admin/maintenance/cameras/{camera}'
 */
export const clear = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: clear.url(args, options),
    method: 'delete',
})

clear.definition = {
    methods: ["delete"],
    url: '/admin/maintenance/cameras/{camera}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\MaintenanceController::clear
 * @see app/Http/Controllers/Admin/MaintenanceController.php:140
 * @route '/admin/maintenance/cameras/{camera}'
 */
clear.url = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { camera: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { camera: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    camera: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        camera: typeof args.camera === 'object'
                ? args.camera.id
                : args.camera,
                }

    return clear.definition.url
            .replace('{camera}', parsedArgs.camera.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\MaintenanceController::clear
 * @see app/Http/Controllers/Admin/MaintenanceController.php:140
 * @route '/admin/maintenance/cameras/{camera}'
 */
clear.delete = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: clear.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\MaintenanceController::clear
 * @see app/Http/Controllers/Admin/MaintenanceController.php:140
 * @route '/admin/maintenance/cameras/{camera}'
 */
    const clearForm = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
 * @see app/Http/Controllers/Admin/MaintenanceController.php:140
 * @route '/admin/maintenance/cameras/{camera}'
 */
        clearForm.delete = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: clear.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    clear.form = clearForm
const cameras = {
    set: Object.assign(set, set),
clear: Object.assign(clear, clear),
}

export default cameras