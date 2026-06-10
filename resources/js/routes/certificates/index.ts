import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\CertificateController::lookup
 * @see app/Http/Controllers/CertificateController.php:22
 * @route '/certificates/verify'
 */
export const lookup = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: lookup.url(options),
    method: 'get',
})

lookup.definition = {
    methods: ["get","head"],
    url: '/certificates/verify',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CertificateController::lookup
 * @see app/Http/Controllers/CertificateController.php:22
 * @route '/certificates/verify'
 */
lookup.url = (options?: RouteQueryOptions) => {
    return lookup.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CertificateController::lookup
 * @see app/Http/Controllers/CertificateController.php:22
 * @route '/certificates/verify'
 */
lookup.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: lookup.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CertificateController::lookup
 * @see app/Http/Controllers/CertificateController.php:22
 * @route '/certificates/verify'
 */
lookup.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: lookup.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CertificateController::lookup
 * @see app/Http/Controllers/CertificateController.php:22
 * @route '/certificates/verify'
 */
    const lookupForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: lookup.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CertificateController::lookup
 * @see app/Http/Controllers/CertificateController.php:22
 * @route '/certificates/verify'
 */
        lookupForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: lookup.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CertificateController::lookup
 * @see app/Http/Controllers/CertificateController.php:22
 * @route '/certificates/verify'
 */
        lookupForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: lookup.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    lookup.form = lookupForm
/**
* @see \App\Http\Controllers\CertificateController::verify
 * @see app/Http/Controllers/CertificateController.php:91
 * @route '/certificates/{hash}/verify'
 */
export const verify = (args: { hash: string | number } | [hash: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verify.url(args, options),
    method: 'get',
})

verify.definition = {
    methods: ["get","head"],
    url: '/certificates/{hash}/verify',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CertificateController::verify
 * @see app/Http/Controllers/CertificateController.php:91
 * @route '/certificates/{hash}/verify'
 */
verify.url = (args: { hash: string | number } | [hash: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { hash: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    hash: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        hash: args.hash,
                }

    return verify.definition.url
            .replace('{hash}', parsedArgs.hash.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CertificateController::verify
 * @see app/Http/Controllers/CertificateController.php:91
 * @route '/certificates/{hash}/verify'
 */
verify.get = (args: { hash: string | number } | [hash: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verify.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CertificateController::verify
 * @see app/Http/Controllers/CertificateController.php:91
 * @route '/certificates/{hash}/verify'
 */
verify.head = (args: { hash: string | number } | [hash: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: verify.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CertificateController::verify
 * @see app/Http/Controllers/CertificateController.php:91
 * @route '/certificates/{hash}/verify'
 */
    const verifyForm = (args: { hash: string | number } | [hash: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: verify.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CertificateController::verify
 * @see app/Http/Controllers/CertificateController.php:91
 * @route '/certificates/{hash}/verify'
 */
        verifyForm.get = (args: { hash: string | number } | [hash: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: verify.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CertificateController::verify
 * @see app/Http/Controllers/CertificateController.php:91
 * @route '/certificates/{hash}/verify'
 */
        verifyForm.head = (args: { hash: string | number } | [hash: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: verify.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    verify.form = verifyForm
/**
* @see \App\Http\Controllers\CertificateController::download
 * @see app/Http/Controllers/CertificateController.php:124
 * @route '/certificates/{hash}/download'
 */
export const download = (args: { hash: string | number } | [hash: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: download.url(args, options),
    method: 'get',
})

download.definition = {
    methods: ["get","head"],
    url: '/certificates/{hash}/download',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CertificateController::download
 * @see app/Http/Controllers/CertificateController.php:124
 * @route '/certificates/{hash}/download'
 */
download.url = (args: { hash: string | number } | [hash: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { hash: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    hash: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        hash: args.hash,
                }

    return download.definition.url
            .replace('{hash}', parsedArgs.hash.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CertificateController::download
 * @see app/Http/Controllers/CertificateController.php:124
 * @route '/certificates/{hash}/download'
 */
download.get = (args: { hash: string | number } | [hash: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: download.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CertificateController::download
 * @see app/Http/Controllers/CertificateController.php:124
 * @route '/certificates/{hash}/download'
 */
download.head = (args: { hash: string | number } | [hash: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: download.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CertificateController::download
 * @see app/Http/Controllers/CertificateController.php:124
 * @route '/certificates/{hash}/download'
 */
    const downloadForm = (args: { hash: string | number } | [hash: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: download.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CertificateController::download
 * @see app/Http/Controllers/CertificateController.php:124
 * @route '/certificates/{hash}/download'
 */
        downloadForm.get = (args: { hash: string | number } | [hash: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: download.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CertificateController::download
 * @see app/Http/Controllers/CertificateController.php:124
 * @route '/certificates/{hash}/download'
 */
        downloadForm.head = (args: { hash: string | number } | [hash: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: download.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    download.form = downloadForm
/**
* @see \App\Http\Controllers\CertificateController::index
 * @see app/Http/Controllers/CertificateController.php:30
 * @route '/certificates'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/certificates',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CertificateController::index
 * @see app/Http/Controllers/CertificateController.php:30
 * @route '/certificates'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CertificateController::index
 * @see app/Http/Controllers/CertificateController.php:30
 * @route '/certificates'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CertificateController::index
 * @see app/Http/Controllers/CertificateController.php:30
 * @route '/certificates'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CertificateController::index
 * @see app/Http/Controllers/CertificateController.php:30
 * @route '/certificates'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CertificateController::index
 * @see app/Http/Controllers/CertificateController.php:30
 * @route '/certificates'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CertificateController::index
 * @see app/Http/Controllers/CertificateController.php:30
 * @route '/certificates'
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
* @see \App\Http\Controllers\CertificateController::store
 * @see app/Http/Controllers/CertificateController.php:48
 * @route '/certificates/trainingPaths/{trainingPathId}'
 */
export const store = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/certificates/trainingPaths/{trainingPathId}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CertificateController::store
 * @see app/Http/Controllers/CertificateController.php:48
 * @route '/certificates/trainingPaths/{trainingPathId}'
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
* @see \App\Http\Controllers\CertificateController::store
 * @see app/Http/Controllers/CertificateController.php:48
 * @route '/certificates/trainingPaths/{trainingPathId}'
 */
store.post = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\CertificateController::store
 * @see app/Http/Controllers/CertificateController.php:48
 * @route '/certificates/trainingPaths/{trainingPathId}'
 */
    const storeForm = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CertificateController::store
 * @see app/Http/Controllers/CertificateController.php:48
 * @route '/certificates/trainingPaths/{trainingPathId}'
 */
        storeForm.post = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\CertificateController::check
 * @see app/Http/Controllers/CertificateController.php:66
 * @route '/certificates/trainingPaths/{trainingPathId}/check'
 */
export const check = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: check.url(args, options),
    method: 'get',
})

check.definition = {
    methods: ["get","head"],
    url: '/certificates/trainingPaths/{trainingPathId}/check',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CertificateController::check
 * @see app/Http/Controllers/CertificateController.php:66
 * @route '/certificates/trainingPaths/{trainingPathId}/check'
 */
check.url = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return check.definition.url
            .replace('{trainingPathId}', parsedArgs.trainingPathId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CertificateController::check
 * @see app/Http/Controllers/CertificateController.php:66
 * @route '/certificates/trainingPaths/{trainingPathId}/check'
 */
check.get = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: check.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CertificateController::check
 * @see app/Http/Controllers/CertificateController.php:66
 * @route '/certificates/trainingPaths/{trainingPathId}/check'
 */
check.head = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: check.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CertificateController::check
 * @see app/Http/Controllers/CertificateController.php:66
 * @route '/certificates/trainingPaths/{trainingPathId}/check'
 */
    const checkForm = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: check.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CertificateController::check
 * @see app/Http/Controllers/CertificateController.php:66
 * @route '/certificates/trainingPaths/{trainingPathId}/check'
 */
        checkForm.get = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: check.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CertificateController::check
 * @see app/Http/Controllers/CertificateController.php:66
 * @route '/certificates/trainingPaths/{trainingPathId}/check'
 */
        checkForm.head = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: check.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    check.form = checkForm
const certificates = {
    lookup: Object.assign(lookup, lookup),
verify: Object.assign(verify, verify),
download: Object.assign(download, download),
index: Object.assign(index, index),
store: Object.assign(store, store),
check: Object.assign(check, check),
}

export default certificates