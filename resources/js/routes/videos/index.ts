import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\VideoController::stream
 * @see app/Http/Controllers/VideoController.php:168
 * @route '/videos/{videoId}/stream'
 */
export const stream = (args: { videoId: string | number } | [videoId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stream.url(args, options),
    method: 'get',
})

stream.definition = {
    methods: ["get","head"],
    url: '/videos/{videoId}/stream',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\VideoController::stream
 * @see app/Http/Controllers/VideoController.php:168
 * @route '/videos/{videoId}/stream'
 */
stream.url = (args: { videoId: string | number } | [videoId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { videoId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    videoId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        videoId: args.videoId,
                }

    return stream.definition.url
            .replace('{videoId}', parsedArgs.videoId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VideoController::stream
 * @see app/Http/Controllers/VideoController.php:168
 * @route '/videos/{videoId}/stream'
 */
stream.get = (args: { videoId: string | number } | [videoId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stream.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\VideoController::stream
 * @see app/Http/Controllers/VideoController.php:168
 * @route '/videos/{videoId}/stream'
 */
stream.head = (args: { videoId: string | number } | [videoId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: stream.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\VideoController::stream
 * @see app/Http/Controllers/VideoController.php:168
 * @route '/videos/{videoId}/stream'
 */
    const streamForm = (args: { videoId: string | number } | [videoId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: stream.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\VideoController::stream
 * @see app/Http/Controllers/VideoController.php:168
 * @route '/videos/{videoId}/stream'
 */
        streamForm.get = (args: { videoId: string | number } | [videoId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: stream.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\VideoController::stream
 * @see app/Http/Controllers/VideoController.php:168
 * @route '/videos/{videoId}/stream'
 */
        streamForm.head = (args: { videoId: string | number } | [videoId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: stream.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    stream.form = streamForm
/**
* @see \App\Http\Controllers\VideoController::segment
 * @see app/Http/Controllers/VideoController.php:199
 * @route '/videos/{videoId}/stream/{quality}/{segment}'
 */
export const segment = (args: { videoId: string | number, quality: string | number, segment: string | number } | [videoId: string | number, quality: string | number, segment: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: segment.url(args, options),
    method: 'get',
})

segment.definition = {
    methods: ["get","head"],
    url: '/videos/{videoId}/stream/{quality}/{segment}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\VideoController::segment
 * @see app/Http/Controllers/VideoController.php:199
 * @route '/videos/{videoId}/stream/{quality}/{segment}'
 */
segment.url = (args: { videoId: string | number, quality: string | number, segment: string | number } | [videoId: string | number, quality: string | number, segment: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    videoId: args[0],
                    quality: args[1],
                    segment: args[2],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        videoId: args.videoId,
                                quality: args.quality,
                                segment: args.segment,
                }

    return segment.definition.url
            .replace('{videoId}', parsedArgs.videoId.toString())
            .replace('{quality}', parsedArgs.quality.toString())
            .replace('{segment}', parsedArgs.segment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VideoController::segment
 * @see app/Http/Controllers/VideoController.php:199
 * @route '/videos/{videoId}/stream/{quality}/{segment}'
 */
segment.get = (args: { videoId: string | number, quality: string | number, segment: string | number } | [videoId: string | number, quality: string | number, segment: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: segment.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\VideoController::segment
 * @see app/Http/Controllers/VideoController.php:199
 * @route '/videos/{videoId}/stream/{quality}/{segment}'
 */
segment.head = (args: { videoId: string | number, quality: string | number, segment: string | number } | [videoId: string | number, quality: string | number, segment: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: segment.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\VideoController::segment
 * @see app/Http/Controllers/VideoController.php:199
 * @route '/videos/{videoId}/stream/{quality}/{segment}'
 */
    const segmentForm = (args: { videoId: string | number, quality: string | number, segment: string | number } | [videoId: string | number, quality: string | number, segment: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: segment.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\VideoController::segment
 * @see app/Http/Controllers/VideoController.php:199
 * @route '/videos/{videoId}/stream/{quality}/{segment}'
 */
        segmentForm.get = (args: { videoId: string | number, quality: string | number, segment: string | number } | [videoId: string | number, quality: string | number, segment: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: segment.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\VideoController::segment
 * @see app/Http/Controllers/VideoController.php:199
 * @route '/videos/{videoId}/stream/{quality}/{segment}'
 */
        segmentForm.head = (args: { videoId: string | number, quality: string | number, segment: string | number } | [videoId: string | number, quality: string | number, segment: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: segment.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    segment.form = segmentForm
const videos = {
    stream: Object.assign(stream, stream),
segment: Object.assign(segment, segment),
}

export default videos