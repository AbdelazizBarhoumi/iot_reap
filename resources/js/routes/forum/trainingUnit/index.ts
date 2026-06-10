import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\ForumController::threads
 * @see app/Http/Controllers/ForumController.php:32
 * @route '/forum/trainingUnits/{trainingUnitId}/threads'
 */
export const threads = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: threads.url(args, options),
    method: 'get',
})

threads.definition = {
    methods: ["get","head"],
    url: '/forum/trainingUnits/{trainingUnitId}/threads',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ForumController::threads
 * @see app/Http/Controllers/ForumController.php:32
 * @route '/forum/trainingUnits/{trainingUnitId}/threads'
 */
threads.url = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return threads.definition.url
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::threads
 * @see app/Http/Controllers/ForumController.php:32
 * @route '/forum/trainingUnits/{trainingUnitId}/threads'
 */
threads.get = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: threads.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ForumController::threads
 * @see app/Http/Controllers/ForumController.php:32
 * @route '/forum/trainingUnits/{trainingUnitId}/threads'
 */
threads.head = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: threads.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ForumController::threads
 * @see app/Http/Controllers/ForumController.php:32
 * @route '/forum/trainingUnits/{trainingUnitId}/threads'
 */
    const threadsForm = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: threads.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ForumController::threads
 * @see app/Http/Controllers/ForumController.php:32
 * @route '/forum/trainingUnits/{trainingUnitId}/threads'
 */
        threadsForm.get = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: threads.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ForumController::threads
 * @see app/Http/Controllers/ForumController.php:32
 * @route '/forum/trainingUnits/{trainingUnitId}/threads'
 */
        threadsForm.head = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: threads.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    threads.form = threadsForm
const trainingUnit = {
    threads: Object.assign(threads, threads),
}

export default trainingUnit