import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminAnalyticsController::dashboard
 * @see app/Http/Controllers/Admin/AdminAnalyticsController.php:25
 * @route '/admin/dashboard'
 */
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/admin/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminAnalyticsController::dashboard
 * @see app/Http/Controllers/Admin/AdminAnalyticsController.php:25
 * @route '/admin/dashboard'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminAnalyticsController::dashboard
 * @see app/Http/Controllers/Admin/AdminAnalyticsController.php:25
 * @route '/admin/dashboard'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminAnalyticsController::dashboard
 * @see app/Http/Controllers/Admin/AdminAnalyticsController.php:25
 * @route '/admin/dashboard'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminAnalyticsController::dashboard
 * @see app/Http/Controllers/Admin/AdminAnalyticsController.php:25
 * @route '/admin/dashboard'
 */
    const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dashboard.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminAnalyticsController::dashboard
 * @see app/Http/Controllers/Admin/AdminAnalyticsController.php:25
 * @route '/admin/dashboard'
 */
        dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminAnalyticsController::dashboard
 * @see app/Http/Controllers/Admin/AdminAnalyticsController.php:25
 * @route '/admin/dashboard'
 */
        dashboardForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    dashboard.form = dashboardForm
/**
* @see \App\Http\Controllers\Admin\AdminAnalyticsController::kpis
 * @see app/Http/Controllers/Admin/AdminAnalyticsController.php:53
 * @route '/admin/analytics/kpis'
 */
export const kpis = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: kpis.url(options),
    method: 'get',
})

kpis.definition = {
    methods: ["get","head"],
    url: '/admin/analytics/kpis',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminAnalyticsController::kpis
 * @see app/Http/Controllers/Admin/AdminAnalyticsController.php:53
 * @route '/admin/analytics/kpis'
 */
kpis.url = (options?: RouteQueryOptions) => {
    return kpis.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminAnalyticsController::kpis
 * @see app/Http/Controllers/Admin/AdminAnalyticsController.php:53
 * @route '/admin/analytics/kpis'
 */
kpis.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: kpis.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminAnalyticsController::kpis
 * @see app/Http/Controllers/Admin/AdminAnalyticsController.php:53
 * @route '/admin/analytics/kpis'
 */
kpis.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: kpis.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminAnalyticsController::kpis
 * @see app/Http/Controllers/Admin/AdminAnalyticsController.php:53
 * @route '/admin/analytics/kpis'
 */
    const kpisForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: kpis.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminAnalyticsController::kpis
 * @see app/Http/Controllers/Admin/AdminAnalyticsController.php:53
 * @route '/admin/analytics/kpis'
 */
        kpisForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: kpis.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminAnalyticsController::kpis
 * @see app/Http/Controllers/Admin/AdminAnalyticsController.php:53
 * @route '/admin/analytics/kpis'
 */
        kpisForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: kpis.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    kpis.form = kpisForm
/**
* @see \App\Http\Controllers\Admin\AdminAnalyticsController::health
 * @see app/Http/Controllers/Admin/AdminAnalyticsController.php:67
 * @route '/admin/analytics/health'
 */
export const health = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: health.url(options),
    method: 'get',
})

health.definition = {
    methods: ["get","head"],
    url: '/admin/analytics/health',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminAnalyticsController::health
 * @see app/Http/Controllers/Admin/AdminAnalyticsController.php:67
 * @route '/admin/analytics/health'
 */
health.url = (options?: RouteQueryOptions) => {
    return health.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminAnalyticsController::health
 * @see app/Http/Controllers/Admin/AdminAnalyticsController.php:67
 * @route '/admin/analytics/health'
 */
health.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: health.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminAnalyticsController::health
 * @see app/Http/Controllers/Admin/AdminAnalyticsController.php:67
 * @route '/admin/analytics/health'
 */
health.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: health.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminAnalyticsController::health
 * @see app/Http/Controllers/Admin/AdminAnalyticsController.php:67
 * @route '/admin/analytics/health'
 */
    const healthForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: health.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminAnalyticsController::health
 * @see app/Http/Controllers/Admin/AdminAnalyticsController.php:67
 * @route '/admin/analytics/health'
 */
        healthForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: health.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminAnalyticsController::health
 * @see app/Http/Controllers/Admin/AdminAnalyticsController.php:67
 * @route '/admin/analytics/health'
 */
        healthForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: health.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    health.form = healthForm
const AdminAnalyticsController = { dashboard, kpis, health }

export default AdminAnalyticsController