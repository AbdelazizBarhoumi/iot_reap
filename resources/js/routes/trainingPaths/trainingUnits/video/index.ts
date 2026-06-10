import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\VideoController::status
 * @see app/Http/Controllers/VideoController.php:137
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/video/status'
 */
export const status = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status.url(args, options),
    method: 'get',
})

status.definition = {
    methods: ["get","head"],
    url: '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/video/status',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\VideoController::status
 * @see app/Http/Controllers/VideoController.php:137
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/video/status'
 */
status.url = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions) => {
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

    return status.definition.url
            .replace('{trainingPathId}', parsedArgs.trainingPathId.toString())
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VideoController::status
 * @see app/Http/Controllers/VideoController.php:137
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/video/status'
 */
status.get = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\VideoController::status
 * @see app/Http/Controllers/VideoController.php:137
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/video/status'
 */
status.head = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: status.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\VideoController::status
 * @see app/Http/Controllers/VideoController.php:137
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/video/status'
 */
    const statusForm = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: status.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\VideoController::status
 * @see app/Http/Controllers/VideoController.php:137
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/video/status'
 */
        statusForm.get = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: status.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\VideoController::status
 * @see app/Http/Controllers/VideoController.php:137
 * @route '/trainingPaths/{trainingPathId}/trainingUnits/{trainingUnitId}/video/status'
 */
        statusForm.head = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: status.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    status.form = statusForm
const video = {
    status: Object.assign(status, status),
}

export default video