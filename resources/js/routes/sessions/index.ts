import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
import cameras from './cameras'
import hardware from './hardware'
/**
* @see \App\Http\Controllers\VMSessionController::index
 * @see app/Http/Controllers/VMSessionController.php:49
 * @route '/sessions'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/sessions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\VMSessionController::index
 * @see app/Http/Controllers/VMSessionController.php:49
 * @route '/sessions'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\VMSessionController::index
 * @see app/Http/Controllers/VMSessionController.php:49
 * @route '/sessions'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\VMSessionController::index
 * @see app/Http/Controllers/VMSessionController.php:49
 * @route '/sessions'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\VMSessionController::index
 * @see app/Http/Controllers/VMSessionController.php:49
 * @route '/sessions'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\VMSessionController::index
 * @see app/Http/Controllers/VMSessionController.php:49
 * @route '/sessions'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\VMSessionController::index
 * @see app/Http/Controllers/VMSessionController.php:49
 * @route '/sessions'
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
* @see \App\Http\Controllers\VMSessionController::store
 * @see app/Http/Controllers/VMSessionController.php:85
 * @route '/sessions'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/sessions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\VMSessionController::store
 * @see app/Http/Controllers/VMSessionController.php:85
 * @route '/sessions'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\VMSessionController::store
 * @see app/Http/Controllers/VMSessionController.php:85
 * @route '/sessions'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\VMSessionController::store
 * @see app/Http/Controllers/VMSessionController.php:85
 * @route '/sessions'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\VMSessionController::store
 * @see app/Http/Controllers/VMSessionController.php:85
 * @route '/sessions'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\VMSessionController::show
 * @see app/Http/Controllers/VMSessionController.php:228
 * @route '/sessions/{session}'
 */
export const show = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/sessions/{session}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\VMSessionController::show
 * @see app/Http/Controllers/VMSessionController.php:228
 * @route '/sessions/{session}'
 */
show.url = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VMSessionController::show
 * @see app/Http/Controllers/VMSessionController.php:228
 * @route '/sessions/{session}'
 */
show.get = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\VMSessionController::show
 * @see app/Http/Controllers/VMSessionController.php:228
 * @route '/sessions/{session}'
 */
show.head = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\VMSessionController::show
 * @see app/Http/Controllers/VMSessionController.php:228
 * @route '/sessions/{session}'
 */
    const showForm = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\VMSessionController::show
 * @see app/Http/Controllers/VMSessionController.php:228
 * @route '/sessions/{session}'
 */
        showForm.get = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\VMSessionController::show
 * @see app/Http/Controllers/VMSessionController.php:228
 * @route '/sessions/{session}'
 */
        showForm.head = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\VMSessionController::extend
 * @see app/Http/Controllers/VMSessionController.php:370
 * @route '/sessions/{session}/extend'
 */
export const extend = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: extend.url(args, options),
    method: 'post',
})

extend.definition = {
    methods: ["post"],
    url: '/sessions/{session}/extend',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\VMSessionController::extend
 * @see app/Http/Controllers/VMSessionController.php:370
 * @route '/sessions/{session}/extend'
 */
extend.url = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return extend.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VMSessionController::extend
 * @see app/Http/Controllers/VMSessionController.php:370
 * @route '/sessions/{session}/extend'
 */
extend.post = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: extend.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\VMSessionController::extend
 * @see app/Http/Controllers/VMSessionController.php:370
 * @route '/sessions/{session}/extend'
 */
    const extendForm = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: extend.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\VMSessionController::extend
 * @see app/Http/Controllers/VMSessionController.php:370
 * @route '/sessions/{session}/extend'
 */
        extendForm.post = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: extend.url(args, options),
            method: 'post',
        })
    
    extend.form = extendForm
/**
* @see \App\Http\Controllers\VMSessionController::destroy
 * @see app/Http/Controllers/VMSessionController.php:306
 * @route '/sessions/{session}'
 */
export const destroy = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/sessions/{session}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\VMSessionController::destroy
 * @see app/Http/Controllers/VMSessionController.php:306
 * @route '/sessions/{session}'
 */
destroy.url = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VMSessionController::destroy
 * @see app/Http/Controllers/VMSessionController.php:306
 * @route '/sessions/{session}'
 */
