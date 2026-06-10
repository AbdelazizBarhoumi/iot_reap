import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\ForumController::upvote
 * @see app/Http/Controllers/ForumController.php:174
 * @route '/forum/replies/{replyId}/upvote'
 */
export const upvote = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upvote.url(args, options),
    method: 'post',
})

upvote.definition = {
    methods: ["post"],
    url: '/forum/replies/{replyId}/upvote',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ForumController::upvote
 * @see app/Http/Controllers/ForumController.php:174
 * @route '/forum/replies/{replyId}/upvote'
 */
upvote.url = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return upvote.definition.url
            .replace('{replyId}', parsedArgs.replyId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::upvote
 * @see app/Http/Controllers/ForumController.php:174
 * @route '/forum/replies/{replyId}/upvote'
 */
upvote.post = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upvote.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ForumController::upvote
 * @see app/Http/Controllers/ForumController.php:174
 * @route '/forum/replies/{replyId}/upvote'
 */
    const upvoteForm = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: upvote.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ForumController::upvote
 * @see app/Http/Controllers/ForumController.php:174
 * @route '/forum/replies/{replyId}/upvote'
 */
        upvoteForm.post = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: upvote.url(args, options),
            method: 'post',
        })
    
    upvote.form = upvoteForm
/**
* @see \App\Http\Controllers\ForumController::flag
 * @see app/Http/Controllers/ForumController.php:201
 * @route '/forum/replies/{replyId}/flag'
 */
export const flag = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: flag.url(args, options),
    method: 'post',
})

flag.definition = {
    methods: ["post"],
    url: '/forum/replies/{replyId}/flag',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ForumController::flag
 * @see app/Http/Controllers/ForumController.php:201
 * @route '/forum/replies/{replyId}/flag'
 */
flag.url = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return flag.definition.url
            .replace('{replyId}', parsedArgs.replyId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::flag
 * @see app/Http/Controllers/ForumController.php:201
 * @route '/forum/replies/{replyId}/flag'
 */
flag.post = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: flag.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ForumController::flag
 * @see app/Http/Controllers/ForumController.php:201
 * @route '/forum/replies/{replyId}/flag'
 */
    const flagForm = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: flag.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ForumController::flag
 * @see app/Http/Controllers/ForumController.php:201
 * @route '/forum/replies/{replyId}/flag'
 */
        flagForm.post = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: flag.url(args, options),
            method: 'post',
        })
    
    flag.form = flagForm
/**
* @see \App\Http\Controllers\ForumController::destroy
 * @see app/Http/Controllers/ForumController.php:370
 * @route '/forum/replies/{replyId}'
 */
export const destroy = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/forum/replies/{replyId}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ForumController::destroy
 * @see app/Http/Controllers/ForumController.php:370
 * @route '/forum/replies/{replyId}'
 */
destroy.url = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{replyId}', parsedArgs.replyId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::destroy
 * @see app/Http/Controllers/ForumController.php:370
 * @route '/forum/replies/{replyId}'
 */
destroy.delete = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\ForumController::destroy
 * @see app/Http/Controllers/ForumController.php:370
 * @route '/forum/replies/{replyId}'
 */
    const destroyForm = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ForumController::destroy
 * @see app/Http/Controllers/ForumController.php:370
 * @route '/forum/replies/{replyId}'
 */
        destroyForm.delete = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const replies = {
    upvote: Object.assign(upvote, upvote),
flag: Object.assign(flag, flag),
destroy: Object.assign(destroy, destroy),
}

export default replies