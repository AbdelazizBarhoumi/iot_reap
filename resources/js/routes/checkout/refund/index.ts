import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\CheckoutController::request
 * @see app/Http/Controllers/CheckoutController.php:144
 * @route '/checkout/refund'
 */
export const request = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: request.url(options),
    method: 'post',
})

request.definition = {
    methods: ["post"],
    url: '/checkout/refund',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CheckoutController::request
 * @see app/Http/Controllers/CheckoutController.php:144
 * @route '/checkout/refund'
 */
request.url = (options?: RouteQueryOptions) => {
    return request.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CheckoutController::request
 * @see app/Http/Controllers/CheckoutController.php:144
 * @route '/checkout/refund'
 */
request.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: request.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\CheckoutController::request
 * @see app/Http/Controllers/CheckoutController.php:144
 * @route '/checkout/refund'
 */
    const requestForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: request.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CheckoutController::request
 * @see app/Http/Controllers/CheckoutController.php:144
 * @route '/checkout/refund'
 */
        requestForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: request.url(options),
            method: 'post',
        })
    
    request.form = requestForm
const refund = {
    request: Object.assign(request, request),
}

export default refund