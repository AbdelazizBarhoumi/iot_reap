import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/finance'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/finance',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/finance'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/finance'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/finance'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/finance'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/finance'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/finance'
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
const finance = {
    index: Object.assign(index, index),
}

export default finance