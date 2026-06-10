import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
import threads from './threads'
import replies from './replies'
/**
* @see \App\Http\Controllers\ForumController::inbox
 * @see app/Http/Controllers/ForumController.php:216
 * @route '/teaching/forum/inbox'
 */
export const inbox = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: inbox.url(options),
    method: 'get',
})

inbox.definition = {
    methods: ["get","head"],
    url: '/teaching/forum/inbox',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ForumController::inbox
 * @see app/Http/Controllers/ForumController.php:216
 * @route '/teaching/forum/inbox'
 */
inbox.url = (options?: RouteQueryOptions) => {
    return inbox.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::inbox
 * @see app/Http/Controllers/ForumController.php:216
 * @route '/teaching/forum/inbox'
 */
inbox.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: inbox.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ForumController::inbox
 * @see app/Http/Controllers/ForumController.php:216
 * @route '/teaching/forum/inbox'
 */
inbox.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: inbox.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ForumController::inbox
 * @see app/Http/Controllers/ForumController.php:216
 * @route '/teaching/forum/inbox'
 */
    const inboxForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: inbox.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ForumController::inbox
 * @see app/Http/Controllers/ForumController.php:216
 * @route '/teaching/forum/inbox'
 */
        inboxForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: inbox.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ForumController::inbox
 * @see app/Http/Controllers/ForumController.php:216
 * @route '/teaching/forum/inbox'
 */
        inboxForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: inbox.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    inbox.form = inboxForm
const forum = {
    inbox: Object.assign(inbox, inbox),
threads: Object.assign(threads, threads),
replies: Object.assign(replies, replies),
}

export default forum