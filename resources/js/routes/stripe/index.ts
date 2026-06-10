import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\StripeWebhookController::__invoke
 * @see app/Http/Controllers/StripeWebhookController.php:20
 * @route '/stripe/webhook'
 */
export const webhook = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: webhook.url(options),
    method: 'post',
})

webhook.definition = {
    methods: ["post"],
    url: '/stripe/webhook',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\StripeWebhookController::__invoke
 * @see app/Http/Controllers/StripeWebhookController.php:20
 * @route '/stripe/webhook'
 */
webhook.url = (options?: RouteQueryOptions) => {
    return webhook.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StripeWebhookController::__invoke
 * @see app/Http/Controllers/StripeWebhookController.php:20
 * @route '/stripe/webhook'
 */
webhook.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: webhook.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\StripeWebhookController::__invoke
 * @see app/Http/Controllers/StripeWebhookController.php:20
 * @route '/stripe/webhook'
 */
    const webhookForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: webhook.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\StripeWebhookController::__invoke
 * @see app/Http/Controllers/StripeWebhookController.php:20
 * @route '/stripe/webhook'
 */
        webhookForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: webhook.url(options),
            method: 'post',
        })
    
    webhook.form = webhookForm
const stripe = {
    webhook: Object.assign(webhook, webhook),
}

export default stripe