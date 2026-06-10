import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
import modules from './modules'
import trainingUnit from './trainingUnit'
import trainingUnits from './trainingUnits'
import quiz from './quiz'
import article from './article'
import video from './video'
import forum from './forum'
import analytics from './analytics'
import payouts from './payouts'
import trainingUnitAssignments from './trainingUnit-assignments'
/**
 * @see routes/teaching.php:16
 * @route '/teaching'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/teaching',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/teaching.php:16
 * @route '/teaching'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
 * @see routes/teaching.php:16
 * @route '/teaching'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
 * @see routes/teaching.php:16
 * @route '/teaching'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
 * @see routes/teaching.php:16
 * @route '/teaching'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
 * @see routes/teaching.php:16
 * @route '/teaching'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
 * @see routes/teaching.php:16
 * @route '/teaching'
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
* @see \App\Http\Controllers\TeachingController::trainingPaths
 * @see app/Http/Controllers/TeachingController.php:47
 * @route '/teaching/training-paths'
 */
export const trainingPaths = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: trainingPaths.url(options),
    method: 'get',
})

trainingPaths.definition = {
    methods: ["get","head"],
    url: '/teaching/training-paths',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TeachingController::trainingPaths
 * @see app/Http/Controllers/TeachingController.php:47
 * @route '/teaching/training-paths'
 */
trainingPaths.url = (options?: RouteQueryOptions) => {
    return trainingPaths.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeachingController::trainingPaths
 * @see app/Http/Controllers/TeachingController.php:47
 * @route '/teaching/training-paths'
 */
trainingPaths.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: trainingPaths.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TeachingController::trainingPaths
 * @see app/Http/Controllers/TeachingController.php:47
 * @route '/teaching/training-paths'
 */
trainingPaths.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: trainingPaths.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TeachingController::trainingPaths
 * @see app/Http/Controllers/TeachingController.php:47
 * @route '/teaching/training-paths'
 */
    const trainingPathsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: trainingPaths.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TeachingController::trainingPaths
 * @see app/Http/Controllers/TeachingController.php:47
 * @route '/teaching/training-paths'
 */
        trainingPathsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: trainingPaths.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TeachingController::trainingPaths
 * @see app/Http/Controllers/TeachingController.php:47
 * @route '/teaching/training-paths'
 */
        trainingPathsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: trainingPaths.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    trainingPaths.form = trainingPathsForm
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
* @see \App\Http\Controllers\TeachingController::submit
 * @see app/Http/Controllers/TeachingController.php:252
 * @route '/teaching/{trainingPath}/submit'
 */
export const submit = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: submit.url(args, options),
    method: 'post',
})

submit.definition = {
    methods: ["post"],
    url: '/teaching/{trainingPath}/submit',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TeachingController::submit
 * @see app/Http/Controllers/TeachingController.php:252
 * @route '/teaching/{trainingPath}/submit'
 */
submit.url = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return submit.definition.url
            .replace('{trainingPath}', parsedArgs.trainingPath.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeachingController::submit
 * @see app/Http/Controllers/TeachingController.php:252
 * @route '/teaching/{trainingPath}/submit'
 */
submit.post = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: submit.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\TeachingController::submit
 * @see app/Http/Controllers/TeachingController.php:252
 * @route '/teaching/{trainingPath}/submit'
 */
    const submitForm = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: submit.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TeachingController::submit
 * @see app/Http/Controllers/TeachingController.php:252
 * @route '/teaching/{trainingPath}/submit'
 */
        submitForm.post = (args: { trainingPath: number | { id: number } } | [trainingPath: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: submit.url(args, options),
            method: 'post',
        })
    
    submit.form = submitForm
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
const teaching = {
    index: Object.assign(index, index),
trainingPaths: Object.assign(trainingPaths, trainingPaths),
create: Object.assign(create, create),
store: Object.assign(store, store),
edit: Object.assign(edit, edit),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
submit: Object.assign(submit, submit),
archive: Object.assign(archive, archive),
restore: Object.assign(restore, restore),
modules: Object.assign(modules, modules),
trainingUnit: Object.assign(trainingUnit, trainingUnit),
trainingUnits: Object.assign(trainingUnits, trainingUnits),
quiz: Object.assign(quiz, quiz),
article: Object.assign(article, article),
video: Object.assign(video, video),
forum: Object.assign(forum, forum),
analytics: Object.assign(analytics, analytics),
payouts: Object.assign(payouts, payouts),
trainingUnitAssignments: Object.assign(trainingUnitAssignments, trainingUnitAssignments),
}

export default teaching