destroy.delete = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\VMSessionController::destroy
 * @see app/Http/Controllers/VMSessionController.php:306
 * @route '/sessions/{session}'
 */
    const destroyForm = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\VMSessionController::destroy
 * @see app/Http/Controllers/VMSessionController.php:306
 * @route '/sessions/{session}'
 */
        destroyForm.delete = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\VMSessionController::snapshots
 * @see app/Http/Controllers/VMSessionController.php:194
 * @route '/sessions/{session}/snapshots'
 */
export const snapshots = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: snapshots.url(args, options),
    method: 'get',
})

snapshots.definition = {
    methods: ["get","head"],
    url: '/sessions/{session}/snapshots',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\VMSessionController::snapshots
 * @see app/Http/Controllers/VMSessionController.php:194
 * @route '/sessions/{session}/snapshots'
 */
snapshots.url = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return snapshots.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VMSessionController::snapshots
 * @see app/Http/Controllers/VMSessionController.php:194
 * @route '/sessions/{session}/snapshots'
 */
snapshots.get = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: snapshots.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\VMSessionController::snapshots
 * @see app/Http/Controllers/VMSessionController.php:194
 * @route '/sessions/{session}/snapshots'
 */
snapshots.head = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: snapshots.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\VMSessionController::snapshots
 * @see app/Http/Controllers/VMSessionController.php:194
 * @route '/sessions/{session}/snapshots'
 */
    const snapshotsForm = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: snapshots.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\VMSessionController::snapshots
 * @see app/Http/Controllers/VMSessionController.php:194
 * @route '/sessions/{session}/snapshots'
 */
        snapshotsForm.get = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: snapshots.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\VMSessionController::snapshots
 * @see app/Http/Controllers/VMSessionController.php:194
 * @route '/sessions/{session}/snapshots'
 */
        snapshotsForm.head = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: snapshots.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    snapshots.form = snapshotsForm
/**
* @see \App\Http\Controllers\GuacamoleTokenController::guacamoleToken
 * @see app/Http/Controllers/GuacamoleTokenController.php:34
 * @route '/sessions/{session}/guacamole-token'
 */
export const guacamoleToken = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: guacamoleToken.url(args, options),
    method: 'get',
})

guacamoleToken.definition = {
    methods: ["get","head"],
    url: '/sessions/{session}/guacamole-token',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\GuacamoleTokenController::guacamoleToken
 * @see app/Http/Controllers/GuacamoleTokenController.php:34
 * @route '/sessions/{session}/guacamole-token'
 */
guacamoleToken.url = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { session: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { session: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    session: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        session: typeof args.session === 'object'
                ? args.session.id
                : args.session,
                }

    return guacamoleToken.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\GuacamoleTokenController::guacamoleToken
 * @see app/Http/Controllers/GuacamoleTokenController.php:34
 * @route '/sessions/{session}/guacamole-token'
 */
guacamoleToken.get = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: guacamoleToken.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\GuacamoleTokenController::guacamoleToken
 * @see app/Http/Controllers/GuacamoleTokenController.php:34
 * @route '/sessions/{session}/guacamole-token'
 */
guacamoleToken.head = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: guacamoleToken.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\GuacamoleTokenController::guacamoleToken
 * @see app/Http/Controllers/GuacamoleTokenController.php:34
 * @route '/sessions/{session}/guacamole-token'
 */
    const guacamoleTokenForm = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: guacamoleToken.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\GuacamoleTokenController::guacamoleToken
 * @see app/Http/Controllers/GuacamoleTokenController.php:34
 * @route '/sessions/{session}/guacamole-token'
 */
        guacamoleTokenForm.get = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: guacamoleToken.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\GuacamoleTokenController::guacamoleToken
 * @see app/Http/Controllers/GuacamoleTokenController.php:34
 * @route '/sessions/{session}/guacamole-token'
 */
        guacamoleTokenForm.head = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: guacamoleToken.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    guacamoleToken.form = guacamoleTokenForm
const sessions = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
show: Object.assign(show, show),
extend: Object.assign(extend, extend),
destroy: Object.assign(destroy, destroy),
snapshots: Object.assign(snapshots, snapshots),
guacamoleToken: Object.assign(guacamoleToken, guacamoleToken),
cameras: Object.assign(cameras, cameras),
hardware: Object.assign(hardware, hardware),
}

export default sessions