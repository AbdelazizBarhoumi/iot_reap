import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
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
const threads = {
    pin: Object.assign(pin, pin),
unpin: Object.assign(unpin, unpin),
resolveFlag: Object.assign(resolveFlag, resolveFlag),
lock: Object.assign(lock, lock),
unlock: Object.assign(unlock, unlock),
}

export default threads