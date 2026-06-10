import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/finance'
 */
const indexfd90acb6b549d6cc4b768c7da85d6709 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexfd90acb6b549d6cc4b768c7da85d6709.url(options),
    method: 'get',
})

indexfd90acb6b549d6cc4b768c7da85d6709.definition = {
    methods: ["get","head"],
    url: '/admin/finance',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/finance'
 */
indexfd90acb6b549d6cc4b768c7da85d6709.url = (options?: RouteQueryOptions) => {
    return indexfd90acb6b549d6cc4b768c7da85d6709.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/finance'
 */
indexfd90acb6b549d6cc4b768c7da85d6709.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexfd90acb6b549d6cc4b768c7da85d6709.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/finance'
 */
indexfd90acb6b549d6cc4b768c7da85d6709.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: indexfd90acb6b549d6cc4b768c7da85d6709.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/finance'
 */
    const indexfd90acb6b549d6cc4b768c7da85d6709Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: indexfd90acb6b549d6cc4b768c7da85d6709.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/finance'
 */
        indexfd90acb6b549d6cc4b768c7da85d6709Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: indexfd90acb6b549d6cc4b768c7da85d6709.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/finance'
 */
        indexfd90acb6b549d6cc4b768c7da85d6709Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: indexfd90acb6b549d6cc4b768c7da85d6709.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    indexfd90acb6b549d6cc4b768c7da85d6709.form = indexfd90acb6b549d6cc4b768c7da85d6709Form
    /**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/refunds'
 */
const indexa4402124c0d68127366e6cda252fcaec = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexa4402124c0d68127366e6cda252fcaec.url(options),
    method: 'get',
})

indexa4402124c0d68127366e6cda252fcaec.definition = {
    methods: ["get","head"],
    url: '/admin/refunds',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/refunds'
 */
indexa4402124c0d68127366e6cda252fcaec.url = (options?: RouteQueryOptions) => {
    return indexa4402124c0d68127366e6cda252fcaec.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/refunds'
 */
indexa4402124c0d68127366e6cda252fcaec.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexa4402124c0d68127366e6cda252fcaec.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/refunds'
 */
indexa4402124c0d68127366e6cda252fcaec.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: indexa4402124c0d68127366e6cda252fcaec.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/refunds'
 */
    const indexa4402124c0d68127366e6cda252fcaecForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: indexa4402124c0d68127366e6cda252fcaec.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/refunds'
 */
        indexa4402124c0d68127366e6cda252fcaecForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: indexa4402124c0d68127366e6cda252fcaec.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/refunds'
 */
        indexa4402124c0d68127366e6cda252fcaecForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: indexa4402124c0d68127366e6cda252fcaec.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    indexa4402124c0d68127366e6cda252fcaec.form = indexa4402124c0d68127366e6cda252fcaecForm
    /**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/payouts'
 */
const indexa35852e982c9204e5efe304a414a9c4c = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexa35852e982c9204e5efe304a414a9c4c.url(options),
    method: 'get',
})

indexa35852e982c9204e5efe304a414a9c4c.definition = {
    methods: ["get","head"],
    url: '/admin/payouts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/payouts'
 */
indexa35852e982c9204e5efe304a414a9c4c.url = (options?: RouteQueryOptions) => {
    return indexa35852e982c9204e5efe304a414a9c4c.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/payouts'
 */
indexa35852e982c9204e5efe304a414a9c4c.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexa35852e982c9204e5efe304a414a9c4c.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/payouts'
 */
indexa35852e982c9204e5efe304a414a9c4c.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: indexa35852e982c9204e5efe304a414a9c4c.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/payouts'
 */
    const indexa35852e982c9204e5efe304a414a9c4cForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: indexa35852e982c9204e5efe304a414a9c4c.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/payouts'
 */
        indexa35852e982c9204e5efe304a414a9c4cForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: indexa35852e982c9204e5efe304a414a9c4c.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminFinanceController::index
 * @see app/Http/Controllers/Admin/AdminFinanceController.php:25
 * @route '/admin/payouts'
 */
        indexa35852e982c9204e5efe304a414a9c4cForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: indexa35852e982c9204e5efe304a414a9c4c.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    indexa35852e982c9204e5efe304a414a9c4c.form = indexa35852e982c9204e5efe304a414a9c4cForm

export const index = {
    '/admin/finance': indexfd90acb6b549d6cc4b768c7da85d6709,
    '/admin/refunds': indexa4402124c0d68127366e6cda252fcaec,
    '/admin/payouts': indexa35852e982c9204e5efe304a414a9c4c,
}

const AdminFinanceController = { index }

export default AdminFinanceController