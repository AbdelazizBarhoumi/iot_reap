import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/refunds'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/refunds',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/refunds'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/refunds'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/refunds'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/refunds'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/refunds'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/refunds'
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
* @see \App\Http\Controllers\Admin\AdminRefundController::all
 * @see app/Http/Controllers/Admin/AdminRefundController.php:73
 * @route '/admin/refunds/all'
 */
export const all = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: all.url(options),
    method: 'get',
})

all.definition = {
    methods: ["get","head"],
    url: '/admin/refunds/all',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminRefundController::all
 * @see app/Http/Controllers/Admin/AdminRefundController.php:73
 * @route '/admin/refunds/all'
 */
all.url = (options?: RouteQueryOptions) => {
    return all.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminRefundController::all
 * @see app/Http/Controllers/Admin/AdminRefundController.php:73
 * @route '/admin/refunds/all'
 */
all.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: all.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminRefundController::all
 * @see app/Http/Controllers/Admin/AdminRefundController.php:73
 * @route '/admin/refunds/all'
 */
all.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: all.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminRefundController::all
 * @see app/Http/Controllers/Admin/AdminRefundController.php:73
 * @route '/admin/refunds/all'
 */
    const allForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: all.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminRefundController::all
 * @see app/Http/Controllers/Admin/AdminRefundController.php:73
 * @route '/admin/refunds/all'
 */
        allForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: all.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminRefundController::all
 * @see app/Http/Controllers/Admin/AdminRefundController.php:73
 * @route '/admin/refunds/all'
 */
        allForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: all.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    all.form = allForm
/**
* @see \App\Http\Controllers\Admin\AdminRefundController::approve
 * @see app/Http/Controllers/Admin/AdminRefundController.php:21
 * @route '/admin/refunds/{refundRequest}/approve'
 */
export const approve = (args: { refundRequest: number | { id: number } } | [refundRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/admin/refunds/{refundRequest}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminRefundController::approve
 * @see app/Http/Controllers/Admin/AdminRefundController.php:21
 * @route '/admin/refunds/{refundRequest}/approve'
 */
approve.url = (args: { refundRequest: number | { id: number } } | [refundRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { refundRequest: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { refundRequest: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    refundRequest: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        refundRequest: typeof args.refundRequest === 'object'
                ? args.refundRequest.id
                : args.refundRequest,
                }

    return approve.definition.url
            .replace('{refundRequest}', parsedArgs.refundRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminRefundController::approve
 * @see app/Http/Controllers/Admin/AdminRefundController.php:21
 * @route '/admin/refunds/{refundRequest}/approve'
 */
approve.post = (args: { refundRequest: number | { id: number } } | [refundRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminRefundController::approve
 * @see app/Http/Controllers/Admin/AdminRefundController.php:21
 * @route '/admin/refunds/{refundRequest}/approve'
 */
    const approveForm = (args: { refundRequest: number | { id: number } } | [refundRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: approve.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminRefundController::approve
 * @see app/Http/Controllers/Admin/AdminRefundController.php:21
 * @route '/admin/refunds/{refundRequest}/approve'
 */
        approveForm.post = (args: { refundRequest: number | { id: number } } | [refundRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: approve.url(args, options),
            method: 'post',
        })
    
    approve.form = approveForm
/**
* @see \App\Http\Controllers\Admin\AdminRefundController::reject
 * @see app/Http/Controllers/Admin/AdminRefundController.php:47
 * @route '/admin/refunds/{refundRequest}/reject'
 */
export const reject = (args: { refundRequest: number | { id: number } } | [refundRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/admin/refunds/{refundRequest}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminRefundController::reject
 * @see app/Http/Controllers/Admin/AdminRefundController.php:47
 * @route '/admin/refunds/{refundRequest}/reject'
 */
reject.url = (args: { refundRequest: number | { id: number } } | [refundRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { refundRequest: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { refundRequest: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    refundRequest: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        refundRequest: typeof args.refundRequest === 'object'
                ? args.refundRequest.id
                : args.refundRequest,
                }

    return reject.definition.url
            .replace('{refundRequest}', parsedArgs.refundRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminRefundController::reject
 * @see app/Http/Controllers/Admin/AdminRefundController.php:47
 * @route '/admin/refunds/{refundRequest}/reject'
 */
reject.post = (args: { refundRequest: number | { id: number } } | [refundRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminRefundController::reject
 * @see app/Http/Controllers/Admin/AdminRefundController.php:47
 * @route '/admin/refunds/{refundRequest}/reject'
 */
    const rejectForm = (args: { refundRequest: number | { id: number } } | [refundRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reject.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminRefundController::reject
 * @see app/Http/Controllers/Admin/AdminRefundController.php:47
 * @route '/admin/refunds/{refundRequest}/reject'
 */
        rejectForm.post = (args: { refundRequest: number | { id: number } } | [refundRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reject.url(args, options),
            method: 'post',
        })
    
    reject.form = rejectForm
const refunds = {
    index: Object.assign(index, index),
all: Object.assign(all, all),
approve: Object.assign(approve, approve),
reject: Object.assign(reject, reject),
}

export default refunds