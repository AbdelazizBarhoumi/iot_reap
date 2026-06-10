import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import earnings0c062c from './earnings'
/**
* @see \App\Http\Controllers\TeacherAnalyticsController::index
 * @see app/Http/Controllers/TeacherAnalyticsController.php:24
 * @route '/teaching/analytics'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/teaching/analytics',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TeacherAnalyticsController::index
 * @see app/Http/Controllers/TeacherAnalyticsController.php:24
 * @route '/teaching/analytics'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeacherAnalyticsController::index
 * @see app/Http/Controllers/TeacherAnalyticsController.php:24
 * @route '/teaching/analytics'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TeacherAnalyticsController::index
 * @see app/Http/Controllers/TeacherAnalyticsController.php:24
 * @route '/teaching/analytics'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TeacherAnalyticsController::index
 * @see app/Http/Controllers/TeacherAnalyticsController.php:24
 * @route '/teaching/analytics'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TeacherAnalyticsController::index
 * @see app/Http/Controllers/TeacherAnalyticsController.php:24
 * @route '/teaching/analytics'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TeacherAnalyticsController::index
 * @see app/Http/Controllers/TeacherAnalyticsController.php:24
 * @route '/teaching/analytics'
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
* @see \App\Http\Controllers\TeacherAnalyticsController::kpis
 * @see app/Http/Controllers/TeacherAnalyticsController.php:46
 * @route '/teaching/analytics/kpis'
 */
export const kpis = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: kpis.url(options),
    method: 'get',
})

kpis.definition = {
    methods: ["get","head"],
    url: '/teaching/analytics/kpis',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TeacherAnalyticsController::kpis
 * @see app/Http/Controllers/TeacherAnalyticsController.php:46
 * @route '/teaching/analytics/kpis'
 */
kpis.url = (options?: RouteQueryOptions) => {
    return kpis.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeacherAnalyticsController::kpis
 * @see app/Http/Controllers/TeacherAnalyticsController.php:46
 * @route '/teaching/analytics/kpis'
 */
kpis.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: kpis.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TeacherAnalyticsController::kpis
 * @see app/Http/Controllers/TeacherAnalyticsController.php:46
 * @route '/teaching/analytics/kpis'
 */
kpis.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: kpis.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TeacherAnalyticsController::kpis
 * @see app/Http/Controllers/TeacherAnalyticsController.php:46
 * @route '/teaching/analytics/kpis'
 */
    const kpisForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: kpis.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TeacherAnalyticsController::kpis
 * @see app/Http/Controllers/TeacherAnalyticsController.php:46
 * @route '/teaching/analytics/kpis'
 */
        kpisForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: kpis.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TeacherAnalyticsController::kpis
 * @see app/Http/Controllers/TeacherAnalyticsController.php:46
 * @route '/teaching/analytics/kpis'
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
* @see \App\Http\Controllers\TeacherAnalyticsController::enrollmentChart
 * @see app/Http/Controllers/TeacherAnalyticsController.php:59
 * @route '/teaching/analytics/enrollment-chart'
 */
export const enrollmentChart = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: enrollmentChart.url(options),
    method: 'get',
})

enrollmentChart.definition = {
    methods: ["get","head"],
    url: '/teaching/analytics/enrollment-chart',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TeacherAnalyticsController::enrollmentChart
 * @see app/Http/Controllers/TeacherAnalyticsController.php:59
 * @route '/teaching/analytics/enrollment-chart'
 */
enrollmentChart.url = (options?: RouteQueryOptions) => {
    return enrollmentChart.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeacherAnalyticsController::enrollmentChart
 * @see app/Http/Controllers/TeacherAnalyticsController.php:59
 * @route '/teaching/analytics/enrollment-chart'
 */
enrollmentChart.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: enrollmentChart.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TeacherAnalyticsController::enrollmentChart
 * @see app/Http/Controllers/TeacherAnalyticsController.php:59
 * @route '/teaching/analytics/enrollment-chart'
 */
enrollmentChart.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: enrollmentChart.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TeacherAnalyticsController::enrollmentChart
 * @see app/Http/Controllers/TeacherAnalyticsController.php:59
 * @route '/teaching/analytics/enrollment-chart'
 */
    const enrollmentChartForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: enrollmentChart.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TeacherAnalyticsController::enrollmentChart
 * @see app/Http/Controllers/TeacherAnalyticsController.php:59
 * @route '/teaching/analytics/enrollment-chart'
 */
        enrollmentChartForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: enrollmentChart.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TeacherAnalyticsController::enrollmentChart
 * @see app/Http/Controllers/TeacherAnalyticsController.php:59
 * @route '/teaching/analytics/enrollment-chart'
 */
        enrollmentChartForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: enrollmentChart.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    enrollmentChart.form = enrollmentChartForm
/**
* @see \App\Http\Controllers\TeacherAnalyticsController::revenueChart
 * @see app/Http/Controllers/TeacherAnalyticsController.php:72
 * @route '/teaching/analytics/revenue-chart'
 */
export const revenueChart = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: revenueChart.url(options),
    method: 'get',
})

