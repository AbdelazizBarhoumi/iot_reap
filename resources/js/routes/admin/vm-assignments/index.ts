import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminVMAssignmentController::index
 * @see app/Http/Controllers/Admin/AdminVMAssignmentController.php:17
 * @route '/admin/vm-assignments'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/vm-assignments',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminVMAssignmentController::index
 * @see app/Http/Controllers/Admin/AdminVMAssignmentController.php:17
 * @route '/admin/vm-assignments'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminVMAssignmentController::index
 * @see app/Http/Controllers/Admin/AdminVMAssignmentController.php:17
 * @route '/admin/vm-assignments'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminVMAssignmentController::index
 * @see app/Http/Controllers/Admin/AdminVMAssignmentController.php:17
 * @route '/admin/vm-assignments'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminVMAssignmentController::index
 * @see app/Http/Controllers/Admin/AdminVMAssignmentController.php:17
 * @route '/admin/vm-assignments'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminVMAssignmentController::index
 * @see app/Http/Controllers/Admin/AdminVMAssignmentController.php:17
 * @route '/admin/vm-assignments'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminVMAssignmentController::index
 * @see app/Http/Controllers/Admin/AdminVMAssignmentController.php:17
 * @route '/admin/vm-assignments'
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
const vmAssignments = {
    index: Object.assign(index, index),
}

export default vmAssignments