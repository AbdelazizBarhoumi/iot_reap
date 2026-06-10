import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ForumController::flaggedThreads
 * @see app/Http/Controllers/ForumController.php:392
 * @route '/admin/forum/flagged'
 */
export const flaggedThreads = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: flaggedThreads.url(options),
    method: 'get',
})

flaggedThreads.definition = {
    methods: ["get","head"],
    url: '/admin/forum/flagged',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ForumController::flaggedThreads
 * @see app/Http/Controllers/ForumController.php:392
 * @route '/admin/forum/flagged'
 */
flaggedThreads.url = (options?: RouteQueryOptions) => {
    return flaggedThreads.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::flaggedThreads
 * @see app/Http/Controllers/ForumController.php:392
 * @route '/admin/forum/flagged'
 */
flaggedThreads.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: flaggedThreads.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ForumController::flaggedThreads
 * @see app/Http/Controllers/ForumController.php:392
 * @route '/admin/forum/flagged'
 */
flaggedThreads.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: flaggedThreads.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ForumController::flaggedThreads
 * @see app/Http/Controllers/ForumController.php:392
 * @route '/admin/forum/flagged'
 */
    const flaggedThreadsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: flaggedThreads.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ForumController::flaggedThreads
 * @see app/Http/Controllers/ForumController.php:392
 * @route '/admin/forum/flagged'
 */
        flaggedThreadsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: flaggedThreads.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ForumController::flaggedThreads
 * @see app/Http/Controllers/ForumController.php:392
 * @route '/admin/forum/flagged'
 */
        flaggedThreadsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: flaggedThreads.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    flaggedThreads.form = flaggedThreadsForm
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
/**
* @see \App\Http\Controllers\ForumController::unflagThread
 * @see app/Http/Controllers/ForumController.php:436
 * @route '/admin/forum/threads/{threadId}/unflag'
 */
export const unflagThread = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unflagThread.url(args, options),
    method: 'post',
})

unflagThread.definition = {
    methods: ["post"],
    url: '/admin/forum/threads/{threadId}/unflag',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ForumController::unflagThread
 * @see app/Http/Controllers/ForumController.php:436
 * @route '/admin/forum/threads/{threadId}/unflag'
 */
unflagThread.url = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return unflagThread.definition.url
            .replace('{threadId}', parsedArgs.threadId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::unflagThread
 * @see app/Http/Controllers/ForumController.php:436
 * @route '/admin/forum/threads/{threadId}/unflag'
 */
unflagThread.post = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unflagThread.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ForumController::unflagThread
 * @see app/Http/Controllers/ForumController.php:436
 * @route '/admin/forum/threads/{threadId}/unflag'
 */
    const unflagThreadForm = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: unflagThread.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ForumController::unflagThread
 * @see app/Http/Controllers/ForumController.php:436
 * @route '/admin/forum/threads/{threadId}/unflag'
 */
        unflagThreadForm.post = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: unflagThread.url(args, options),
            method: 'post',
        })
    
    unflagThread.form = unflagThreadForm
/**
* @see \App\Http\Controllers\ForumController::unflagReply
 * @see app/Http/Controllers/ForumController.php:452
 * @route '/admin/forum/replies/{replyId}/unflag'
 */
export const unflagReply = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unflagReply.url(args, options),
    method: 'post',
})

unflagReply.definition = {
    methods: ["post"],
    url: '/admin/forum/replies/{replyId}/unflag',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ForumController::unflagReply
 * @see app/Http/Controllers/ForumController.php:452
 * @route '/admin/forum/replies/{replyId}/unflag'
 */
unflagReply.url = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return unflagReply.definition.url
            .replace('{replyId}', parsedArgs.replyId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::unflagReply
 * @see app/Http/Controllers/ForumController.php:452
 * @route '/admin/forum/replies/{replyId}/unflag'
 */
unflagReply.post = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unflagReply.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ForumController::unflagReply
 * @see app/Http/Controllers/ForumController.php:452
 * @route '/admin/forum/replies/{replyId}/unflag'
 */
    const unflagReplyForm = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: unflagReply.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ForumController::unflagReply
 * @see app/Http/Controllers/ForumController.php:452
 * @route '/admin/forum/replies/{replyId}/unflag'
 */
        unflagReplyForm.post = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: unflagReply.url(args, options),
            method: 'post',
        })
    
    unflagReply.form = unflagReplyForm
