import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
import camera from './camera'
/**
* @see \App\Http\Controllers\CameraReservationController::index
 * @see app/Http/Controllers/CameraReservationController.php:32
 * @route '/camera-reservations'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/camera-reservations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CameraReservationController::index
 * @see app/Http/Controllers/CameraReservationController.php:32
 * @route '/camera-reservations'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CameraReservationController::index
 * @see app/Http/Controllers/CameraReservationController.php:32
 * @route '/camera-reservations'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CameraReservationController::index
 * @see app/Http/Controllers/CameraReservationController.php:32
 * @route '/camera-reservations'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CameraReservationController::index
 * @see app/Http/Controllers/CameraReservationController.php:32
 * @route '/camera-reservations'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CameraReservationController::index
 * @see app/Http/Controllers/CameraReservationController.php:32
 * @route '/camera-reservations'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CameraReservationController::index
 * @see app/Http/Controllers/CameraReservationController.php:32
 * @route '/camera-reservations'
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
* @see \App\Http\Controllers\CameraReservationController::cameras
 * @see app/Http/Controllers/CameraReservationController.php:54
 * @route '/camera-reservations/cameras'
 */
export const cameras = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: cameras.url(options),
    method: 'get',
})

cameras.definition = {
    methods: ["get","head"],
    url: '/camera-reservations/cameras',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CameraReservationController::cameras
 * @see app/Http/Controllers/CameraReservationController.php:54
 * @route '/camera-reservations/cameras'
 */
cameras.url = (options?: RouteQueryOptions) => {
    return cameras.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CameraReservationController::cameras
 * @see app/Http/Controllers/CameraReservationController.php:54
 * @route '/camera-reservations/cameras'
 */
cameras.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: cameras.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CameraReservationController::cameras
 * @see app/Http/Controllers/CameraReservationController.php:54
 * @route '/camera-reservations/cameras'
 */
cameras.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: cameras.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CameraReservationController::cameras
 * @see app/Http/Controllers/CameraReservationController.php:54
 * @route '/camera-reservations/cameras'
 */
    const camerasForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: cameras.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CameraReservationController::cameras
 * @see app/Http/Controllers/CameraReservationController.php:54
 * @route '/camera-reservations/cameras'
 */
        camerasForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: cameras.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CameraReservationController::cameras
 * @see app/Http/Controllers/CameraReservationController.php:54
 * @route '/camera-reservations/cameras'
 */
        camerasForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: cameras.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    cameras.form = camerasForm
/**
* @see \App\Http\Controllers\CameraReservationController::store
 * @see app/Http/Controllers/CameraReservationController.php:70
 * @route '/camera-reservations'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/camera-reservations',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CameraReservationController::store
 * @see app/Http/Controllers/CameraReservationController.php:70
 * @route '/camera-reservations'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CameraReservationController::store
 * @see app/Http/Controllers/CameraReservationController.php:70
 * @route '/camera-reservations'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\CameraReservationController::store
 * @see app/Http/Controllers/CameraReservationController.php:70
 * @route '/camera-reservations'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CameraReservationController::store
 * @see app/Http/Controllers/CameraReservationController.php:70
 * @route '/camera-reservations'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\CameraReservationController::show
 * @see app/Http/Controllers/CameraReservationController.php:105
 * @route '/camera-reservations/{reservation}'
 */
export const show = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/camera-reservations/{reservation}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CameraReservationController::show
 * @see app/Http/Controllers/CameraReservationController.php:105
 * @route '/camera-reservations/{reservation}'
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
* @see \App\Http\Controllers\CameraReservationController::show
 * @see app/Http/Controllers/CameraReservationController.php:105
 * @route '/camera-reservations/{reservation}'
 */
show.get = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CameraReservationController::show
 * @see app/Http/Controllers/CameraReservationController.php:105
 * @route '/camera-reservations/{reservation}'
 */
show.head = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CameraReservationController::show
 * @see app/Http/Controllers/CameraReservationController.php:105
 * @route '/camera-reservations/{reservation}'
 */
    const showForm = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CameraReservationController::show
 * @see app/Http/Controllers/CameraReservationController.php:105
 * @route '/camera-reservations/{reservation}'
 */
        showForm.get = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CameraReservationController::show
 * @see app/Http/Controllers/CameraReservationController.php:105
 * @route '/camera-reservations/{reservation}'
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
* @see \App\Http\Controllers\CameraReservationController::cancel
 * @see app/Http/Controllers/CameraReservationController.php:131
 * @route '/camera-reservations/{reservation}/cancel'
 */
export const cancel = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

cancel.definition = {
    methods: ["post"],
    url: '/camera-reservations/{reservation}/cancel',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CameraReservationController::cancel
 * @see app/Http/Controllers/CameraReservationController.php:131
 * @route '/camera-reservations/{reservation}/cancel'
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
* @see \App\Http\Controllers\CameraReservationController::cancel
 * @see app/Http/Controllers/CameraReservationController.php:131
 * @route '/camera-reservations/{reservation}/cancel'
 */
cancel.post = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\CameraReservationController::cancel
 * @see app/Http/Controllers/CameraReservationController.php:131
 * @route '/camera-reservations/{reservation}/cancel'
 */
    const cancelForm = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: cancel.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CameraReservationController::cancel
 * @see app/Http/Controllers/CameraReservationController.php:131
 * @route '/camera-reservations/{reservation}/cancel'
 */
        cancelForm.post = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: cancel.url(args, options),
            method: 'post',
        })
    
    cancel.form = cancelForm
const cameraReservations = {
    index: Object.assign(index, index),
cameras: Object.assign(cameras, cameras),
store: Object.assign(store, store),
show: Object.assign(show, show),
cancel: Object.assign(cancel, cancel),
camera: Object.assign(camera, camera),
}

export default cameraReservations