import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminPayoutController::exportMethod
 * @see app/Http/Controllers/Admin/AdminPayoutController.php:78
 * @route '/admin/payouts/export'
 */
export const exportMethod = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/admin/payouts/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminPayoutController::exportMethod
 * @see app/Http/Controllers/Admin/AdminPayoutController.php:78
 * @route '/admin/payouts/export'
 */
exportMethod.url = (options?: RouteQueryOptions) => {
    return exportMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminPayoutController::exportMethod
 * @see app/Http/Controllers/Admin/AdminPayoutController.php:78
 * @route '/admin/payouts/export'
 */
exportMethod.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminPayoutController::exportMethod
 * @see app/Http/Controllers/Admin/AdminPayoutController.php:78
 * @route '/admin/payouts/export'
 */
exportMethod.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminPayoutController::exportMethod
 * @see app/Http/Controllers/Admin/AdminPayoutController.php:78
 * @route '/admin/payouts/export'
 */
    const exportMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: exportMethod.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminPayoutController::exportMethod
 * @see app/Http/Controllers/Admin/AdminPayoutController.php:78
 * @route '/admin/payouts/export'
 */
        exportMethodForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: exportMethod.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminPayoutController::exportMethod
 * @see app/Http/Controllers/Admin/AdminPayoutController.php:78
 * @route '/admin/payouts/export'
 */
        exportMethodForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: exportMethod.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    exportMethod.form = exportMethodForm
/**
* @see \App\Http\Controllers\Admin\AdminPayoutController::approve
 * @see app/Http/Controllers/Admin/AdminPayoutController.php:20
 * @route '/admin/payouts/{payoutRequest}/approve'
 */
export const approve = (args: { payoutRequest: number | { id: number } } | [payoutRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/admin/payouts/{payoutRequest}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminPayoutController::approve
 * @see app/Http/Controllers/Admin/AdminPayoutController.php:20
 * @route '/admin/payouts/{payoutRequest}/approve'
 */
approve.url = (args: { payoutRequest: number | { id: number } } | [payoutRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { payoutRequest: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { payoutRequest: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    payoutRequest: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        payoutRequest: typeof args.payoutRequest === 'object'
                ? args.payoutRequest.id
                : args.payoutRequest,
                }

    return approve.definition.url
            .replace('{payoutRequest}', parsedArgs.payoutRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminPayoutController::approve
 * @see app/Http/Controllers/Admin/AdminPayoutController.php:20
 * @route '/admin/payouts/{payoutRequest}/approve'
 */
approve.post = (args: { payoutRequest: number | { id: number } } | [payoutRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminPayoutController::approve
 * @see app/Http/Controllers/Admin/AdminPayoutController.php:20
 * @route '/admin/payouts/{payoutRequest}/approve'
 */
    const approveForm = (args: { payoutRequest: number | { id: number } } | [payoutRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: approve.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminPayoutController::approve
 * @see app/Http/Controllers/Admin/AdminPayoutController.php:20
 * @route '/admin/payouts/{payoutRequest}/approve'
 */
        approveForm.post = (args: { payoutRequest: number | { id: number } } | [payoutRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: approve.url(args, options),
            method: 'post',
        })
    
    approve.form = approveForm
/**
* @see \App\Http\Controllers\Admin\AdminPayoutController::reject
 * @see app/Http/Controllers/Admin/AdminPayoutController.php:42
 * @route '/admin/payouts/{payoutRequest}/reject'
 */
export const reject = (args: { payoutRequest: number | { id: number } } | [payoutRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/admin/payouts/{payoutRequest}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminPayoutController::reject
 * @see app/Http/Controllers/Admin/AdminPayoutController.php:42
 * @route '/admin/payouts/{payoutRequest}/reject'
 */
reject.url = (args: { payoutRequest: number | { id: number } } | [payoutRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { payoutRequest: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { payoutRequest: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    payoutRequest: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        payoutRequest: typeof args.payoutRequest === 'object'
                ? args.payoutRequest.id
                : args.payoutRequest,
                }

    return reject.definition.url
            .replace('{payoutRequest}', parsedArgs.payoutRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminPayoutController::reject
 * @see app/Http/Controllers/Admin/AdminPayoutController.php:42
 * @route '/admin/payouts/{payoutRequest}/reject'
 */
reject.post = (args: { payoutRequest: number | { id: number } } | [payoutRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminPayoutController::reject
 * @see app/Http/Controllers/Admin/AdminPayoutController.php:42
 * @route '/admin/payouts/{payoutRequest}/reject'
 */
    const rejectForm = (args: { payoutRequest: number | { id: number } } | [payoutRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reject.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminPayoutController::reject
 * @see app/Http/Controllers/Admin/AdminPayoutController.php:42
 * @route '/admin/payouts/{payoutRequest}/reject'
 */
        rejectForm.post = (args: { payoutRequest: number | { id: number } } | [payoutRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reject.url(args, options),
            method: 'post',
        })
    
    reject.form = rejectForm
/**
* @see \App\Http\Controllers\Admin\AdminPayoutController::process
 * @see app/Http/Controllers/Admin/AdminPayoutController.php:64
 * @route '/admin/payouts/{payoutRequest}/process'
 */
export const process = (args: { payoutRequest: number | { id: number } } | [payoutRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: process.url(args, options),
    method: 'post',
})

process.definition = {
    methods: ["post"],
    url: '/admin/payouts/{payoutRequest}/process',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminPayoutController::process
 * @see app/Http/Controllers/Admin/AdminPayoutController.php:64
 * @route '/admin/payouts/{payoutRequest}/process'
 */
process.url = (args: { payoutRequest: number | { id: number } } | [payoutRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { payoutRequest: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { payoutRequest: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    payoutRequest: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        payoutRequest: typeof args.payoutRequest === 'object'
                ? args.payoutRequest.id
                : args.payoutRequest,
                }

    return process.definition.url
            .replace('{payoutRequest}', parsedArgs.payoutRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminPayoutController::process
 * @see app/Http/Controllers/Admin/AdminPayoutController.php:64
 * @route '/admin/payouts/{payoutRequest}/process'
 */
process.post = (args: { payoutRequest: number | { id: number } } | [payoutRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: process.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminPayoutController::process
 * @see app/Http/Controllers/Admin/AdminPayoutController.php:64
 * @route '/admin/payouts/{payoutRequest}/process'
 */
    const processForm = (args: { payoutRequest: number | { id: number } } | [payoutRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: process.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminPayoutController::process
 * @see app/Http/Controllers/Admin/AdminPayoutController.php:64
 * @route '/admin/payouts/{payoutRequest}/process'
 */
        processForm.post = (args: { payoutRequest: number | { id: number } } | [payoutRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: process.url(args, options),
            method: 'post',
        })
    
    process.form = processForm
const AdminPayoutController = { exportMethod, approve, reject, process, export: exportMethod }

export default AdminPayoutController