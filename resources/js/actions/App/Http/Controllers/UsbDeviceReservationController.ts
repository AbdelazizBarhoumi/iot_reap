import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\UsbDeviceReservationController::index
 * @see app/Http/Controllers/UsbDeviceReservationController.php:32
 * @route '/reservations'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/reservations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UsbDeviceReservationController::index
 * @see app/Http/Controllers/UsbDeviceReservationController.php:32
 * @route '/reservations'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UsbDeviceReservationController::index
 * @see app/Http/Controllers/UsbDeviceReservationController.php:32
 * @route '/reservations'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\UsbDeviceReservationController::index
 * @see app/Http/Controllers/UsbDeviceReservationController.php:32
 * @route '/reservations'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\UsbDeviceReservationController::index
 * @see app/Http/Controllers/UsbDeviceReservationController.php:32
 * @route '/reservations'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\UsbDeviceReservationController::index
 * @see app/Http/Controllers/UsbDeviceReservationController.php:32
 * @route '/reservations'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\UsbDeviceReservationController::index
 * @see app/Http/Controllers/UsbDeviceReservationController.php:32
 * @route '/reservations'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\UsbDeviceReservationController::store
 * @see app/Http/Controllers/UsbDeviceReservationController.php:50
 * @route '/reservations'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/reservations',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\UsbDeviceReservationController::store
 * @see app/Http/Controllers/UsbDeviceReservationController.php:50
 * @route '/reservations'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UsbDeviceReservationController::store
 * @see app/Http/Controllers/UsbDeviceReservationController.php:50
 * @route '/reservations'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\UsbDeviceReservationController::store
 * @see app/Http/Controllers/UsbDeviceReservationController.php:50
 * @route '/reservations'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\UsbDeviceReservationController::store
 * @see app/Http/Controllers/UsbDeviceReservationController.php:50
 * @route '/reservations'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\UsbDeviceReservationController::show
 * @see app/Http/Controllers/UsbDeviceReservationController.php:90
 * @route '/reservations/{reservation}'
 */
export const show = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/reservations/{reservation}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UsbDeviceReservationController::show
 * @see app/Http/Controllers/UsbDeviceReservationController.php:90
 * @route '/reservations/{reservation}'
 */
show.url = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { reservation: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { reservation: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    reservation: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        reservation: typeof args.reservation === 'object'
                ? args.reservation.id
                : args.reservation,
                }

    return show.definition.url
            .replace('{reservation}', parsedArgs.reservation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\UsbDeviceReservationController::show
 * @see app/Http/Controllers/UsbDeviceReservationController.php:90
 * @route '/reservations/{reservation}'
 */
show.get = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\UsbDeviceReservationController::show
 * @see app/Http/Controllers/UsbDeviceReservationController.php:90
 * @route '/reservations/{reservation}'
 */
show.head = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\UsbDeviceReservationController::show
 * @see app/Http/Controllers/UsbDeviceReservationController.php:90
 * @route '/reservations/{reservation}'
 */
    const showForm = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\UsbDeviceReservationController::show
 * @see app/Http/Controllers/UsbDeviceReservationController.php:90
 * @route '/reservations/{reservation}'
 */
        showForm.get = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\UsbDeviceReservationController::show
 * @see app/Http/Controllers/UsbDeviceReservationController.php:90
 * @route '/reservations/{reservation}'
 */
        showForm.head = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \App\Http\Controllers\UsbDeviceReservationController::cancel
 * @see app/Http/Controllers/UsbDeviceReservationController.php:111
 * @route '/reservations/{reservation}/cancel'
 */
export const cancel = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

cancel.definition = {
    methods: ["post"],
    url: '/reservations/{reservation}/cancel',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\UsbDeviceReservationController::cancel
 * @see app/Http/Controllers/UsbDeviceReservationController.php:111
 * @route '/reservations/{reservation}/cancel'
 */
cancel.url = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { reservation: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { reservation: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    reservation: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        reservation: typeof args.reservation === 'object'
                ? args.reservation.id
                : args.reservation,
                }

    return cancel.definition.url
            .replace('{reservation}', parsedArgs.reservation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\UsbDeviceReservationController::cancel
 * @see app/Http/Controllers/UsbDeviceReservationController.php:111
 * @route '/reservations/{reservation}/cancel'
 */
cancel.post = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\UsbDeviceReservationController::cancel
 * @see app/Http/Controllers/UsbDeviceReservationController.php:111
 * @route '/reservations/{reservation}/cancel'
 */
    const cancelForm = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: cancel.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\UsbDeviceReservationController::cancel
 * @see app/Http/Controllers/UsbDeviceReservationController.php:111
 * @route '/reservations/{reservation}/cancel'
 */
        cancelForm.post = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: cancel.url(args, options),
            method: 'post',
        })
    
    cancel.form = cancelForm
/**
* @see \App\Http\Controllers\UsbDeviceReservationController::deviceReservations
 * @see app/Http/Controllers/UsbDeviceReservationController.php:141
 * @route '/reservations/devices/{device}/calendar'
 */
export const deviceReservations = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: deviceReservations.url(args, options),
    method: 'get',
})

deviceReservations.definition = {
    methods: ["get","head"],
    url: '/reservations/devices/{device}/calendar',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UsbDeviceReservationController::deviceReservations
 * @see app/Http/Controllers/UsbDeviceReservationController.php:141
 * @route '/reservations/devices/{device}/calendar'
 */
deviceReservations.url = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return deviceReservations.definition.url
            .replace('{device}', parsedArgs.device.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\UsbDeviceReservationController::deviceReservations
 * @see app/Http/Controllers/UsbDeviceReservationController.php:141
 * @route '/reservations/devices/{device}/calendar'
 */
deviceReservations.get = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: deviceReservations.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\UsbDeviceReservationController::deviceReservations
 * @see app/Http/Controllers/UsbDeviceReservationController.php:141
 * @route '/reservations/devices/{device}/calendar'
 */
deviceReservations.head = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: deviceReservations.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\UsbDeviceReservationController::deviceReservations
 * @see app/Http/Controllers/UsbDeviceReservationController.php:141
 * @route '/reservations/devices/{device}/calendar'
 */
    const deviceReservationsForm = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: deviceReservations.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\UsbDeviceReservationController::deviceReservations
 * @see app/Http/Controllers/UsbDeviceReservationController.php:141
 * @route '/reservations/devices/{device}/calendar'
 */
        deviceReservationsForm.get = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: deviceReservations.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\UsbDeviceReservationController::deviceReservations
 * @see app/Http/Controllers/UsbDeviceReservationController.php:141
 * @route '/reservations/devices/{device}/calendar'
 */
        deviceReservationsForm.head = (args: { device: number | { id: number } } | [device: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: deviceReservations.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    deviceReservations.form = deviceReservationsForm
const UsbDeviceReservationController = { index, store, show, cancel, deviceReservations }

export default UsbDeviceReservationController