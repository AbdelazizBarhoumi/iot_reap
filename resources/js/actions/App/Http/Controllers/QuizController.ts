import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\QuizController::take
 * @see app/Http/Controllers/QuizController.php:216
 * @route '/trainingUnits/{trainingUnitId}/quiz'
 */
export const take = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: take.url(args, options),
    method: 'get',
})

take.definition = {
    methods: ["get","head"],
    url: '/trainingUnits/{trainingUnitId}/quiz',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\QuizController::take
 * @see app/Http/Controllers/QuizController.php:216
 * @route '/trainingUnits/{trainingUnitId}/quiz'
 */
take.url = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return take.definition.url
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\QuizController::take
 * @see app/Http/Controllers/QuizController.php:216
 * @route '/trainingUnits/{trainingUnitId}/quiz'
 */
take.get = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: take.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\QuizController::take
 * @see app/Http/Controllers/QuizController.php:216
 * @route '/trainingUnits/{trainingUnitId}/quiz'
 */
take.head = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: take.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\QuizController::take
 * @see app/Http/Controllers/QuizController.php:216
 * @route '/trainingUnits/{trainingUnitId}/quiz'
 */
    const takeForm = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: take.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\QuizController::take
 * @see app/Http/Controllers/QuizController.php:216
 * @route '/trainingUnits/{trainingUnitId}/quiz'
 */
        takeForm.get = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: take.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\QuizController::take
 * @see app/Http/Controllers/QuizController.php:216
 * @route '/trainingUnits/{trainingUnitId}/quiz'
 */
        takeForm.head = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: take.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    take.form = takeForm
/**
* @see \App\Http\Controllers\QuizController::startAttempt
 * @see app/Http/Controllers/QuizController.php:266
 * @route '/quizzes/{quiz}/start'
 */
export const startAttempt = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: startAttempt.url(args, options),
    method: 'post',
})

startAttempt.definition = {
    methods: ["post"],
    url: '/quizzes/{quiz}/start',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\QuizController::startAttempt
 * @see app/Http/Controllers/QuizController.php:266
 * @route '/quizzes/{quiz}/start'
 */
startAttempt.url = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return startAttempt.definition.url
            .replace('{quiz}', parsedArgs.quiz.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\QuizController::startAttempt
 * @see app/Http/Controllers/QuizController.php:266
 * @route '/quizzes/{quiz}/start'
 */
startAttempt.post = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: startAttempt.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\QuizController::startAttempt
 * @see app/Http/Controllers/QuizController.php:266
 * @route '/quizzes/{quiz}/start'
 */
    const startAttemptForm = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: startAttempt.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\QuizController::startAttempt
 * @see app/Http/Controllers/QuizController.php:266
 * @route '/quizzes/{quiz}/start'
 */
        startAttemptForm.post = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: startAttempt.url(args, options),
            method: 'post',
        })
    
    startAttempt.form = startAttemptForm
/**
* @see \App\Http\Controllers\QuizController::submitAttempt
 * @see app/Http/Controllers/QuizController.php:286
 * @route '/quiz-attempts/{attempt}/submit'
 */
export const submitAttempt = (args: { attempt: number | { id: number } } | [attempt: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: submitAttempt.url(args, options),
    method: 'post',
})

