import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
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
* @see \App\Http\Controllers\SessionCameraController::acquireControl
 * @see app/Http/Controllers/SessionCameraController.php:73
 * @route '/sessions/{session}/cameras/{camera}/control'
 */
export const acquireControl = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: acquireControl.url(args, options),
    method: 'post',
})

acquireControl.definition = {
    methods: ["post"],
    url: '/sessions/{session}/cameras/{camera}/control',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SessionCameraController::acquireControl
 * @see app/Http/Controllers/SessionCameraController.php:73
 * @route '/sessions/{session}/cameras/{camera}/control'
 */
acquireControl.url = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions) => {
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

    return acquireControl.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace('{camera}', parsedArgs.camera.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionCameraController::acquireControl
 * @see app/Http/Controllers/SessionCameraController.php:73
 * @route '/sessions/{session}/cameras/{camera}/control'
 */
acquireControl.post = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: acquireControl.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\SessionCameraController::acquireControl
 * @see app/Http/Controllers/SessionCameraController.php:73
 * @route '/sessions/{session}/cameras/{camera}/control'
 */
    const acquireControlForm = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: acquireControl.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SessionCameraController::acquireControl
 * @see app/Http/Controllers/SessionCameraController.php:73
 * @route '/sessions/{session}/cameras/{camera}/control'
 */
        acquireControlForm.post = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: acquireControl.url(args, options),
            method: 'post',
        })
    
    acquireControl.form = acquireControlForm
/**
* @see \App\Http\Controllers\SessionCameraController::releaseControl
 * @see app/Http/Controllers/SessionCameraController.php:99
 * @route '/sessions/{session}/cameras/{camera}/control'
 */
export const releaseControl = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: releaseControl.url(args, options),
    method: 'delete',
})

releaseControl.definition = {
    methods: ["delete"],
    url: '/sessions/{session}/cameras/{camera}/control',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\SessionCameraController::releaseControl
 * @see app/Http/Controllers/SessionCameraController.php:99
 * @route '/sessions/{session}/cameras/{camera}/control'
 */
releaseControl.url = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions) => {
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

    return releaseControl.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace('{camera}', parsedArgs.camera.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionCameraController::releaseControl
 * @see app/Http/Controllers/SessionCameraController.php:99
 * @route '/sessions/{session}/cameras/{camera}/control'
 */
releaseControl.delete = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: releaseControl.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\SessionCameraController::releaseControl
 * @see app/Http/Controllers/SessionCameraController.php:99
 * @route '/sessions/{session}/cameras/{camera}/control'
 */
    const releaseControlForm = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: releaseControl.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SessionCameraController::releaseControl
 * @see app/Http/Controllers/SessionCameraController.php:99
 * @route '/sessions/{session}/cameras/{camera}/control'
 */
        releaseControlForm.delete = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: releaseControl.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    releaseControl.form = releaseControlForm
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
* @see \App\Http\Controllers\SessionCameraController::changeResolution
 * @see app/Http/Controllers/SessionCameraController.php:165
 * @route '/sessions/{session}/cameras/{camera}/resolution'
 */
export const changeResolution = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: changeResolution.url(args, options),
    method: 'put',
})

changeResolution.definition = {
    methods: ["put"],
    url: '/sessions/{session}/cameras/{camera}/resolution',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\SessionCameraController::changeResolution
 * @see app/Http/Controllers/SessionCameraController.php:165
 * @route '/sessions/{session}/cameras/{camera}/resolution'
 */
changeResolution.url = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions) => {
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

    return changeResolution.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace('{camera}', parsedArgs.camera.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionCameraController::changeResolution
 * @see app/Http/Controllers/SessionCameraController.php:165
 * @route '/sessions/{session}/cameras/{camera}/resolution'
 */
changeResolution.put = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: changeResolution.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\SessionCameraController::changeResolution
 * @see app/Http/Controllers/SessionCameraController.php:165
 * @route '/sessions/{session}/cameras/{camera}/resolution'
 */
    const changeResolutionForm = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: changeResolution.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SessionCameraController::changeResolution
 * @see app/Http/Controllers/SessionCameraController.php:165
 * @route '/sessions/{session}/cameras/{camera}/resolution'
 */
        changeResolutionForm.put = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: changeResolution.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    changeResolution.form = changeResolutionForm
/**
* @see \App\Http\Controllers\SessionCameraController::whepProxy
 * @see app/Http/Controllers/SessionCameraController.php:193
 * @route '/sessions/{session}/cameras/{camera}/whep'
 */
export const whepProxy = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: whepProxy.url(args, options),
    method: 'post',
})

whepProxy.definition = {
    methods: ["post"],
    url: '/sessions/{session}/cameras/{camera}/whep',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SessionCameraController::whepProxy
 * @see app/Http/Controllers/SessionCameraController.php:193
 * @route '/sessions/{session}/cameras/{camera}/whep'
 */
whepProxy.url = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions) => {
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

    return whepProxy.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace('{camera}', parsedArgs.camera.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionCameraController::whepProxy
 * @see app/Http/Controllers/SessionCameraController.php:193
 * @route '/sessions/{session}/cameras/{camera}/whep'
 */
whepProxy.post = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: whepProxy.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\SessionCameraController::whepProxy
 * @see app/Http/Controllers/SessionCameraController.php:193
 * @route '/sessions/{session}/cameras/{camera}/whep'
 */
    const whepProxyForm = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: whepProxy.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SessionCameraController::whepProxy
 * @see app/Http/Controllers/SessionCameraController.php:193
 * @route '/sessions/{session}/cameras/{camera}/whep'
 */
        whepProxyForm.post = (args: { session: string | number, camera: string | number } | [session: string | number, camera: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: whepProxy.url(args, options),
            method: 'post',
        })
    
    whepProxy.form = whepProxyForm
const SessionCameraController = { index, resolutions, show, acquireControl, releaseControl, move, changeResolution, whepProxy }

export default SessionCameraController