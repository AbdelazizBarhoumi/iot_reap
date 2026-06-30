import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\TeacherAnalyticsController::exportMethod
 * @see app/Http/Controllers/TeacherAnalyticsController.php:148
 * @route '/teaching/analytics/earnings/export'
 */
export const exportMethod = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/teaching/analytics/earnings/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TeacherAnalyticsController::exportMethod
 * @see app/Http/Controllers/TeacherAnalyticsController.php:148
 * @route '/teaching/analytics/earnings/export'
 */
exportMethod.url = (options?: RouteQueryOptions) => {
    return exportMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeacherAnalyticsController::exportMethod
 * @see app/Http/Controllers/TeacherAnalyticsController.php:148
 * @route '/teaching/analytics/earnings/export'
 */
exportMethod.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TeacherAnalyticsController::exportMethod
 * @see app/Http/Controllers/TeacherAnalyticsController.php:148
 * @route '/teaching/analytics/earnings/export'
 */
exportMethod.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TeacherAnalyticsController::exportMethod
 * @see app/Http/Controllers/TeacherAnalyticsController.php:148
 * @route '/teaching/analytics/earnings/export'
 */
    const exportMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: exportMethod.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TeacherAnalyticsController::exportMethod
 * @see app/Http/Controllers/TeacherAnalyticsController.php:148
 * @route '/teaching/analytics/earnings/export'
 */
        exportMethodForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: exportMethod.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TeacherAnalyticsController::exportMethod
 * @see app/Http/Controllers/TeacherAnalyticsController.php:148
 * @route '/teaching/analytics/earnings/export'
 */
        exportMethodForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: exportMethod.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    exportMethod.form = exportMethodForm
const earnings = {
    export: Object.assign(exportMethod, exportMethod),
}

export default earnings