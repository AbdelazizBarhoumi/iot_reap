import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ForumController::answer
 * @see app/Http/Controllers/ForumController.php:336
 * @route '/teaching/forum/replies/{replyId}/answer'
 */
export const answer = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: answer.url(args, options),
    method: 'post',
})

answer.definition = {
    methods: ["post"],
    url: '/teaching/forum/replies/{replyId}/answer',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ForumController::answer
 * @see app/Http/Controllers/ForumController.php:336
 * @route '/teaching/forum/replies/{replyId}/answer'
 */
answer.url = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { replyId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    replyId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        replyId: args.replyId,
                }

    return answer.definition.url
            .replace('{replyId}', parsedArgs.replyId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ForumController::answer
 * @see app/Http/Controllers/ForumController.php:336
 * @route '/teaching/forum/replies/{replyId}/answer'
 */
answer.post = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: answer.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ForumController::answer
 * @see app/Http/Controllers/ForumController.php:336
 * @route '/teaching/forum/replies/{replyId}/answer'
 */
    const answerForm = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: answer.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ForumController::answer
 * @see app/Http/Controllers/ForumController.php:336
 * @route '/teaching/forum/replies/{replyId}/answer'
 */
        answerForm.post = (args: { replyId: string | number } | [replyId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: answer.url(args, options),
            method: 'post',
        })
    
    answer.form = answerForm
const replies = {
    answer: Object.assign(answer, answer),
}

export default replies