/**
* @see \App\Http\Controllers\ForumController::index
 * @see app/Http/Controllers/ForumController.php:32
 * @route '/forum/trainingUnits/{trainingUnitId}/threads'
 */
export const index = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/forum/trainingUnits/{trainingUnitId}/threads',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ForumController::index
 * @see app/Http/Controllers/ForumController.php:32
 * @route '/forum/trainingUnits/{trainingUnitId}/threads'
 */
index.url = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return index.definition.url
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::index
 * @see app/Http/Controllers/ForumController.php:32
 * @route '/forum/trainingUnits/{trainingUnitId}/threads'
 */
index.get = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ForumController::index
 * @see app/Http/Controllers/ForumController.php:32
 * @route '/forum/trainingUnits/{trainingUnitId}/threads'
 */
index.head = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ForumController::index
 * @see app/Http/Controllers/ForumController.php:32
 * @route '/forum/trainingUnits/{trainingUnitId}/threads'
 */
    const indexForm = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ForumController::index
 * @see app/Http/Controllers/ForumController.php:32
 * @route '/forum/trainingUnits/{trainingUnitId}/threads'
 */
        indexForm.get = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ForumController::index
 * @see app/Http/Controllers/ForumController.php:32
 * @route '/forum/trainingUnits/{trainingUnitId}/threads'
 */
        indexForm.head = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\ForumController::trainingPathThreads
 * @see app/Http/Controllers/ForumController.php:60
 * @route '/forum/trainingPaths/{trainingPathId}/threads'
 */
export const trainingPathThreads = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: trainingPathThreads.url(args, options),
    method: 'get',
})

trainingPathThreads.definition = {
    methods: ["get","head"],
    url: '/forum/trainingPaths/{trainingPathId}/threads',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ForumController::trainingPathThreads
 * @see app/Http/Controllers/ForumController.php:60
 * @route '/forum/trainingPaths/{trainingPathId}/threads'
 */
trainingPathThreads.url = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingPathId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    trainingPathId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPathId: args.trainingPathId,
                }

    return trainingPathThreads.definition.url
            .replace('{trainingPathId}', parsedArgs.trainingPathId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::trainingPathThreads
 * @see app/Http/Controllers/ForumController.php:60
 * @route '/forum/trainingPaths/{trainingPathId}/threads'
 */
trainingPathThreads.get = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: trainingPathThreads.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ForumController::trainingPathThreads
 * @see app/Http/Controllers/ForumController.php:60
 * @route '/forum/trainingPaths/{trainingPathId}/threads'
 */
trainingPathThreads.head = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: trainingPathThreads.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ForumController::trainingPathThreads
 * @see app/Http/Controllers/ForumController.php:60
 * @route '/forum/trainingPaths/{trainingPathId}/threads'
 */
    const trainingPathThreadsForm = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: trainingPathThreads.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ForumController::trainingPathThreads
 * @see app/Http/Controllers/ForumController.php:60
 * @route '/forum/trainingPaths/{trainingPathId}/threads'
 */
        trainingPathThreadsForm.get = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: trainingPathThreads.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ForumController::trainingPathThreads
 * @see app/Http/Controllers/ForumController.php:60
 * @route '/forum/trainingPaths/{trainingPathId}/threads'
 */
        trainingPathThreadsForm.head = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: trainingPathThreads.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    trainingPathThreads.form = trainingPathThreadsForm
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
const store480497397da43851b948c0b8788c494f = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store480497397da43851b948c0b8788c494f.url(args, options),
    method: 'post',
})

