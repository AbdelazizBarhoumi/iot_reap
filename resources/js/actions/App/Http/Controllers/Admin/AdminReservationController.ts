import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminReservationController::index
 * @see app/Http/Controllers/Admin/AdminReservationController.php:44
 * @route '/admin/reservations'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/reservations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminReservationController::index
 * @see app/Http/Controllers/Admin/AdminReservationController.php:44
 * @route '/admin/reservations'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminReservationController::index
 * @see app/Http/Controllers/Admin/AdminReservationController.php:44
 * @route '/admin/reservations'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminReservationController::index
 * @see app/Http/Controllers/Admin/AdminReservationController.php:44
 * @route '/admin/reservations'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminReservationController::index
 * @see app/Http/Controllers/Admin/AdminReservationController.php:44
 * @route '/admin/reservations'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminReservationController::index
 * @see app/Http/Controllers/Admin/AdminReservationController.php:44
 * @route '/admin/reservations'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminReservationController::index
 * @see app/Http/Controllers/Admin/AdminReservationController.php:44
 * @route '/admin/reservations'
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
* @see \App\Http\Controllers\Admin\AdminReservationController::pending
 * @see app/Http/Controllers/Admin/AdminReservationController.php:30
 * @route '/admin/reservations/pending'
 */
export const pending = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pending.url(options),
    method: 'get',
})

pending.definition = {
    methods: ["get","head"],
    url: '/admin/reservations/pending',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminReservationController::pending
 * @see app/Http/Controllers/Admin/AdminReservationController.php:30
 * @route '/admin/reservations/pending'
 */
pending.url = (options?: RouteQueryOptions) => {
    return pending.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminReservationController::pending
 * @see app/Http/Controllers/Admin/AdminReservationController.php:30
 * @route '/admin/reservations/pending'
 */
pending.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pending.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminReservationController::pending
 * @see app/Http/Controllers/Admin/AdminReservationController.php:30
 * @route '/admin/reservations/pending'
 */
pending.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: pending.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminReservationController::pending
 * @see app/Http/Controllers/Admin/AdminReservationController.php:30
 * @route '/admin/reservations/pending'
 */
    const pendingForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: pending.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminReservationController::pending
 * @see app/Http/Controllers/Admin/AdminReservationController.php:30
 * @route '/admin/reservations/pending'
 */
        pendingForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: pending.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminReservationController::pending
 * @see app/Http/Controllers/Admin/AdminReservationController.php:30
 * @route '/admin/reservations/pending'
 */
        pendingForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: pending.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    pending.form = pendingForm
/**
* @see \App\Http\Controllers\Admin\AdminReservationController::upcoming
 * @see app/Http/Controllers/Admin/AdminReservationController.php:216
 * @route '/admin/reservations/upcoming'
 */
export const upcoming = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: upcoming.url(options),
    method: 'get',
})

