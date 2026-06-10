import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::order
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:128
 * @route '/admin/trainingPaths/featured/order'
 */
export const order = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: order.url(options),
    method: 'put',
})

order.definition = {
    methods: ["put"],
    url: '/admin/trainingPaths/featured/order',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::order
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:128
 * @route '/admin/trainingPaths/featured/order'
 */
order.url = (options?: RouteQueryOptions) => {
    return order.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::order
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:128
 * @route '/admin/trainingPaths/featured/order'
 */
order.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: order.url(options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::order
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:128
 * @route '/admin/trainingPaths/featured/order'
 */
    const orderForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: order.url({
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminTrainingPathController::order
 * @see app/Http/Controllers/Admin/AdminTrainingPathController.php:128
 * @route '/admin/trainingPaths/featured/order'
 */
        orderForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: order.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    order.form = orderForm
const featured = {
    order: Object.assign(order, order),
}

export default featured