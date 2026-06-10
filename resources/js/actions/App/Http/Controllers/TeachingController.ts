import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\TeachingController::index
 * @see app/Http/Controllers/TeachingController.php:47
 * @route '/teaching/training-paths'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/teaching/training-paths',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TeachingController::index
 * @see app/Http/Controllers/TeachingController.php:47
 * @route '/teaching/training-paths'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeachingController::index
 * @see app/Http/Controllers/TeachingController.php:47
 * @route '/teaching/training-paths'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TeachingController::index
 * @see app/Http/Controllers/TeachingController.php:47
 * @route '/teaching/training-paths'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TeachingController::index
 * @see app/Http/Controllers/TeachingController.php:47
 * @route '/teaching/training-paths'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TeachingController::index
 * @see app/Http/Controllers/TeachingController.php:47
 * @route '/teaching/training-paths'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TeachingController::index
 * @see app/Http/Controllers/TeachingController.php:47
 * @route '/teaching/training-paths'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\TeachingController::create
 * @see app/Http/Controllers/TeachingController.php:75
 * @route '/teaching/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/teaching/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TeachingController::create
 * @see app/Http/Controllers/TeachingController.php:75
 * @route '/teaching/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeachingController::create
 * @see app/Http/Controllers/TeachingController.php:75
 * @route '/teaching/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TeachingController::create
 * @see app/Http/Controllers/TeachingController.php:75
 * @route '/teaching/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TeachingController::create
 * @see app/Http/Controllers/TeachingController.php:75
 * @route '/teaching/create'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TeachingController::create
 * @see app/Http/Controllers/TeachingController.php:75
 * @route '/teaching/create'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TeachingController::create
 * @see app/Http/Controllers/TeachingController.php:75
 * @route '/teaching/create'
 */
        createForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    create.form = createForm
/**
* @see \App\Http\Controllers\TeachingController::store
 * @see app/Http/Controllers/TeachingController.php:110
 * @route '/teaching'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/teaching',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TeachingController::store
 * @see app/Http/Controllers/TeachingController.php:110
 * @route '/teaching'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeachingController::store
 * @see app/Http/Controllers/TeachingController.php:110
 * @route '/teaching'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\TeachingController::store
 * @see app/Http/Controllers/TeachingController.php:110
 * @route '/teaching'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TeachingController::store
 * @see app/Http/Controllers/TeachingController.php:110
 * @route '/teaching'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\TeachingController::edit
 * @see app/Http/Controllers/TeachingController.php:137
 * @route '/teaching/{id}/edit'
 */
export const edit = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/teaching/{id}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TeachingController::edit
 * @see app/Http/Controllers/TeachingController.php:137
 * @route '/teaching/{id}/edit'
 */
edit.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return edit.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeachingController::edit
 * @see app/Http/Controllers/TeachingController.php:137
 * @route '/teaching/{id}/edit'
 */
edit.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TeachingController::edit
 * @see app/Http/Controllers/TeachingController.php:137
 * @route '/teaching/{id}/edit'
 */
edit.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TeachingController::edit
 * @see app/Http/Controllers/TeachingController.php:137
 * @route '/teaching/{id}/edit'
 */
    const editForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TeachingController::edit
 * @see app/Http/Controllers/TeachingController.php:137
 * @route '/teaching/{id}/edit'
 */
        editForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TeachingController::edit
 * @see app/Http/Controllers/TeachingController.php:137
 * @route '/teaching/{id}/edit'
 */
        editForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    edit.form = editForm
/**
* @see \App\Http\Controllers\TeachingController::update
 * @see app/Http/Controllers/TeachingController.php:188
 * @route '/teaching/{trainingPath}'
 */
export const update = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/teaching/{trainingPath}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\TeachingController::update
 * @see app/Http/Controllers/TeachingController.php:188
 * @route '/teaching/{trainingPath}'
 */
