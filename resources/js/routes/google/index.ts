import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\GoogleOAuthController::redirect
 * @see app/Http/Controllers/GoogleOAuthController.php:21
 * @route '/auth/oauth/google/redirect'
 */
export const redirect = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: redirect.url(options),
    method: 'get',
})

redirect.definition = {
    methods: ["get","head"],
    url: '/auth/oauth/google/redirect',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\GoogleOAuthController::redirect
 * @see app/Http/Controllers/GoogleOAuthController.php:21
 * @route '/auth/oauth/google/redirect'
 */
redirect.url = (options?: RouteQueryOptions) => {
    return redirect.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\GoogleOAuthController::redirect
 * @see app/Http/Controllers/GoogleOAuthController.php:21
 * @route '/auth/oauth/google/redirect'
 */
redirect.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: redirect.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\GoogleOAuthController::redirect
 * @see app/Http/Controllers/GoogleOAuthController.php:21
 * @route '/auth/oauth/google/redirect'
 */
redirect.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: redirect.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\GoogleOAuthController::redirect
 * @see app/Http/Controllers/GoogleOAuthController.php:21
 * @route '/auth/oauth/google/redirect'
 */
    const redirectForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: redirect.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\GoogleOAuthController::redirect
 * @see app/Http/Controllers/GoogleOAuthController.php:21
 * @route '/auth/oauth/google/redirect'
 */
        redirectForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: redirect.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\GoogleOAuthController::redirect
 * @see app/Http/Controllers/GoogleOAuthController.php:21
 * @route '/auth/oauth/google/redirect'
 */
        redirectForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: redirect.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    redirect.form = redirectForm
/**
* @see \App\Http\Controllers\GoogleOAuthController::callback
 * @see app/Http/Controllers/GoogleOAuthController.php:29
 * @route '/auth/oauth/google/callback'
 */
export const callback = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: callback.url(options),
    method: 'get',
})

callback.definition = {
    methods: ["get","head"],
    url: '/auth/oauth/google/callback',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\GoogleOAuthController::callback
 * @see app/Http/Controllers/GoogleOAuthController.php:29
 * @route '/auth/oauth/google/callback'
 */
callback.url = (options?: RouteQueryOptions) => {
    return callback.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\GoogleOAuthController::callback
 * @see app/Http/Controllers/GoogleOAuthController.php:29
 * @route '/auth/oauth/google/callback'
 */
callback.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: callback.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\GoogleOAuthController::callback
 * @see app/Http/Controllers/GoogleOAuthController.php:29
 * @route '/auth/oauth/google/callback'
 */
callback.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: callback.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\GoogleOAuthController::callback
 * @see app/Http/Controllers/GoogleOAuthController.php:29
 * @route '/auth/oauth/google/callback'
 */
    const callbackForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: callback.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\GoogleOAuthController::callback
 * @see app/Http/Controllers/GoogleOAuthController.php:29
 * @route '/auth/oauth/google/callback'
 */
        callbackForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: callback.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\GoogleOAuthController::callback
 * @see app/Http/Controllers/GoogleOAuthController.php:29
 * @route '/auth/oauth/google/callback'
 */
        callbackForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: callback.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    callback.form = callbackForm
/**
* @see \App\Http\Controllers\GoogleOAuthController::authCode
 * @see app/Http/Controllers/GoogleOAuthController.php:73
 * @route '/auth/oauth/google/auth-code'
 */
export const authCode = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: authCode.url(options),
    method: 'post',
})

