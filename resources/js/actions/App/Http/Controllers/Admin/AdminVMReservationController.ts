import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminVMReservationController::index
 * @see app/Http/Controllers/Admin/AdminVMReservationController.php:21
 * @route '/admin/vm-reservations'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/vm-reservations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminVMReservationController::index
 * @see app/Http/Controllers/Admin/AdminVMReservationController.php:21
 * @route '/admin/vm-reservations'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminVMReservationController::index
 * @see app/Http/Controllers/Admin/AdminVMReservationController.php:21
 * @route '/admin/vm-reservations'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminVMReservationController::index
 * @see app/Http/Controllers/Admin/AdminVMReservationController.php:21
 * @route '/admin/vm-reservations'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminVMReservationController::index
 * @see app/Http/Controllers/Admin/AdminVMReservationController.php:21
 * @route '/admin/vm-reservations'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminVMReservationController::index
 * @see app/Http/Controllers/Admin/AdminVMReservationController.php:21
 * @route '/admin/vm-reservations'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminVMReservationController::index
 * @see app/Http/Controllers/Admin/AdminVMReservationController.php:21
 * @route '/admin/vm-reservations'
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
* @see \App\Http\Controllers\Admin\AdminVMReservationController::pending
 * @see app/Http/Controllers/Admin/AdminVMReservationController.php:35
 * @route '/admin/vm-reservations/pending'
 */
export const pending = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pending.url(options),
    method: 'get',
})

pending.definition = {
    methods: ["get","head"],
    url: '/admin/vm-reservations/pending',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminVMReservationController::pending
 * @see app/Http/Controllers/Admin/AdminVMReservationController.php:35
 * @route '/admin/vm-reservations/pending'
 */
pending.url = (options?: RouteQueryOptions) => {
    return pending.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminVMReservationController::pending
 * @see app/Http/Controllers/Admin/AdminVMReservationController.php:35
 * @route '/admin/vm-reservations/pending'
 */
pending.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pending.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminVMReservationController::pending
 * @see app/Http/Controllers/Admin/AdminVMReservationController.php:35
 * @route '/admin/vm-reservations/pending'
 */
pending.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: pending.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminVMReservationController::pending
 * @see app/Http/Controllers/Admin/AdminVMReservationController.php:35
 * @route '/admin/vm-reservations/pending'
 */
    const pendingForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: pending.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminVMReservationController::pending
 * @see app/Http/Controllers/Admin/AdminVMReservationController.php:35
 * @route '/admin/vm-reservations/pending'
 */
        pendingForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: pending.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminVMReservationController::pending
 * @see app/Http/Controllers/Admin/AdminVMReservationController.php:35
 * @route '/admin/vm-reservations/pending'
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
* @see \App\Http\Controllers\Admin\AdminVMReservationController::approve
 * @see app/Http/Controllers/Admin/AdminVMReservationController.php:40
 * @route '/admin/vm-reservations/{reservation}/approve'
 */
export const approve = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/admin/vm-reservations/{reservation}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminVMReservationController::approve
 * @see app/Http/Controllers/Admin/AdminVMReservationController.php:40
 * @route '/admin/vm-reservations/{reservation}/approve'
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
* @see \App\Http\Controllers\Admin\AdminVMReservationController::approve
 * @see app/Http/Controllers/Admin/AdminVMReservationController.php:40
 * @route '/admin/vm-reservations/{reservation}/approve'
 */
approve.post = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminVMReservationController::approve
 * @see app/Http/Controllers/Admin/AdminVMReservationController.php:40
 * @route '/admin/vm-reservations/{reservation}/approve'
 */
    const approveForm = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: approve.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminVMReservationController::approve
 * @see app/Http/Controllers/Admin/AdminVMReservationController.php:40
 * @route '/admin/vm-reservations/{reservation}/approve'
 */
        approveForm.post = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: approve.url(args, options),
            method: 'post',
        })
    
    approve.form = approveForm
/**
* @see \App\Http\Controllers\Admin\AdminVMReservationController::reject
 * @see app/Http/Controllers/Admin/AdminVMReservationController.php:70
 * @route '/admin/vm-reservations/{reservation}/reject'
 */
export const reject = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/admin/vm-reservations/{reservation}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminVMReservationController::reject
 * @see app/Http/Controllers/Admin/AdminVMReservationController.php:70
 * @route '/admin/vm-reservations/{reservation}/reject'
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
* @see \App\Http\Controllers\Admin\AdminVMReservationController::reject
 * @see app/Http/Controllers/Admin/AdminVMReservationController.php:70
 * @route '/admin/vm-reservations/{reservation}/reject'
 */
reject.post = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminVMReservationController::reject
 * @see app/Http/Controllers/Admin/AdminVMReservationController.php:70
 * @route '/admin/vm-reservations/{reservation}/reject'
 */
    const rejectForm = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reject.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminVMReservationController::reject
 * @see app/Http/Controllers/Admin/AdminVMReservationController.php:70
 * @route '/admin/vm-reservations/{reservation}/reject'
 */
        rejectForm.post = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reject.url(args, options),
            method: 'post',
        })
    
    reject.form = rejectForm
const AdminVMReservationController = { index, pending, approve, reject }

export default AdminVMReservationController