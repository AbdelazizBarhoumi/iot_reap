import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults, validateParameters } from './../../wayfinder'
import perVm from './per-vm'
/**
* @see \App\Http\Controllers\ConnectionPreferencesController::index
 * @see app/Http/Controllers/ConnectionPreferencesController.php:35
 * @route '/connection-preferences'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/connection-preferences',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ConnectionPreferencesController::index
 * @see app/Http/Controllers/ConnectionPreferencesController.php:35
 * @route '/connection-preferences'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConnectionPreferencesController::index
 * @see app/Http/Controllers/ConnectionPreferencesController.php:35
 * @route '/connection-preferences'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ConnectionPreferencesController::index
 * @see app/Http/Controllers/ConnectionPreferencesController.php:35
 * @route '/connection-preferences'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ConnectionPreferencesController::index
 * @see app/Http/Controllers/ConnectionPreferencesController.php:35
 * @route '/connection-preferences'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ConnectionPreferencesController::index
 * @see app/Http/Controllers/ConnectionPreferencesController.php:35
 * @route '/connection-preferences'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ConnectionPreferencesController::index
 * @see app/Http/Controllers/ConnectionPreferencesController.php:35
 * @route '/connection-preferences'
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
* @see \App\Http\Controllers\ConnectionPreferencesController::show
 * @see app/Http/Controllers/ConnectionPreferencesController.php:70
 * @route '/connection-preferences/{protocol}'
 */
