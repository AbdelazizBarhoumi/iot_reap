import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ActivityLogController::index
 * @see app/Http/Controllers/ActivityLogController.php:27
 * @route '/admin/activity-logs'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/activity-logs',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ActivityLogController::index
 * @see app/Http/Controllers/ActivityLogController.php:27
 * @route '/admin/activity-logs'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ActivityLogController::index
 * @see app/Http/Controllers/ActivityLogController.php:27
 * @route '/admin/activity-logs'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ActivityLogController::index
 * @see app/Http/Controllers/ActivityLogController.php:27
 * @route '/admin/activity-logs'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ActivityLogController::index
 * @see app/Http/Controllers/ActivityLogController.php:27
 * @route '/admin/activity-logs'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ActivityLogController::index
 * @see app/Http/Controllers/ActivityLogController.php:27
 * @route '/admin/activity-logs'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ActivityLogController::index
 * @see app/Http/Controllers/ActivityLogController.php:27
 * @route '/admin/activity-logs'
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
* @see \App\Http\Controllers\ActivityLogController::recent
 * @see app/Http/Controllers/ActivityLogController.php:54
 * @route '/admin/activity-logs/recent'
 */
export const recent = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: recent.url(options),
    method: 'get',
})

recent.definition = {
    methods: ["get","head"],
    url: '/admin/activity-logs/recent',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ActivityLogController::recent
 * @see app/Http/Controllers/ActivityLogController.php:54
 * @route '/admin/activity-logs/recent'
 */
recent.url = (options?: RouteQueryOptions) => {
    return recent.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ActivityLogController::recent
 * @see app/Http/Controllers/ActivityLogController.php:54
 * @route '/admin/activity-logs/recent'
 */
recent.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: recent.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ActivityLogController::recent
 * @see app/Http/Controllers/ActivityLogController.php:54
 * @route '/admin/activity-logs/recent'
 */
recent.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: recent.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ActivityLogController::recent
 * @see app/Http/Controllers/ActivityLogController.php:54
 * @route '/admin/activity-logs/recent'
 */
    const recentForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: recent.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ActivityLogController::recent
 * @see app/Http/Controllers/ActivityLogController.php:54
 * @route '/admin/activity-logs/recent'
 */
        recentForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: recent.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ActivityLogController::recent
 * @see app/Http/Controllers/ActivityLogController.php:54
 * @route '/admin/activity-logs/recent'
 */
        recentForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: recent.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    recent.form = recentForm
/**
* @see \App\Http\Controllers\ActivityLogController::stats
 * @see app/Http/Controllers/ActivityLogController.php:69
 * @route '/admin/activity-logs/stats'
 */
export const stats = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stats.url(options),
    method: 'get',
})

stats.definition = {
    methods: ["get","head"],
    url: '/admin/activity-logs/stats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ActivityLogController::stats
 * @see app/Http/Controllers/ActivityLogController.php:69
 * @route '/admin/activity-logs/stats'
 */
stats.url = (options?: RouteQueryOptions) => {
    return stats.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ActivityLogController::stats
 * @see app/Http/Controllers/ActivityLogController.php:69
 * @route '/admin/activity-logs/stats'
 */
stats.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stats.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ActivityLogController::stats
 * @see app/Http/Controllers/ActivityLogController.php:69
 * @route '/admin/activity-logs/stats'
 */
stats.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: stats.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ActivityLogController::stats
 * @see app/Http/Controllers/ActivityLogController.php:69
 * @route '/admin/activity-logs/stats'
 */
    const statsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: stats.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ActivityLogController::stats
 * @see app/Http/Controllers/ActivityLogController.php:69
 * @route '/admin/activity-logs/stats'
 */
        statsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: stats.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ActivityLogController::stats
 * @see app/Http/Controllers/ActivityLogController.php:69
 * @route '/admin/activity-logs/stats'
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
* @see \App\Http\Controllers\ActivityLogController::userActivity
 * @see app/Http/Controllers/ActivityLogController.php:82
 * @route '/admin/activity-logs/user'
 */
export const userActivity = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: userActivity.url(options),
    method: 'get',
})

userActivity.definition = {
    methods: ["get","head"],
    url: '/admin/activity-logs/user',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ActivityLogController::userActivity
 * @see app/Http/Controllers/ActivityLogController.php:82
 * @route '/admin/activity-logs/user'
 */
userActivity.url = (options?: RouteQueryOptions) => {
    return userActivity.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ActivityLogController::userActivity
 * @see app/Http/Controllers/ActivityLogController.php:82
 * @route '/admin/activity-logs/user'
 */
userActivity.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: userActivity.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ActivityLogController::userActivity
 * @see app/Http/Controllers/ActivityLogController.php:82
 * @route '/admin/activity-logs/user'
 */
userActivity.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: userActivity.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ActivityLogController::userActivity
 * @see app/Http/Controllers/ActivityLogController.php:82
 * @route '/admin/activity-logs/user'
 */
    const userActivityForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: userActivity.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ActivityLogController::userActivity
 * @see app/Http/Controllers/ActivityLogController.php:82
 * @route '/admin/activity-logs/user'
 */
        userActivityForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: userActivity.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ActivityLogController::userActivity
 * @see app/Http/Controllers/ActivityLogController.php:82
 * @route '/admin/activity-logs/user'
 */
        userActivityForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: userActivity.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    userActivity.form = userActivityForm
const ActivityLogController = { index, recent, stats, userActivity }

export default ActivityLogController