import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::listActive
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:384
 * @route '/proxmox-servers/active'
 */
export const listActive = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listActive.url(options),
    method: 'get',
})

listActive.definition = {
    methods: ["get","head"],
    url: '/proxmox-servers/active',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::listActive
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:384
 * @route '/proxmox-servers/active'
 */
listActive.url = (options?: RouteQueryOptions) => {
    return listActive.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::listActive
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:384
 * @route '/proxmox-servers/active'
 */
listActive.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listActive.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::listActive
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:384
 * @route '/proxmox-servers/active'
 */
listActive.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: listActive.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::listActive
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:384
 * @route '/proxmox-servers/active'
 */
    const listActiveForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: listActive.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::listActive
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:384
 * @route '/proxmox-servers/active'
 */
        listActiveForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: listActive.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::listActive
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:384
 * @route '/proxmox-servers/active'
 */
        listActiveForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: listActive.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    listActive.form = listActiveForm
/**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::index
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:41
 * @route '/admin/proxmox-servers'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/proxmox-servers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::index
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:41
 * @route '/admin/proxmox-servers'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::index
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:41
 * @route '/admin/proxmox-servers'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::index
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:41
 * @route '/admin/proxmox-servers'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::index
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:41
 * @route '/admin/proxmox-servers'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::index
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:41
 * @route '/admin/proxmox-servers'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::index
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:41
 * @route '/admin/proxmox-servers'
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
* @see \App\Http\Controllers\Admin\ProxmoxServerController::test
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:338
 * @route '/admin/proxmox-servers/test'
 */
export const test = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: test.url(options),
    method: 'post',
})

test.definition = {
    methods: ["post"],
    url: '/admin/proxmox-servers/test',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::test
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:338
 * @route '/admin/proxmox-servers/test'
 */
test.url = (options?: RouteQueryOptions) => {
    return test.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::test
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:338
 * @route '/admin/proxmox-servers/test'
 */
test.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: test.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::test
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:338
 * @route '/admin/proxmox-servers/test'
 */
    const testForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: test.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::test
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:338
 * @route '/admin/proxmox-servers/test'
 */
        testForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: test.url(options),
            method: 'post',
        })
    
    test.form = testForm
/**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::store
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:82
 * @route '/admin/proxmox-servers'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/proxmox-servers',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::store
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:82
 * @route '/admin/proxmox-servers'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::store
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:82
 * @route '/admin/proxmox-servers'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::store
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:82
 * @route '/admin/proxmox-servers'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::store
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:82
 * @route '/admin/proxmox-servers'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::show
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:69
 * @route '/admin/proxmox-servers/{proxmox_server}'
 */
