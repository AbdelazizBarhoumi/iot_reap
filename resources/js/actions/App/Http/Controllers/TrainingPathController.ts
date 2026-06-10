import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\TrainingPathController::index
 * @see app/Http/Controllers/TrainingPathController.php:35
 * @route '/trainingPaths'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/trainingPaths',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TrainingPathController::index
 * @see app/Http/Controllers/TrainingPathController.php:35
 * @route '/trainingPaths'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingPathController::index
 * @see app/Http/Controllers/TrainingPathController.php:35
 * @route '/trainingPaths'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TrainingPathController::index
 * @see app/Http/Controllers/TrainingPathController.php:35
 * @route '/trainingPaths'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TrainingPathController::index
 * @see app/Http/Controllers/TrainingPathController.php:35
 * @route '/trainingPaths'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TrainingPathController::index
 * @see app/Http/Controllers/TrainingPathController.php:35
 * @route '/trainingPaths'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TrainingPathController::index
 * @see app/Http/Controllers/TrainingPathController.php:35
 * @route '/trainingPaths'
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
* @see \App\Http\Controllers\TrainingPathController::show
 * @see app/Http/Controllers/TrainingPathController.php:70
 * @route '/trainingPaths/{id}'
 */
export const show = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/trainingPaths/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TrainingPathController::show
 * @see app/Http/Controllers/TrainingPathController.php:70
 * @route '/trainingPaths/{id}'
 */
show.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingPathController::show
 * @see app/Http/Controllers/TrainingPathController.php:70
 * @route '/trainingPaths/{id}'
 */
show.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TrainingPathController::show
 * @see app/Http/Controllers/TrainingPathController.php:70
 * @route '/trainingPaths/{id}'
 */
show.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TrainingPathController::show
 * @see app/Http/Controllers/TrainingPathController.php:70
 * @route '/trainingPaths/{id}'
 */
    const showForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TrainingPathController::show
 * @see app/Http/Controllers/TrainingPathController.php:70
 * @route '/trainingPaths/{id}'
 */
        showForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TrainingPathController::show
 * @see app/Http/Controllers/TrainingPathController.php:70
 * @route '/trainingPaths/{id}'
 */
        showForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\TrainingPathController::myTrainingPaths
 * @see app/Http/Controllers/TrainingPathController.php:289
 * @route '/my-trainingPaths'
 */
export const myTrainingPaths = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: myTrainingPaths.url(options),
    method: 'get',
})

myTrainingPaths.definition = {
    methods: ["get","head"],
    url: '/my-trainingPaths',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TrainingPathController::myTrainingPaths
 * @see app/Http/Controllers/TrainingPathController.php:289
 * @route '/my-trainingPaths'
 */
myTrainingPaths.url = (options?: RouteQueryOptions) => {
    return myTrainingPaths.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingPathController::myTrainingPaths
 * @see app/Http/Controllers/TrainingPathController.php:289
 * @route '/my-trainingPaths'
 */
myTrainingPaths.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: myTrainingPaths.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TrainingPathController::myTrainingPaths
 * @see app/Http/Controllers/TrainingPathController.php:289
 * @route '/my-trainingPaths'
 */
myTrainingPaths.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: myTrainingPaths.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TrainingPathController::myTrainingPaths
 * @see app/Http/Controllers/TrainingPathController.php:289
 * @route '/my-trainingPaths'
 */
    const myTrainingPathsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: myTrainingPaths.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TrainingPathController::myTrainingPaths
 * @see app/Http/Controllers/TrainingPathController.php:289
 * @route '/my-trainingPaths'
 */
        myTrainingPathsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: myTrainingPaths.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TrainingPathController::myTrainingPaths
 * @see app/Http/Controllers/TrainingPathController.php:289
 * @route '/my-trainingPaths'
 */
        myTrainingPathsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: myTrainingPaths.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    myTrainingPaths.form = myTrainingPathsForm
/**
* @see \App\Http\Controllers\TrainingPathController::trainingUnit
 * @see app/Http/Controllers/TrainingPathController.php:113
 * @route '/trainingPaths/{trainingPathId}/trainingUnit/{trainingUnitId}'
 */
export const trainingUnit = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: trainingUnit.url(args, options),
    method: 'get',
})

trainingUnit.definition = {
    methods: ["get","head"],
    url: '/trainingPaths/{trainingPathId}/trainingUnit/{trainingUnitId}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TrainingPathController::trainingUnit
 * @see app/Http/Controllers/TrainingPathController.php:113
 * @route '/trainingPaths/{trainingPathId}/trainingUnit/{trainingUnitId}'
 */
trainingUnit.url = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    trainingPathId: args[0],
                    trainingUnitId: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPathId: args.trainingPathId,
                                trainingUnitId: args.trainingUnitId,
                }

    return trainingUnit.definition.url
            .replace('{trainingPathId}', parsedArgs.trainingPathId.toString())
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingPathController::trainingUnit
 * @see app/Http/Controllers/TrainingPathController.php:113
 * @route '/trainingPaths/{trainingPathId}/trainingUnit/{trainingUnitId}'
 */