store480497397da43851b948c0b8788c494f.definition = {
    methods: ["post"],
    url: '/forum/trainingUnits/{trainingUnitId}/threads',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ForumController::store
 * @see app/Http/Controllers/ForumController.php:112
 * @route '/forum/trainingUnits/{trainingUnitId}/threads'
 */
store480497397da43851b948c0b8788c494f.url = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return store480497397da43851b948c0b8788c494f.definition.url
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::store
 * @see app/Http/Controllers/ForumController.php:112
 * @route '/forum/trainingUnits/{trainingUnitId}/threads'
 */
store480497397da43851b948c0b8788c494f.post = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store480497397da43851b948c0b8788c494f.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ForumController::store
 * @see app/Http/Controllers/ForumController.php:112
 * @route '/forum/trainingUnits/{trainingUnitId}/threads'
 */
    const store480497397da43851b948c0b8788c494fForm = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store480497397da43851b948c0b8788c494f.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ForumController::store
 * @see app/Http/Controllers/ForumController.php:112
 * @route '/forum/trainingUnits/{trainingUnitId}/threads'
 */
        store480497397da43851b948c0b8788c494fForm.post = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store480497397da43851b948c0b8788c494f.url(args, options),
            method: 'post',
        })
    
    store480497397da43851b948c0b8788c494f.form = store480497397da43851b948c0b8788c494fForm
    /**
* @see \App\Http\Controllers\ForumController::store
 * @see app/Http/Controllers/ForumController.php:112
 * @route '/forum/trainingPaths/{trainingPathId}/threads'
 */
const storea44f6ddd924869c05d6c2f7b92bc29c9 = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storea44f6ddd924869c05d6c2f7b92bc29c9.url(args, options),
    method: 'post',
})

storea44f6ddd924869c05d6c2f7b92bc29c9.definition = {
    methods: ["post"],
    url: '/forum/trainingPaths/{trainingPathId}/threads',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ForumController::store
 * @see app/Http/Controllers/ForumController.php:112
 * @route '/forum/trainingPaths/{trainingPathId}/threads'
 */
storea44f6ddd924869c05d6c2f7b92bc29c9.url = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingPathId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    trainingPathId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPathId: args.trainingPathId,
                }

    return storea44f6ddd924869c05d6c2f7b92bc29c9.definition.url
            .replace('{trainingPathId}', parsedArgs.trainingPathId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::store
 * @see app/Http/Controllers/ForumController.php:112
 * @route '/forum/trainingPaths/{trainingPathId}/threads'
 */
storea44f6ddd924869c05d6c2f7b92bc29c9.post = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storea44f6ddd924869c05d6c2f7b92bc29c9.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ForumController::store
 * @see app/Http/Controllers/ForumController.php:112
 * @route '/forum/trainingPaths/{trainingPathId}/threads'
 */
    const storea44f6ddd924869c05d6c2f7b92bc29c9Form = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: storea44f6ddd924869c05d6c2f7b92bc29c9.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ForumController::store
 * @see app/Http/Controllers/ForumController.php:112
 * @route '/forum/trainingPaths/{trainingPathId}/threads'
 */
        storea44f6ddd924869c05d6c2f7b92bc29c9Form.post = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: storea44f6ddd924869c05d6c2f7b92bc29c9.url(args, options),
            method: 'post',
        })
    
    storea44f6ddd924869c05d6c2f7b92bc29c9.form = storea44f6ddd924869c05d6c2f7b92bc29c9Form

export const store = {
    '/forum/trainingUnits/{trainingUnitId}/threads': store480497397da43851b948c0b8788c494f,
    '/forum/trainingPaths/{trainingPathId}/threads': storea44f6ddd924869c05d6c2f7b92bc29c9,
}

/**
* @see \App\Http\Controllers\ForumController::destroyThread
 * @see app/Http/Controllers/ForumController.php:352
 * @route '/forum/threads/{threadId}'
 */
export const destroyThread = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyThread.url(args, options),
    method: 'delete',
})

