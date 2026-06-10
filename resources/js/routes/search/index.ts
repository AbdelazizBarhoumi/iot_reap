import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\SearchController::index
 * @see app/Http/Controllers/SearchController.php:26
 * @route '/search'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SearchController::index
 * @see app/Http/Controllers/SearchController.php:26
 * @route '/search'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SearchController::index
 * @see app/Http/Controllers/SearchController.php:26
 * @route '/search'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SearchController::index
 * @see app/Http/Controllers/SearchController.php:26
 * @route '/search'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SearchController::index
 * @see app/Http/Controllers/SearchController.php:26
 * @route '/search'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SearchController::index
 * @see app/Http/Controllers/SearchController.php:26
 * @route '/search'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SearchController::index
 * @see app/Http/Controllers/SearchController.php:26
 * @route '/search'
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
* @see \App\Http\Controllers\SearchController::suggest
 * @see app/Http/Controllers/SearchController.php:65
 * @route '/search/suggest'
 */
export const suggest = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: suggest.url(options),
    method: 'get',
})

suggest.definition = {
    methods: ["get","head"],
    url: '/search/suggest',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SearchController::suggest
 * @see app/Http/Controllers/SearchController.php:65
 * @route '/search/suggest'
 */
suggest.url = (options?: RouteQueryOptions) => {
    return suggest.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SearchController::suggest
 * @see app/Http/Controllers/SearchController.php:65
 * @route '/search/suggest'
 */
suggest.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: suggest.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SearchController::suggest
 * @see app/Http/Controllers/SearchController.php:65
 * @route '/search/suggest'
 */
suggest.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: suggest.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SearchController::suggest
 * @see app/Http/Controllers/SearchController.php:65
 * @route '/search/suggest'
 */
    const suggestForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: suggest.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SearchController::suggest
 * @see app/Http/Controllers/SearchController.php:65
 * @route '/search/suggest'
 */
        suggestForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: suggest.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SearchController::suggest
 * @see app/Http/Controllers/SearchController.php:65
 * @route '/search/suggest'
 */
        suggestForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: suggest.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    suggest.form = suggestForm
/**
* @see \App\Http\Controllers\SearchController::trending
 * @see app/Http/Controllers/SearchController.php:98
 * @route '/search/trending'
 */
export const trending = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: trending.url(options),
    method: 'get',
})

trending.definition = {
    methods: ["get","head"],
    url: '/search/trending',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SearchController::trending
 * @see app/Http/Controllers/SearchController.php:98
 * @route '/search/trending'
 */
trending.url = (options?: RouteQueryOptions) => {
    return trending.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SearchController::trending
 * @see app/Http/Controllers/SearchController.php:98
 * @route '/search/trending'
 */
trending.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: trending.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SearchController::trending
 * @see app/Http/Controllers/SearchController.php:98
 * @route '/search/trending'
 */
trending.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: trending.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SearchController::trending
 * @see app/Http/Controllers/SearchController.php:98
 * @route '/search/trending'
 */
    const trendingForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: trending.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SearchController::trending
 * @see app/Http/Controllers/SearchController.php:98
 * @route '/search/trending'
 */
        trendingForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: trending.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SearchController::trending
 * @see app/Http/Controllers/SearchController.php:98
 * @route '/search/trending'
 */
        trendingForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: trending.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    trending.form = trendingForm
/**
* @see \App\Http\Controllers\SearchController::categories
 * @see app/Http/Controllers/SearchController.php:110
 * @route '/search/categories'
 */
export const categories = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: categories.url(options),
    method: 'get',
})

categories.definition = {
    methods: ["get","head"],
    url: '/search/categories',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SearchController::categories
 * @see app/Http/Controllers/SearchController.php:110
 * @route '/search/categories'
 */
categories.url = (options?: RouteQueryOptions) => {
    return categories.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SearchController::categories
 * @see app/Http/Controllers/SearchController.php:110
 * @route '/search/categories'
 */
categories.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: categories.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SearchController::categories
 * @see app/Http/Controllers/SearchController.php:110
 * @route '/search/categories'
 */
categories.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: categories.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SearchController::categories
 * @see app/Http/Controllers/SearchController.php:110
 * @route '/search/categories'
 */
    const categoriesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: categories.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SearchController::categories
 * @see app/Http/Controllers/SearchController.php:110
 * @route '/search/categories'
 */
        categoriesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: categories.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SearchController::categories
 * @see app/Http/Controllers/SearchController.php:110
 * @route '/search/categories'
 */
        categoriesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: categories.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    categories.form = categoriesForm
/**
* @see \App\Http\Controllers\SearchController::category
 * @see app/Http/Controllers/SearchController.php:122
 * @route '/search/category/{slug}'
 */
export const category = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: category.url(args, options),
    method: 'get',
})

category.definition = {
    methods: ["get","head"],
    url: '/search/category/{slug}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SearchController::category
 * @see app/Http/Controllers/SearchController.php:122
 * @route '/search/category/{slug}'
 */
category.url = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { slug: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    slug: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        slug: args.slug,
                }

    return category.definition.url
            .replace('{slug}', parsedArgs.slug.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SearchController::category
 * @see app/Http/Controllers/SearchController.php:122
 * @route '/search/category/{slug}'
 */
category.get = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: category.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SearchController::category
 * @see app/Http/Controllers/SearchController.php:122
 * @route '/search/category/{slug}'
 */
category.head = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: category.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SearchController::category
 * @see app/Http/Controllers/SearchController.php:122
 * @route '/search/category/{slug}'
 */
    const categoryForm = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: category.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SearchController::category
 * @see app/Http/Controllers/SearchController.php:122
 * @route '/search/category/{slug}'
 */
        categoryForm.get = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: category.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SearchController::category
 * @see app/Http/Controllers/SearchController.php:122
 * @route '/search/category/{slug}'
 */
        categoryForm.head = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: category.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    category.form = categoryForm
/**
* @see \App\Http\Controllers\SearchController::recent
 * @see app/Http/Controllers/SearchController.php:80
 * @route '/search/recent'
 */
export const recent = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: recent.url(options),
    method: 'get',
})

recent.definition = {
    methods: ["get","head"],
    url: '/search/recent',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SearchController::recent
 * @see app/Http/Controllers/SearchController.php:80
 * @route '/search/recent'
 */
recent.url = (options?: RouteQueryOptions) => {
    return recent.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SearchController::recent
 * @see app/Http/Controllers/SearchController.php:80
 * @route '/search/recent'
 */
recent.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: recent.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SearchController::recent
 * @see app/Http/Controllers/SearchController.php:80
 * @route '/search/recent'
 */
recent.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: recent.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SearchController::recent
 * @see app/Http/Controllers/SearchController.php:80
 * @route '/search/recent'
 */
    const recentForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: recent.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SearchController::recent
 * @see app/Http/Controllers/SearchController.php:80
 * @route '/search/recent'
 */
        recentForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: recent.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SearchController::recent
 * @see app/Http/Controllers/SearchController.php:80
 * @route '/search/recent'
 */
        recentForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: recent.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    recent.form = recentForm
const search = {
    index: Object.assign(index, index),
suggest: Object.assign(suggest, suggest),
trending: Object.assign(trending, trending),
categories: Object.assign(categories, categories),
category: Object.assign(category, category),
recent: Object.assign(recent, recent),
}

export default search