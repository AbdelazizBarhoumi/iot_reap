import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\HardwareController::store
 * @see app/Http/Controllers/HardwareController.php:754
 * @route '/admin/hardware/nodes'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/hardware/nodes',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\HardwareController::store
 * @see app/Http/Controllers/HardwareController.php:754
 * @route '/admin/hardware/nodes'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::store
 * @see app/Http/Controllers/HardwareController.php:754
 * @route '/admin/hardware/nodes'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\HardwareController::store
 * @see app/Http/Controllers/HardwareController.php:754
 * @route '/admin/hardware/nodes'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HardwareController::store
 * @see app/Http/Controllers/HardwareController.php:754
 * @route '/admin/hardware/nodes'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\HardwareController::update
 * @see app/Http/Controllers/HardwareController.php:790
 * @route '/admin/hardware/nodes/{node}'
 */
export const update = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/admin/hardware/nodes/{node}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\HardwareController::update
 * @see app/Http/Controllers/HardwareController.php:790
 * @route '/admin/hardware/nodes/{node}'
 */
update.url = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { node: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { node: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    node: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        node: typeof args.node === 'object'
                ? args.node.id
                : args.node,
                }

    return update.definition.url
            .replace('{node}', parsedArgs.node.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::update
 * @see app/Http/Controllers/HardwareController.php:790
 * @route '/admin/hardware/nodes/{node}'
 */
update.patch = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\HardwareController::update
 * @see app/Http/Controllers/HardwareController.php:790
 * @route '/admin/hardware/nodes/{node}'
 */
    const updateForm = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HardwareController::update
 * @see app/Http/Controllers/HardwareController.php:790
 * @route '/admin/hardware/nodes/{node}'
 */
        updateForm.patch = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\HardwareController::verify
 * @see app/Http/Controllers/HardwareController.php:819
 * @route '/admin/hardware/nodes/{node}/verify'
 */
export const verify = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verify.url(args, options),
    method: 'post',
})

verify.definition = {
    methods: ["post"],
    url: '/admin/hardware/nodes/{node}/verify',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\HardwareController::verify
 * @see app/Http/Controllers/HardwareController.php:819
 * @route '/admin/hardware/nodes/{node}/verify'
 */
verify.url = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { node: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { node: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    node: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        node: typeof args.node === 'object'
                ? args.node.id
                : args.node,
                }

    return verify.definition.url
            .replace('{node}', parsedArgs.node.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::verify
 * @see app/Http/Controllers/HardwareController.php:819
 * @route '/admin/hardware/nodes/{node}/verify'
 */
verify.post = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verify.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\HardwareController::verify
 * @see app/Http/Controllers/HardwareController.php:819
 * @route '/admin/hardware/nodes/{node}/verify'
 */
    const verifyForm = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: verify.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HardwareController::verify
 * @see app/Http/Controllers/HardwareController.php:819
 * @route '/admin/hardware/nodes/{node}/verify'
 */
        verifyForm.post = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: verify.url(args, options),
            method: 'post',
        })
    
    verify.form = verifyForm
/**
* @see \App\Http\Controllers\HardwareController::destroy
 * @see app/Http/Controllers/HardwareController.php:775
 * @route '/admin/hardware/nodes/{node}'
 */
export const destroy = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/hardware/nodes/{node}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\HardwareController::destroy
 * @see app/Http/Controllers/HardwareController.php:775
 * @route '/admin/hardware/nodes/{node}'
 */
destroy.url = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { node: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { node: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    node: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        node: typeof args.node === 'object'
                ? args.node.id
                : args.node,
                }

    return destroy.definition.url
            .replace('{node}', parsedArgs.node.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\HardwareController::destroy
 * @see app/Http/Controllers/HardwareController.php:775
 * @route '/admin/hardware/nodes/{node}'
 */
destroy.delete = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\HardwareController::destroy
 * @see app/Http/Controllers/HardwareController.php:775
 * @route '/admin/hardware/nodes/{node}'
 */
    const destroyForm = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HardwareController::destroy
 * @see app/Http/Controllers/HardwareController.php:775
 * @route '/admin/hardware/nodes/{node}'
 */
        destroyForm.delete = (args: { node: number | { id: number } } | [node: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const nodes = {
    store: Object.assign(store, store),
update: Object.assign(update, update),
verify: Object.assign(verify, verify),
destroy: Object.assign(destroy, destroy),
}

export default nodes