destroyThread.definition = {
    methods: ["delete"],
    url: '/forum/threads/{threadId}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ForumController::destroyThread
 * @see app/Http/Controllers/ForumController.php:352
 * @route '/forum/threads/{threadId}'
 */
destroyThread.url = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroyThread.definition.url
            .replace('{threadId}', parsedArgs.threadId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::destroyThread
 * @see app/Http/Controllers/ForumController.php:352
 * @route '/forum/threads/{threadId}'
 */
destroyThread.delete = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyThread.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\ForumController::destroyThread
 * @see app/Http/Controllers/ForumController.php:352
 * @route '/forum/threads/{threadId}'
 */
    const destroyThreadForm = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroyThread.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ForumController::destroyThread
 * @see app/Http/Controllers/ForumController.php:352
 * @route '/forum/threads/{threadId}'
 */
        destroyThreadForm.delete = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroyThread.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroyThread.form = destroyThreadForm
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
* @see \App\Http\Controllers\ForumController::upvoteThread
 * @see app/Http/Controllers/ForumController.php:158
 * @route '/forum/threads/{threadId}/upvote'
 */
export const upvoteThread = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upvoteThread.url(args, options),
    method: 'post',
})

upvoteThread.definition = {
    methods: ["post"],
    url: '/forum/threads/{threadId}/upvote',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ForumController::upvoteThread
 * @see app/Http/Controllers/ForumController.php:158
 * @route '/forum/threads/{threadId}/upvote'
 */
upvoteThread.url = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return upvoteThread.definition.url
            .replace('{threadId}', parsedArgs.threadId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::upvoteThread
 * @see app/Http/Controllers/ForumController.php:158
 * @route '/forum/threads/{threadId}/upvote'
 */
upvoteThread.post = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upvoteThread.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ForumController::upvoteThread
 * @see app/Http/Controllers/ForumController.php:158
 * @route '/forum/threads/{threadId}/upvote'
 */
    const upvoteThreadForm = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: upvoteThread.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ForumController::upvoteThread
 * @see app/Http/Controllers/ForumController.php:158
 * @route '/forum/threads/{threadId}/upvote'
 */
        upvoteThreadForm.post = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: upvoteThread.url(args, options),
            method: 'post',
        })
    
    upvoteThread.form = upvoteThreadForm
/**
* @see \App\Http\Controllers\ForumController::flagThread
 * @see app/Http/Controllers/ForumController.php:190
 * @route '/forum/threads/{threadId}/flag'
 */
export const flagThread = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: flagThread.url(args, options),
    method: 'post',
})

flagThread.definition = {
    methods: ["post"],
    url: '/forum/threads/{threadId}/flag',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ForumController::flagThread
 * @see app/Http/Controllers/ForumController.php:190
 * @route '/forum/threads/{threadId}/flag'
 */
flagThread.url = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return flagThread.definition.url
            .replace('{threadId}', parsedArgs.threadId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::flagThread
 * @see app/Http/Controllers/ForumController.php:190
 * @route '/forum/threads/{threadId}/flag'
 */
flagThread.post = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: flagThread.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ForumController::flagThread
 * @see app/Http/Controllers/ForumController.php:190
 * @route '/forum/threads/{threadId}/flag'
 */
    const flagThreadForm = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: flagThread.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ForumController::flagThread
 * @see app/Http/Controllers/ForumController.php:190
 * @route '/forum/threads/{threadId}/flag'
 */
        flagThreadForm.post = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: flagThread.url(args, options),
            method: 'post',
        })
    
    flagThread.form = flagThreadForm
/**
* @see \App\Http\Controllers\ForumController::upvoteReply
 * @see app/Http/Controllers/ForumController.php:174
 * @route '/forum/replies/{replyId}/upvote'
 */
export const upvoteReply = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upvoteReply.url(args, options),
    method: 'post',
})

upvoteReply.definition = {
    methods: ["post"],
    url: '/forum/replies/{replyId}/upvote',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ForumController::upvoteReply
 * @see app/Http/Controllers/ForumController.php:174
 * @route '/forum/replies/{replyId}/upvote'
 */
upvoteReply.url = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return upvoteReply.definition.url
            .replace('{replyId}', parsedArgs.replyId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::upvoteReply
 * @see app/Http/Controllers/ForumController.php:174
 * @route '/forum/replies/{replyId}/upvote'
 */
upvoteReply.post = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upvoteReply.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ForumController::upvoteReply
 * @see app/Http/Controllers/ForumController.php:174
 * @route '/forum/replies/{replyId}/upvote'
 */
    const upvoteReplyForm = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: upvoteReply.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ForumController::upvoteReply
 * @see app/Http/Controllers/ForumController.php:174
 * @route '/forum/replies/{replyId}/upvote'
 */
        upvoteReplyForm.post = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: upvoteReply.url(args, options),
            method: 'post',
        })
    
    upvoteReply.form = upvoteReplyForm