authCode.definition = {
    methods: ["post"],
    url: '/auth/oauth/google/auth-code',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\GoogleOAuthController::authCode
 * @see app/Http/Controllers/GoogleOAuthController.php:73
 * @route '/auth/oauth/google/auth-code'
 */
authCode.url = (options?: RouteQueryOptions) => {
    return authCode.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\GoogleOAuthController::authCode
 * @see app/Http/Controllers/GoogleOAuthController.php:73
 * @route '/auth/oauth/google/auth-code'
 */
authCode.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: authCode.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\GoogleOAuthController::authCode
 * @see app/Http/Controllers/GoogleOAuthController.php:73
 * @route '/auth/oauth/google/auth-code'
 */
    const authCodeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: authCode.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\GoogleOAuthController::authCode
 * @see app/Http/Controllers/GoogleOAuthController.php:73
 * @route '/auth/oauth/google/auth-code'
 */
        authCodeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: authCode.url(options),
            method: 'post',
        })
    
    authCode.form = authCodeForm
/**
* @see \App\Http\Controllers\GoogleOAuthController::roleSelection
 * @see app/Http/Controllers/GoogleOAuthController.php:119
 * @route '/auth/oauth/google/role-selection'
 */
export const roleSelection = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: roleSelection.url(options),
    method: 'get',
})

roleSelection.definition = {
    methods: ["get","head"],
    url: '/auth/oauth/google/role-selection',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\GoogleOAuthController::roleSelection
 * @see app/Http/Controllers/GoogleOAuthController.php:119
 * @route '/auth/oauth/google/role-selection'
 */
roleSelection.url = (options?: RouteQueryOptions) => {
    return roleSelection.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\GoogleOAuthController::roleSelection
 * @see app/Http/Controllers/GoogleOAuthController.php:119
 * @route '/auth/oauth/google/role-selection'
 */
roleSelection.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: roleSelection.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\GoogleOAuthController::roleSelection
 * @see app/Http/Controllers/GoogleOAuthController.php:119
 * @route '/auth/oauth/google/role-selection'
 */
roleSelection.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: roleSelection.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\GoogleOAuthController::roleSelection
 * @see app/Http/Controllers/GoogleOAuthController.php:119
 * @route '/auth/oauth/google/role-selection'
 */
    const roleSelectionForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: roleSelection.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\GoogleOAuthController::roleSelection
 * @see app/Http/Controllers/GoogleOAuthController.php:119
 * @route '/auth/oauth/google/role-selection'
 */
        roleSelectionForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: roleSelection.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\GoogleOAuthController::roleSelection
 * @see app/Http/Controllers/GoogleOAuthController.php:119
 * @route '/auth/oauth/google/role-selection'
 */
        roleSelectionForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: roleSelection.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    roleSelection.form = roleSelectionForm
/**
* @see \App\Http\Controllers\GoogleOAuthController::completeSignup
 * @see app/Http/Controllers/GoogleOAuthController.php:139
 * @route '/auth/oauth/google/complete-signup'
 */
export const completeSignup = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: completeSignup.url(options),
    method: 'post',
})

completeSignup.definition = {
    methods: ["post"],
    url: '/auth/oauth/google/complete-signup',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\GoogleOAuthController::completeSignup
 * @see app/Http/Controllers/GoogleOAuthController.php:139
 * @route '/auth/oauth/google/complete-signup'
 */
completeSignup.url = (options?: RouteQueryOptions) => {
    return completeSignup.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\GoogleOAuthController::completeSignup
 * @see app/Http/Controllers/GoogleOAuthController.php:139
 * @route '/auth/oauth/google/complete-signup'
 */
completeSignup.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: completeSignup.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\GoogleOAuthController::completeSignup
 * @see app/Http/Controllers/GoogleOAuthController.php:139
 * @route '/auth/oauth/google/complete-signup'
 */
    const completeSignupForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: completeSignup.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\GoogleOAuthController::completeSignup
 * @see app/Http/Controllers/GoogleOAuthController.php:139
 * @route '/auth/oauth/google/complete-signup'
 */
        completeSignupForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: completeSignup.url(options),
            method: 'post',
        })
    
    completeSignup.form = completeSignupForm
const google = {
    redirect: Object.assign(redirect, redirect),
callback: Object.assign(callback, callback),
authCode: Object.assign(authCode, authCode),
roleSelection: Object.assign(roleSelection, roleSelection),
completeSignup: Object.assign(completeSignup, completeSignup),
}

export default google