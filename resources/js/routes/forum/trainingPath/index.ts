import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import threadsCbddcd from './threads'
/**
* @see \App\Http\Controllers\ForumController::threads
 * @see app/Http/Controllers/ForumController.php:60
 * @route '/forum/trainingPaths/{trainingPathId}/threads'
 */
export const threads = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: threads.url(args, options),
    method: 'get',
})

threads.definition = {
    methods: ["get","head"],
    url: '/forum/trainingPaths/{trainingPathId}/threads',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ForumController::threads
 * @see app/Http/Controllers/ForumController.php:60
 * @route '/forum/trainingPaths/{trainingPathId}/threads'
 */
threads.url = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return threads.definition.url
            .replace('{trainingPathId}', parsedArgs.trainingPathId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::threads
 * @see app/Http/Controllers/ForumController.php:60
 * @route '/forum/trainingPaths/{trainingPathId}/threads'
 */
threads.get = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: threads.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ForumController::threads
 * @see app/Http/Controllers/ForumController.php:60
 * @route '/forum/trainingPaths/{trainingPathId}/threads'
 */
threads.head = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: threads.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ForumController::threads
 * @see app/Http/Controllers/ForumController.php:60
 * @route '/forum/trainingPaths/{trainingPathId}/threads'
 */
    const threadsForm = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: threads.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ForumController::threads
 * @see app/Http/Controllers/ForumController.php:60
 * @route '/forum/trainingPaths/{trainingPathId}/threads'
 */
        threadsForm.get = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: threads.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ForumController::threads
 * @see app/Http/Controllers/ForumController.php:60
 * @route '/forum/trainingPaths/{trainingPathId}/threads'
 */
        threadsForm.head = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: threads.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    threads.form = threadsForm
const trainingPath = {
    threads: Object.assign(threads, threadsCbddcd),
}

export default trainingPath