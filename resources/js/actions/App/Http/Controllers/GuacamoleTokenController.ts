import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\GuacamoleTokenController::generate
 * @see app/Http/Controllers/GuacamoleTokenController.php:34
 * @route '/sessions/{session}/guacamole-token'
 */
export const generate = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: generate.url(args, options),
    method: 'get',
})

generate.definition = {
    methods: ["get","head"],
    url: '/sessions/{session}/guacamole-token',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\GuacamoleTokenController::generate
 * @see app/Http/Controllers/GuacamoleTokenController.php:34
 * @route '/sessions/{session}/guacamole-token'
 */
generate.url = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { session: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { session: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    session: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        session: typeof args.session === 'object'
                ? args.session.id
                : args.session,
                }

    return generate.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\GuacamoleTokenController::generate
 * @see app/Http/Controllers/GuacamoleTokenController.php:34
 * @route '/sessions/{session}/guacamole-token'
 */
generate.get = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: generate.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\GuacamoleTokenController::generate
 * @see app/Http/Controllers/GuacamoleTokenController.php:34
 * @route '/sessions/{session}/guacamole-token'
 */
generate.head = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: generate.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\GuacamoleTokenController::generate
 * @see app/Http/Controllers/GuacamoleTokenController.php:34
 * @route '/sessions/{session}/guacamole-token'
 */
    const generateForm = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: generate.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\GuacamoleTokenController::generate
 * @see app/Http/Controllers/GuacamoleTokenController.php:34
 * @route '/sessions/{session}/guacamole-token'
 */
        generateForm.get = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: generate.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\GuacamoleTokenController::generate
 * @see app/Http/Controllers/GuacamoleTokenController.php:34
 * @route '/sessions/{session}/guacamole-token'
 */
        generateForm.head = (args: { session: string | { id: string } } | [session: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: generate.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    generate.form = generateForm
const GuacamoleTokenController = { generate }

export default GuacamoleTokenController