import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ForumController::unflag
 * @see app/Http/Controllers/ForumController.php:452
 * @route '/admin/forum/replies/{replyId}/unflag'
 */
export const unflag = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unflag.url(args, options),
    method: 'post',
})

unflag.definition = {
    methods: ["post"],
    url: '/admin/forum/replies/{replyId}/unflag',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ForumController::unflag
 * @see app/Http/Controllers/ForumController.php:452
 * @route '/admin/forum/replies/{replyId}/unflag'
 */
unflag.url = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { replyId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    replyId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        replyId: args.replyId,
                }

    return unflag.definition.url
            .replace('{replyId}', parsedArgs.replyId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::unflag
 * @see app/Http/Controllers/ForumController.php:452
 * @route '/admin/forum/replies/{replyId}/unflag'
 */
unflag.post = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unflag.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ForumController::unflag
 * @see app/Http/Controllers/ForumController.php:452
 * @route '/admin/forum/replies/{replyId}/unflag'
 */
    const unflagForm = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: unflag.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ForumController::unflag
 * @see app/Http/Controllers/ForumController.php:452
 * @route '/admin/forum/replies/{replyId}/unflag'
 */
        unflagForm.post = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: unflag.url(args, options),
            method: 'post',
        })
    
    unflag.form = unflagForm
const replies = {
    unflag: Object.assign(unflag, unflag),
}

export default replies