submitAttempt.definition = {
    methods: ["post"],
    url: '/quiz-attempts/{attempt}/submit',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\QuizController::submitAttempt
 * @see app/Http/Controllers/QuizController.php:286
 * @route '/quiz-attempts/{attempt}/submit'
 */
submitAttempt.url = (args: { attempt: number | { id: number } } | [attempt: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { attempt: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { attempt: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    attempt: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        attempt: typeof args.attempt === 'object'
                ? args.attempt.id
                : args.attempt,
                }

    return submitAttempt.definition.url
            .replace('{attempt}', parsedArgs.attempt.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\QuizController::submitAttempt
 * @see app/Http/Controllers/QuizController.php:286
 * @route '/quiz-attempts/{attempt}/submit'
 */
submitAttempt.post = (args: { attempt: number | { id: number } } | [attempt: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: submitAttempt.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\QuizController::submitAttempt
 * @see app/Http/Controllers/QuizController.php:286
 * @route '/quiz-attempts/{attempt}/submit'
 */
    const submitAttemptForm = (args: { attempt: number | { id: number } } | [attempt: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: submitAttempt.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\QuizController::submitAttempt
 * @see app/Http/Controllers/QuizController.php:286
 * @route '/quiz-attempts/{attempt}/submit'
 */
        submitAttemptForm.post = (args: { attempt: number | { id: number } } | [attempt: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: submitAttempt.url(args, options),
            method: 'post',
        })
    
    submitAttempt.form = submitAttemptForm
/**
* @see \App\Http\Controllers\QuizController::attemptHistory
 * @see app/Http/Controllers/QuizController.php:310
 * @route '/quizzes/{quiz}/history'
 */
export const attemptHistory = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: attemptHistory.url(args, options),
    method: 'get',
})

attemptHistory.definition = {
    methods: ["get","head"],
    url: '/quizzes/{quiz}/history',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\QuizController::attemptHistory
 * @see app/Http/Controllers/QuizController.php:310
 * @route '/quizzes/{quiz}/history'
 */
attemptHistory.url = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return attemptHistory.definition.url
            .replace('{quiz}', parsedArgs.quiz.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\QuizController::attemptHistory
 * @see app/Http/Controllers/QuizController.php:310
 * @route '/quizzes/{quiz}/history'
 */
attemptHistory.get = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: attemptHistory.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\QuizController::attemptHistory
 * @see app/Http/Controllers/QuizController.php:310
 * @route '/quizzes/{quiz}/history'
 */
attemptHistory.head = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: attemptHistory.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\QuizController::attemptHistory
 * @see app/Http/Controllers/QuizController.php:310
 * @route '/quizzes/{quiz}/history'
 */
    const attemptHistoryForm = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: attemptHistory.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\QuizController::attemptHistory
 * @see app/Http/Controllers/QuizController.php:310
 * @route '/quizzes/{quiz}/history'
 */
        attemptHistoryForm.get = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: attemptHistory.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\QuizController::attemptHistory
 * @see app/Http/Controllers/QuizController.php:310
 * @route '/quizzes/{quiz}/history'
 */
        attemptHistoryForm.head = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: attemptHistory.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    attemptHistory.form = attemptHistoryForm
/**
* @see \App\Http\Controllers\QuizController::showAttempt
 * @see app/Http/Controllers/QuizController.php:323
 * @route '/quiz-attempts/{attempt}'
 */
export const showAttempt = (args: { attempt: number | { id: number } } | [attempt: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showAttempt.url(args, options),
    method: 'get',
})

showAttempt.definition = {
    methods: ["get","head"],
    url: '/quiz-attempts/{attempt}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\QuizController::showAttempt
 * @see app/Http/Controllers/QuizController.php:323
 * @route '/quiz-attempts/{attempt}'
 */
showAttempt.url = (args: { attempt: number | { id: number } } | [attempt: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { attempt: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { attempt: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    attempt: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        attempt: typeof args.attempt === 'object'
                ? args.attempt.id
                : args.attempt,
                }

    return showAttempt.definition.url
            .replace('{attempt}', parsedArgs.attempt.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\QuizController::showAttempt
 * @see app/Http/Controllers/QuizController.php:323
 * @route '/quiz-attempts/{attempt}'
 */
showAttempt.get = (args: { attempt: number | { id: number } } | [attempt: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showAttempt.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\QuizController::showAttempt
 * @see app/Http/Controllers/QuizController.php:323
 * @route '/quiz-attempts/{attempt}'
 */
showAttempt.head = (args: { attempt: number | { id: number } } | [attempt: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showAttempt.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\QuizController::showAttempt
 * @see app/Http/Controllers/QuizController.php:323
 * @route '/quiz-attempts/{attempt}'
 */
    const showAttemptForm = (args: { attempt: number | { id: number } } | [attempt: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: showAttempt.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\QuizController::showAttempt
 * @see app/Http/Controllers/QuizController.php:323
 * @route '/quiz-attempts/{attempt}'
 */
        showAttemptForm.get = (args: { attempt: number | { id: number } } | [attempt: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showAttempt.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\QuizController::showAttempt
 * @see app/Http/Controllers/QuizController.php:323
 * @route '/quiz-attempts/{attempt}'
 */
        showAttemptForm.head = (args: { attempt: number | { id: number } } | [attempt: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: showAttempt.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    showAttempt.form = showAttemptForm
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
* @see \App\Http\Controllers\QuizController::storeQuestion
 * @see app/Http/Controllers/QuizController.php:150
 * @route '/teaching/quizzes/{quiz}/questions'
 */
export const storeQuestion = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeQuestion.url(args, options),
    method: 'post',
})

storeQuestion.definition = {
    methods: ["post"],
    url: '/teaching/quizzes/{quiz}/questions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\QuizController::storeQuestion
 * @see app/Http/Controllers/QuizController.php:150
 * @route '/teaching/quizzes/{quiz}/questions'
 */
storeQuestion.url = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return storeQuestion.definition.url
            .replace('{quiz}', parsedArgs.quiz.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\QuizController::storeQuestion
 * @see app/Http/Controllers/QuizController.php:150
 * @route '/teaching/quizzes/{quiz}/questions'
 */
storeQuestion.post = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeQuestion.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\QuizController::storeQuestion
 * @see app/Http/Controllers/QuizController.php:150
 * @route '/teaching/quizzes/{quiz}/questions'
 */
    const storeQuestionForm = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: storeQuestion.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\QuizController::storeQuestion
 * @see app/Http/Controllers/QuizController.php:150
 * @route '/teaching/quizzes/{quiz}/questions'
 */
        storeQuestionForm.post = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: storeQuestion.url(args, options),
            method: 'post',
        })
    
    storeQuestion.form = storeQuestionForm
/**
* @see \App\Http\Controllers\QuizController::reorderQuestions
 * @see app/Http/Controllers/QuizController.php:200
 * @route '/teaching/quizzes/{quiz}/reorder'
 */
export const reorderQuestions = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reorderQuestions.url(args, options),
    method: 'post',
})

reorderQuestions.definition = {
    methods: ["post"],
    url: '/teaching/quizzes/{quiz}/reorder',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\QuizController::reorderQuestions
 * @see app/Http/Controllers/QuizController.php:200
 * @route '/teaching/quizzes/{quiz}/reorder'
 */
reorderQuestions.url = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return reorderQuestions.definition.url
            .replace('{quiz}', parsedArgs.quiz.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\QuizController::reorderQuestions
 * @see app/Http/Controllers/QuizController.php:200
 * @route '/teaching/quizzes/{quiz}/reorder'
 */
reorderQuestions.post = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reorderQuestions.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\QuizController::reorderQuestions
 * @see app/Http/Controllers/QuizController.php:200
 * @route '/teaching/quizzes/{quiz}/reorder'
 */
    const reorderQuestionsForm = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reorderQuestions.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\QuizController::reorderQuestions
 * @see app/Http/Controllers/QuizController.php:200
 * @route '/teaching/quizzes/{quiz}/reorder'
 */
        reorderQuestionsForm.post = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reorderQuestions.url(args, options),
            method: 'post',
        })
    
    reorderQuestions.form = reorderQuestionsForm
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
/**
* @see \App\Http\Controllers\QuizController::updateQuestion
 * @see app/Http/Controllers/QuizController.php:169
 * @route '/teaching/questions/{question}'
 */
export const updateQuestion = (args: { question: number | { id: number } } | [question: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateQuestion.url(args, options),
    method: 'patch',
})

updateQuestion.definition = {
    methods: ["patch"],
    url: '/teaching/questions/{question}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\QuizController::updateQuestion
 * @see app/Http/Controllers/QuizController.php:169
 * @route '/teaching/questions/{question}'
 */
updateQuestion.url = (args: { question: number | { id: number } } | [question: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { question: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { question: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    question: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        question: typeof args.question === 'object'
                ? args.question.id
                : args.question,
                }

    return updateQuestion.definition.url
            .replace('{question}', parsedArgs.question.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\QuizController::updateQuestion
 * @see app/Http/Controllers/QuizController.php:169
 * @route '/teaching/questions/{question}'
 */
updateQuestion.patch = (args: { question: number | { id: number } } | [question: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateQuestion.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\QuizController::updateQuestion
 * @see app/Http/Controllers/QuizController.php:169
 * @route '/teaching/questions/{question}'
 */
    const updateQuestionForm = (args: { question: number | { id: number } } | [question: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateQuestion.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\QuizController::updateQuestion
 * @see app/Http/Controllers/QuizController.php:169
 * @route '/teaching/questions/{question}'
 */
        updateQuestionForm.patch = (args: { question: number | { id: number } } | [question: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateQuestion.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateQuestion.form = updateQuestionForm
/**
* @see \App\Http\Controllers\QuizController::destroyQuestion
 * @see app/Http/Controllers/QuizController.php:188
 * @route '/teaching/questions/{question}'
 */
export const destroyQuestion = (args: { question: number | { id: number } } | [question: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyQuestion.url(args, options),
    method: 'delete',
})

destroyQuestion.definition = {
    methods: ["delete"],
    url: '/teaching/questions/{question}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\QuizController::destroyQuestion
 * @see app/Http/Controllers/QuizController.php:188
 * @route '/teaching/questions/{question}'
 */
destroyQuestion.url = (args: { question: number | { id: number } } | [question: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { question: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { question: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    question: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        question: typeof args.question === 'object'
                ? args.question.id
                : args.question,
                }

    return destroyQuestion.definition.url
            .replace('{question}', parsedArgs.question.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\QuizController::destroyQuestion
 * @see app/Http/Controllers/QuizController.php:188
 * @route '/teaching/questions/{question}'
 */
destroyQuestion.delete = (args: { question: number | { id: number } } | [question: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyQuestion.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\QuizController::destroyQuestion
 * @see app/Http/Controllers/QuizController.php:188
 * @route '/teaching/questions/{question}'
 */
    const destroyQuestionForm = (args: { question: number | { id: number } } | [question: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroyQuestion.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\QuizController::destroyQuestion
 * @see app/Http/Controllers/QuizController.php:188
 * @route '/teaching/questions/{question}'
 */
        destroyQuestionForm.delete = (args: { question: number | { id: number } } | [question: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroyQuestion.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroyQuestion.form = destroyQuestionForm
const QuizController = { take, startAttempt, submitAttempt, attemptHistory, showAttempt, show, store, update, destroy, publish, unpublish, storeQuestion, reorderQuestions, stats, updateQuestion, destroyQuestion }

export default QuizController