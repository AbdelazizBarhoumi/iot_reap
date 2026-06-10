import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import video from './video'
/**
* @see \App\Http\Controllers\TrainingPathController::complete
 * @see app/Http/Controllers/TrainingPathController.php:205
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/complete'
 */
export const complete = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: complete.url(args, options),
    method: 'post',
})

complete.definition = {
    methods: ["post"],
    url: '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/complete',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TrainingPathController::complete
 * @see app/Http/Controllers/TrainingPathController.php:205
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/complete'
 */
complete.url = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions) => {
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

    return complete.definition.url
            .replace('{trainingPathId}', parsedArgs.trainingPathId.toString())
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingPathController::complete
 * @see app/Http/Controllers/TrainingPathController.php:205
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/complete'
 */
complete.post = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: complete.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\TrainingPathController::complete
 * @see app/Http/Controllers/TrainingPathController.php:205
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/complete'
 */
    const completeForm = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: complete.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TrainingPathController::complete
 * @see app/Http/Controllers/TrainingPathController.php:205
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/complete'
 */
        completeForm.post = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: complete.url(args, options),
            method: 'post',
        })
    
    complete.form = completeForm
/**
* @see \App\Http\Controllers\TrainingPathController::incomplete
 * @see app/Http/Controllers/TrainingPathController.php:222
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/complete'
 */
export const incomplete = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: incomplete.url(args, options),
    method: 'delete',
})

incomplete.definition = {
    methods: ["delete"],
    url: '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/complete',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\TrainingPathController::incomplete
 * @see app/Http/Controllers/TrainingPathController.php:222
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/complete'
 */
incomplete.url = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions) => {
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

    return incomplete.definition.url
            .replace('{trainingPathId}', parsedArgs.trainingPathId.toString())
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingPathController::incomplete
 * @see app/Http/Controllers/TrainingPathController.php:222
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/complete'
 */
incomplete.delete = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: incomplete.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\TrainingPathController::incomplete
 * @see app/Http/Controllers/TrainingPathController.php:222
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/complete'
 */
    const incompleteForm = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: incomplete.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TrainingPathController::incomplete
 * @see app/Http/Controllers/TrainingPathController.php:222
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/complete'
 */
        incompleteForm.delete = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: incomplete.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    incomplete.form = incompleteForm
/**
* @see \App\Http\Controllers\TrainingPathController::videoProgress
 * @see app/Http/Controllers/TrainingPathController.php:239
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/video-progress'
 */
export const videoProgress = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: videoProgress.url(args, options),
    method: 'post',
})

videoProgress.definition = {
    methods: ["post"],
    url: '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/video-progress',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TrainingPathController::videoProgress
 * @see app/Http/Controllers/TrainingPathController.php:239
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/video-progress'
 */
videoProgress.url = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions) => {
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

    return videoProgress.definition.url
            .replace('{trainingPathId}', parsedArgs.trainingPathId.toString())
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingPathController::videoProgress
 * @see app/Http/Controllers/TrainingPathController.php:239
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/video-progress'
 */
videoProgress.post = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: videoProgress.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\TrainingPathController::videoProgress
 * @see app/Http/Controllers/TrainingPathController.php:239
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/video-progress'
 */
    const videoProgressForm = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: videoProgress.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TrainingPathController::videoProgress
 * @see app/Http/Controllers/TrainingPathController.php:239
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/video-progress'
 */
        videoProgressForm.post = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: videoProgress.url(args, options),
            method: 'post',
        })
    
    videoProgress.form = videoProgressForm
/**
* @see \App\Http\Controllers\TrainingPathController::articleRead
 * @see app/Http/Controllers/TrainingPathController.php:268
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/article-read'
 */
export const articleRead = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: articleRead.url(args, options),
    method: 'post',
})

articleRead.definition = {
    methods: ["post"],
    url: '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/article-read',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TrainingPathController::articleRead
 * @see app/Http/Controllers/TrainingPathController.php:268
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/article-read'
 */
articleRead.url = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions) => {
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

    return articleRead.definition.url
            .replace('{trainingPathId}', parsedArgs.trainingPathId.toString())
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingPathController::articleRead
 * @see app/Http/Controllers/TrainingPathController.php:268
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/article-read'
 */
articleRead.post = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: articleRead.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\TrainingPathController::articleRead
 * @see app/Http/Controllers/TrainingPathController.php:268
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/article-read'
 */
    const articleReadForm = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: articleRead.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TrainingPathController::articleRead
 * @see app/Http/Controllers/TrainingPathController.php:268
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/article-read'
 */
        articleReadForm.post = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: articleRead.url(args, options),
            method: 'post',
        })
    
    articleRead.form = articleReadForm
const trainingUnits = {
    complete: Object.assign(complete, complete),
incomplete: Object.assign(incomplete, incomplete),
videoProgress: Object.assign(videoProgress, videoProgress),
articleRead: Object.assign(articleRead, articleRead),
video: Object.assign(video, video),
}

export default trainingUnits