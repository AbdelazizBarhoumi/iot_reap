import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\SessionHardwareController::join
 * @see app/Http/Controllers/SessionHardwareController.php:373
 * @route '/sessions/{session}/hardware/devices/{device}/queue/join'
 */
export const join = (args: { session: string | { id: string }, device: number | { id: number } } | [session: string | { id: string }, device: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: join.url(args, options),
    method: 'post',
})

join.definition = {
    methods: ["post"],
    url: '/sessions/{session}/hardware/devices/{device}/queue/join',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SessionHardwareController::join
 * @see app/Http/Controllers/SessionHardwareController.php:373
 * @route '/sessions/{session}/hardware/devices/{device}/queue/join'
 */
join.url = (args: { session: string | { id: string }, device: number | { id: number } } | [session: string | { id: string }, device: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    session: args[0],
                    device: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        session: typeof args.session === 'object'
                ? args.session.id
                : args.session,
                                device: typeof args.device === 'object'
                ? args.device.id
                : args.device,
                }

    return join.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace('{device}', parsedArgs.device.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionHardwareController::join
 * @see app/Http/Controllers/SessionHardwareController.php:373
 * @route '/sessions/{session}/hardware/devices/{device}/queue/join'
 */
join.post = (args: { session: string | { id: string }, device: number | { id: number } } | [session: string | { id: string }, device: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: join.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\SessionHardwareController::join
 * @see app/Http/Controllers/SessionHardwareController.php:373
 * @route '/sessions/{session}/hardware/devices/{device}/queue/join'
 */
    const joinForm = (args: { session: string | { id: string }, device: number | { id: number } } | [session: string | { id: string }, device: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: join.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SessionHardwareController::join
 * @see app/Http/Controllers/SessionHardwareController.php:373
 * @route '/sessions/{session}/hardware/devices/{device}/queue/join'
 */
        joinForm.post = (args: { session: string | { id: string }, device: number | { id: number } } | [session: string | { id: string }, device: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: join.url(args, options),
            method: 'post',
        })
    
    join.form = joinForm
/**
* @see \App\Http\Controllers\SessionHardwareController::leave
 * @see app/Http/Controllers/SessionHardwareController.php:427
 * @route '/sessions/{session}/hardware/devices/{device}/queue/leave'
 */
export const leave = (args: { session: string | { id: string }, device: number | { id: number } } | [session: string | { id: string }, device: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: leave.url(args, options),
    method: 'post',
})

leave.definition = {
    methods: ["post"],
    url: '/sessions/{session}/hardware/devices/{device}/queue/leave',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SessionHardwareController::leave
 * @see app/Http/Controllers/SessionHardwareController.php:427
 * @route '/sessions/{session}/hardware/devices/{device}/queue/leave'
 */
leave.url = (args: { session: string | { id: string }, device: number | { id: number } } | [session: string | { id: string }, device: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    session: args[0],
                    device: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        session: typeof args.session === 'object'
                ? args.session.id
                : args.session,
                                device: typeof args.device === 'object'
                ? args.device.id
                : args.device,
                }

    return leave.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace('{device}', parsedArgs.device.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionHardwareController::leave
 * @see app/Http/Controllers/SessionHardwareController.php:427
 * @route '/sessions/{session}/hardware/devices/{device}/queue/leave'
 */
leave.post = (args: { session: string | { id: string }, device: number | { id: number } } | [session: string | { id: string }, device: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: leave.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\SessionHardwareController::leave
 * @see app/Http/Controllers/SessionHardwareController.php:427
 * @route '/sessions/{session}/hardware/devices/{device}/queue/leave'
 */
    const leaveForm = (args: { session: string | { id: string }, device: number | { id: number } } | [session: string | { id: string }, device: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: leave.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SessionHardwareController::leave
 * @see app/Http/Controllers/SessionHardwareController.php:427
 * @route '/sessions/{session}/hardware/devices/{device}/queue/leave'
 */
        leaveForm.post = (args: { session: string | { id: string }, device: number | { id: number } } | [session: string | { id: string }, device: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: leave.url(args, options),
            method: 'post',
        })
    
    leave.form = leaveForm
const queue = {
    join: Object.assign(join, join),
leave: Object.assign(leave, leave),
}

export default queue