trainingUnit.get = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: trainingUnit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TrainingPathController::trainingUnit
 * @see app/Http/Controllers/TrainingPathController.php:113
 * @route '/trainingPaths/{trainingPathId}/trainingUnit/{trainingUnitId}'
 */
trainingUnit.head = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: trainingUnit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TrainingPathController::trainingUnit
 * @see app/Http/Controllers/TrainingPathController.php:113
 * @route '/trainingPaths/{trainingPathId}/trainingUnit/{trainingUnitId}'
 */
    const trainingUnitForm = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: trainingUnit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TrainingPathController::trainingUnit
 * @see app/Http/Controllers/TrainingPathController.php:113
 * @route '/trainingPaths/{trainingPathId}/trainingUnit/{trainingUnitId}'
 */
        trainingUnitForm.get = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: trainingUnit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TrainingPathController::trainingUnit
 * @see app/Http/Controllers/TrainingPathController.php:113
 * @route '/trainingPaths/{trainingPathId}/trainingUnit/{trainingUnitId}'
 */
        trainingUnitForm.head = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: trainingUnit.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    trainingUnit.form = trainingUnitForm
/**
* @see \App\Http\Controllers\TrainingPathController::enroll
 * @see app/Http/Controllers/TrainingPathController.php:176
 * @route '/trainingPaths/{id}/enroll'
 */
export const enroll = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: enroll.url(args, options),
    method: 'post',
})

enroll.definition = {
    methods: ["post"],
    url: '/trainingPaths/{id}/enroll',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TrainingPathController::enroll
 * @see app/Http/Controllers/TrainingPathController.php:176
 * @route '/trainingPaths/{id}/enroll'
 */
enroll.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return enroll.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingPathController::enroll
 * @see app/Http/Controllers/TrainingPathController.php:176
 * @route '/trainingPaths/{id}/enroll'
 */
enroll.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: enroll.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\TrainingPathController::enroll
 * @see app/Http/Controllers/TrainingPathController.php:176
 * @route '/trainingPaths/{id}/enroll'
 */
    const enrollForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: enroll.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TrainingPathController::enroll
 * @see app/Http/Controllers/TrainingPathController.php:176
 * @route '/trainingPaths/{id}/enroll'
 */
        enrollForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: enroll.url(args, options),
            method: 'post',
        })
    
    enroll.form = enrollForm
/**
* @see \App\Http\Controllers\TrainingPathController::unenroll
 * @see app/Http/Controllers/TrainingPathController.php:194
 * @route '/trainingPaths/{id}/enroll'
 */
export const unenroll = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: unenroll.url(args, options),
    method: 'delete',
})

unenroll.definition = {
    methods: ["delete"],
    url: '/trainingPaths/{id}/enroll',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\TrainingPathController::unenroll
 * @see app/Http/Controllers/TrainingPathController.php:194
 * @route '/trainingPaths/{id}/enroll'
 */
unenroll.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return unenroll.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingPathController::unenroll
 * @see app/Http/Controllers/TrainingPathController.php:194
 * @route '/trainingPaths/{id}/enroll'
 */
unenroll.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: unenroll.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\TrainingPathController::unenroll
 * @see app/Http/Controllers/TrainingPathController.php:194
 * @route '/trainingPaths/{id}/enroll'
 */
    const unenrollForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: unenroll.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TrainingPathController::unenroll
 * @see app/Http/Controllers/TrainingPathController.php:194
 * @route '/trainingPaths/{id}/enroll'
 */
        unenrollForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: unenroll.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    unenroll.form = unenrollForm
/**
* @see \App\Http\Controllers\TrainingPathController::markTrainingUnitComplete
 * @see app/Http/Controllers/TrainingPathController.php:205
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/complete'
 */
export const markTrainingUnitComplete = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markTrainingUnitComplete.url(args, options),
    method: 'post',
})

markTrainingUnitComplete.definition = {
    methods: ["post"],
    url: '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/complete',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TrainingPathController::markTrainingUnitComplete
 * @see app/Http/Controllers/TrainingPathController.php:205
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/complete'
 */
markTrainingUnitComplete.url = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    trainingPathId: args[0],
                    trainingUnitId: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPathId: args.trainingPathId,
                                trainingUnitId: args.trainingUnitId,
                }

    return markTrainingUnitComplete.definition.url
            .replace('{trainingPathId}', parsedArgs.trainingPathId.toString())
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingPathController::markTrainingUnitComplete
 * @see app/Http/Controllers/TrainingPathController.php:205
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/complete'
 */
markTrainingUnitComplete.post = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markTrainingUnitComplete.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\TrainingPathController::markTrainingUnitComplete
 * @see app/Http/Controllers/TrainingPathController.php:205
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/complete'
 */
    const markTrainingUnitCompleteForm = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: markTrainingUnitComplete.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TrainingPathController::markTrainingUnitComplete
 * @see app/Http/Controllers/TrainingPathController.php:205
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/complete'
 */
        markTrainingUnitCompleteForm.post = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: markTrainingUnitComplete.url(args, options),
            method: 'post',
        })
    
    markTrainingUnitComplete.form = markTrainingUnitCompleteForm
