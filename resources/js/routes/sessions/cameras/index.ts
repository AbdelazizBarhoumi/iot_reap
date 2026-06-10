import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import control from './control'
/**
* @see \App\Http\Controllers\SessionCameraController::index
 * @see app/Http/Controllers/SessionCameraController.php:42
 * @route '/sessions/{session}/cameras'
 */
export const index = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/sessions/{session}/cameras',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SessionCameraController::index
 * @see app/Http/Controllers/SessionCameraController.php:42
 * @route '/sessions/{session}/cameras'
 */
index.url = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { session: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    session: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        session: args.session,
                }

    return index.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionCameraController::index
 * @see app/Http/Controllers/SessionCameraController.php:42
 * @route '/sessions/{session}/cameras'
 */
index.get = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SessionCameraController::index
 * @see app/Http/Controllers/SessionCameraController.php:42
 * @route '/sessions/{session}/cameras'
 */
index.head = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SessionCameraController::index
 * @see app/Http/Controllers/SessionCameraController.php:42
 * @route '/sessions/{session}/cameras'
 */
    const indexForm = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SessionCameraController::index
 * @see app/Http/Controllers/SessionCameraController.php:42
 * @route '/sessions/{session}/cameras'
 */
        indexForm.get = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SessionCameraController::index
 * @see app/Http/Controllers/SessionCameraController.php:42
 * @route '/sessions/{session}/cameras'
 */
        indexForm.head = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\SessionCameraController::resolutions
 * @see app/Http/Controllers/SessionCameraController.php:150
 * @route '/sessions/{session}/cameras/resolutions'
 */
export const resolutions = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: resolutions.url(args, options),
    method: 'get',
})

resolutions.definition = {
    methods: ["get","head"],
    url: '/sessions/{session}/cameras/resolutions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SessionCameraController::resolutions
 * @see app/Http/Controllers/SessionCameraController.php:150
 * @route '/sessions/{session}/cameras/resolutions'
 */
resolutions.url = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { session: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    session: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        session: args.session,
                }

    return resolutions.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionCameraController::resolutions
 * @see app/Http/Controllers/SessionCameraController.php:150
 * @route '/sessions/{session}/cameras/resolutions'
 */
resolutions.get = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: resolutions.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SessionCameraController::resolutions
 * @see app/Http/Controllers/SessionCameraController.php:150
 * @route '/sessions/{session}/cameras/resolutions'
 */
resolutions.head = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: resolutions.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SessionCameraController::resolutions
 * @see app/Http/Controllers/SessionCameraController.php:150
 * @route '/sessions/{session}/cameras/resolutions'
 */
    const resolutionsForm = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: resolutions.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SessionCameraController::resolutions
 * @see app/Http/Controllers/SessionCameraController.php:150
 * @route '/sessions/{session}/cameras/resolutions'
 */
        resolutionsForm.get = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: resolutions.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SessionCameraController::resolutions
 * @see app/Http/Controllers/SessionCameraController.php:150
 * @route '/sessions/{session}/cameras/resolutions'
 */
        resolutionsForm.head = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: resolutions.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    resolutions.form = resolutionsForm
/**
* @see \App\Http\Controllers\SessionCameraController::show
 * @see app/Http/Controllers/SessionCameraController.php:57
 * @route '/sessions/{session}/cameras/{camera}'
 */
export const show = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/sessions/{session}/cameras/{camera}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SessionCameraController::show
 * @see app/Http/Controllers/SessionCameraController.php:57
 * @route '/sessions/{session}/cameras/{camera}'
 */
show.url = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace('{camera}', parsedArgs.camera.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionCameraController::show
 * @see app/Http/Controllers/SessionCameraController.php:57
 * @route '/sessions/{session}/cameras/{camera}'
 */
show.get = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SessionCameraController::show
 * @see app/Http/Controllers/SessionCameraController.php:57
 * @route '/sessions/{session}/cameras/{camera}'
 */
show.head = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SessionCameraController::show
 * @see app/Http/Controllers/SessionCameraController.php:57
 * @route '/sessions/{session}/cameras/{camera}'
 */
    const showForm = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SessionCameraController::show
 * @see app/Http/Controllers/SessionCameraController.php:57
 * @route '/sessions/{session}/cameras/{camera}'
 */
        showForm.get = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SessionCameraController::show
 * @see app/Http/Controllers/SessionCameraController.php:57
 * @route '/sessions/{session}/cameras/{camera}'
 */
        showForm.head = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \App\Http\Controllers\SessionCameraController::move
 * @see app/Http/Controllers/SessionCameraController.php:125
 * @route '/sessions/{session}/cameras/{camera}/move'
 */
export const move = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: move.url(args, options),
    method: 'post',
})

