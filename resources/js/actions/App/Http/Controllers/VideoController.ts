import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\VideoController::stream
 * @see app/Http/Controllers/VideoController.php:168
 * @route '/videos/{videoId}/stream'
 */
export const stream = (args: { videoId: string | number } | [videoId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stream.url(args, options),
    method: 'get',
})

stream.definition = {
    methods: ["get","head"],
    url: '/videos/{videoId}/stream',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\VideoController::stream
 * @see app/Http/Controllers/VideoController.php:168
 * @route '/videos/{videoId}/stream'
 */
stream.url = (args: { videoId: string | number } | [videoId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { videoId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    videoId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        videoId: args.videoId,
                }

    return stream.definition.url
            .replace('{videoId}', parsedArgs.videoId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VideoController::stream
 * @see app/Http/Controllers/VideoController.php:168
 * @route '/videos/{videoId}/stream'
 */
stream.get = (args: { videoId: string | number } | [videoId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stream.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\VideoController::stream
 * @see app/Http/Controllers/VideoController.php:168
 * @route '/videos/{videoId}/stream'
 */
stream.head = (args: { videoId: string | number } | [videoId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: stream.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\VideoController::stream
 * @see app/Http/Controllers/VideoController.php:168
 * @route '/videos/{videoId}/stream'
 */
    const streamForm = (args: { videoId: string | number } | [videoId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: stream.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\VideoController::stream
 * @see app/Http/Controllers/VideoController.php:168
 * @route '/videos/{videoId}/stream'
 */
        streamForm.get = (args: { videoId: string | number } | [videoId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: stream.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\VideoController::stream
 * @see app/Http/Controllers/VideoController.php:168
 * @route '/videos/{videoId}/stream'
 */
        streamForm.head = (args: { videoId: string | number } | [videoId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: stream.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    stream.form = streamForm
/**
* @see \App\Http\Controllers\VideoController::segment
 * @see app/Http/Controllers/VideoController.php:199
 * @route '/videos/{videoId}/stream/{quality}/{segment}'
 */
export const segment = (args: { videoId: string | number, quality: string | number, segment: string | number } | [videoId: string | number, quality: string | number, segment: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: segment.url(args, options),
    method: 'get',
})

segment.definition = {
    methods: ["get","head"],
    url: '/videos/{videoId}/stream/{quality}/{segment}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\VideoController::segment
 * @see app/Http/Controllers/VideoController.php:199
 * @route '/videos/{videoId}/stream/{quality}/{segment}'
 */
segment.url = (args: { videoId: string | number, quality: string | number, segment: string | number } | [videoId: string | number, quality: string | number, segment: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    videoId: args[0],
                    quality: args[1],
                    segment: args[2],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        videoId: args.videoId,
                                quality: args.quality,
                                segment: args.segment,
                }

    return segment.definition.url
            .replace('{videoId}', parsedArgs.videoId.toString())
            .replace('{quality}', parsedArgs.quality.toString())
            .replace('{segment}', parsedArgs.segment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VideoController::segment
 * @see app/Http/Controllers/VideoController.php:199
 * @route '/videos/{videoId}/stream/{quality}/{segment}'
 */
segment.get = (args: { videoId: string | number, quality: string | number, segment: string | number } | [videoId: string | number, quality: string | number, segment: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: segment.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\VideoController::segment
 * @see app/Http/Controllers/VideoController.php:199
 * @route '/videos/{videoId}/stream/{quality}/{segment}'
 */
segment.head = (args: { videoId: string | number, quality: string | number, segment: string | number } | [videoId: string | number, quality: string | number, segment: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: segment.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\VideoController::segment
 * @see app/Http/Controllers/VideoController.php:199
 * @route '/videos/{videoId}/stream/{quality}/{segment}'
 */
    const segmentForm = (args: { videoId: string | number, quality: string | number, segment: string | number } | [videoId: string | number, quality: string | number, segment: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: segment.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\VideoController::segment
 * @see app/Http/Controllers/VideoController.php:199
 * @route '/videos/{videoId}/stream/{quality}/{segment}'
 */
        segmentForm.get = (args: { videoId: string | number, quality: string | number, segment: string | number } | [videoId: string | number, quality: string | number, segment: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: segment.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\VideoController::segment
 * @see app/Http/Controllers/VideoController.php:199
 * @route '/videos/{videoId}/stream/{quality}/{segment}'
 */
        segmentForm.head = (args: { videoId: string | number, quality: string | number, segment: string | number } | [videoId: string | number, quality: string | number, segment: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: segment.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    segment.form = segmentForm
/**
* @see \App\Http\Controllers\VideoController::status
 * @see app/Http/Controllers/VideoController.php:137
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/video/status'
 */
const status5083271b9f0182c150d3692a51202ea3 = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status5083271b9f0182c150d3692a51202ea3.url(args, options),
    method: 'get',
})

status5083271b9f0182c150d3692a51202ea3.definition = {
    methods: ["get","head"],
    url: '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/video/status',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\VideoController::status
 * @see app/Http/Controllers/VideoController.php:137
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/video/status'
 */
status5083271b9f0182c150d3692a51202ea3.url = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    trainingPathId: args[0],
                    trainingUnitId: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPathId: args.trainingPathId,
                                trainingUnitId: args.trainingUnitId,
                }

    return status5083271b9f0182c150d3692a51202ea3.definition.url
            .replace('{trainingPathId}', parsedArgs.trainingPathId.toString())
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VideoController::status
 * @see app/Http/Controllers/VideoController.php:137
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/video/status'
 */
status5083271b9f0182c150d3692a51202ea3.get = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status5083271b9f0182c150d3692a51202ea3.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\VideoController::status
 * @see app/Http/Controllers/VideoController.php:137
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/video/status'
 */
status5083271b9f0182c150d3692a51202ea3.head = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: status5083271b9f0182c150d3692a51202ea3.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\VideoController::status
 * @see app/Http/Controllers/VideoController.php:137
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/video/status'
 */
    const status5083271b9f0182c150d3692a51202ea3Form = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: status5083271b9f0182c150d3692a51202ea3.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\VideoController::status
 * @see app/Http/Controllers/VideoController.php:137
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/video/status'
 */
        status5083271b9f0182c150d3692a51202ea3Form.get = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: status5083271b9f0182c150d3692a51202ea3.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\VideoController::status
 * @see app/Http/Controllers/VideoController.php:137
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/video/status'
 */
        status5083271b9f0182c150d3692a51202ea3Form.head = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: status5083271b9f0182c150d3692a51202ea3.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    status5083271b9f0182c150d3692a51202ea3.form = status5083271b9f0182c150d3692a51202ea3Form
    /**
* @see \App\Http\Controllers\VideoController::status
 * @see app/Http/Controllers/VideoController.php:137
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/status'
 */
const status5d470e29f568f4657da39fa395440a78 = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status5d470e29f568f4657da39fa395440a78.url(args, options),
    method: 'get',
})

status5d470e29f568f4657da39fa395440a78.definition = {
    methods: ["get","head"],
    url: '/teaching/trainingUnits/{trainingUnitId}/video/status',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\VideoController::status
 * @see app/Http/Controllers/VideoController.php:137
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/status'
 */
status5d470e29f568f4657da39fa395440a78.url = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingUnitId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    trainingUnitId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingUnitId: args.trainingUnitId,
                }

    return status5d470e29f568f4657da39fa395440a78.definition.url
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VideoController::status
 * @see app/Http/Controllers/VideoController.php:137
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/status'
 */
status5d470e29f568f4657da39fa395440a78.get = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status5d470e29f568f4657da39fa395440a78.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\VideoController::status
 * @see app/Http/Controllers/VideoController.php:137
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/status'
 */
status5d470e29f568f4657da39fa395440a78.head = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: status5d470e29f568f4657da39fa395440a78.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\VideoController::status
 * @see app/Http/Controllers/VideoController.php:137
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/status'
 */
    const status5d470e29f568f4657da39fa395440a78Form = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: status5d470e29f568f4657da39fa395440a78.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\VideoController::status
 * @see app/Http/Controllers/VideoController.php:137
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/status'
 */
        status5d470e29f568f4657da39fa395440a78Form.get = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: status5d470e29f568f4657da39fa395440a78.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\VideoController::status
 * @see app/Http/Controllers/VideoController.php:137
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/status'
 */
        status5d470e29f568f4657da39fa395440a78Form.head = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: status5d470e29f568f4657da39fa395440a78.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    status5d470e29f568f4657da39fa395440a78.form = status5d470e29f568f4657da39fa395440a78Form

export const status = {
    '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/video/status': status5083271b9f0182c150d3692a51202ea3,
    '/teaching/trainingUnits/{trainingUnitId}/video/status': status5d470e29f568f4657da39fa395440a78,
}

/**
* @see \App\Http\Controllers\VideoController::show
 * @see app/Http/Controllers/VideoController.php:34
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
export const show = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/teaching/trainingUnits/{trainingUnitId}/video',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\VideoController::show
 * @see app/Http/Controllers/VideoController.php:34
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
show.url = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingUnitId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    trainingUnitId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingUnitId: args.trainingUnitId,
                }

    return show.definition.url
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VideoController::show
 * @see app/Http/Controllers/VideoController.php:34
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
show.get = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\VideoController::show
 * @see app/Http/Controllers/VideoController.php:34
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
show.head = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\VideoController::show
 * @see app/Http/Controllers/VideoController.php:34
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
    const showForm = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\VideoController::show
 * @see app/Http/Controllers/VideoController.php:34
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
        showForm.get = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\VideoController::show
 * @see app/Http/Controllers/VideoController.php:34
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
        showForm.head = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\VideoController::store
 * @see app/Http/Controllers/VideoController.php:52
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
export const store = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/teaching/trainingUnits/{trainingUnitId}/video',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\VideoController::store
 * @see app/Http/Controllers/VideoController.php:52
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
store.url = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingUnitId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    trainingUnitId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingUnitId: args.trainingUnitId,
                }

    return store.definition.url
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VideoController::store
 * @see app/Http/Controllers/VideoController.php:52
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
store.post = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\VideoController::store
 * @see app/Http/Controllers/VideoController.php:52
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
    const storeForm = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\VideoController::store
 * @see app/Http/Controllers/VideoController.php:52
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
        storeForm.post = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\VideoController::destroy
 * @see app/Http/Controllers/VideoController.php:82
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
export const destroy = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/teaching/trainingUnits/{trainingUnitId}/video',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\VideoController::destroy
 * @see app/Http/Controllers/VideoController.php:82
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
destroy.url = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingUnitId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    trainingUnitId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingUnitId: args.trainingUnitId,
                }

    return destroy.definition.url
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VideoController::destroy
 * @see app/Http/Controllers/VideoController.php:82
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
destroy.delete = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\VideoController::destroy
 * @see app/Http/Controllers/VideoController.php:82
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
    const destroyForm = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\VideoController::destroy
 * @see app/Http/Controllers/VideoController.php:82
 * @route '/teaching/trainingUnits/{trainingUnitId}/video'
 */
        destroyForm.delete = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
/**
* @see \App\Http\Controllers\VideoController::retry
 * @see app/Http/Controllers/VideoController.php:107
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/retry'
 */
export const retry = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: retry.url(args, options),
    method: 'post',
})

retry.definition = {
    methods: ["post"],
    url: '/teaching/trainingUnits/{trainingUnitId}/video/retry',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\VideoController::retry
 * @see app/Http/Controllers/VideoController.php:107
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/retry'
 */
retry.url = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingUnitId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    trainingUnitId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingUnitId: args.trainingUnitId,
                }

    return retry.definition.url
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VideoController::retry
 * @see app/Http/Controllers/VideoController.php:107
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/retry'
 */
retry.post = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: retry.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\VideoController::retry
 * @see app/Http/Controllers/VideoController.php:107
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/retry'
 */
    const retryForm = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: retry.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\VideoController::retry
 * @see app/Http/Controllers/VideoController.php:107
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/retry'
 */
        retryForm.post = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: retry.url(args, options),
            method: 'post',
        })
    
    retry.form = retryForm
/**
* @see \App\Http\Controllers\VideoController::captions
 * @see app/Http/Controllers/VideoController.php:252
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions'
 */
export const captions = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: captions.url(args, options),
    method: 'get',
})

captions.definition = {
    methods: ["get","head"],
    url: '/teaching/trainingUnits/{trainingUnitId}/video/captions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\VideoController::captions
 * @see app/Http/Controllers/VideoController.php:252
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions'
 */
captions.url = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingUnitId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    trainingUnitId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingUnitId: args.trainingUnitId,
                }

    return captions.definition.url
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VideoController::captions
 * @see app/Http/Controllers/VideoController.php:252
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions'
 */
captions.get = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: captions.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\VideoController::captions
 * @see app/Http/Controllers/VideoController.php:252
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions'
 */
captions.head = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: captions.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\VideoController::captions
 * @see app/Http/Controllers/VideoController.php:252
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions'
 */
    const captionsForm = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: captions.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\VideoController::captions
 * @see app/Http/Controllers/VideoController.php:252
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions'
 */
        captionsForm.get = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: captions.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\VideoController::captions
 * @see app/Http/Controllers/VideoController.php:252
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions'
 */
        captionsForm.head = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: captions.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    captions.form = captionsForm
/**
* @see \App\Http\Controllers\VideoController::storeCaption
 * @see app/Http/Controllers/VideoController.php:270
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions'
 */
export const storeCaption = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeCaption.url(args, options),
    method: 'post',
})

storeCaption.definition = {
    methods: ["post"],
    url: '/teaching/trainingUnits/{trainingUnitId}/video/captions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\VideoController::storeCaption
 * @see app/Http/Controllers/VideoController.php:270
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions'
 */
storeCaption.url = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingUnitId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    trainingUnitId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingUnitId: args.trainingUnitId,
                }

    return storeCaption.definition.url
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VideoController::storeCaption
 * @see app/Http/Controllers/VideoController.php:270
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions'
 */
storeCaption.post = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeCaption.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\VideoController::storeCaption
 * @see app/Http/Controllers/VideoController.php:270
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions'
 */
    const storeCaptionForm = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: storeCaption.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\VideoController::storeCaption
 * @see app/Http/Controllers/VideoController.php:270
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions'
 */
        storeCaptionForm.post = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: storeCaption.url(args, options),
            method: 'post',
        })
    
    storeCaption.form = storeCaptionForm
/**
* @see \App\Http\Controllers\VideoController::destroyCaption
 * @see app/Http/Controllers/VideoController.php:300
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions/{captionId}'
 */
export const destroyCaption = (args: { trainingUnitId: string | number, captionId: string | number } | [trainingUnitId: string | number, captionId: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyCaption.url(args, options),
    method: 'delete',
})

destroyCaption.definition = {
    methods: ["delete"],
    url: '/teaching/trainingUnits/{trainingUnitId}/video/captions/{captionId}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\VideoController::destroyCaption
 * @see app/Http/Controllers/VideoController.php:300
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions/{captionId}'
 */
destroyCaption.url = (args: { trainingUnitId: string | number, captionId: string | number } | [trainingUnitId: string | number, captionId: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    trainingUnitId: args[0],
                    captionId: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingUnitId: args.trainingUnitId,
                                captionId: args.captionId,
                }

    return destroyCaption.definition.url
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace('{captionId}', parsedArgs.captionId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VideoController::destroyCaption
 * @see app/Http/Controllers/VideoController.php:300
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions/{captionId}'
 */
destroyCaption.delete = (args: { trainingUnitId: string | number, captionId: string | number } | [trainingUnitId: string | number, captionId: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyCaption.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\VideoController::destroyCaption
 * @see app/Http/Controllers/VideoController.php:300
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions/{captionId}'
 */
    const destroyCaptionForm = (args: { trainingUnitId: string | number, captionId: string | number } | [trainingUnitId: string | number, captionId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroyCaption.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\VideoController::destroyCaption
 * @see app/Http/Controllers/VideoController.php:300
 * @route '/teaching/trainingUnits/{trainingUnitId}/video/captions/{captionId}'
 */
        destroyCaptionForm.delete = (args: { trainingUnitId: string | number, captionId: string | number } | [trainingUnitId: string | number, captionId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroyCaption.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroyCaption.form = destroyCaptionForm
const VideoController = { stream, segment, status, show, store, destroy, retry, captions, storeCaption, destroyCaption }

export default VideoController