revenueChart.definition = {
    methods: ["get","head"],
    url: '/teaching/analytics/revenue-chart',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TeacherAnalyticsController::revenueChart
 * @see app/Http/Controllers/TeacherAnalyticsController.php:72
 * @route '/teaching/analytics/revenue-chart'
 */
revenueChart.url = (options?: RouteQueryOptions) => {
    return revenueChart.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeacherAnalyticsController::revenueChart
 * @see app/Http/Controllers/TeacherAnalyticsController.php:72
 * @route '/teaching/analytics/revenue-chart'
 */
revenueChart.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: revenueChart.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TeacherAnalyticsController::revenueChart
 * @see app/Http/Controllers/TeacherAnalyticsController.php:72
 * @route '/teaching/analytics/revenue-chart'
 */
revenueChart.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: revenueChart.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TeacherAnalyticsController::revenueChart
 * @see app/Http/Controllers/TeacherAnalyticsController.php:72
 * @route '/teaching/analytics/revenue-chart'
 */
    const revenueChartForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: revenueChart.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TeacherAnalyticsController::revenueChart
 * @see app/Http/Controllers/TeacherAnalyticsController.php:72
 * @route '/teaching/analytics/revenue-chart'
 */
        revenueChartForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: revenueChart.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TeacherAnalyticsController::revenueChart
 * @see app/Http/Controllers/TeacherAnalyticsController.php:72
 * @route '/teaching/analytics/revenue-chart'
 */
        revenueChartForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: revenueChart.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    revenueChart.form = revenueChartForm
/**
* @see \App\Http\Controllers\TeacherAnalyticsController::engineers
 * @see app/Http/Controllers/TeacherAnalyticsController.php:85
 * @route '/teaching/analytics/trainingPaths/{trainingPath}/engineers'
 */
export const engineers = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: engineers.url(args, options),
    method: 'get',
})

engineers.definition = {
    methods: ["get","head"],
    url: '/teaching/analytics/trainingPaths/{trainingPath}/engineers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TeacherAnalyticsController::engineers
 * @see app/Http/Controllers/TeacherAnalyticsController.php:85
 * @route '/teaching/analytics/trainingPaths/{trainingPath}/engineers'
 */
engineers.url = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingPath: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { trainingPath: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    trainingPath: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPath: typeof args.trainingPath === 'object'
                ? args.trainingPath.id
                : args.trainingPath,
                }

    return engineers.definition.url
            .replace('{trainingPath}', parsedArgs.trainingPath.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeacherAnalyticsController::engineers
 * @see app/Http/Controllers/TeacherAnalyticsController.php:85
 * @route '/teaching/analytics/trainingPaths/{trainingPath}/engineers'
 */
engineers.get = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: engineers.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TeacherAnalyticsController::engineers
 * @see app/Http/Controllers/TeacherAnalyticsController.php:85
 * @route '/teaching/analytics/trainingPaths/{trainingPath}/engineers'
 */
engineers.head = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: engineers.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TeacherAnalyticsController::engineers
 * @see app/Http/Controllers/TeacherAnalyticsController.php:85
 * @route '/teaching/analytics/trainingPaths/{trainingPath}/engineers'
 */
    const engineersForm = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: engineers.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TeacherAnalyticsController::engineers
 * @see app/Http/Controllers/TeacherAnalyticsController.php:85
 * @route '/teaching/analytics/trainingPaths/{trainingPath}/engineers'
 */
        engineersForm.get = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: engineers.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TeacherAnalyticsController::engineers
 * @see app/Http/Controllers/TeacherAnalyticsController.php:85
 * @route '/teaching/analytics/trainingPaths/{trainingPath}/engineers'
 */
        engineersForm.head = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: engineers.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    engineers.form = engineersForm
/**
* @see \App\Http\Controllers\TeacherAnalyticsController::funnel
 * @see app/Http/Controllers/TeacherAnalyticsController.php:105
 * @route '/teaching/analytics/trainingPaths/{trainingPath}/funnel'
 */
export const funnel = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: funnel.url(args, options),
    method: 'get',
})