export const show = (args: { protocol: string | number } | [protocol: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/connection-preferences/{protocol}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ConnectionPreferencesController::show
 * @see app/Http/Controllers/ConnectionPreferencesController.php:70
 * @route '/connection-preferences/{protocol}'
 */
show.url = (args: { protocol: string | number } | [protocol: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { protocol: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    protocol: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        protocol: args.protocol,
                }

    return show.definition.url
            .replace('{protocol}', parsedArgs.protocol.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConnectionPreferencesController::show
 * @see app/Http/Controllers/ConnectionPreferencesController.php:70
 * @route '/connection-preferences/{protocol}'
 */
show.get = (args: { protocol: string | number } | [protocol: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ConnectionPreferencesController::show
 * @see app/Http/Controllers/ConnectionPreferencesController.php:70
 * @route '/connection-preferences/{protocol}'
 */
show.head = (args: { protocol: string | number } | [protocol: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ConnectionPreferencesController::show
 * @see app/Http/Controllers/ConnectionPreferencesController.php:70
 * @route '/connection-preferences/{protocol}'
 */
    const showForm = (args: { protocol: string | number } | [protocol: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ConnectionPreferencesController::show
 * @see app/Http/Controllers/ConnectionPreferencesController.php:70
 * @route '/connection-preferences/{protocol}'
 */
        showForm.get = (args: { protocol: string | number } | [protocol: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ConnectionPreferencesController::show
 * @see app/Http/Controllers/ConnectionPreferencesController.php:70
 * @route '/connection-preferences/{protocol}'
 */
        showForm.head = (args: { protocol: string | number } | [protocol: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\ConnectionPreferencesController::store
 * @see app/Http/Controllers/ConnectionPreferencesController.php:94
 * @route '/connection-preferences/{protocol}'
 */
export const store = (args: { protocol: string | number } | [protocol: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/connection-preferences/{protocol}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ConnectionPreferencesController::store
 * @see app/Http/Controllers/ConnectionPreferencesController.php:94
 * @route '/connection-preferences/{protocol}'
 */
store.url = (args: { protocol: string | number } | [protocol: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { protocol: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    protocol: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        protocol: args.protocol,
                }

    return store.definition.url
            .replace('{protocol}', parsedArgs.protocol.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConnectionPreferencesController::store
 * @see app/Http/Controllers/ConnectionPreferencesController.php:94
 * @route '/connection-preferences/{protocol}'
 */
store.post = (args: { protocol: string | number } | [protocol: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ConnectionPreferencesController::store
 * @see app/Http/Controllers/ConnectionPreferencesController.php:94
 * @route '/connection-preferences/{protocol}'
 */
    const storeForm = (args: { protocol: string | number } | [protocol: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ConnectionPreferencesController::store
 * @see app/Http/Controllers/ConnectionPreferencesController.php:94
 * @route '/connection-preferences/{protocol}'
 */
        storeForm.post = (args: { protocol: string | number } | [protocol: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\ConnectionPreferencesController::update
 * @see app/Http/Controllers/ConnectionPreferencesController.php:131
 * @route '/connection-preferences/{protocol}/{profile?}'
 */
export const update = (args: { protocol: string | number, profile?: string | number } | [protocol: string | number, profile: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/connection-preferences/{protocol}/{profile?}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ConnectionPreferencesController::update
 * @see app/Http/Controllers/ConnectionPreferencesController.php:131
 * @route '/connection-preferences/{protocol}/{profile?}'
 */
update.url = (args: { protocol: string | number, profile?: string | number } | [protocol: string | number, profile: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    protocol: args[0],
                    profile: args[1],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "profile",
        ])

    const parsedArgs = {
                        protocol: args.protocol,
                                profile: args.profile,
                }

    return update.definition.url
            .replace('{protocol}', parsedArgs.protocol.toString())
            .replace('{profile?}', parsedArgs.profile?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConnectionPreferencesController::update
 * @see app/Http/Controllers/ConnectionPreferencesController.php:131
 * @route '/connection-preferences/{protocol}/{profile?}'
 */
update.put = (args: { protocol: string | number, profile?: string | number } | [protocol: string | number, profile: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\ConnectionPreferencesController::update
 * @see app/Http/Controllers/ConnectionPreferencesController.php:131
 * @route '/connection-preferences/{protocol}/{profile?}'
 */
    const updateForm = (args: { protocol: string | number, profile?: string | number } | [protocol: string | number, profile: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ConnectionPreferencesController::update
 * @see app/Http/Controllers/ConnectionPreferencesController.php:131
 * @route '/connection-preferences/{protocol}/{profile?}'
 */
        updateForm.put = (args: { protocol: string | number, profile?: string | number } | [protocol: string | number, profile: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\ConnectionPreferencesController::destroy
 * @see app/Http/Controllers/ConnectionPreferencesController.php:168
 * @route '/connection-preferences/{protocol}/{profile}'
 */
export const destroy = (args: { protocol: string | number, profile: string | number } | [protocol: string | number, profile: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/connection-preferences/{protocol}/{profile}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ConnectionPreferencesController::destroy
 * @see app/Http/Controllers/ConnectionPreferencesController.php:168
 * @route '/connection-preferences/{protocol}/{profile}'
 */
destroy.url = (args: { protocol: string | number, profile: string | number } | [protocol: string | number, profile: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    protocol: args[0],
                    profile: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        protocol: args.protocol,
                                profile: args.profile,
                }

    return destroy.definition.url
            .replace('{protocol}', parsedArgs.protocol.toString())
            .replace('{profile}', parsedArgs.profile.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConnectionPreferencesController::destroy
 * @see app/Http/Controllers/ConnectionPreferencesController.php:168
 * @route '/connection-preferences/{protocol}/{profile}'
 */
destroy.delete = (args: { protocol: string | number, profile: string | number } | [protocol: string | number, profile: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\ConnectionPreferencesController::destroy
 * @see app/Http/Controllers/ConnectionPreferencesController.php:168
 * @route '/connection-preferences/{protocol}/{profile}'
 */
    const destroyForm = (args: { protocol: string | number, profile: string | number } | [protocol: string | number, profile: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ConnectionPreferencesController::destroy
 * @see app/Http/Controllers/ConnectionPreferencesController.php:168
 * @route '/connection-preferences/{protocol}/{profile}'
 */
        destroyForm.delete = (args: { protocol: string | number, profile: string | number } | [protocol: string | number, profile: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\ConnectionPreferencesController::setDefault
 * @see app/Http/Controllers/ConnectionPreferencesController.php:187
 * @route '/connection-preferences/{protocol}/{profile}/default'
 */
export const setDefault = (args: { protocol: string | number, profile: string | number } | [protocol: string | number, profile: string | number ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: setDefault.url(args, options),
    method: 'patch',
})

setDefault.definition = {
    methods: ["patch"],
    url: '/connection-preferences/{protocol}/{profile}/default',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\ConnectionPreferencesController::setDefault
 * @see app/Http/Controllers/ConnectionPreferencesController.php:187
 * @route '/connection-preferences/{protocol}/{profile}/default'
 */
setDefault.url = (args: { protocol: string | number, profile: string | number } | [protocol: string | number, profile: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    protocol: args[0],
                    profile: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        protocol: args.protocol,
                                profile: args.profile,
                }

    return setDefault.definition.url
            .replace('{protocol}', parsedArgs.protocol.toString())
            .replace('{profile}', parsedArgs.profile.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConnectionPreferencesController::setDefault
 * @see app/Http/Controllers/ConnectionPreferencesController.php:187
 * @route '/connection-preferences/{protocol}/{profile}/default'
 */
setDefault.patch = (args: { protocol: string | number, profile: string | number } | [protocol: string | number, profile: string | number ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: setDefault.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\ConnectionPreferencesController::setDefault
 * @see app/Http/Controllers/ConnectionPreferencesController.php:187
 * @route '/connection-preferences/{protocol}/{profile}/default'
 */
    const setDefaultForm = (args: { protocol: string | number, profile: string | number } | [protocol: string | number, profile: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: setDefault.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ConnectionPreferencesController::setDefault
 * @see app/Http/Controllers/ConnectionPreferencesController.php:187
 * @route '/connection-preferences/{protocol}/{profile}/default'
 */
        setDefaultForm.patch = (args: { protocol: string | number, profile: string | number } | [protocol: string | number, profile: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: setDefault.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    setDefault.form = setDefaultForm
const connectionPreferences = {
    index: Object.assign(index, index),
show: Object.assign(show, show),
store: Object.assign(store, store),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
setDefault: Object.assign(setDefault, setDefault),
perVm: Object.assign(perVm, perVm),
}

export default connectionPreferences