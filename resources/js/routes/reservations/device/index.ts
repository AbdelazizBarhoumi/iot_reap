import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\UsbDeviceReservationController::calendar
 * @see app/Http/Controllers/UsbDeviceReservationController.php:141
 * @route '/reservations/devices/{device}/calendar'
 */
export const calendar = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: calendar.url(args, options),
    method: 'get',
})

calendar.definition = {
    methods: ["get","head"],
    url: '/reservations/devices/{device}/calendar',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UsbDeviceReservationController::calendar
 * @see app/Http/Controllers/UsbDeviceReservationController.php:141
 * @route '/reservations/devices/{device}/calendar'
 */
calendar.url = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { device: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { device: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    device: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        device: typeof args.device === 'object'
                ? args.device.id
                : args.device,
                }

    return calendar.definition.url
            .replace('{device}', parsedArgs.device.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\UsbDeviceReservationController::calendar
 * @see app/Http/Controllers/UsbDeviceReservationController.php:141
 * @route '/reservations/devices/{device}/calendar'
 */
calendar.get = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: calendar.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\UsbDeviceReservationController::calendar
 * @see app/Http/Controllers/UsbDeviceReservationController.php:141
 * @route '/reservations/devices/{device}/calendar'
 */
calendar.head = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: calendar.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\UsbDeviceReservationController::calendar
 * @see app/Http/Controllers/UsbDeviceReservationController.php:141
 * @route '/reservations/devices/{device}/calendar'
 */
    const calendarForm = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: calendar.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\UsbDeviceReservationController::calendar
 * @see app/Http/Controllers/UsbDeviceReservationController.php:141
 * @route '/reservations/devices/{device}/calendar'
 */
        calendarForm.get = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: calendar.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\UsbDeviceReservationController::calendar
 * @see app/Http/Controllers/UsbDeviceReservationController.php:141
 * @route '/reservations/devices/{device}/calendar'
 */
        calendarForm.head = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: calendar.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    calendar.form = calendarForm
const device = {
    calendar: Object.assign(calendar, calendar),
}

export default device