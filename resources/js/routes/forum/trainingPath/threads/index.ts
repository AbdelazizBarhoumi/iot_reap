import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ForumController::store
 * @see app/Http/Controllers/ForumController.php:112
 * @route '/forum/trainingPaths/{trainingPathId}/threads'
 */
export const store = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/forum/trainingPaths/{trainingPathId}/threads',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ForumController::store
 * @see app/Http/Controllers/ForumController.php:112
 * @route '/forum/trainingPaths/{trainingPathId}/threads'
 */
store.url = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { trainingPathId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    trainingPathId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPathId: args.trainingPathId,
                }

    return store.definition.url
            .replace('{trainingPathId}', parsedArgs.trainingPathId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::store
 * @see app/Http/Controllers/ForumController.php:112
 * @route '/forum/trainingPaths/{trainingPathId}/threads'
 */
store.post = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ForumController::store
 * @see app/Http/Controllers/ForumController.php:112
 * @route '/forum/trainingPaths/{trainingPathId}/threads'
 */
    const storeForm = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ForumController::store
 * @see app/Http/Controllers/ForumController.php:112
 * @route '/forum/trainingPaths/{trainingPathId}/threads'
 */
        storeForm.post = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
const threads = {
    store: Object.assign(store, store),
}

export default threads