import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import questions from './questions'
/**
* @see \App\Http\Controllers\QuizController::show
 * @see app/Http/Controllers/QuizController.php:42
 * @route '/teaching/trainingUnits/{trainingUnitId}/quiz'
 */
export const show = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/teaching/trainingUnits/{trainingUnitId}/quiz',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\QuizController::show
 * @see app/Http/Controllers/QuizController.php:42
 * @route '/teaching/trainingUnits/{trainingUnitId}/quiz'
 */
show.url = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\QuizController::show
 * @see app/Http/Controllers/QuizController.php:42
 * @route '/teaching/trainingUnits/{trainingUnitId}/quiz'
 */
show.get = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\QuizController::show
 * @see app/Http/Controllers/QuizController.php:42
 * @route '/teaching/trainingUnits/{trainingUnitId}/quiz'
 */
show.head = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\QuizController::show
 * @see app/Http/Controllers/QuizController.php:42
 * @route '/teaching/trainingUnits/{trainingUnitId}/quiz'
 */
    const showForm = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\QuizController::show
 * @see app/Http/Controllers/QuizController.php:42
 * @route '/teaching/trainingUnits/{trainingUnitId}/quiz'
 */
        showForm.get = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\QuizController::show
 * @see app/Http/Controllers/QuizController.php:42
 * @route '/teaching/trainingUnits/{trainingUnitId}/quiz'
 */
        showForm.head = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\QuizController::store
 * @see app/Http/Controllers/QuizController.php:64
 * @route '/teaching/trainingUnits/{trainingUnitId}/quiz'
 */
export const store = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/teaching/trainingUnits/{trainingUnitId}/quiz',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\QuizController::store
 * @see app/Http/Controllers/QuizController.php:64
 * @route '/teaching/trainingUnits/{trainingUnitId}/quiz'
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
* @see \App\Http\Controllers\QuizController::store
 * @see app/Http/Controllers/QuizController.php:64
 * @route '/teaching/trainingUnits/{trainingUnitId}/quiz'
 */
store.post = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\QuizController::store
 * @see app/Http/Controllers/QuizController.php:64
 * @route '/teaching/trainingUnits/{trainingUnitId}/quiz'
 */
    const storeForm = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\QuizController::store
 * @see app/Http/Controllers/QuizController.php:64
 * @route '/teaching/trainingUnits/{trainingUnitId}/quiz'
 */
        storeForm.post = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\QuizController::update
 * @see app/Http/Controllers/QuizController.php:85
 * @route '/teaching/quizzes/{quiz}'
 */
export const update = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/teaching/quizzes/{quiz}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\QuizController::update
 * @see app/Http/Controllers/QuizController.php:85
 * @route '/teaching/quizzes/{quiz}'
 */
update.url = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { quiz: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { quiz: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    quiz: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        quiz: typeof args.quiz === 'object'
                ? args.quiz.id
                : args.quiz,
                }

    return update.definition.url
            .replace('{quiz}', parsedArgs.quiz.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\QuizController::update
 * @see app/Http/Controllers/QuizController.php:85
 * @route '/teaching/quizzes/{quiz}'
 */
update.patch = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\QuizController::update
 * @see app/Http/Controllers/QuizController.php:85
 * @route '/teaching/quizzes/{quiz}'
 */
    const updateForm = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\QuizController::update
 * @see app/Http/Controllers/QuizController.php:85
 * @route '/teaching/quizzes/{quiz}'
 */
        updateForm.patch = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\QuizController::destroy
 * @see app/Http/Controllers/QuizController.php:100
 * @route '/teaching/quizzes/{quiz}'
 */
export const destroy = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/teaching/quizzes/{quiz}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\QuizController::destroy
 * @see app/Http/Controllers/QuizController.php:100
 * @route '/teaching/quizzes/{quiz}'
 */
destroy.url = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { quiz: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { quiz: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    quiz: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        quiz: typeof args.quiz === 'object'
                ? args.quiz.id
                : args.quiz,
                }

    return destroy.definition.url
            .replace('{quiz}', parsedArgs.quiz.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\QuizController::destroy
 * @see app/Http/Controllers/QuizController.php:100
 * @route '/teaching/quizzes/{quiz}'
 */
destroy.delete = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\QuizController::destroy
 * @see app/Http/Controllers/QuizController.php:100
 * @route '/teaching/quizzes/{quiz}'
 */
    const destroyForm = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\QuizController::destroy
 * @see app/Http/Controllers/QuizController.php:100
 * @route '/teaching/quizzes/{quiz}'
 */
        destroyForm.delete = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\QuizController::publish
 * @see app/Http/Controllers/QuizController.php:112
 * @route '/teaching/quizzes/{quiz}/publish'
 */
export const publish = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: publish.url(args, options),
    method: 'post',
})

publish.definition = {
    methods: ["post"],
    url: '/teaching/quizzes/{quiz}/publish',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\QuizController::publish
 * @see app/Http/Controllers/QuizController.php:112
 * @route '/teaching/quizzes/{quiz}/publish'
 */
publish.url = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { quiz: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { quiz: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    quiz: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        quiz: typeof args.quiz === 'object'
                ? args.quiz.id
                : args.quiz,
                }

    return publish.definition.url
            .replace('{quiz}', parsedArgs.quiz.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\QuizController::publish
 * @see app/Http/Controllers/QuizController.php:112
 * @route '/teaching/quizzes/{quiz}/publish'
 */
publish.post = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: publish.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\QuizController::publish
 * @see app/Http/Controllers/QuizController.php:112
 * @route '/teaching/quizzes/{quiz}/publish'
 */
    const publishForm = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: publish.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\QuizController::publish
 * @see app/Http/Controllers/QuizController.php:112
 * @route '/teaching/quizzes/{quiz}/publish'
 */
        publishForm.post = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: publish.url(args, options),
            method: 'post',
        })
    
    publish.form = publishForm
/**
* @see \App\Http\Controllers\QuizController::unpublish
 * @see app/Http/Controllers/QuizController.php:131
 * @route '/teaching/quizzes/{quiz}/unpublish'
 */
export const unpublish = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unpublish.url(args, options),
    method: 'post',
})

unpublish.definition = {
    methods: ["post"],
    url: '/teaching/quizzes/{quiz}/unpublish',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\QuizController::unpublish
 * @see app/Http/Controllers/QuizController.php:131
 * @route '/teaching/quizzes/{quiz}/unpublish'
 */
unpublish.url = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { quiz: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { quiz: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    quiz: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        quiz: typeof args.quiz === 'object'
                ? args.quiz.id
                : args.quiz,
                }

    return unpublish.definition.url
            .replace('{quiz}', parsedArgs.quiz.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\QuizController::unpublish
 * @see app/Http/Controllers/QuizController.php:131
 * @route '/teaching/quizzes/{quiz}/unpublish'
 */
unpublish.post = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unpublish.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\QuizController::unpublish
 * @see app/Http/Controllers/QuizController.php:131
 * @route '/teaching/quizzes/{quiz}/unpublish'
 */
    const unpublishForm = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: unpublish.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\QuizController::unpublish
 * @see app/Http/Controllers/QuizController.php:131
 * @route '/teaching/quizzes/{quiz}/unpublish'
 */
        unpublishForm.post = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: unpublish.url(args, options),
            method: 'post',
        })
    
    unpublish.form = unpublishForm
/**
* @see \App\Http\Controllers\QuizController::reorder
 * @see app/Http/Controllers/QuizController.php:200
 * @route '/teaching/quizzes/{quiz}/reorder'
 */
export const reorder = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reorder.url(args, options),
    method: 'post',
})

