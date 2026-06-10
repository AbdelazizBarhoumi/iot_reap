import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ForumController::unflag
 * @see app/Http/Controllers/ForumController.php:436
 * @route '/admin/forum/threads/{threadId}/unflag'
 */
export const unflag = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unflag.url(args, options),
    method: 'post',
})

unflag.definition = {
    methods: ["post"],
    url: '/admin/forum/threads/{threadId}/unflag',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ForumController::unflag
 * @see app/Http/Controllers/ForumController.php:436
 * @route '/admin/forum/threads/{threadId}/unflag'
 */
unflag.url = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { threadId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    threadId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        threadId: args.threadId,
                }

    return unflag.definition.url
            .replace('{threadId}', parsedArgs.threadId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::unflag
 * @see app/Http/Controllers/ForumController.php:436
 * @route '/admin/forum/threads/{threadId}/unflag'
 */
unflag.post = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unflag.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ForumController::unflag
 * @see app/Http/Controllers/ForumController.php:436
 * @route '/admin/forum/threads/{threadId}/unflag'
 */
    const unflagForm = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: unflag.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ForumController::unflag
 * @see app/Http/Controllers/ForumController.php:436
 * @route '/admin/forum/threads/{threadId}/unflag'
 */
        unflagForm.post = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: unflag.url(args, options),
            method: 'post',
        })
    
    unflag.form = unflagForm
const threads = {
    unflag: Object.assign(unflag, unflag),
}

export default threads