funnel.definition = {
    methods: ["get","head"],
    url: '/teaching/analytics/trainingPaths/{trainingPath}/funnel',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TeacherAnalyticsController::funnel
 * @see app/Http/Controllers/TeacherAnalyticsController.php:105
 * @route '/teaching/analytics/trainingPaths/{trainingPath}/funnel'
 */
funnel.url = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingPath: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { trainingPath: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    trainingPath: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPath: typeof args.trainingPath === 'object'
                ? args.trainingPath.id
                : args.trainingPath,
                }

    return funnel.definition.url
            .replace('{trainingPath}', parsedArgs.trainingPath.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeacherAnalyticsController::funnel
 * @see app/Http/Controllers/TeacherAnalyticsController.php:105
 * @route '/teaching/analytics/trainingPaths/{trainingPath}/funnel'
 */
funnel.get = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: funnel.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TeacherAnalyticsController::funnel
 * @see app/Http/Controllers/TeacherAnalyticsController.php:105
 * @route '/teaching/analytics/trainingPaths/{trainingPath}/funnel'
 */
funnel.head = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: funnel.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TeacherAnalyticsController::funnel
 * @see app/Http/Controllers/TeacherAnalyticsController.php:105
 * @route '/teaching/analytics/trainingPaths/{trainingPath}/funnel'
 */
    const funnelForm = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: funnel.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TeacherAnalyticsController::funnel
 * @see app/Http/Controllers/TeacherAnalyticsController.php:105
 * @route '/teaching/analytics/trainingPaths/{trainingPath}/funnel'
 */
        funnelForm.get = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: funnel.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TeacherAnalyticsController::funnel
 * @see app/Http/Controllers/TeacherAnalyticsController.php:105
 * @route '/teaching/analytics/trainingPaths/{trainingPath}/funnel'
 */
        funnelForm.head = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: funnel.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    funnel.form = funnelForm
/**
* @see \App\Http\Controllers\TeacherAnalyticsController::earnings
 * @see app/Http/Controllers/TeacherAnalyticsController.php:117
 * @route '/teaching/analytics/earnings'
 */
export const earnings = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: earnings.url(options),
    method: 'get',
})

earnings.definition = {
    methods: ["get","head"],
    url: '/teaching/analytics/earnings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TeacherAnalyticsController::earnings
 * @see app/Http/Controllers/TeacherAnalyticsController.php:117
 * @route '/teaching/analytics/earnings'
 */
earnings.url = (options?: RouteQueryOptions) => {
    return earnings.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeacherAnalyticsController::earnings
 * @see app/Http/Controllers/TeacherAnalyticsController.php:117
 * @route '/teaching/analytics/earnings'
 */
earnings.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: earnings.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TeacherAnalyticsController::earnings
 * @see app/Http/Controllers/TeacherAnalyticsController.php:117
 * @route '/teaching/analytics/earnings'
 */
earnings.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: earnings.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TeacherAnalyticsController::earnings
 * @see app/Http/Controllers/TeacherAnalyticsController.php:117
 * @route '/teaching/analytics/earnings'
 */
    const earningsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: earnings.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TeacherAnalyticsController::earnings
 * @see app/Http/Controllers/TeacherAnalyticsController.php:117
 * @route '/teaching/analytics/earnings'
 */
        earningsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: earnings.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TeacherAnalyticsController::earnings
 * @see app/Http/Controllers/TeacherAnalyticsController.php:117
 * @route '/teaching/analytics/earnings'
 */
        earningsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: earnings.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    earnings.form = earningsForm
const analytics = {
    index: Object.assign(index, index),
kpis: Object.assign(kpis, kpis),
enrollmentChart: Object.assign(enrollmentChart, enrollmentChart),
revenueChart: Object.assign(revenueChart, revenueChart),
engineers: Object.assign(engineers, engineers),
funnel: Object.assign(funnel, funnel),
earnings: Object.assign(earnings, earnings0c062c),
}

export default analytics