reorder.definition = {
    methods: ["post"],
    url: '/teaching/quizzes/{quiz}/reorder',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\QuizController::reorder
 * @see app/Http/Controllers/QuizController.php:200
 * @route '/teaching/quizzes/{quiz}/reorder'
 */
reorder.url = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { quiz: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { quiz: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    quiz: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        quiz: typeof args.quiz === 'object'
                ? args.quiz.id
                : args.quiz,
                }

    return reorder.definition.url
            .replace('{quiz}', parsedArgs.quiz.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\QuizController::reorder
 * @see app/Http/Controllers/QuizController.php:200
 * @route '/teaching/quizzes/{quiz}/reorder'
 */
reorder.post = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reorder.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\QuizController::reorder
 * @see app/Http/Controllers/QuizController.php:200
 * @route '/teaching/quizzes/{quiz}/reorder'
 */
    const reorderForm = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reorder.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\QuizController::reorder
 * @see app/Http/Controllers/QuizController.php:200
 * @route '/teaching/quizzes/{quiz}/reorder'
 */
        reorderForm.post = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reorder.url(args, options),
            method: 'post',
        })
    
    reorder.form = reorderForm
/**
* @see \App\Http\Controllers\QuizController::stats
 * @see app/Http/Controllers/QuizController.php:345
 * @route '/teaching/quizzes/{quiz}/stats'
 */
export const stats = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stats.url(args, options),
    method: 'get',
})

stats.definition = {
    methods: ["get","head"],
    url: '/teaching/quizzes/{quiz}/stats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\QuizController::stats
 * @see app/Http/Controllers/QuizController.php:345
 * @route '/teaching/quizzes/{quiz}/stats'
 */
stats.url = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { quiz: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { quiz: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    quiz: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        quiz: typeof args.quiz === 'object'
                ? args.quiz.id
                : args.quiz,
                }

    return stats.definition.url
            .replace('{quiz}', parsedArgs.quiz.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\QuizController::stats
 * @see app/Http/Controllers/QuizController.php:345
 * @route '/teaching/quizzes/{quiz}/stats'
 */
stats.get = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stats.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\QuizController::stats
 * @see app/Http/Controllers/QuizController.php:345
 * @route '/teaching/quizzes/{quiz}/stats'
 */
stats.head = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: stats.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\QuizController::stats
 * @see app/Http/Controllers/QuizController.php:345
 * @route '/teaching/quizzes/{quiz}/stats'
 */
    const statsForm = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: stats.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\QuizController::stats
 * @see app/Http/Controllers/QuizController.php:345
 * @route '/teaching/quizzes/{quiz}/stats'
 */
        statsForm.get = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: stats.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\QuizController::stats
 * @see app/Http/Controllers/QuizController.php:345
 * @route '/teaching/quizzes/{quiz}/stats'
 */
        statsForm.head = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: stats.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    stats.form = statsForm
const quiz = {
    show: Object.assign(show, show),
store: Object.assign(store, store),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
publish: Object.assign(publish, publish),
unpublish: Object.assign(unpublish, unpublish),
questions: Object.assign(questions, questions),
reorder: Object.assign(reorder, reorder),
stats: Object.assign(stats, stats),
}

export default quiz