update.url = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingPath: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { trainingPath: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    trainingPath: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPath: typeof args.trainingPath === 'object'
                ? args.trainingPath.id
                : args.trainingPath,
                }

    return update.definition.url
            .replace('{trainingPath}', parsedArgs.trainingPath.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeachingController::update
 * @see app/Http/Controllers/TeachingController.php:188
 * @route '/teaching/{trainingPath}'
 */
update.patch = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\TeachingController::update
 * @see app/Http/Controllers/TeachingController.php:188
 * @route '/teaching/{trainingPath}'
 */
    const updateForm = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TeachingController::update
 * @see app/Http/Controllers/TeachingController.php:188
 * @route '/teaching/{trainingPath}'
 */
        updateForm.patch = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\TeachingController::destroy
 * @see app/Http/Controllers/TeachingController.php:201
 * @route '/teaching/{trainingPath}'
 */
export const destroy = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/teaching/{trainingPath}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\TeachingController::destroy
 * @see app/Http/Controllers/TeachingController.php:201
 * @route '/teaching/{trainingPath}'
 */
destroy.url = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingPath: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { trainingPath: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    trainingPath: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPath: typeof args.trainingPath === 'object'
                ? args.trainingPath.id
                : args.trainingPath,
                }

    return destroy.definition.url
            .replace('{trainingPath}', parsedArgs.trainingPath.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeachingController::destroy
 * @see app/Http/Controllers/TeachingController.php:201
 * @route '/teaching/{trainingPath}'
 */
destroy.delete = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\TeachingController::destroy
 * @see app/Http/Controllers/TeachingController.php:201
 * @route '/teaching/{trainingPath}'
 */
    const destroyForm = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TeachingController::destroy
 * @see app/Http/Controllers/TeachingController.php:201
 * @route '/teaching/{trainingPath}'
 */
        destroyForm.delete = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\TeachingController::submitForReview
 * @see app/Http/Controllers/TeachingController.php:252
 * @route '/teaching/{trainingPath}/submit'
 */
export const submitForReview = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: submitForReview.url(args, options),
    method: 'post',
})

submitForReview.definition = {
    methods: ["post"],
    url: '/teaching/{trainingPath}/submit',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TeachingController::submitForReview
 * @see app/Http/Controllers/TeachingController.php:252
 * @route '/teaching/{trainingPath}/submit'
 */
submitForReview.url = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingPath: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { trainingPath: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    trainingPath: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPath: typeof args.trainingPath === 'object'
                ? args.trainingPath.id
                : args.trainingPath,
                }

    return submitForReview.definition.url
            .replace('{trainingPath}', parsedArgs.trainingPath.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeachingController::submitForReview
 * @see app/Http/Controllers/TeachingController.php:252
 * @route '/teaching/{trainingPath}/submit'
 */
submitForReview.post = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: submitForReview.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\TeachingController::submitForReview
 * @see app/Http/Controllers/TeachingController.php:252
 * @route '/teaching/{trainingPath}/submit'
 */
    const submitForReviewForm = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: submitForReview.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TeachingController::submitForReview
 * @see app/Http/Controllers/TeachingController.php:252
 * @route '/teaching/{trainingPath}/submit'
 */
        submitForReviewForm.post = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: submitForReview.url(args, options),
            method: 'post',
        })
    
    submitForReview.form = submitForReviewForm
/**
* @see \App\Http\Controllers\TeachingController::archive
 * @see app/Http/Controllers/TeachingController.php:216
 * @route '/teaching/{trainingPath}/archive'
 */
export const archive = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: archive.url(args, options),
    method: 'post',
})

archive.definition = {
    methods: ["post"],
    url: '/teaching/{trainingPath}/archive',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TeachingController::archive
 * @see app/Http/Controllers/TeachingController.php:216
 * @route '/teaching/{trainingPath}/archive'
 */
archive.url = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingPath: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { trainingPath: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    trainingPath: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPath: typeof args.trainingPath === 'object'
                ? args.trainingPath.id
                : args.trainingPath,
                }

    return archive.definition.url
            .replace('{trainingPath}', parsedArgs.trainingPath.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeachingController::archive
 * @see app/Http/Controllers/TeachingController.php:216
 * @route '/teaching/{trainingPath}/archive'
 */
archive.post = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: archive.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\TeachingController::archive
 * @see app/Http/Controllers/TeachingController.php:216
 * @route '/teaching/{trainingPath}/archive'
 */
    const archiveForm = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: archive.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TeachingController::archive
 * @see app/Http/Controllers/TeachingController.php:216
 * @route '/teaching/{trainingPath}/archive'
 */
        archiveForm.post = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: archive.url(args, options),
            method: 'post',
        })
    
    archive.form = archiveForm
