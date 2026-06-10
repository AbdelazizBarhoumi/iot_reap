import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\VMReservationController::index
 * @see app/Http/Controllers/VMReservationController.php:23
 * @route '/vm-reservations'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/vm-reservations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\VMReservationController::index
 * @see app/Http/Controllers/VMReservationController.php:23
 * @route '/vm-reservations'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\VMReservationController::index
 * @see app/Http/Controllers/VMReservationController.php:23
 * @route '/vm-reservations'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\VMReservationController::index
 * @see app/Http/Controllers/VMReservationController.php:23
 * @route '/vm-reservations'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\VMReservationController::index
 * @see app/Http/Controllers/VMReservationController.php:23
 * @route '/vm-reservations'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\VMReservationController::index
 * @see app/Http/Controllers/VMReservationController.php:23
 * @route '/vm-reservations'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\VMReservationController::index
 * @see app/Http/Controllers/VMReservationController.php:23
 * @route '/vm-reservations'
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
* @see \App\Http\Controllers\VMReservationController::availableVMs
 * @see app/Http/Controllers/VMReservationController.php:32
 * @route '/vm-reservations/available-vms'
 */
export const availableVMs = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: availableVMs.url(options),
    method: 'get',
})

availableVMs.definition = {
    methods: ["get","head"],
    url: '/vm-reservations/available-vms',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\VMReservationController::availableVMs
 * @see app/Http/Controllers/VMReservationController.php:32
 * @route '/vm-reservations/available-vms'
 */
availableVMs.url = (options?: RouteQueryOptions) => {
    return availableVMs.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\VMReservationController::availableVMs
 * @see app/Http/Controllers/VMReservationController.php:32
 * @route '/vm-reservations/available-vms'
 */
availableVMs.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: availableVMs.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\VMReservationController::availableVMs
 * @see app/Http/Controllers/VMReservationController.php:32
 * @route '/vm-reservations/available-vms'
 */
availableVMs.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: availableVMs.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\VMReservationController::availableVMs
 * @see app/Http/Controllers/VMReservationController.php:32
 * @route '/vm-reservations/available-vms'
 */
    const availableVMsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: availableVMs.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\VMReservationController::availableVMs
 * @see app/Http/Controllers/VMReservationController.php:32
 * @route '/vm-reservations/available-vms'
 */
        availableVMsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: availableVMs.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\VMReservationController::availableVMs
 * @see app/Http/Controllers/VMReservationController.php:32
 * @route '/vm-reservations/available-vms'
 */
        availableVMsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: availableVMs.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    availableVMs.form = availableVMsForm
/**
* @see \App\Http\Controllers\VMReservationController::store
 * @see app/Http/Controllers/VMReservationController.php:39
 * @route '/vm-reservations'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/vm-reservations',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\VMReservationController::store
 * @see app/Http/Controllers/VMReservationController.php:39
 * @route '/vm-reservations'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\VMReservationController::store
 * @see app/Http/Controllers/VMReservationController.php:39
 * @route '/vm-reservations'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\VMReservationController::store
 * @see app/Http/Controllers/VMReservationController.php:39
 * @route '/vm-reservations'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\VMReservationController::store
 * @see app/Http/Controllers/VMReservationController.php:39
 * @route '/vm-reservations'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\VMReservationController::show
 * @see app/Http/Controllers/VMReservationController.php:66
 * @route '/vm-reservations/{reservation}'
 */
export const show = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/vm-reservations/{reservation}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\VMReservationController::show
 * @see app/Http/Controllers/VMReservationController.php:66
 * @route '/vm-reservations/{reservation}'
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
* @see \App\Http\Controllers\VMReservationController::show
 * @see app/Http/Controllers/VMReservationController.php:66
 * @route '/vm-reservations/{reservation}'
 */
show.get = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\VMReservationController::show
 * @see app/Http/Controllers/VMReservationController.php:66
 * @route '/vm-reservations/{reservation}'
 */
show.head = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\VMReservationController::show
 * @see app/Http/Controllers/VMReservationController.php:66
 * @route '/vm-reservations/{reservation}'
 */
    const showForm = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\VMReservationController::show
 * @see app/Http/Controllers/VMReservationController.php:66
 * @route '/vm-reservations/{reservation}'
 */
        showForm.get = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\VMReservationController::show
 * @see app/Http/Controllers/VMReservationController.php:66
 * @route '/vm-reservations/{reservation}'
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
* @see \App\Http\Controllers\VMReservationController::cancel
 * @see app/Http/Controllers/VMReservationController.php:81
 * @route '/vm-reservations/{reservation}/cancel'
 */
export const cancel = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

cancel.definition = {
    methods: ["post"],
    url: '/vm-reservations/{reservation}/cancel',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\VMReservationController::cancel
 * @see app/Http/Controllers/VMReservationController.php:81
 * @route '/vm-reservations/{reservation}/cancel'
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
* @see \App\Http\Controllers\VMReservationController::cancel
 * @see app/Http/Controllers/VMReservationController.php:81
 * @route '/vm-reservations/{reservation}/cancel'
 */
cancel.post = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\VMReservationController::cancel
 * @see app/Http/Controllers/VMReservationController.php:81
 * @route '/vm-reservations/{reservation}/cancel'
 */
    const cancelForm = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: cancel.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\VMReservationController::cancel
 * @see app/Http/Controllers/VMReservationController.php:81
 * @route '/vm-reservations/{reservation}/cancel'
 */
        cancelForm.post = (args: { reservation: number | { id: number } } | [reservation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: cancel.url(args, options),
            method: 'post',
        })
    
    cancel.form = cancelForm
/**
* @see \App\Http\Controllers\VMReservationController::vmReservationsCalendar
 * @see app/Http/Controllers/VMReservationController.php:103
 * @route '/vm-reservations/nodes/{nodeId}/vms/{vmId}/calendar'
 */
export const vmReservationsCalendar = (args: { nodeId: string | number, vmId: string | number } | [nodeId: string | number, vmId: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: vmReservationsCalendar.url(args, options),
    method: 'get',
})

vmReservationsCalendar.definition = {
    methods: ["get","head"],
    url: '/vm-reservations/nodes/{nodeId}/vms/{vmId}/calendar',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\VMReservationController::vmReservationsCalendar
 * @see app/Http/Controllers/VMReservationController.php:103
 * @route '/vm-reservations/nodes/{nodeId}/vms/{vmId}/calendar'
 */
vmReservationsCalendar.url = (args: { nodeId: string | number, vmId: string | number } | [nodeId: string | number, vmId: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    nodeId: args[0],
                    vmId: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        nodeId: args.nodeId,
                                vmId: args.vmId,
                }

    return vmReservationsCalendar.definition.url
            .replace('{nodeId}', parsedArgs.nodeId.toString())
            .replace('{vmId}', parsedArgs.vmId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VMReservationController::vmReservationsCalendar
 * @see app/Http/Controllers/VMReservationController.php:103
 * @route '/vm-reservations/nodes/{nodeId}/vms/{vmId}/calendar'
 */
vmReservationsCalendar.get = (args: { nodeId: string | number, vmId: string | number } | [nodeId: string | number, vmId: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: vmReservationsCalendar.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\VMReservationController::vmReservationsCalendar
 * @see app/Http/Controllers/VMReservationController.php:103
 * @route '/vm-reservations/nodes/{nodeId}/vms/{vmId}/calendar'
 */
vmReservationsCalendar.head = (args: { nodeId: string | number, vmId: string | number } | [nodeId: string | number, vmId: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: vmReservationsCalendar.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\VMReservationController::vmReservationsCalendar
 * @see app/Http/Controllers/VMReservationController.php:103
 * @route '/vm-reservations/nodes/{nodeId}/vms/{vmId}/calendar'
 */
    const vmReservationsCalendarForm = (args: { nodeId: string | number, vmId: string | number } | [nodeId: string | number, vmId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: vmReservationsCalendar.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\VMReservationController::vmReservationsCalendar
 * @see app/Http/Controllers/VMReservationController.php:103
 * @route '/vm-reservations/nodes/{nodeId}/vms/{vmId}/calendar'
 */
        vmReservationsCalendarForm.get = (args: { nodeId: string | number, vmId: string | number } | [nodeId: string | number, vmId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: vmReservationsCalendar.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\VMReservationController::vmReservationsCalendar
 * @see app/Http/Controllers/VMReservationController.php:103
 * @route '/vm-reservations/nodes/{nodeId}/vms/{vmId}/calendar'
 */
        vmReservationsCalendarForm.head = (args: { nodeId: string | number, vmId: string | number } | [nodeId: string | number, vmId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: vmReservationsCalendar.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    vmReservationsCalendar.form = vmReservationsCalendarForm
const VMReservationController = { index, availableVMs, store, show, cancel, vmReservationsCalendar }

export default VMReservationController