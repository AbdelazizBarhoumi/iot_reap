import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\TeacherPayoutController::index
 * @see app/Http/Controllers/TeacherPayoutController.php:20
 * @route '/teaching/payouts'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/teaching/payouts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TeacherPayoutController::index
 * @see app/Http/Controllers/TeacherPayoutController.php:20
 * @route '/teaching/payouts'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeacherPayoutController::index
 * @see app/Http/Controllers/TeacherPayoutController.php:20
 * @route '/teaching/payouts'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TeacherPayoutController::index
 * @see app/Http/Controllers/TeacherPayoutController.php:20
 * @route '/teaching/payouts'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TeacherPayoutController::index
 * @see app/Http/Controllers/TeacherPayoutController.php:20
 * @route '/teaching/payouts'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TeacherPayoutController::index
 * @see app/Http/Controllers/TeacherPayoutController.php:20
 * @route '/teaching/payouts'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TeacherPayoutController::index
 * @see app/Http/Controllers/TeacherPayoutController.php:20
 * @route '/teaching/payouts'
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
* @see \App\Http\Controllers\TeacherPayoutController::store
 * @see app/Http/Controllers/TeacherPayoutController.php:37
 * @route '/teaching/payouts/request'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/teaching/payouts/request',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TeacherPayoutController::store
 * @see app/Http/Controllers/TeacherPayoutController.php:37
 * @route '/teaching/payouts/request'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TeacherPayoutController::store
 * @see app/Http/Controllers/TeacherPayoutController.php:37
 * @route '/teaching/payouts/request'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\TeacherPayoutController::store
 * @see app/Http/Controllers/TeacherPayoutController.php:37
 * @route '/teaching/payouts/request'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TeacherPayoutController::store
 * @see app/Http/Controllers/TeacherPayoutController.php:37
 * @route '/teaching/payouts/request'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
const TeacherPayoutController = { index, store }

export default TeacherPayoutController