upcoming.definition = {
    methods: ["get","head"],
    url: '/admin/reservations/upcoming',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminReservationController::upcoming
 * @see app/Http/Controllers/Admin/AdminReservationController.php:216
 * @route '/admin/reservations/upcoming'
 */
upcoming.url = (options?: RouteQueryOptions) => {
    return upcoming.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminReservationController::upcoming
 * @see app/Http/Controllers/Admin/AdminReservationController.php:216
 * @route '/admin/reservations/upcoming'
 */
upcoming.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: upcoming.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminReservationController::upcoming
 * @see app/Http/Controllers/Admin/AdminReservationController.php:216
 * @route '/admin/reservations/upcoming'
 */
upcoming.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: upcoming.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminReservationController::upcoming
 * @see app/Http/Controllers/Admin/AdminReservationController.php:216
 * @route '/admin/reservations/upcoming'
 */
    const upcomingForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: upcoming.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminReservationController::upcoming
 * @see app/Http/Controllers/Admin/AdminReservationController.php:216
 * @route '/admin/reservations/upcoming'
 */
        upcomingForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: upcoming.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminReservationController::upcoming
 * @see app/Http/Controllers/Admin/AdminReservationController.php:216
 * @route '/admin/reservations/upcoming'
 */
        upcomingForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: upcoming.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    upcoming.form = upcomingForm
/**
* @see \App\Http\Controllers\Admin\AdminReservationController::approve
 * @see app/Http/Controllers/Admin/AdminReservationController.php:97
 * @route '/admin/reservations/{reservation}/approve'
 */
export const approve = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/admin/reservations/{reservation}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminReservationController::approve
 * @see app/Http/Controllers/Admin/AdminReservationController.php:97
 * @route '/admin/reservations/{reservation}/approve'
 */
approve.url = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return approve.definition.url
            .replace('{reservation}', parsedArgs.reservation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminReservationController::approve
 * @see app/Http/Controllers/Admin/AdminReservationController.php:97
 * @route '/admin/reservations/{reservation}/approve'
 */
approve.post = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminReservationController::approve
 * @see app/Http/Controllers/Admin/AdminReservationController.php:97
 * @route '/admin/reservations/{reservation}/approve'
 */
    const approveForm = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: approve.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminReservationController::approve
 * @see app/Http/Controllers/Admin/AdminReservationController.php:97
 * @route '/admin/reservations/{reservation}/approve'
 */
        approveForm.post = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: approve.url(args, options),
            method: 'post',
        })
    
    approve.form = approveForm
/**
* @see \App\Http\Controllers\Admin\AdminReservationController::reject
 * @see app/Http/Controllers/Admin/AdminReservationController.php:147
 * @route '/admin/reservations/{reservation}/reject'
 */
export const reject = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/admin/reservations/{reservation}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminReservationController::reject
 * @see app/Http/Controllers/Admin/AdminReservationController.php:147
 * @route '/admin/reservations/{reservation}/reject'
 */
reject.url = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return reject.definition.url
            .replace('{reservation}', parsedArgs.reservation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminReservationController::reject
 * @see app/Http/Controllers/Admin/AdminReservationController.php:147
 * @route '/admin/reservations/{reservation}/reject'
 */
reject.post = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminReservationController::reject
 * @see app/Http/Controllers/Admin/AdminReservationController.php:147
 * @route '/admin/reservations/{reservation}/reject'
 */
    const rejectForm = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reject.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminReservationController::reject
 * @see app/Http/Controllers/Admin/AdminReservationController.php:147
 * @route '/admin/reservations/{reservation}/reject'
 */
        rejectForm.post = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reject.url(args, options),
            method: 'post',
        })
    
    reject.form = rejectForm
/**
* @see \App\Http\Controllers\Admin\AdminReservationController::createBlock
 * @see app/Http/Controllers/Admin/AdminReservationController.php:179
 * @route '/admin/reservations/block'
 */
export const createBlock = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createBlock.url(options),
    method: 'post',
})

createBlock.definition = {
    methods: ["post"],
    url: '/admin/reservations/block',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminReservationController::createBlock
 * @see app/Http/Controllers/Admin/AdminReservationController.php:179
 * @route '/admin/reservations/block'
 */
createBlock.url = (options?: RouteQueryOptions) => {
    return createBlock.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminReservationController::createBlock
 * @see app/Http/Controllers/Admin/AdminReservationController.php:179
 * @route '/admin/reservations/block'
 */
createBlock.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createBlock.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminReservationController::createBlock
 * @see app/Http/Controllers/Admin/AdminReservationController.php:179
 * @route '/admin/reservations/block'
 */
    const createBlockForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: createBlock.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminReservationController::createBlock
 * @see app/Http/Controllers/Admin/AdminReservationController.php:179
 * @route '/admin/reservations/block'
 */
        createBlockForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: createBlock.url(options),
            method: 'post',
        })
    
    createBlock.form = createBlockForm
const AdminReservationController = { index, pending, upcoming, approve, reject, createBlock }

export default AdminReservationController