/**
* @see \App\Http\Controllers\ForumController::flagReply
 * @see app/Http/Controllers/ForumController.php:201
 * @route '/forum/replies/{replyId}/flag'
 */
export const flagReply = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: flagReply.url(args, options),
    method: 'post',
})

flagReply.definition = {
    methods: ["post"],
    url: '/forum/replies/{replyId}/flag',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ForumController::flagReply
 * @see app/Http/Controllers/ForumController.php:201
 * @route '/forum/replies/{replyId}/flag'
 */
flagReply.url = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return flagReply.definition.url
            .replace('{replyId}', parsedArgs.replyId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::flagReply
 * @see app/Http/Controllers/ForumController.php:201
 * @route '/forum/replies/{replyId}/flag'
 */
flagReply.post = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: flagReply.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ForumController::flagReply
 * @see app/Http/Controllers/ForumController.php:201
 * @route '/forum/replies/{replyId}/flag'
 */
    const flagReplyForm = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: flagReply.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ForumController::flagReply
 * @see app/Http/Controllers/ForumController.php:201
 * @route '/forum/replies/{replyId}/flag'
 */
        flagReplyForm.post = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: flagReply.url(args, options),
            method: 'post',
        })
    
    flagReply.form = flagReplyForm
/**
* @see \App\Http\Controllers\ForumController::destroyReply
 * @see app/Http/Controllers/ForumController.php:370
 * @route '/forum/replies/{replyId}'
 */
export const destroyReply = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyReply.url(args, options),
    method: 'delete',
})

destroyReply.definition = {
    methods: ["delete"],
    url: '/forum/replies/{replyId}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ForumController::destroyReply
 * @see app/Http/Controllers/ForumController.php:370
 * @route '/forum/replies/{replyId}'
 */
destroyReply.url = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroyReply.definition.url
            .replace('{replyId}', parsedArgs.replyId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::destroyReply
 * @see app/Http/Controllers/ForumController.php:370
 * @route '/forum/replies/{replyId}'
 */
destroyReply.delete = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyReply.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\ForumController::destroyReply
 * @see app/Http/Controllers/ForumController.php:370
 * @route '/forum/replies/{replyId}'
 */
    const destroyReplyForm = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroyReply.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ForumController::destroyReply
 * @see app/Http/Controllers/ForumController.php:370
 * @route '/forum/replies/{replyId}'
 */
        destroyReplyForm.delete = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroyReply.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroyReply.form = destroyReplyForm
/**
* @see \App\Http\Controllers\ForumController::teacherInbox
 * @see app/Http/Controllers/ForumController.php:216
 * @route '/teaching/forum/inbox'
 */
export const teacherInbox = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: teacherInbox.url(options),
    method: 'get',
})

teacherInbox.definition = {
    methods: ["get","head"],
    url: '/teaching/forum/inbox',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ForumController::teacherInbox
 * @see app/Http/Controllers/ForumController.php:216
 * @route '/teaching/forum/inbox'
 */
teacherInbox.url = (options?: RouteQueryOptions) => {
    return teacherInbox.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::teacherInbox
 * @see app/Http/Controllers/ForumController.php:216
 * @route '/teaching/forum/inbox'
 */
teacherInbox.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: teacherInbox.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ForumController::teacherInbox
 * @see app/Http/Controllers/ForumController.php:216
 * @route '/teaching/forum/inbox'
 */
teacherInbox.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: teacherInbox.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ForumController::teacherInbox
 * @see app/Http/Controllers/ForumController.php:216
 * @route '/teaching/forum/inbox'
 */
    const teacherInboxForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: teacherInbox.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ForumController::teacherInbox
 * @see app/Http/Controllers/ForumController.php:216
 * @route '/teaching/forum/inbox'
 */
        teacherInboxForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: teacherInbox.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ForumController::teacherInbox
 * @see app/Http/Controllers/ForumController.php:216
 * @route '/teaching/forum/inbox'
 */
        teacherInboxForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: teacherInbox.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    teacherInbox.form = teacherInboxForm
/**
* @see \App\Http\Controllers\ForumController::pin
 * @see app/Http/Controllers/ForumController.php:256
 * @route '/teaching/forum/threads/{threadId}/pin'
 */
export const pin = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pin.url(args, options),
    method: 'post',
})