/**
* @see \App\Http\Controllers\TeachingController::restore
 * @see app/Http/Controllers/TeachingController.php:234
 * @route '/teaching/{trainingPath}/restore'
 */
export const restore = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: restore.url(args, options),
    method: 'post',
})

restore.definition = {
    methods: ["post"],
    url: '/teaching/{trainingPath}/restore',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TeachingController::restore
 * @see app/Http/Controllers/TeachingController.php:234
 * @route '/teaching/{trainingPath}/restore'
 */
restore.url = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingPath: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { trainingPath: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    trainingPath: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPath: typeof args.trainingPath === 'object'
                ? args.trainingPath.id
                : args.trainingPath,
                }

    return restore.definition.url
            .replace('{trainingPath}', parsedArgs.trainingPath.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeachingController::restore
 * @see app/Http/Controllers/TeachingController.php:234
 * @route '/teaching/{trainingPath}/restore'
 */
restore.post = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: restore.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\TeachingController::restore
 * @see app/Http/Controllers/TeachingController.php:234
 * @route '/teaching/{trainingPath}/restore'
 */
    const restoreForm = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: restore.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TeachingController::restore
 * @see app/Http/Controllers/TeachingController.php:234
 * @route '/teaching/{trainingPath}/restore'
 */
        restoreForm.post = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: restore.url(args, options),
            method: 'post',
        })
    
    restore.form = restoreForm
/**
* @see \App\Http\Controllers\TeachingController::storeModule
 * @see app/Http/Controllers/TeachingController.php:274
 * @route '/teaching/{trainingPath}/modules'
 */
export const storeModule = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeModule.url(args, options),
    method: 'post',
})

storeModule.definition = {
    methods: ["post"],
    url: '/teaching/{trainingPath}/modules',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TeachingController::storeModule
 * @see app/Http/Controllers/TeachingController.php:274
 * @route '/teaching/{trainingPath}/modules'
 */
storeModule.url = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingPath: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { trainingPath: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    trainingPath: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPath: typeof args.trainingPath === 'object'
                ? args.trainingPath.id
                : args.trainingPath,
                }

    return storeModule.definition.url
            .replace('{trainingPath}', parsedArgs.trainingPath.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeachingController::storeModule
 * @see app/Http/Controllers/TeachingController.php:274
 * @route '/teaching/{trainingPath}/modules'
 */
storeModule.post = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeModule.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\TeachingController::storeModule
 * @see app/Http/Controllers/TeachingController.php:274
 * @route '/teaching/{trainingPath}/modules'
 */
    const storeModuleForm = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: storeModule.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TeachingController::storeModule
 * @see app/Http/Controllers/TeachingController.php:274
 * @route '/teaching/{trainingPath}/modules'
 */
        storeModuleForm.post = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: storeModule.url(args, options),
            method: 'post',
        })
    
    storeModule.form = storeModuleForm
/**
* @see \App\Http\Controllers\TeachingController::reorderModules
 * @see app/Http/Controllers/TeachingController.php:316
 * @route '/teaching/{trainingPath}/modules/reorder'
 */
export const reorderModules = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: reorderModules.url(args, options),
    method: 'patch',
})

