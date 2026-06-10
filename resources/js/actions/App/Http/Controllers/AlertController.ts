import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\AlertController::index
 * @see app/Http/Controllers/AlertController.php:28
 * @route '/admin/alerts'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/alerts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AlertController::index
 * @see app/Http/Controllers/AlertController.php:28
 * @route '/admin/alerts'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AlertController::index
 * @see app/Http/Controllers/AlertController.php:28
 * @route '/admin/alerts'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AlertController::index
 * @see app/Http/Controllers/AlertController.php:28
 * @route '/admin/alerts'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\AlertController::index
 * @see app/Http/Controllers/AlertController.php:28
 * @route '/admin/alerts'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\AlertController::index
 * @see app/Http/Controllers/AlertController.php:28
 * @route '/admin/alerts'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\AlertController::index
 * @see app/Http/Controllers/AlertController.php:28
 * @route '/admin/alerts'
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
* @see \App\Http\Controllers\AlertController::unacknowledged
 * @see app/Http/Controllers/AlertController.php:55
 * @route '/admin/alerts/unacknowledged'
 */
export const unacknowledged = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: unacknowledged.url(options),
    method: 'get',
})

unacknowledged.definition = {
    methods: ["get","head"],
    url: '/admin/alerts/unacknowledged',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AlertController::unacknowledged
 * @see app/Http/Controllers/AlertController.php:55
 * @route '/admin/alerts/unacknowledged'
 */
unacknowledged.url = (options?: RouteQueryOptions) => {
    return unacknowledged.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AlertController::unacknowledged
 * @see app/Http/Controllers/AlertController.php:55
 * @route '/admin/alerts/unacknowledged'
 */
unacknowledged.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: unacknowledged.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AlertController::unacknowledged
 * @see app/Http/Controllers/AlertController.php:55
 * @route '/admin/alerts/unacknowledged'
 */
unacknowledged.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: unacknowledged.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\AlertController::unacknowledged
 * @see app/Http/Controllers/AlertController.php:55
 * @route '/admin/alerts/unacknowledged'
 */
    const unacknowledgedForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: unacknowledged.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\AlertController::unacknowledged
 * @see app/Http/Controllers/AlertController.php:55
 * @route '/admin/alerts/unacknowledged'
 */
        unacknowledgedForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: unacknowledged.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\AlertController::unacknowledged
 * @see app/Http/Controllers/AlertController.php:55
 * @route '/admin/alerts/unacknowledged'
 */
        unacknowledgedForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: unacknowledged.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    unacknowledged.form = unacknowledgedForm
/**
* @see \App\Http\Controllers\AlertController::stats
 * @see app/Http/Controllers/AlertController.php:69
 * @route '/admin/alerts/stats'
 */
export const stats = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stats.url(options),
    method: 'get',
})

