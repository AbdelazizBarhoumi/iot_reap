import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
import threads from './threads'
import replies from './replies'
/**
* @see \App\Http\Controllers\ForumController::flagged
 * @see app/Http/Controllers/ForumController.php:392
 * @route '/admin/forum/flagged'
 */
export const flagged = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: flagged.url(options),
    method: 'get',
})

flagged.definition = {
    methods: ["get","head"],
    url: '/admin/forum/flagged',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ForumController::flagged
 * @see app/Http/Controllers/ForumController.php:392
 * @route '/admin/forum/flagged'
 */
flagged.url = (options?: RouteQueryOptions) => {
    return flagged.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::flagged
 * @see app/Http/Controllers/ForumController.php:392
 * @route '/admin/forum/flagged'
 */
flagged.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: flagged.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ForumController::flagged
 * @see app/Http/Controllers/ForumController.php:392
 * @route '/admin/forum/flagged'
 */
flagged.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: flagged.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ForumController::flagged
 * @see app/Http/Controllers/ForumController.php:392
 * @route '/admin/forum/flagged'
 */
    const flaggedForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: flagged.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ForumController::flagged
 * @see app/Http/Controllers/ForumController.php:392
 * @route '/admin/forum/flagged'
 */
        flaggedForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: flagged.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ForumController::flagged
 * @see app/Http/Controllers/ForumController.php:392
 * @route '/admin/forum/flagged'
 */
        flaggedForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: flagged.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    flagged.form = flaggedForm
/**
* @see \App\Http\Controllers\ForumController::flaggedReplies
 * @see app/Http/Controllers/ForumController.php:416
 * @route '/admin/forum/flagged-replies'
 */
export const flaggedReplies = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: flaggedReplies.url(options),
    method: 'get',
})

flaggedReplies.definition = {
    methods: ["get","head"],
    url: '/admin/forum/flagged-replies',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ForumController::flaggedReplies
 * @see app/Http/Controllers/ForumController.php:416
 * @route '/admin/forum/flagged-replies'
 */
flaggedReplies.url = (options?: RouteQueryOptions) => {
    return flaggedReplies.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::flaggedReplies
 * @see app/Http/Controllers/ForumController.php:416
 * @route '/admin/forum/flagged-replies'
 */
flaggedReplies.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: flaggedReplies.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ForumController::flaggedReplies
 * @see app/Http/Controllers/ForumController.php:416
 * @route '/admin/forum/flagged-replies'
 */
flaggedReplies.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: flaggedReplies.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ForumController::flaggedReplies
 * @see app/Http/Controllers/ForumController.php:416
 * @route '/admin/forum/flagged-replies'
 */
    const flaggedRepliesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: flaggedReplies.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ForumController::flaggedReplies
 * @see app/Http/Controllers/ForumController.php:416
 * @route '/admin/forum/flagged-replies'
 */
        flaggedRepliesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: flaggedReplies.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ForumController::flaggedReplies
 * @see app/Http/Controllers/ForumController.php:416
 * @route '/admin/forum/flagged-replies'
 */
        flaggedRepliesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: flaggedReplies.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    flaggedReplies.form = flaggedRepliesForm
const forum = {
    flagged: Object.assign(flagged, flagged),
flaggedReplies: Object.assign(flaggedReplies, flaggedReplies),
threads: Object.assign(threads, threads),
replies: Object.assign(replies, replies),
}

export default forum