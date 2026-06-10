import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\ForumController::show
 * @see app/Http/Controllers/ForumController.php:86
 * @route '/forum/threads/{threadId}'
 */
export const show = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/forum/threads/{threadId}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ForumController::show
 * @see app/Http/Controllers/ForumController.php:86
 * @route '/forum/threads/{threadId}'
 */
show.url = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{threadId}', parsedArgs.threadId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::show
 * @see app/Http/Controllers/ForumController.php:86
 * @route '/forum/threads/{threadId}'
 */
show.get = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ForumController::show
 * @see app/Http/Controllers/ForumController.php:86
 * @route '/forum/threads/{threadId}'
 */
show.head = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ForumController::show
 * @see app/Http/Controllers/ForumController.php:86
 * @route '/forum/threads/{threadId}'
 */
    const showForm = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ForumController::show
 * @see app/Http/Controllers/ForumController.php:86
 * @route '/forum/threads/{threadId}'
 */
        showForm.get = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ForumController::show
 * @see app/Http/Controllers/ForumController.php:86
 * @route '/forum/threads/{threadId}'
 */
        showForm.head = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \App\Http\Controllers\ForumController::store
 * @see app/Http/Controllers/ForumController.php:112
 * @route '/forum/trainingUnits/{trainingUnitId}/threads'
 */
export const store = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/forum/trainingUnits/{trainingUnitId}/threads',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ForumController::store
 * @see app/Http/Controllers/ForumController.php:112
 * @route '/forum/trainingUnits/{trainingUnitId}/threads'
 */
store.url = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingUnitId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    trainingUnitId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingUnitId: args.trainingUnitId,
                }

    return store.definition.url
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::store
 * @see app/Http/Controllers/ForumController.php:112
 * @route '/forum/trainingUnits/{trainingUnitId}/threads'
 */
store.post = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ForumController::store
 * @see app/Http/Controllers/ForumController.php:112
 * @route '/forum/trainingUnits/{trainingUnitId}/threads'
 */
    const storeForm = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ForumController::store
 * @see app/Http/Controllers/ForumController.php:112
 * @route '/forum/trainingUnits/{trainingUnitId}/threads'
 */
        storeForm.post = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\ForumController::destroy
 * @see app/Http/Controllers/ForumController.php:352
 * @route '/forum/threads/{threadId}'
 */
export const destroy = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/forum/threads/{threadId}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ForumController::destroy
 * @see app/Http/Controllers/ForumController.php:352
 * @route '/forum/threads/{threadId}'
 */
destroy.url = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{threadId}', parsedArgs.threadId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::destroy
 * @see app/Http/Controllers/ForumController.php:352
 * @route '/forum/threads/{threadId}'
 */
destroy.delete = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\ForumController::destroy
 * @see app/Http/Controllers/ForumController.php:352
 * @route '/forum/threads/{threadId}'
 */
    const destroyForm = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
 * @see app/Http/Controllers/ForumController.php:352
 * @route '/forum/threads/{threadId}'
 */
        destroyForm.delete = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
/**
* @see \App\Http\Controllers\ForumController::reply
 * @see app/Http/Controllers/ForumController.php:133
 * @route '/forum/threads/{threadId}/reply'
 */
export const reply = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reply.url(args, options),
    method: 'post',
})

reply.definition = {
    methods: ["post"],
    url: '/forum/threads/{threadId}/reply',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ForumController::reply
 * @see app/Http/Controllers/ForumController.php:133
 * @route '/forum/threads/{threadId}/reply'
 */
reply.url = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return reply.definition.url
            .replace('{threadId}', parsedArgs.threadId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::reply
 * @see app/Http/Controllers/ForumController.php:133
 * @route '/forum/threads/{threadId}/reply'
 */
reply.post = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reply.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ForumController::reply
 * @see app/Http/Controllers/ForumController.php:133
 * @route '/forum/threads/{threadId}/reply'
 */
    const replyForm = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reply.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ForumController::reply
 * @see app/Http/Controllers/ForumController.php:133
 * @route '/forum/threads/{threadId}/reply'
 */
        replyForm.post = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reply.url(args, options),
            method: 'post',
        })
    
    reply.form = replyForm
/**
* @see \App\Http\Controllers\ForumController::upvote
 * @see app/Http/Controllers/ForumController.php:158
 * @route '/forum/threads/{threadId}/upvote'
 */
export const upvote = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upvote.url(args, options),
    method: 'post',
})

upvote.definition = {
    methods: ["post"],
    url: '/forum/threads/{threadId}/upvote',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ForumController::upvote
 * @see app/Http/Controllers/ForumController.php:158
 * @route '/forum/threads/{threadId}/upvote'
 */
upvote.url = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return upvote.definition.url
            .replace('{threadId}', parsedArgs.threadId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::upvote
 * @see app/Http/Controllers/ForumController.php:158
 * @route '/forum/threads/{threadId}/upvote'
 */
upvote.post = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upvote.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ForumController::upvote
 * @see app/Http/Controllers/ForumController.php:158
 * @route '/forum/threads/{threadId}/upvote'
 */
    const upvoteForm = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: upvote.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ForumController::upvote
 * @see app/Http/Controllers/ForumController.php:158
 * @route '/forum/threads/{threadId}/upvote'
 */
        upvoteForm.post = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: upvote.url(args, options),
            method: 'post',
        })
    
    upvote.form = upvoteForm
/**
* @see \App\Http\Controllers\ForumController::flag
 * @see app/Http/Controllers/ForumController.php:190
 * @route '/forum/threads/{threadId}/flag'
 */
export const flag = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: flag.url(args, options),
    method: 'post',
})

flag.definition = {
    methods: ["post"],
    url: '/forum/threads/{threadId}/flag',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ForumController::flag
 * @see app/Http/Controllers/ForumController.php:190
 * @route '/forum/threads/{threadId}/flag'
 */
flag.url = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return flag.definition.url
            .replace('{threadId}', parsedArgs.threadId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::flag
 * @see app/Http/Controllers/ForumController.php:190
 * @route '/forum/threads/{threadId}/flag'
 */
flag.post = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: flag.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ForumController::flag
 * @see app/Http/Controllers/ForumController.php:190
 * @route '/forum/threads/{threadId}/flag'
 */
    const flagForm = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: flag.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ForumController::flag
 * @see app/Http/Controllers/ForumController.php:190
 * @route '/forum/threads/{threadId}/flag'
 */
        flagForm.post = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: flag.url(args, options),
            method: 'post',
        })
    
    flag.form = flagForm
const threads = {
    show: Object.assign(show, show),
store: Object.assign(store, store),
destroy: Object.assign(destroy, destroy),
reply: Object.assign(reply, reply),
upvote: Object.assign(upvote, upvote),
flag: Object.assign(flag, flag),
}

export default threads