import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\ArticleController::read
 * @see app/Http/Controllers/ArticleController.php:82
 * @route '/trainingUnits/{trainingUnitId}/article/read'
 */
export const read = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: read.url(args, options),
    method: 'get',
})

read.definition = {
    methods: ["get","head"],
    url: '/trainingUnits/{trainingUnitId}/article/read',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ArticleController::read
 * @see app/Http/Controllers/ArticleController.php:82
 * @route '/trainingUnits/{trainingUnitId}/article/read'
 */
read.url = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return read.definition.url
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ArticleController::read
 * @see app/Http/Controllers/ArticleController.php:82
 * @route '/trainingUnits/{trainingUnitId}/article/read'
 */
read.get = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: read.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ArticleController::read
 * @see app/Http/Controllers/ArticleController.php:82
 * @route '/trainingUnits/{trainingUnitId}/article/read'
 */
read.head = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: read.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ArticleController::read
 * @see app/Http/Controllers/ArticleController.php:82
 * @route '/trainingUnits/{trainingUnitId}/article/read'
 */
    const readForm = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: read.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ArticleController::read
 * @see app/Http/Controllers/ArticleController.php:82
 * @route '/trainingUnits/{trainingUnitId}/article/read'
 */
        readForm.get = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: read.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ArticleController::read
 * @see app/Http/Controllers/ArticleController.php:82
 * @route '/trainingUnits/{trainingUnitId}/article/read'
 */
        readForm.head = (args: { trainingUnitId: string | number } | [trainingUnitId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: read.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    read.form = readForm
const article = {
    read: Object.assign(read, read),
}

export default article