stats.definition = {
    methods: ["get","head"],
    url: '/admin/alerts/stats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AlertController::stats
 * @see app/Http/Controllers/AlertController.php:69
 * @route '/admin/alerts/stats'
 */
stats.url = (options?: RouteQueryOptions) => {
    return stats.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AlertController::stats
 * @see app/Http/Controllers/AlertController.php:69
 * @route '/admin/alerts/stats'
 */
stats.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stats.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AlertController::stats
 * @see app/Http/Controllers/AlertController.php:69
 * @route '/admin/alerts/stats'
 */
stats.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: stats.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\AlertController::stats
 * @see app/Http/Controllers/AlertController.php:69
 * @route '/admin/alerts/stats'
 */
    const statsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: stats.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\AlertController::stats
 * @see app/Http/Controllers/AlertController.php:69
 * @route '/admin/alerts/stats'
 */
        statsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: stats.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\AlertController::stats
 * @see app/Http/Controllers/AlertController.php:69
 * @route '/admin/alerts/stats'
 */
        statsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: stats.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    stats.form = statsForm
/**
* @see \App\Http\Controllers\AlertController::acknowledge
 * @see app/Http/Controllers/AlertController.php:81
 * @route '/admin/alerts/{alert}/acknowledge'
 */
export const acknowledge = (args: { alert: number | { id: number } } | [alert: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: acknowledge.url(args, options),
    method: 'post',
})

acknowledge.definition = {
    methods: ["post"],
    url: '/admin/alerts/{alert}/acknowledge',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AlertController::acknowledge
 * @see app/Http/Controllers/AlertController.php:81
 * @route '/admin/alerts/{alert}/acknowledge'
 */
acknowledge.url = (args: { alert: number | { id: number } } | [alert: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { alert: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { alert: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    alert: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        alert: typeof args.alert === 'object'
                ? args.alert.id
                : args.alert,
                }

    return acknowledge.definition.url
            .replace('{alert}', parsedArgs.alert.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AlertController::acknowledge
 * @see app/Http/Controllers/AlertController.php:81
 * @route '/admin/alerts/{alert}/acknowledge'
 */
acknowledge.post = (args: { alert: number | { id: number } } | [alert: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: acknowledge.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\AlertController::acknowledge
 * @see app/Http/Controllers/AlertController.php:81
 * @route '/admin/alerts/{alert}/acknowledge'
 */
    const acknowledgeForm = (args: { alert: number | { id: number } } | [alert: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: acknowledge.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AlertController::acknowledge
 * @see app/Http/Controllers/AlertController.php:81
 * @route '/admin/alerts/{alert}/acknowledge'
 */
        acknowledgeForm.post = (args: { alert: number | { id: number } } | [alert: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: acknowledge.url(args, options),
            method: 'post',
        })
    
    acknowledge.form = acknowledgeForm
/**
* @see \App\Http\Controllers\AlertController::acknowledgeAll
 * @see app/Http/Controllers/AlertController.php:98
 * @route '/admin/alerts/acknowledge-all'
 */
export const acknowledgeAll = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: acknowledgeAll.url(options),
    method: 'post',
})

acknowledgeAll.definition = {
    methods: ["post"],
    url: '/admin/alerts/acknowledge-all',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AlertController::acknowledgeAll
 * @see app/Http/Controllers/AlertController.php:98
 * @route '/admin/alerts/acknowledge-all'
 */
acknowledgeAll.url = (options?: RouteQueryOptions) => {
    return acknowledgeAll.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AlertController::acknowledgeAll
 * @see app/Http/Controllers/AlertController.php:98
 * @route '/admin/alerts/acknowledge-all'
 */
acknowledgeAll.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: acknowledgeAll.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\AlertController::acknowledgeAll
 * @see app/Http/Controllers/AlertController.php:98
 * @route '/admin/alerts/acknowledge-all'
 */
    const acknowledgeAllForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: acknowledgeAll.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AlertController::acknowledgeAll
 * @see app/Http/Controllers/AlertController.php:98
 * @route '/admin/alerts/acknowledge-all'
 */
        acknowledgeAllForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: acknowledgeAll.url(options),
            method: 'post',
        })
    
    acknowledgeAll.form = acknowledgeAllForm
/**
* @see \App\Http\Controllers\AlertController::resolve
 * @see app/Http/Controllers/AlertController.php:114
 * @route '/admin/alerts/{alert}/resolve'
 */
export const resolve = (args: { alert: number | { id: number } } | [alert: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resolve.url(args, options),
    method: 'post',
})

resolve.definition = {
    methods: ["post"],
    url: '/admin/alerts/{alert}/resolve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AlertController::resolve
 * @see app/Http/Controllers/AlertController.php:114
 * @route '/admin/alerts/{alert}/resolve'
 */
resolve.url = (args: { alert: number | { id: number } } | [alert: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { alert: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { alert: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    alert: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        alert: typeof args.alert === 'object'
                ? args.alert.id
                : args.alert,
                }

    return resolve.definition.url
            .replace('{alert}', parsedArgs.alert.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AlertController::resolve
 * @see app/Http/Controllers/AlertController.php:114
 * @route '/admin/alerts/{alert}/resolve'
 */
resolve.post = (args: { alert: number | { id: number } } | [alert: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resolve.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\AlertController::resolve
 * @see app/Http/Controllers/AlertController.php:114
 * @route '/admin/alerts/{alert}/resolve'
 */
    const resolveForm = (args: { alert: number | { id: number } } | [alert: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: resolve.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AlertController::resolve
 * @see app/Http/Controllers/AlertController.php:114
 * @route '/admin/alerts/{alert}/resolve'
 */
        resolveForm.post = (args: { alert: number | { id: number } } | [alert: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: resolve.url(args, options),
            method: 'post',
        })
    
    resolve.form = resolveForm
/**
* @see \App\Http\Controllers\AlertController::destroy
 * @see app/Http/Controllers/AlertController.php:131
 * @route '/admin/alerts/{alert}'
 */
export const destroy = (args: { alert: number | { id: number } } | [alert: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/alerts/{alert}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\AlertController::destroy
 * @see app/Http/Controllers/AlertController.php:131
 * @route '/admin/alerts/{alert}'
 */
destroy.url = (args: { alert: number | { id: number } } | [alert: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { alert: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { alert: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    alert: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        alert: typeof args.alert === 'object'
                ? args.alert.id
                : args.alert,
                }

    return destroy.definition.url
            .replace('{alert}', parsedArgs.alert.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AlertController::destroy
 * @see app/Http/Controllers/AlertController.php:131
 * @route '/admin/alerts/{alert}'
 */
destroy.delete = (args: { alert: number | { id: number } } | [alert: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\AlertController::destroy
 * @see app/Http/Controllers/AlertController.php:131
 * @route '/admin/alerts/{alert}'
 */
    const destroyForm = (args: { alert: number | { id: number } } | [alert: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AlertController::destroy
 * @see app/Http/Controllers/AlertController.php:131
 * @route '/admin/alerts/{alert}'
 */
        destroyForm.delete = (args: { alert: number | { id: number } } | [alert: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const AlertController = { index, unacknowledged, stats, acknowledge, acknowledgeAll, resolve, destroy }

export default AlertController