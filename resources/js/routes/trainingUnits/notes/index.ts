import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\TrainingUnitNoteController::index
 * @see app/Http/Controllers/TrainingUnitNoteController.php:21
 * @route '/trainingUnits/{trainingUnitId}/notes'
 */
export const index = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/trainingUnits/{trainingUnitId}/notes',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TrainingUnitNoteController::index
 * @see app/Http/Controllers/TrainingUnitNoteController.php:21
 * @route '/trainingUnits/{trainingUnitId}/notes'
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
* @see \App\Http\Controllers\TrainingUnitNoteController::index
 * @see app/Http/Controllers/TrainingUnitNoteController.php:21
 * @route '/trainingUnits/{trainingUnitId}/notes'
 */
index.get = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TrainingUnitNoteController::index
 * @see app/Http/Controllers/TrainingUnitNoteController.php:21
 * @route '/trainingUnits/{trainingUnitId}/notes'
 */
index.head = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TrainingUnitNoteController::index
 * @see app/Http/Controllers/TrainingUnitNoteController.php:21
 * @route '/trainingUnits/{trainingUnitId}/notes'
 */
    const indexForm = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TrainingUnitNoteController::index
 * @see app/Http/Controllers/TrainingUnitNoteController.php:21
 * @route '/trainingUnits/{trainingUnitId}/notes'
 */
        indexForm.get = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TrainingUnitNoteController::index
 * @see app/Http/Controllers/TrainingUnitNoteController.php:21
 * @route '/trainingUnits/{trainingUnitId}/notes'
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
* @see \App\Http\Controllers\TrainingUnitNoteController::store
 * @see app/Http/Controllers/TrainingUnitNoteController.php:51
 * @route '/trainingUnits/{trainingUnitId}/notes'
 */
export const store = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/trainingUnits/{trainingUnitId}/notes',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TrainingUnitNoteController::store
 * @see app/Http/Controllers/TrainingUnitNoteController.php:51
 * @route '/trainingUnits/{trainingUnitId}/notes'
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
* @see \App\Http\Controllers\TrainingUnitNoteController::store
 * @see app/Http/Controllers/TrainingUnitNoteController.php:51
 * @route '/trainingUnits/{trainingUnitId}/notes'
 */
store.post = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\TrainingUnitNoteController::store
 * @see app/Http/Controllers/TrainingUnitNoteController.php:51
 * @route '/trainingUnits/{trainingUnitId}/notes'
 */
    const storeForm = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TrainingUnitNoteController::store
 * @see app/Http/Controllers/TrainingUnitNoteController.php:51
 * @route '/trainingUnits/{trainingUnitId}/notes'
 */
        storeForm.post = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\TrainingUnitNoteController::update
 * @see app/Http/Controllers/TrainingUnitNoteController.php:69
 * @route '/trainingUnits/{trainingUnitId}/notes/{noteId}'
 */
export const update = (args: { trainingUnitId: string | number, noteId: string | number } | [trainingUnitId: string | number, noteId: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/trainingUnits/{trainingUnitId}/notes/{noteId}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\TrainingUnitNoteController::update
 * @see app/Http/Controllers/TrainingUnitNoteController.php:69
 * @route '/trainingUnits/{trainingUnitId}/notes/{noteId}'
 */
update.url = (args: { trainingUnitId: string | number, noteId: string | number } | [trainingUnitId: string | number, noteId: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    trainingUnitId: args[0],
                    noteId: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingUnitId: args.trainingUnitId,
                                noteId: args.noteId,
                }

    return update.definition.url
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace('{noteId}', parsedArgs.noteId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingUnitNoteController::update
 * @see app/Http/Controllers/TrainingUnitNoteController.php:69
 * @route '/trainingUnits/{trainingUnitId}/notes/{noteId}'
 */
update.put = (args: { trainingUnitId: string | number, noteId: string | number } | [trainingUnitId: string | number, noteId: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\TrainingUnitNoteController::update
 * @see app/Http/Controllers/TrainingUnitNoteController.php:69
 * @route '/trainingUnits/{trainingUnitId}/notes/{noteId}'
 */
    const updateForm = (args: { trainingUnitId: string | number, noteId: string | number } | [trainingUnitId: string | number, noteId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TrainingUnitNoteController::update
 * @see app/Http/Controllers/TrainingUnitNoteController.php:69
 * @route '/trainingUnits/{trainingUnitId}/notes/{noteId}'
 */
        updateForm.put = (args: { trainingUnitId: string | number, noteId: string | number } | [trainingUnitId: string | number, noteId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\TrainingUnitNoteController::destroy
 * @see app/Http/Controllers/TrainingUnitNoteController.php:87
 * @route '/trainingUnits/{trainingUnitId}/notes/{noteId}'
 */
export const destroy = (args: { trainingUnitId: string | number, noteId: string | number } | [trainingUnitId: string | number, noteId: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/trainingUnits/{trainingUnitId}/notes/{noteId}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\TrainingUnitNoteController::destroy
 * @see app/Http/Controllers/TrainingUnitNoteController.php:87
 * @route '/trainingUnits/{trainingUnitId}/notes/{noteId}'
 */
destroy.url = (args: { trainingUnitId: string | number, noteId: string | number } | [trainingUnitId: string | number, noteId: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    trainingUnitId: args[0],
                    noteId: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingUnitId: args.trainingUnitId,
                                noteId: args.noteId,
                }

    return destroy.definition.url
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace('{noteId}', parsedArgs.noteId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingUnitNoteController::destroy
 * @see app/Http/Controllers/TrainingUnitNoteController.php:87
 * @route '/trainingUnits/{trainingUnitId}/notes/{noteId}'
 */
destroy.delete = (args: { trainingUnitId: string | number, noteId: string | number } | [trainingUnitId: string | number, noteId: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\TrainingUnitNoteController::destroy
 * @see app/Http/Controllers/TrainingUnitNoteController.php:87
 * @route '/trainingUnits/{trainingUnitId}/notes/{noteId}'
 */
    const destroyForm = (args: { trainingUnitId: string | number, noteId: string | number } | [trainingUnitId: string | number, noteId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TrainingUnitNoteController::destroy
 * @see app/Http/Controllers/TrainingUnitNoteController.php:87
 * @route '/trainingUnits/{trainingUnitId}/notes/{noteId}'
 */
        destroyForm.delete = (args: { trainingUnitId: string | number, noteId: string | number } | [trainingUnitId: string | number, noteId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const notes = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default notes