reorderModules.definition = {
    methods: ["patch"],
    url: '/teaching/{trainingPath}/modules/reorder',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\TeachingController::reorderModules
 * @see app/Http/Controllers/TeachingController.php:316
 * @route '/teaching/{trainingPath}/modules/reorder'
 */
reorderModules.url = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingPath: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { trainingPath: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    trainingPath: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPath: typeof args.trainingPath === 'object'
                ? args.trainingPath.id
                : args.trainingPath,
                }

    return reorderModules.definition.url
            .replace('{trainingPath}', parsedArgs.trainingPath.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeachingController::reorderModules
 * @see app/Http/Controllers/TeachingController.php:316
 * @route '/teaching/{trainingPath}/modules/reorder'
 */
reorderModules.patch = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: reorderModules.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\TeachingController::reorderModules
 * @see app/Http/Controllers/TeachingController.php:316
 * @route '/teaching/{trainingPath}/modules/reorder'
 */
    const reorderModulesForm = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reorderModules.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TeachingController::reorderModules
 * @see app/Http/Controllers/TeachingController.php:316
 * @route '/teaching/{trainingPath}/modules/reorder'
 */
        reorderModulesForm.patch = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reorderModules.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    reorderModules.form = reorderModulesForm
/**
* @see \App\Http\Controllers\TeachingController::updateModule
 * @see app/Http/Controllers/TeachingController.php:288
 * @route '/teaching/{trainingPath}/modules/{module}'
 */
export const updateModule = (args: { trainingPath: number | { id: number }, module: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateModule.url(args, options),
    method: 'patch',
})

updateModule.definition = {
    methods: ["patch"],
    url: '/teaching/{trainingPath}/modules/{module}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\TeachingController::updateModule
 * @see app/Http/Controllers/TeachingController.php:288
 * @route '/teaching/{trainingPath}/modules/{module}'
 */
updateModule.url = (args: { trainingPath: number | { id: number }, module: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    trainingPath: args[0],
                    module: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPath: typeof args.trainingPath === 'object'
                ? args.trainingPath.id
                : args.trainingPath,
                                module: typeof args.module === 'object'
                ? args.module.id
                : args.module,
                }

    return updateModule.definition.url
            .replace('{trainingPath}', parsedArgs.trainingPath.toString())
            .replace('{module}', parsedArgs.module.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeachingController::updateModule
 * @see app/Http/Controllers/TeachingController.php:288
 * @route '/teaching/{trainingPath}/modules/{module}'
 */
updateModule.patch = (args: { trainingPath: number | { id: number }, module: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateModule.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\TeachingController::updateModule
 * @see app/Http/Controllers/TeachingController.php:288
 * @route '/teaching/{trainingPath}/modules/{module}'
 */
    const updateModuleForm = (args: { trainingPath: number | { id: number }, module: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateModule.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TeachingController::updateModule
 * @see app/Http/Controllers/TeachingController.php:288
 * @route '/teaching/{trainingPath}/modules/{module}'
 */
        updateModuleForm.patch = (args: { trainingPath: number | { id: number }, module: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateModule.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateModule.form = updateModuleForm
/**
* @see \App\Http\Controllers\TeachingController::destroyModule
 * @see app/Http/Controllers/TeachingController.php:302
 * @route '/teaching/{trainingPath}/modules/{module}'
 */
export const destroyModule = (args: { trainingPath: number | { id: number }, module: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyModule.url(args, options),
    method: 'delete',
})

destroyModule.definition = {
    methods: ["delete"],
    url: '/teaching/{trainingPath}/modules/{module}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\TeachingController::destroyModule
 * @see app/Http/Controllers/TeachingController.php:302
 * @route '/teaching/{trainingPath}/modules/{module}'
 */
destroyModule.url = (args: { trainingPath: number | { id: number }, module: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    trainingPath: args[0],
                    module: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPath: typeof args.trainingPath === 'object'
                ? args.trainingPath.id
                : args.trainingPath,
                                module: typeof args.module === 'object'
                ? args.module.id
                : args.module,
                }

    return destroyModule.definition.url
            .replace('{trainingPath}', parsedArgs.trainingPath.toString())
            .replace('{module}', parsedArgs.module.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeachingController::destroyModule
 * @see app/Http/Controllers/TeachingController.php:302
 * @route '/teaching/{trainingPath}/modules/{module}'
 */
destroyModule.delete = (args: { trainingPath: number | { id: number }, module: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyModule.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\TeachingController::destroyModule
 * @see app/Http/Controllers/TeachingController.php:302
 * @route '/teaching/{trainingPath}/modules/{module}'
 */
    const destroyModuleForm = (args: { trainingPath: number | { id: number }, module: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroyModule.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TeachingController::destroyModule
 * @see app/Http/Controllers/TeachingController.php:302
 * @route '/teaching/{trainingPath}/modules/{module}'
 */
        destroyModuleForm.delete = (args: { trainingPath: number | { id: number }, module: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroyModule.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroyModule.form = destroyModuleForm
/**
* @see \App\Http\Controllers\TeachingController::editTrainingUnit
 * @see app/Http/Controllers/TeachingController.php:330
 * @route '/teaching/{trainingPathId}/module/{moduleId}/trainingUnit/{trainingUnitId}'
 */
export const editTrainingUnit = (args: { trainingPathId: string | number, moduleId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, moduleId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: editTrainingUnit.url(args, options),
    method: 'get',
})

editTrainingUnit.definition = {
    methods: ["get","head"],
    url: '/teaching/{trainingPathId}/module/{moduleId}/trainingUnit/{trainingUnitId}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TeachingController::editTrainingUnit
 * @see app/Http/Controllers/TeachingController.php:330
 * @route '/teaching/{trainingPathId}/module/{moduleId}/trainingUnit/{trainingUnitId}'
 */
editTrainingUnit.url = (args: { trainingPathId: string | number, moduleId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, moduleId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    trainingPathId: args[0],
                    moduleId: args[1],
                    trainingUnitId: args[2],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPathId: args.trainingPathId,
                                moduleId: args.moduleId,
                                trainingUnitId: args.trainingUnitId,
                }

    return editTrainingUnit.definition.url
            .replace('{trainingPathId}', parsedArgs.trainingPathId.toString())
            .replace('{moduleId}', parsedArgs.moduleId.toString())
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeachingController::editTrainingUnit
 * @see app/Http/Controllers/TeachingController.php:330
 * @route '/teaching/{trainingPathId}/module/{moduleId}/trainingUnit/{trainingUnitId}'
 */
editTrainingUnit.get = (args: { trainingPathId: string | number, moduleId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, moduleId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: editTrainingUnit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TeachingController::editTrainingUnit
 * @see app/Http/Controllers/TeachingController.php:330
 * @route '/teaching/{trainingPathId}/module/{moduleId}/trainingUnit/{trainingUnitId}'
 */
editTrainingUnit.head = (args: { trainingPathId: string | number, moduleId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, moduleId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: editTrainingUnit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TeachingController::editTrainingUnit
 * @see app/Http/Controllers/TeachingController.php:330
 * @route '/teaching/{trainingPathId}/module/{moduleId}/trainingUnit/{trainingUnitId}'
 */
    const editTrainingUnitForm = (args: { trainingPathId: string | number, moduleId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, moduleId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: editTrainingUnit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TeachingController::editTrainingUnit
 * @see app/Http/Controllers/TeachingController.php:330
 * @route '/teaching/{trainingPathId}/module/{moduleId}/trainingUnit/{trainingUnitId}'
 */
        editTrainingUnitForm.get = (args: { trainingPathId: string | number, moduleId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, moduleId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: editTrainingUnit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TeachingController::editTrainingUnit
 * @see app/Http/Controllers/TeachingController.php:330
 * @route '/teaching/{trainingPathId}/module/{moduleId}/trainingUnit/{trainingUnitId}'
 */
        editTrainingUnitForm.head = (args: { trainingPathId: string | number, moduleId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, moduleId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: editTrainingUnit.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    editTrainingUnit.form = editTrainingUnitForm
/**
* @see \App\Http\Controllers\TeachingController::storeTrainingUnit
 * @see app/Http/Controllers/TeachingController.php:370
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits'
 */
export const storeTrainingUnit = (args: { trainingPath: number | { id: number }, module: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeTrainingUnit.url(args, options),
    method: 'post',
})

storeTrainingUnit.definition = {
    methods: ["post"],
    url: '/teaching/{trainingPath}/modules/{module}/trainingUnits',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TeachingController::storeTrainingUnit
 * @see app/Http/Controllers/TeachingController.php:370
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits'
 */
storeTrainingUnit.url = (args: { trainingPath: number | { id: number }, module: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    trainingPath: args[0],
                    module: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPath: typeof args.trainingPath === 'object'
                ? args.trainingPath.id
                : args.trainingPath,
                                module: typeof args.module === 'object'
                ? args.module.id
                : args.module,
                }

    return storeTrainingUnit.definition.url
            .replace('{trainingPath}', parsedArgs.trainingPath.toString())
            .replace('{module}', parsedArgs.module.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeachingController::storeTrainingUnit
 * @see app/Http/Controllers/TeachingController.php:370
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits'
 */
storeTrainingUnit.post = (args: { trainingPath: number | { id: number }, module: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeTrainingUnit.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\TeachingController::storeTrainingUnit
 * @see app/Http/Controllers/TeachingController.php:370
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits'
 */
    const storeTrainingUnitForm = (args: { trainingPath: number | { id: number }, module: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: storeTrainingUnit.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TeachingController::storeTrainingUnit
 * @see app/Http/Controllers/TeachingController.php:370
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits'
 */
        storeTrainingUnitForm.post = (args: { trainingPath: number | { id: number }, module: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: storeTrainingUnit.url(args, options),
            method: 'post',
        })
    
    storeTrainingUnit.form = storeTrainingUnitForm
/**
* @see \App\Http\Controllers\TeachingController::reorderTrainingUnits
 * @see app/Http/Controllers/TeachingController.php:412
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits/reorder'
 */
export const reorderTrainingUnits = (args: { trainingPath: number | { id: number }, module: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: reorderTrainingUnits.url(args, options),
    method: 'patch',
})

reorderTrainingUnits.definition = {
    methods: ["patch"],
    url: '/teaching/{trainingPath}/modules/{module}/trainingUnits/reorder',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\TeachingController::reorderTrainingUnits
 * @see app/Http/Controllers/TeachingController.php:412
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits/reorder'
 */
reorderTrainingUnits.url = (args: { trainingPath: number | { id: number }, module: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    trainingPath: args[0],
                    module: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPath: typeof args.trainingPath === 'object'
                ? args.trainingPath.id
                : args.trainingPath,
                                module: typeof args.module === 'object'
                ? args.module.id
                : args.module,
                }

    return reorderTrainingUnits.definition.url
            .replace('{trainingPath}', parsedArgs.trainingPath.toString())
            .replace('{module}', parsedArgs.module.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeachingController::reorderTrainingUnits
 * @see app/Http/Controllers/TeachingController.php:412
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits/reorder'
 */
reorderTrainingUnits.patch = (args: { trainingPath: number | { id: number }, module: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: reorderTrainingUnits.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\TeachingController::reorderTrainingUnits
 * @see app/Http/Controllers/TeachingController.php:412
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits/reorder'
 */
    const reorderTrainingUnitsForm = (args: { trainingPath: number | { id: number }, module: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reorderTrainingUnits.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TeachingController::reorderTrainingUnits
 * @see app/Http/Controllers/TeachingController.php:412
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits/reorder'
 */
        reorderTrainingUnitsForm.patch = (args: { trainingPath: number | { id: number }, module: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reorderTrainingUnits.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    reorderTrainingUnits.form = reorderTrainingUnitsForm
/**
* @see \App\Http\Controllers\TeachingController::updateTrainingUnit
 * @see app/Http/Controllers/TeachingController.php:384
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits/{trainingUnit}'
 */
export const updateTrainingUnit = (args: { trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateTrainingUnit.url(args, options),
    method: 'patch',
})

updateTrainingUnit.definition = {
    methods: ["patch"],
    url: '/teaching/{trainingPath}/modules/{module}/trainingUnits/{trainingUnit}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\TeachingController::updateTrainingUnit
 * @see app/Http/Controllers/TeachingController.php:384
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits/{trainingUnit}'
 */
updateTrainingUnit.url = (args: { trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    trainingPath: args[0],
                    module: args[1],
                    trainingUnit: args[2],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPath: typeof args.trainingPath === 'object'
                ? args.trainingPath.id
                : args.trainingPath,
                                module: typeof args.module === 'object'
                ? args.module.id
                : args.module,
                                trainingUnit: typeof args.trainingUnit === 'object'
                ? args.trainingUnit.id
                : args.trainingUnit,
                }

    return updateTrainingUnit.definition.url
            .replace('{trainingPath}', parsedArgs.trainingPath.toString())
            .replace('{module}', parsedArgs.module.toString())
            .replace('{trainingUnit}', parsedArgs.trainingUnit.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeachingController::updateTrainingUnit
 * @see app/Http/Controllers/TeachingController.php:384
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits/{trainingUnit}'
 */
updateTrainingUnit.patch = (args: { trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateTrainingUnit.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\TeachingController::updateTrainingUnit
 * @see app/Http/Controllers/TeachingController.php:384
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits/{trainingUnit}'
 */
    const updateTrainingUnitForm = (args: { trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateTrainingUnit.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TeachingController::updateTrainingUnit
 * @see app/Http/Controllers/TeachingController.php:384
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits/{trainingUnit}'
 */
        updateTrainingUnitForm.patch = (args: { trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateTrainingUnit.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateTrainingUnit.form = updateTrainingUnitForm
/**
* @see \App\Http\Controllers\TeachingController::destroyTrainingUnit
 * @see app/Http/Controllers/TeachingController.php:398
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits/{trainingUnit}'
 */
export const destroyTrainingUnit = (args: { trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyTrainingUnit.url(args, options),
    method: 'delete',
})

destroyTrainingUnit.definition = {
    methods: ["delete"],
    url: '/teaching/{trainingPath}/modules/{module}/trainingUnits/{trainingUnit}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\TeachingController::destroyTrainingUnit
 * @see app/Http/Controllers/TeachingController.php:398
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits/{trainingUnit}'
 */
destroyTrainingUnit.url = (args: { trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    trainingPath: args[0],
                    module: args[1],
                    trainingUnit: args[2],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPath: typeof args.trainingPath === 'object'
                ? args.trainingPath.id
                : args.trainingPath,
                                module: typeof args.module === 'object'
                ? args.module.id
                : args.module,
                                trainingUnit: typeof args.trainingUnit === 'object'
                ? args.trainingUnit.id
                : args.trainingUnit,
                }

    return destroyTrainingUnit.definition.url
            .replace('{trainingPath}', parsedArgs.trainingPath.toString())
            .replace('{module}', parsedArgs.module.toString())
            .replace('{trainingUnit}', parsedArgs.trainingUnit.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeachingController::destroyTrainingUnit
 * @see app/Http/Controllers/TeachingController.php:398
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits/{trainingUnit}'
 */
destroyTrainingUnit.delete = (args: { trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyTrainingUnit.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\TeachingController::destroyTrainingUnit
 * @see app/Http/Controllers/TeachingController.php:398
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits/{trainingUnit}'
 */
    const destroyTrainingUnitForm = (args: { trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroyTrainingUnit.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TeachingController::destroyTrainingUnit
 * @see app/Http/Controllers/TeachingController.php:398
 * @route '/teaching/{trainingPath}/modules/{module}/trainingUnits/{trainingUnit}'
 */
        destroyTrainingUnitForm.delete = (args: { trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } } | [trainingPath: number | { id: number }, module: number | { id: number }, trainingUnit: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroyTrainingUnit.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroyTrainingUnit.form = destroyTrainingUnitForm
const TeachingController = { index, create, store, edit, update, destroy, submitForReview, archive, restore, storeModule, reorderModules, updateModule, destroyModule, editTrainingUnit, storeTrainingUnit, reorderTrainingUnits, updateTrainingUnit, destroyTrainingUnit }

export default TeachingController