import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\SessionCameraController::acquire
 * @see app/Http/Controllers/SessionCameraController.php:73
 * @route '/sessions/{session}/cameras/{camera}/control'
 */
export const acquire = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: acquire.url(args, options),
    method: 'post',
})

acquire.definition = {
    methods: ["post"],
    url: '/sessions/{session}/cameras/{camera}/control',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SessionCameraController::acquire
 * @see app/Http/Controllers/SessionCameraController.php:73
 * @route '/sessions/{session}/cameras/{camera}/control'
 */
acquire.url = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    session: args[0],
                    camera: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        session: args.session,
                                camera: args.camera,
                }

    return acquire.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace('{camera}', parsedArgs.camera.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionCameraController::acquire
 * @see app/Http/Controllers/SessionCameraController.php:73
 * @route '/sessions/{session}/cameras/{camera}/control'
 */
acquire.post = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: acquire.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\SessionCameraController::acquire
 * @see app/Http/Controllers/SessionCameraController.php:73
 * @route '/sessions/{session}/cameras/{camera}/control'
 */
    const acquireForm = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: acquire.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SessionCameraController::acquire
 * @see app/Http/Controllers/SessionCameraController.php:73
 * @route '/sessions/{session}/cameras/{camera}/control'
 */
        acquireForm.post = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: acquire.url(args, options),
            method: 'post',
        })
    
    acquire.form = acquireForm
/**
* @see \App\Http\Controllers\SessionCameraController::release
 * @see app/Http/Controllers/SessionCameraController.php:99
 * @route '/sessions/{session}/cameras/{camera}/control'
 */
export const release = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: release.url(args, options),
    method: 'delete',
})

release.definition = {
    methods: ["delete"],
    url: '/sessions/{session}/cameras/{camera}/control',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\SessionCameraController::release
 * @see app/Http/Controllers/SessionCameraController.php:99
 * @route '/sessions/{session}/cameras/{camera}/control'
 */
release.url = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    session: args[0],
                    camera: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        session: args.session,
                                camera: args.camera,
                }

    return release.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace('{camera}', parsedArgs.camera.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionCameraController::release
 * @see app/Http/Controllers/SessionCameraController.php:99
 * @route '/sessions/{session}/cameras/{camera}/control'
 */
release.delete = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: release.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\SessionCameraController::release
 * @see app/Http/Controllers/SessionCameraController.php:99
 * @route '/sessions/{session}/cameras/{camera}/control'
 */
    const releaseForm = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: release.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SessionCameraController::release
 * @see app/Http/Controllers/SessionCameraController.php:99
 * @route '/sessions/{session}/cameras/{camera}/control'
 */
        releaseForm.delete = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: release.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    release.form = releaseForm
const control = {
    acquire: Object.assign(acquire, acquire),
release: Object.assign(release, release),
}

export default control