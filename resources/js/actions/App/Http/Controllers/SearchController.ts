import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\SearchController::search
 * @see app/Http/Controllers/SearchController.php:26
 * @route '/search'
 */
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SearchController::search
 * @see app/Http/Controllers/SearchController.php:26
 * @route '/search'
 */
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SearchController::search
 * @see app/Http/Controllers/SearchController.php:26
 * @route '/search'
 */
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SearchController::search
 * @see app/Http/Controllers/SearchController.php:26
 * @route '/search'
 */
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SearchController::search
 * @see app/Http/Controllers/SearchController.php:26
 * @route '/search'
 */
    const searchForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: search.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SearchController::search
 * @see app/Http/Controllers/SearchController.php:26
 * @route '/search'
 */
        searchForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: search.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SearchController::search
 * @see app/Http/Controllers/SearchController.php:26
 * @route '/search'
 */
        searchForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: search.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    search.form = searchForm
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
* @see \App\Http\Controllers\SearchController::byCategory
 * @see app/Http/Controllers/SearchController.php:122
 * @route '/search/category/{slug}'
 */
export const byCategory = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: byCategory.url(args, options),
    method: 'get',
})

byCategory.definition = {
    methods: ["get","head"],
    url: '/search/category/{slug}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SearchController::byCategory
 * @see app/Http/Controllers/SearchController.php:122
 * @route '/search/category/{slug}'
 */
byCategory.url = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return byCategory.definition.url
            .replace('{slug}', parsedArgs.slug.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SearchController::byCategory
 * @see app/Http/Controllers/SearchController.php:122
 * @route '/search/category/{slug}'
 */
byCategory.get = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: byCategory.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SearchController::byCategory
 * @see app/Http/Controllers/SearchController.php:122
 * @route '/search/category/{slug}'
 */
byCategory.head = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: byCategory.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SearchController::byCategory
 * @see app/Http/Controllers/SearchController.php:122
 * @route '/search/category/{slug}'
 */
    const byCategoryForm = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: byCategory.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SearchController::byCategory
 * @see app/Http/Controllers/SearchController.php:122
 * @route '/search/category/{slug}'
 */
        byCategoryForm.get = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: byCategory.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SearchController::byCategory
 * @see app/Http/Controllers/SearchController.php:122
 * @route '/search/category/{slug}'
 */
        byCategoryForm.head = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: byCategory.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    byCategory.form = byCategoryForm
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
const SearchController = { search, suggest, trending, categories, byCategory, recent }

export default SearchController