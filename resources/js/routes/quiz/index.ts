import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
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
* @see \App\Http\Controllers\QuizController::start
 * @see app/Http/Controllers/QuizController.php:266
 * @route '/quizzes/{quiz}/start'
 */
export const start = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: start.url(args, options),
    method: 'post',
})

start.definition = {
    methods: ["post"],
    url: '/quizzes/{quiz}/start',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\QuizController::start
 * @see app/Http/Controllers/QuizController.php:266
 * @route '/quizzes/{quiz}/start'
 */
start.url = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return start.definition.url
            .replace('{quiz}', parsedArgs.quiz.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\QuizController::start
 * @see app/Http/Controllers/QuizController.php:266
 * @route '/quizzes/{quiz}/start'
 */
start.post = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: start.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\QuizController::start
 * @see app/Http/Controllers/QuizController.php:266
 * @route '/quizzes/{quiz}/start'
 */
    const startForm = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: start.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\QuizController::start
 * @see app/Http/Controllers/QuizController.php:266
 * @route '/quizzes/{quiz}/start'
 */
        startForm.post = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: start.url(args, options),
            method: 'post',
        })
    
    start.form = startForm
/**
* @see \App\Http\Controllers\QuizController::submit
 * @see app/Http/Controllers/QuizController.php:286
 * @route '/quiz-attempts/{attempt}/submit'
 */
export const submit = (args: { attempt: number | { id: number } } | [attempt: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: submit.url(args, options),
    method: 'post',
})

submit.definition = {
    methods: ["post"],
    url: '/quiz-attempts/{attempt}/submit',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\QuizController::submit
 * @see app/Http/Controllers/QuizController.php:286
 * @route '/quiz-attempts/{attempt}/submit'
 */
submit.url = (args: { attempt: number | { id: number } } | [attempt: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return submit.definition.url
            .replace('{attempt}', parsedArgs.attempt.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\QuizController::submit
 * @see app/Http/Controllers/QuizController.php:286
 * @route '/quiz-attempts/{attempt}/submit'
 */
submit.post = (args: { attempt: number | { id: number } } | [attempt: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: submit.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\QuizController::submit
 * @see app/Http/Controllers/QuizController.php:286
 * @route '/quiz-attempts/{attempt}/submit'
 */
    const submitForm = (args: { attempt: number | { id: number } } | [attempt: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: submit.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\QuizController::submit
 * @see app/Http/Controllers/QuizController.php:286
 * @route '/quiz-attempts/{attempt}/submit'
 */
        submitForm.post = (args: { attempt: number | { id: number } } | [attempt: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: submit.url(args, options),
            method: 'post',
        })
    
    submit.form = submitForm
/**
* @see \App\Http\Controllers\QuizController::history
 * @see app/Http/Controllers/QuizController.php:310
 * @route '/quizzes/{quiz}/history'
 */
export const history = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(args, options),
    method: 'get',
})

history.definition = {
    methods: ["get","head"],
    url: '/quizzes/{quiz}/history',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\QuizController::history
 * @see app/Http/Controllers/QuizController.php:310
 * @route '/quizzes/{quiz}/history'
 */
history.url = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return history.definition.url
            .replace('{quiz}', parsedArgs.quiz.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\QuizController::history
 * @see app/Http/Controllers/QuizController.php:310
 * @route '/quizzes/{quiz}/history'
 */
history.get = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\QuizController::history
 * @see app/Http/Controllers/QuizController.php:310
 * @route '/quizzes/{quiz}/history'
 */
history.head = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: history.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\QuizController::history
 * @see app/Http/Controllers/QuizController.php:310
 * @route '/quizzes/{quiz}/history'
 */
    const historyForm = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: history.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\QuizController::history
 * @see app/Http/Controllers/QuizController.php:310
 * @route '/quizzes/{quiz}/history'
 */
        historyForm.get = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: history.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\QuizController::history
 * @see app/Http/Controllers/QuizController.php:310
 * @route '/quizzes/{quiz}/history'
 */
        historyForm.head = (args: { quiz: number | { id: number } } | [quiz: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: history.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    history.form = historyForm
/**
* @see \App\Http\Controllers\QuizController::attempt
 * @see app/Http/Controllers/QuizController.php:323
 * @route '/quiz-attempts/{attempt}'
 */
export const attempt = (args: { attempt: number | { id: number } } | [attempt: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: attempt.url(args, options),
    method: 'get',
})

attempt.definition = {
    methods: ["get","head"],
    url: '/quiz-attempts/{attempt}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\QuizController::attempt
 * @see app/Http/Controllers/QuizController.php:323
 * @route '/quiz-attempts/{attempt}'
 */
attempt.url = (args: { attempt: number | { id: number } } | [attempt: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return attempt.definition.url
            .replace('{attempt}', parsedArgs.attempt.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\QuizController::attempt
 * @see app/Http/Controllers/QuizController.php:323
 * @route '/quiz-attempts/{attempt}'
 */
attempt.get = (args: { attempt: number | { id: number } } | [attempt: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: attempt.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\QuizController::attempt
 * @see app/Http/Controllers/QuizController.php:323
 * @route '/quiz-attempts/{attempt}'
 */
attempt.head = (args: { attempt: number | { id: number } } | [attempt: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: attempt.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\QuizController::attempt
 * @see app/Http/Controllers/QuizController.php:323
 * @route '/quiz-attempts/{attempt}'
 */
    const attemptForm = (args: { attempt: number | { id: number } } | [attempt: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: attempt.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\QuizController::attempt
 * @see app/Http/Controllers/QuizController.php:323
 * @route '/quiz-attempts/{attempt}'
 */
        attemptForm.get = (args: { attempt: number | { id: number } } | [attempt: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: attempt.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\QuizController::attempt
 * @see app/Http/Controllers/QuizController.php:323
 * @route '/quiz-attempts/{attempt}'
 */
        attemptForm.head = (args: { attempt: number | { id: number } } | [attempt: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: attempt.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    attempt.form = attemptForm
const quiz = {
    take: Object.assign(take, take),
start: Object.assign(start, start),
submit: Object.assign(submit, submit),
history: Object.assign(history, history),
attempt: Object.assign(attempt, attempt),
}

export default quiz