move.definition = {
    methods: ["post"],
    url: '/sessions/{session}/cameras/{camera}/move',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SessionCameraController::move
 * @see app/Http/Controllers/SessionCameraController.php:125
 * @route '/sessions/{session}/cameras/{camera}/move'
 */
move.url = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions) => {
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

    return move.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace('{camera}', parsedArgs.camera.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionCameraController::move
 * @see app/Http/Controllers/SessionCameraController.php:125
 * @route '/sessions/{session}/cameras/{camera}/move'
 */
move.post = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: move.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\SessionCameraController::move
 * @see app/Http/Controllers/SessionCameraController.php:125
 * @route '/sessions/{session}/cameras/{camera}/move'
 */
    const moveForm = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: move.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SessionCameraController::move
 * @see app/Http/Controllers/SessionCameraController.php:125
 * @route '/sessions/{session}/cameras/{camera}/move'
 */
        moveForm.post = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: move.url(args, options),
            method: 'post',
        })
    
    move.form = moveForm
/**
* @see \App\Http\Controllers\SessionCameraController::resolution
 * @see app/Http/Controllers/SessionCameraController.php:165
 * @route '/sessions/{session}/cameras/{camera}/resolution'
 */
export const resolution = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: resolution.url(args, options),
    method: 'put',
})

resolution.definition = {
    methods: ["put"],
    url: '/sessions/{session}/cameras/{camera}/resolution',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\SessionCameraController::resolution
 * @see app/Http/Controllers/SessionCameraController.php:165
 * @route '/sessions/{session}/cameras/{camera}/resolution'
 */
resolution.url = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions) => {
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

    return resolution.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace('{camera}', parsedArgs.camera.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionCameraController::resolution
 * @see app/Http/Controllers/SessionCameraController.php:165
 * @route '/sessions/{session}/cameras/{camera}/resolution'
 */
resolution.put = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: resolution.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\SessionCameraController::resolution
 * @see app/Http/Controllers/SessionCameraController.php:165
 * @route '/sessions/{session}/cameras/{camera}/resolution'
 */
    const resolutionForm = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: resolution.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SessionCameraController::resolution
 * @see app/Http/Controllers/SessionCameraController.php:165
 * @route '/sessions/{session}/cameras/{camera}/resolution'
 */
        resolutionForm.put = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: resolution.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    resolution.form = resolutionForm
/**
* @see \App\Http\Controllers\SessionCameraController::whep
 * @see app/Http/Controllers/SessionCameraController.php:193
 * @route '/sessions/{session}/cameras/{camera}/whep'
 */
export const whep = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: whep.url(args, options),
    method: 'post',
})

whep.definition = {
    methods: ["post"],
    url: '/sessions/{session}/cameras/{camera}/whep',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SessionCameraController::whep
 * @see app/Http/Controllers/SessionCameraController.php:193
 * @route '/sessions/{session}/cameras/{camera}/whep'
 */
whep.url = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions) => {
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

    return whep.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace('{camera}', parsedArgs.camera.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionCameraController::whep
 * @see app/Http/Controllers/SessionCameraController.php:193
 * @route '/sessions/{session}/cameras/{camera}/whep'
 */
whep.post = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: whep.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\SessionCameraController::whep
 * @see app/Http/Controllers/SessionCameraController.php:193
 * @route '/sessions/{session}/cameras/{camera}/whep'
 */
    const whepForm = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: whep.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SessionCameraController::whep
 * @see app/Http/Controllers/SessionCameraController.php:193
 * @route '/sessions/{session}/cameras/{camera}/whep'
 */
        whepForm.post = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: whep.url(args, options),
            method: 'post',
        })
    
    whep.form = whepForm
const cameras = {
    index: Object.assign(index, index),
resolutions: Object.assign(resolutions, resolutions),
show: Object.assign(show, show),
control: Object.assign(control, control),
move: Object.assign(move, move),
resolution: Object.assign(resolution, resolution),
whep: Object.assign(whep, whep),
}

export default cameras