/**
* @see \App\Http\Controllers\TrainingPathController::markTrainingUnitIncomplete
 * @see app/Http/Controllers/TrainingPathController.php:222
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/complete'
 */
export const markTrainingUnitIncomplete = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: markTrainingUnitIncomplete.url(args, options),
    method: 'delete',
})

markTrainingUnitIncomplete.definition = {
    methods: ["delete"],
    url: '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/complete',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\TrainingPathController::markTrainingUnitIncomplete
 * @see app/Http/Controllers/TrainingPathController.php:222
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/complete'
 */
markTrainingUnitIncomplete.url = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    trainingPathId: args[0],
                    trainingUnitId: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPathId: args.trainingPathId,
                                trainingUnitId: args.trainingUnitId,
                }

    return markTrainingUnitIncomplete.definition.url
            .replace('{trainingPathId}', parsedArgs.trainingPathId.toString())
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingPathController::markTrainingUnitIncomplete
 * @see app/Http/Controllers/TrainingPathController.php:222
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/complete'
 */
markTrainingUnitIncomplete.delete = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: markTrainingUnitIncomplete.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\TrainingPathController::markTrainingUnitIncomplete
 * @see app/Http/Controllers/TrainingPathController.php:222
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/complete'
 */
    const markTrainingUnitIncompleteForm = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: markTrainingUnitIncomplete.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TrainingPathController::markTrainingUnitIncomplete
 * @see app/Http/Controllers/TrainingPathController.php:222
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/complete'
 */
        markTrainingUnitIncompleteForm.delete = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: markTrainingUnitIncomplete.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    markTrainingUnitIncomplete.form = markTrainingUnitIncompleteForm
/**
* @see \App\Http\Controllers\TrainingPathController::updateVideoProgress
 * @see app/Http/Controllers/TrainingPathController.php:239
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/video-progress'
 */
export const updateVideoProgress = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateVideoProgress.url(args, options),
    method: 'post',
})

updateVideoProgress.definition = {
    methods: ["post"],
    url: '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/video-progress',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TrainingPathController::updateVideoProgress
 * @see app/Http/Controllers/TrainingPathController.php:239
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/video-progress'
 */
updateVideoProgress.url = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    trainingPathId: args[0],
                    trainingUnitId: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPathId: args.trainingPathId,
                                trainingUnitId: args.trainingUnitId,
                }

    return updateVideoProgress.definition.url
            .replace('{trainingPathId}', parsedArgs.trainingPathId.toString())
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingPathController::updateVideoProgress
 * @see app/Http/Controllers/TrainingPathController.php:239
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/video-progress'
 */
updateVideoProgress.post = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateVideoProgress.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\TrainingPathController::updateVideoProgress
 * @see app/Http/Controllers/TrainingPathController.php:239
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/video-progress'
 */
    const updateVideoProgressForm = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateVideoProgress.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TrainingPathController::updateVideoProgress
 * @see app/Http/Controllers/TrainingPathController.php:239
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/video-progress'
 */
        updateVideoProgressForm.post = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateVideoProgress.url(args, options),
            method: 'post',
        })
    
    updateVideoProgress.form = updateVideoProgressForm
/**
* @see \App\Http\Controllers\TrainingPathController::markArticleRead
 * @see app/Http/Controllers/TrainingPathController.php:268
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/article-read'
 */
export const markArticleRead = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markArticleRead.url(args, options),
    method: 'post',
})

markArticleRead.definition = {
    methods: ["post"],
    url: '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/article-read',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TrainingPathController::markArticleRead
 * @see app/Http/Controllers/TrainingPathController.php:268
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/article-read'
 */
markArticleRead.url = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    trainingPathId: args[0],
                    trainingUnitId: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPathId: args.trainingPathId,
                                trainingUnitId: args.trainingUnitId,
                }

    return markArticleRead.definition.url
            .replace('{trainingPathId}', parsedArgs.trainingPathId.toString())
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingPathController::markArticleRead
 * @see app/Http/Controllers/TrainingPathController.php:268
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/article-read'
 */
markArticleRead.post = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markArticleRead.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\TrainingPathController::markArticleRead
 * @see app/Http/Controllers/TrainingPathController.php:268
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/article-read'
 */
    const markArticleReadForm = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: markArticleRead.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TrainingPathController::markArticleRead
 * @see app/Http/Controllers/TrainingPathController.php:268
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/article-read'
 */
        markArticleReadForm.post = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: markArticleRead.url(args, options),
            method: 'post',
        })
    
    markArticleRead.form = markArticleReadForm
const TrainingPathController = { index, show, myTrainingPaths, trainingUnit, enroll, unenroll, markTrainingUnitComplete, markTrainingUnitIncomplete, updateVideoProgress, markArticleRead }

export default TrainingPathController