pin.definition = {
    methods: ["post"],
    url: '/teaching/forum/threads/{threadId}/pin',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ForumController::pin
 * @see app/Http/Controllers/ForumController.php:256
 * @route '/teaching/forum/threads/{threadId}/pin'
 */
pin.url = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return pin.definition.url
            .replace('{threadId}', parsedArgs.threadId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::pin
 * @see app/Http/Controllers/ForumController.php:256
 * @route '/teaching/forum/threads/{threadId}/pin'
 */
pin.post = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pin.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ForumController::pin
 * @see app/Http/Controllers/ForumController.php:256
 * @route '/teaching/forum/threads/{threadId}/pin'
 */
    const pinForm = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: pin.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ForumController::pin
 * @see app/Http/Controllers/ForumController.php:256
 * @route '/teaching/forum/threads/{threadId}/pin'
 */
        pinForm.post = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: pin.url(args, options),
            method: 'post',
        })
    
    pin.form = pinForm
/**
* @see \App\Http\Controllers\ForumController::unpin
 * @see app/Http/Controllers/ForumController.php:272
 * @route '/teaching/forum/threads/{threadId}/unpin'
 */
export const unpin = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unpin.url(args, options),
    method: 'post',
})

unpin.definition = {
    methods: ["post"],
    url: '/teaching/forum/threads/{threadId}/unpin',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ForumController::unpin
 * @see app/Http/Controllers/ForumController.php:272
 * @route '/teaching/forum/threads/{threadId}/unpin'
 */
unpin.url = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return unpin.definition.url
            .replace('{threadId}', parsedArgs.threadId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::unpin
 * @see app/Http/Controllers/ForumController.php:272
 * @route '/teaching/forum/threads/{threadId}/unpin'
 */
unpin.post = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unpin.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ForumController::unpin
 * @see app/Http/Controllers/ForumController.php:272
 * @route '/teaching/forum/threads/{threadId}/unpin'
 */
    const unpinForm = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: unpin.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ForumController::unpin
 * @see app/Http/Controllers/ForumController.php:272
 * @route '/teaching/forum/threads/{threadId}/unpin'
 */
        unpinForm.post = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: unpin.url(args, options),
            method: 'post',
        })
    
    unpin.form = unpinForm
/**
* @see \App\Http\Controllers\ForumController::resolveFlag
 * @see app/Http/Controllers/ForumController.php:288
 * @route '/teaching/forum/threads/{threadId}/resolve-flag'
 */
export const resolveFlag = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resolveFlag.url(args, options),
    method: 'post',
})

resolveFlag.definition = {
    methods: ["post"],
    url: '/teaching/forum/threads/{threadId}/resolve-flag',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ForumController::resolveFlag
 * @see app/Http/Controllers/ForumController.php:288
 * @route '/teaching/forum/threads/{threadId}/resolve-flag'
 */
resolveFlag.url = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return resolveFlag.definition.url
            .replace('{threadId}', parsedArgs.threadId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::resolveFlag
 * @see app/Http/Controllers/ForumController.php:288
 * @route '/teaching/forum/threads/{threadId}/resolve-flag'
 */
resolveFlag.post = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resolveFlag.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ForumController::resolveFlag
 * @see app/Http/Controllers/ForumController.php:288
 * @route '/teaching/forum/threads/{threadId}/resolve-flag'
 */
    const resolveFlagForm = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: resolveFlag.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ForumController::resolveFlag
 * @see app/Http/Controllers/ForumController.php:288
 * @route '/teaching/forum/threads/{threadId}/resolve-flag'
 */
        resolveFlagForm.post = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: resolveFlag.url(args, options),
            method: 'post',
        })
    
    resolveFlag.form = resolveFlagForm
