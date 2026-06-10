import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\CameraReservationController::calendar
 * @see app/Http/Controllers/CameraReservationController.php:166
 * @route '/camera-reservations/cameras/{camera}/calendar'
 */
export const calendar = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: calendar.url(args, options),
    method: 'get',
})

calendar.definition = {
    methods: ["get","head"],
    url: '/camera-reservations/cameras/{camera}/calendar',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CameraReservationController::calendar
 * @see app/Http/Controllers/CameraReservationController.php:166
 * @route '/camera-reservations/cameras/{camera}/calendar'
 */
calendar.url = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { camera: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { camera: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    camera: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        camera: typeof args.camera === 'object'
                ? args.camera.id
                : args.camera,
                }

    return calendar.definition.url
            .replace('{camera}', parsedArgs.camera.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CameraReservationController::calendar
 * @see app/Http/Controllers/CameraReservationController.php:166
 * @route '/camera-reservations/cameras/{camera}/calendar'
 */
calendar.get = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: calendar.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CameraReservationController::calendar
 * @see app/Http/Controllers/CameraReservationController.php:166
 * @route '/camera-reservations/cameras/{camera}/calendar'
 */
calendar.head = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: calendar.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CameraReservationController::calendar
 * @see app/Http/Controllers/CameraReservationController.php:166
 * @route '/camera-reservations/cameras/{camera}/calendar'
 */
    const calendarForm = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: calendar.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CameraReservationController::calendar
 * @see app/Http/Controllers/CameraReservationController.php:166
 * @route '/camera-reservations/cameras/{camera}/calendar'
 */
        calendarForm.get = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: calendar.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CameraReservationController::calendar
 * @see app/Http/Controllers/CameraReservationController.php:166
 * @route '/camera-reservations/cameras/{camera}/calendar'
 */
        calendarForm.head = (args: { camera: number | { id: number } } | [camera: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: calendar.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    calendar.form = calendarForm
const camera = {
    calendar: Object.assign(calendar, calendar),
}

export default camera