export const show = (args: { proxmox_server: number | { id: number } } | [proxmox_server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/proxmox-servers/{proxmox_server}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::show
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:69
 * @route '/admin/proxmox-servers/{proxmox_server}'
 */
show.url = (args: { proxmox_server: number | { id: number } } | [proxmox_server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { proxmox_server: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { proxmox_server: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    proxmox_server: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        proxmox_server: typeof args.proxmox_server === 'object'
                ? args.proxmox_server.id
                : args.proxmox_server,
                }

    return show.definition.url
            .replace('{proxmox_server}', parsedArgs.proxmox_server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::show
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:69
 * @route '/admin/proxmox-servers/{proxmox_server}'
 */
show.get = (args: { proxmox_server: number | { id: number } } | [proxmox_server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::show
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:69
 * @route '/admin/proxmox-servers/{proxmox_server}'
 */
show.head = (args: { proxmox_server: number | { id: number } } | [proxmox_server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::show
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:69
 * @route '/admin/proxmox-servers/{proxmox_server}'
 */
    const showForm = (args: { proxmox_server: number | { id: number } } | [proxmox_server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::show
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:69
 * @route '/admin/proxmox-servers/{proxmox_server}'
 */
        showForm.get = (args: { proxmox_server: number | { id: number } } | [proxmox_server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::show
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:69
 * @route '/admin/proxmox-servers/{proxmox_server}'
 */
        showForm.head = (args: { proxmox_server: number | { id: number } } | [proxmox_server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Admin\ProxmoxServerController::update
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:167
 * @route '/admin/proxmox-servers/{proxmox_server}'
 */
export const update = (args: { proxmox_server: number | { id: number } } | [proxmox_server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/admin/proxmox-servers/{proxmox_server}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::update
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:167
 * @route '/admin/proxmox-servers/{proxmox_server}'
 */
update.url = (args: { proxmox_server: number | { id: number } } | [proxmox_server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { proxmox_server: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { proxmox_server: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    proxmox_server: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        proxmox_server: typeof args.proxmox_server === 'object'
                ? args.proxmox_server.id
                : args.proxmox_server,
                }

    return update.definition.url
            .replace('{proxmox_server}', parsedArgs.proxmox_server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::update
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:167
 * @route '/admin/proxmox-servers/{proxmox_server}'
 */
update.patch = (args: { proxmox_server: number | { id: number } } | [proxmox_server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::update
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:167
 * @route '/admin/proxmox-servers/{proxmox_server}'
 */
    const updateForm = (args: { proxmox_server: number | { id: number } } | [proxmox_server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::update
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:167
 * @route '/admin/proxmox-servers/{proxmox_server}'
 */
        updateForm.patch = (args: { proxmox_server: number | { id: number } } | [proxmox_server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\ProxmoxServerController::inactivate
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:444
 * @route '/admin/proxmox-servers/{proxmox_server}/inactivate'
 */
export const inactivate = (args: { proxmox_server: number | { id: number } } | [proxmox_server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: inactivate.url(args, options),
    method: 'post',
})

inactivate.definition = {
    methods: ["post"],
    url: '/admin/proxmox-servers/{proxmox_server}/inactivate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::inactivate
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:444
 * @route '/admin/proxmox-servers/{proxmox_server}/inactivate'
 */
inactivate.url = (args: { proxmox_server: number | { id: number } } | [proxmox_server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { proxmox_server: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { proxmox_server: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    proxmox_server: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        proxmox_server: typeof args.proxmox_server === 'object'
                ? args.proxmox_server.id
                : args.proxmox_server,
                }

    return inactivate.definition.url
            .replace('{proxmox_server}', parsedArgs.proxmox_server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::inactivate
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:444
 * @route '/admin/proxmox-servers/{proxmox_server}/inactivate'
 */
inactivate.post = (args: { proxmox_server: number | { id: number } } | [proxmox_server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: inactivate.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::inactivate
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:444
 * @route '/admin/proxmox-servers/{proxmox_server}/inactivate'
 */
    const inactivateForm = (args: { proxmox_server: number | { id: number } } | [proxmox_server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: inactivate.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::inactivate
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:444
 * @route '/admin/proxmox-servers/{proxmox_server}/inactivate'
 */
        inactivateForm.post = (args: { proxmox_server: number | { id: number } } | [proxmox_server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: inactivate.url(args, options),
            method: 'post',
        })
    
    inactivate.form = inactivateForm
/**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::destroy
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:262
 * @route '/admin/proxmox-servers/{proxmox_server}'
 */
export const destroy = (args: { proxmox_server: number | { id: number } } | [proxmox_server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/proxmox-servers/{proxmox_server}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::destroy
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:262
 * @route '/admin/proxmox-servers/{proxmox_server}'
 */
destroy.url = (args: { proxmox_server: number | { id: number } } | [proxmox_server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { proxmox_server: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { proxmox_server: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    proxmox_server: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        proxmox_server: typeof args.proxmox_server === 'object'
                ? args.proxmox_server.id
                : args.proxmox_server,
                }

    return destroy.definition.url
            .replace('{proxmox_server}', parsedArgs.proxmox_server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::destroy
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:262
 * @route '/admin/proxmox-servers/{proxmox_server}'
 */
destroy.delete = (args: { proxmox_server: number | { id: number } } | [proxmox_server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::destroy
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:262
 * @route '/admin/proxmox-servers/{proxmox_server}'
 */
    const destroyForm = (args: { proxmox_server: number | { id: number } } | [proxmox_server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::destroy
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:262
 * @route '/admin/proxmox-servers/{proxmox_server}'
 */
        destroyForm.delete = (args: { proxmox_server: number | { id: number } } | [proxmox_server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\ProxmoxServerController::syncNodes
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:406
 * @route '/admin/proxmox-servers/{proxmox_server}/sync-nodes'
 */
export const syncNodes = (args: { proxmox_server: number | { id: number } } | [proxmox_server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: syncNodes.url(args, options),
    method: 'post',
})

syncNodes.definition = {
    methods: ["post"],
    url: '/admin/proxmox-servers/{proxmox_server}/sync-nodes',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::syncNodes
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:406
 * @route '/admin/proxmox-servers/{proxmox_server}/sync-nodes'
 */
syncNodes.url = (args: { proxmox_server: number | { id: number } } | [proxmox_server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { proxmox_server: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { proxmox_server: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    proxmox_server: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        proxmox_server: typeof args.proxmox_server === 'object'
                ? args.proxmox_server.id
                : args.proxmox_server,
                }

    return syncNodes.definition.url
            .replace('{proxmox_server}', parsedArgs.proxmox_server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::syncNodes
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:406
 * @route '/admin/proxmox-servers/{proxmox_server}/sync-nodes'
 */
syncNodes.post = (args: { proxmox_server: number | { id: number } } | [proxmox_server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: syncNodes.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::syncNodes
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:406
 * @route '/admin/proxmox-servers/{proxmox_server}/sync-nodes'
 */
    const syncNodesForm = (args: { proxmox_server: number | { id: number } } | [proxmox_server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: syncNodes.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ProxmoxServerController::syncNodes
 * @see app/Http/Controllers/Admin/ProxmoxServerController.php:406
 * @route '/admin/proxmox-servers/{proxmox_server}/sync-nodes'
 */
        syncNodesForm.post = (args: { proxmox_server: number | { id: number } } | [proxmox_server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: syncNodes.url(args, options),
            method: 'post',
        })
    
    syncNodes.form = syncNodesForm
const ProxmoxServerController = { listActive, index, test, store, show, update, inactivate, destroy, syncNodes }

export default ProxmoxServerController