/**
* @see \App\Http\Controllers\ForumController::lock
 * @see app/Http/Controllers/ForumController.php:304
 * @route '/teaching/forum/threads/{threadId}/lock'
 */
export const lock = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: lock.url(args, options),
    method: 'post',
})

lock.definition = {
    methods: ["post"],
    url: '/teaching/forum/threads/{threadId}/lock',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ForumController::lock
 * @see app/Http/Controllers/ForumController.php:304
 * @route '/teaching/forum/threads/{threadId}/lock'
 */
lock.url = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return lock.definition.url
            .replace('{threadId}', parsedArgs.threadId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::lock
 * @see app/Http/Controllers/ForumController.php:304
 * @route '/teaching/forum/threads/{threadId}/lock'
 */
lock.post = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: lock.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ForumController::lock
 * @see app/Http/Controllers/ForumController.php:304
 * @route '/teaching/forum/threads/{threadId}/lock'
 */
    const lockForm = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: lock.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ForumController::lock
 * @see app/Http/Controllers/ForumController.php:304
 * @route '/teaching/forum/threads/{threadId}/lock'
 */
        lockForm.post = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: lock.url(args, options),
            method: 'post',
        })
    
    lock.form = lockForm
/**
* @see \App\Http\Controllers\ForumController::unlock
 * @see app/Http/Controllers/ForumController.php:320
 * @route '/teaching/forum/threads/{threadId}/unlock'
 */
export const unlock = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unlock.url(args, options),
    method: 'post',
})

unlock.definition = {
    methods: ["post"],
    url: '/teaching/forum/threads/{threadId}/unlock',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ForumController::unlock
 * @see app/Http/Controllers/ForumController.php:320
 * @route '/teaching/forum/threads/{threadId}/unlock'
 */
unlock.url = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return unlock.definition.url
            .replace('{threadId}', parsedArgs.threadId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::unlock
 * @see app/Http/Controllers/ForumController.php:320
 * @route '/teaching/forum/threads/{threadId}/unlock'
 */
unlock.post = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unlock.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ForumController::unlock
 * @see app/Http/Controllers/ForumController.php:320
 * @route '/teaching/forum/threads/{threadId}/unlock'
 */
    const unlockForm = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: unlock.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ForumController::unlock
 * @see app/Http/Controllers/ForumController.php:320
 * @route '/teaching/forum/threads/{threadId}/unlock'
 */
        unlockForm.post = (args: { threadId: string | number } | [threadId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: unlock.url(args, options),
            method: 'post',
        })
    
    unlock.form = unlockForm
/**
* @see \App\Http\Controllers\ForumController::markAnswer
 * @see app/Http/Controllers/ForumController.php:336
 * @route '/teaching/forum/replies/{replyId}/answer'
 */
export const markAnswer = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAnswer.url(args, options),
    method: 'post',
})

markAnswer.definition = {
    methods: ["post"],
    url: '/teaching/forum/replies/{replyId}/answer',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ForumController::markAnswer
 * @see app/Http/Controllers/ForumController.php:336
 * @route '/teaching/forum/replies/{replyId}/answer'
 */
markAnswer.url = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return markAnswer.definition.url
            .replace('{replyId}', parsedArgs.replyId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::markAnswer
 * @see app/Http/Controllers/ForumController.php:336
 * @route '/teaching/forum/replies/{replyId}/answer'
 */
markAnswer.post = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAnswer.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ForumController::markAnswer
 * @see app/Http/Controllers/ForumController.php:336
 * @route '/teaching/forum/replies/{replyId}/answer'
 */
    const markAnswerForm = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: markAnswer.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ForumController::markAnswer
 * @see app/Http/Controllers/ForumController.php:336
 * @route '/teaching/forum/replies/{replyId}/answer'
 */
        markAnswerForm.post = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: markAnswer.url(args, options),
            method: 'post',
        })
    
    markAnswer.form = markAnswerForm
const ForumController = { flaggedThreads, flaggedReplies, unflagThread, unflagReply, index, trainingPathThreads, show, store, destroyThread, reply, upvoteThread, flagThread, upvoteReply, flagReply, destroyReply, teacherInbox, pin, unpin, resolveFlag, lock, unlock, markAnswer }

export default ForumController