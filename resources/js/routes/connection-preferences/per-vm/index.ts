import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\ConnectionPreferencesController::get
 * @see app/Http/Controllers/ConnectionPreferencesController.php:206
 * @route '/connection-preferences/vm/{vmId}/{protocol}'
 */
export const get = (args: { vmId: string | number, protocol: string | number } | [vmId: string | number, protocol: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: get.url(args, options),
    method: 'get',
})

get.definition = {
    methods: ["get","head"],
    url: '/connection-preferences/vm/{vmId}/{protocol}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ConnectionPreferencesController::get
 * @see app/Http/Controllers/ConnectionPreferencesController.php:206
 * @route '/connection-preferences/vm/{vmId}/{protocol}'
 */
get.url = (args: { vmId: string | number, protocol: string | number } | [vmId: string | number, protocol: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    vmId: args[0],
                    protocol: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        vmId: args.vmId,
                                protocol: args.protocol,
                }

    return get.definition.url
            .replace('{vmId}', parsedArgs.vmId.toString())
            .replace('{protocol}', parsedArgs.protocol.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConnectionPreferencesController::get
 * @see app/Http/Controllers/ConnectionPreferencesController.php:206
 * @route '/connection-preferences/vm/{vmId}/{protocol}'
 */
get.get = (args: { vmId: string | number, protocol: string | number } | [vmId: string | number, protocol: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: get.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ConnectionPreferencesController::get
 * @see app/Http/Controllers/ConnectionPreferencesController.php:206
 * @route '/connection-preferences/vm/{vmId}/{protocol}'
 */
get.head = (args: { vmId: string | number, protocol: string | number } | [vmId: string | number, protocol: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: get.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ConnectionPreferencesController::get
 * @see app/Http/Controllers/ConnectionPreferencesController.php:206
 * @route '/connection-preferences/vm/{vmId}/{protocol}'
 */
    const getForm = (args: { vmId: string | number, protocol: string | number } | [vmId: string | number, protocol: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: get.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ConnectionPreferencesController::get
 * @see app/Http/Controllers/ConnectionPreferencesController.php:206
 * @route '/connection-preferences/vm/{vmId}/{protocol}'
 */
        getForm.get = (args: { vmId: string | number, protocol: string | number } | [vmId: string | number, protocol: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: get.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ConnectionPreferencesController::get
 * @see app/Http/Controllers/ConnectionPreferencesController.php:206
 * @route '/connection-preferences/vm/{vmId}/{protocol}'
 */
        getForm.head = (args: { vmId: string | number, protocol: string | number } | [vmId: string | number, protocol: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: get.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    get.form = getForm
/**
* @see \App\Http\Controllers\ConnectionPreferencesController::set
 * @see app/Http/Controllers/ConnectionPreferencesController.php:242
 * @route '/connection-preferences/vm/{vmId}/{protocol}/default'
 */
export const set = (args: { vmId: string | number, protocol: string | number } | [vmId: string | number, protocol: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: set.url(args, options),
    method: 'post',
})

set.definition = {
    methods: ["post"],
    url: '/connection-preferences/vm/{vmId}/{protocol}/default',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ConnectionPreferencesController::set
 * @see app/Http/Controllers/ConnectionPreferencesController.php:242
 * @route '/connection-preferences/vm/{vmId}/{protocol}/default'
 */
set.url = (args: { vmId: string | number, protocol: string | number } | [vmId: string | number, protocol: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    vmId: args[0],
                    protocol: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        vmId: args.vmId,
                                protocol: args.protocol,
                }

    return set.definition.url
            .replace('{vmId}', parsedArgs.vmId.toString())
            .replace('{protocol}', parsedArgs.protocol.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConnectionPreferencesController::set
 * @see app/Http/Controllers/ConnectionPreferencesController.php:242
 * @route '/connection-preferences/vm/{vmId}/{protocol}/default'
 */
set.post = (args: { vmId: string | number, protocol: string | number } | [vmId: string | number, protocol: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: set.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ConnectionPreferencesController::set
 * @see app/Http/Controllers/ConnectionPreferencesController.php:242
 * @route '/connection-preferences/vm/{vmId}/{protocol}/default'
 */
    const setForm = (args: { vmId: string | number, protocol: string | number } | [vmId: string | number, protocol: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: set.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ConnectionPreferencesController::set
 * @see app/Http/Controllers/ConnectionPreferencesController.php:242
 * @route '/connection-preferences/vm/{vmId}/{protocol}/default'
 */
        setForm.post = (args: { vmId: string | number, protocol: string | number } | [vmId: string | number, protocol: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: set.url(args, options),
            method: 'post',
        })
    
    set.form = setForm
/**
* @see \App\Http\Controllers\ConnectionPreferencesController::update
 * @see app/Http/Controllers/ConnectionPreferencesController.php:286
 * @route '/connection-preferences/vm/{vmId}/{protocol}/default'
 */
export const update = (args: { vmId: string | number, protocol: string | number } | [vmId: string | number, protocol: string | number ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/connection-preferences/vm/{vmId}/{protocol}/default',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\ConnectionPreferencesController::update
 * @see app/Http/Controllers/ConnectionPreferencesController.php:286
 * @route '/connection-preferences/vm/{vmId}/{protocol}/default'
 */
update.url = (args: { vmId: string | number, protocol: string | number } | [vmId: string | number, protocol: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    vmId: args[0],
                    protocol: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        vmId: args.vmId,
                                protocol: args.protocol,
                }

    return update.definition.url
            .replace('{vmId}', parsedArgs.vmId.toString())
            .replace('{protocol}', parsedArgs.protocol.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConnectionPreferencesController::update
 * @see app/Http/Controllers/ConnectionPreferencesController.php:286
 * @route '/connection-preferences/vm/{vmId}/{protocol}/default'
 */
update.patch = (args: { vmId: string | number, protocol: string | number } | [vmId: string | number, protocol: string | number ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\ConnectionPreferencesController::update
 * @see app/Http/Controllers/ConnectionPreferencesController.php:286
 * @route '/connection-preferences/vm/{vmId}/{protocol}/default'
 */
    const updateForm = (args: { vmId: string | number, protocol: string | number } | [vmId: string | number, protocol: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ConnectionPreferencesController::update
 * @see app/Http/Controllers/ConnectionPreferencesController.php:286
 * @route '/connection-preferences/vm/{vmId}/{protocol}/default'
 */
        updateForm.patch = (args: { vmId: string | number, protocol: string | number } | [vmId: string | number, protocol: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\ConnectionPreferencesController::deleteMethod
 * @see app/Http/Controllers/ConnectionPreferencesController.php:296
 * @route '/connection-preferences/vm/{vmId}/{protocol}/default'
 */
export const deleteMethod = (args: { vmId: string | number, protocol: string | number } | [vmId: string | number, protocol: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

deleteMethod.definition = {
    methods: ["delete"],
    url: '/connection-preferences/vm/{vmId}/{protocol}/default',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ConnectionPreferencesController::deleteMethod
 * @see app/Http/Controllers/ConnectionPreferencesController.php:296
 * @route '/connection-preferences/vm/{vmId}/{protocol}/default'
 */
deleteMethod.url = (args: { vmId: string | number, protocol: string | number } | [vmId: string | number, protocol: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    vmId: args[0],
                    protocol: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        vmId: args.vmId,
                                protocol: args.protocol,
                }

    return deleteMethod.definition.url
            .replace('{vmId}', parsedArgs.vmId.toString())
            .replace('{protocol}', parsedArgs.protocol.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConnectionPreferencesController::deleteMethod
 * @see app/Http/Controllers/ConnectionPreferencesController.php:296
 * @route '/connection-preferences/vm/{vmId}/{protocol}/default'
 */
deleteMethod.delete = (args: { vmId: string | number, protocol: string | number } | [vmId: string | number, protocol: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\ConnectionPreferencesController::deleteMethod
 * @see app/Http/Controllers/ConnectionPreferencesController.php:296
 * @route '/connection-preferences/vm/{vmId}/{protocol}/default'
 */
    const deleteMethodForm = (args: { vmId: string | number, protocol: string | number } | [vmId: string | number, protocol: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: deleteMethod.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ConnectionPreferencesController::deleteMethod
 * @see app/Http/Controllers/ConnectionPreferencesController.php:296
 * @route '/connection-preferences/vm/{vmId}/{protocol}/default'
 */
        deleteMethodForm.delete = (args: { vmId: string | number, protocol: string | number } | [vmId: string | number, protocol: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: deleteMethod.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    deleteMethod.form = deleteMethodForm
const perVm = {
    get: Object.assign(get, get),
set: Object.assign(set, set),
update: Object.assign(update, update),
delete: Object.assign(deleteMethod, deleteMethod),
}

export default perVm