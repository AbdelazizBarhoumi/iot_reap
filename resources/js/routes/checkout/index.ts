import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import refund from './refund'
/**
* @see \App\Http\Controllers\CheckoutController::success
 * @see app/Http/Controllers/CheckoutController.php:58
 * @route '/checkout/success'
 */
export const success = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: success.url(options),
    method: 'get',
})

success.definition = {
    methods: ["get","head"],
    url: '/checkout/success',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CheckoutController::success
 * @see app/Http/Controllers/CheckoutController.php:58
 * @route '/checkout/success'
 */
success.url = (options?: RouteQueryOptions) => {
    return success.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CheckoutController::success
 * @see app/Http/Controllers/CheckoutController.php:58
 * @route '/checkout/success'
 */
success.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: success.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CheckoutController::success
 * @see app/Http/Controllers/CheckoutController.php:58
 * @route '/checkout/success'
 */
success.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: success.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CheckoutController::success
 * @see app/Http/Controllers/CheckoutController.php:58
 * @route '/checkout/success'
 */
    const successForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: success.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CheckoutController::success
 * @see app/Http/Controllers/CheckoutController.php:58
 * @route '/checkout/success'
 */
        successForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: success.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CheckoutController::success
 * @see app/Http/Controllers/CheckoutController.php:58
 * @route '/checkout/success'
 */
        successForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: success.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    success.form = successForm
/**
* @see \App\Http\Controllers\CheckoutController::cancelled
 * @see app/Http/Controllers/CheckoutController.php:73
 * @route '/checkout/cancelled'
 */
export const cancelled = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: cancelled.url(options),
    method: 'get',
})

cancelled.definition = {
    methods: ["get","head"],
    url: '/checkout/cancelled',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CheckoutController::cancelled
 * @see app/Http/Controllers/CheckoutController.php:73
 * @route '/checkout/cancelled'
 */
cancelled.url = (options?: RouteQueryOptions) => {
    return cancelled.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CheckoutController::cancelled
 * @see app/Http/Controllers/CheckoutController.php:73
 * @route '/checkout/cancelled'
 */
cancelled.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: cancelled.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CheckoutController::cancelled
 * @see app/Http/Controllers/CheckoutController.php:73
 * @route '/checkout/cancelled'
 */
cancelled.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: cancelled.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CheckoutController::cancelled
 * @see app/Http/Controllers/CheckoutController.php:73
 * @route '/checkout/cancelled'
 */
    const cancelledForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: cancelled.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CheckoutController::cancelled
 * @see app/Http/Controllers/CheckoutController.php:73
 * @route '/checkout/cancelled'
 */
        cancelledForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: cancelled.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CheckoutController::cancelled
 * @see app/Http/Controllers/CheckoutController.php:73
 * @route '/checkout/cancelled'
 */
        cancelledForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: cancelled.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    cancelled.form = cancelledForm
/**
* @see \App\Http\Controllers\CheckoutController::initiate
 * @see app/Http/Controllers/CheckoutController.php:30
 * @route '/checkout/initiate'
 */
export const initiate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: initiate.url(options),
    method: 'post',
})

initiate.definition = {
    methods: ["post"],
    url: '/checkout/initiate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CheckoutController::initiate
 * @see app/Http/Controllers/CheckoutController.php:30
 * @route '/checkout/initiate'
 */
initiate.url = (options?: RouteQueryOptions) => {
    return initiate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CheckoutController::initiate
 * @see app/Http/Controllers/CheckoutController.php:30
 * @route '/checkout/initiate'
 */
initiate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: initiate.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\CheckoutController::initiate
 * @see app/Http/Controllers/CheckoutController.php:30
 * @route '/checkout/initiate'
 */
    const initiateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: initiate.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CheckoutController::initiate
 * @see app/Http/Controllers/CheckoutController.php:30
 * @route '/checkout/initiate'
 */
        initiateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: initiate.url(options),
            method: 'post',
        })
    
    initiate.form = initiateForm
/**
* @see \App\Http\Controllers\CheckoutController::payments
 * @see app/Http/Controllers/CheckoutController.php:89
 * @route '/checkout/payments'
 */
export const payments = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payments.url(options),
    method: 'get',
})

payments.definition = {
    methods: ["get","head"],
    url: '/checkout/payments',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CheckoutController::payments
 * @see app/Http/Controllers/CheckoutController.php:89
 * @route '/checkout/payments'
 */
payments.url = (options?: RouteQueryOptions) => {
    return payments.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CheckoutController::payments
 * @see app/Http/Controllers/CheckoutController.php:89
 * @route '/checkout/payments'
 */
payments.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payments.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CheckoutController::payments
 * @see app/Http/Controllers/CheckoutController.php:89
 * @route '/checkout/payments'
 */
payments.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: payments.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CheckoutController::payments
 * @see app/Http/Controllers/CheckoutController.php:89
 * @route '/checkout/payments'
 */
    const paymentsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: payments.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CheckoutController::payments
 * @see app/Http/Controllers/CheckoutController.php:89
 * @route '/checkout/payments'
 */
        paymentsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: payments.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CheckoutController::payments
 * @see app/Http/Controllers/CheckoutController.php:89
 * @route '/checkout/payments'
 */
        paymentsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: payments.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    payments.form = paymentsForm
/**
* @see \App\Http\Controllers\CheckoutController::refunds
 * @see app/Http/Controllers/CheckoutController.php:133
 * @route '/checkout/refunds'
 */
export const refunds = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: refunds.url(options),
    method: 'get',
})

refunds.definition = {
    methods: ["get","head"],
    url: '/checkout/refunds',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CheckoutController::refunds
 * @see app/Http/Controllers/CheckoutController.php:133
 * @route '/checkout/refunds'
 */
refunds.url = (options?: RouteQueryOptions) => {
    return refunds.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CheckoutController::refunds
 * @see app/Http/Controllers/CheckoutController.php:133
 * @route '/checkout/refunds'
 */
refunds.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: refunds.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CheckoutController::refunds
 * @see app/Http/Controllers/CheckoutController.php:133
 * @route '/checkout/refunds'
 */
refunds.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: refunds.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CheckoutController::refunds
 * @see app/Http/Controllers/CheckoutController.php:133
 * @route '/checkout/refunds'
 */
    const refundsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: refunds.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CheckoutController::refunds
 * @see app/Http/Controllers/CheckoutController.php:133
 * @route '/checkout/refunds'
 */
        refundsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: refunds.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CheckoutController::refunds
 * @see app/Http/Controllers/CheckoutController.php:133
 * @route '/checkout/refunds'
 */
        refundsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: refunds.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    refunds.form = refundsForm
const checkout = {
    success: Object.assign(success, success),
cancelled: Object.assign(cancelled, cancelled),
initiate: Object.assign(initiate, initiate),
payments: Object.assign(payments, payments),
refund: Object.assign(refund, refund),
refunds: Object.assign(refunds, refunds),
}

export default checkout