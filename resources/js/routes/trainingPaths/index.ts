import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
import reviews from './reviews'
import trainingUnits from './trainingUnits'
/**
* @see \App\Http\Controllers\TrainingPathController::index
 * @see app/Http/Controllers/TrainingPathController.php:35
 * @route '/trainingPaths'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/trainingPaths',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TrainingPathController::index
 * @see app/Http/Controllers/TrainingPathController.php:35
 * @route '/trainingPaths'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingPathController::index
 * @see app/Http/Controllers/TrainingPathController.php:35
 * @route '/trainingPaths'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TrainingPathController::index
 * @see app/Http/Controllers/TrainingPathController.php:35
 * @route '/trainingPaths'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TrainingPathController::index
 * @see app/Http/Controllers/TrainingPathController.php:35
 * @route '/trainingPaths'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TrainingPathController::index
 * @see app/Http/Controllers/TrainingPathController.php:35
 * @route '/trainingPaths'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TrainingPathController::index
 * @see app/Http/Controllers/TrainingPathController.php:35
 * @route '/trainingPaths'
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
* @see \App\Http\Controllers\TrainingPathController::show
 * @see app/Http/Controllers/TrainingPathController.php:70
 * @route '/trainingPaths/{id}'
 */
export const show = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/trainingPaths/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TrainingPathController::show
 * @see app/Http/Controllers/TrainingPathController.php:70
 * @route '/trainingPaths/{id}'
 */
show.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return show.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingPathController::show
 * @see app/Http/Controllers/TrainingPathController.php:70
 * @route '/trainingPaths/{id}'
 */
show.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TrainingPathController::show
 * @see app/Http/Controllers/TrainingPathController.php:70
 * @route '/trainingPaths/{id}'
 */
show.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TrainingPathController::show
 * @see app/Http/Controllers/TrainingPathController.php:70
 * @route '/trainingPaths/{id}'
 */
    const showForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TrainingPathController::show
 * @see app/Http/Controllers/TrainingPathController.php:70
 * @route '/trainingPaths/{id}'
 */
        showForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TrainingPathController::show
 * @see app/Http/Controllers/TrainingPathController.php:70
 * @route '/trainingPaths/{id}'
 */
        showForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \App\Http\Controllers\TrainingPathController::my
 * @see app/Http/Controllers/TrainingPathController.php:289
 * @route '/my-trainingPaths'
 */
export const my = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: my.url(options),
    method: 'get',
})

my.definition = {
    methods: ["get","head"],
    url: '/my-trainingPaths',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TrainingPathController::my
 * @see app/Http/Controllers/TrainingPathController.php:289
 * @route '/my-trainingPaths'
 */
my.url = (options?: RouteQueryOptions) => {
    return my.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingPathController::my
 * @see app/Http/Controllers/TrainingPathController.php:289
 * @route '/my-trainingPaths'
 */
my.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: my.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TrainingPathController::my
 * @see app/Http/Controllers/TrainingPathController.php:289
 * @route '/my-trainingPaths'
 */
my.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: my.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TrainingPathController::my
 * @see app/Http/Controllers/TrainingPathController.php:289
 * @route '/my-trainingPaths'
 */
    const myForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: my.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TrainingPathController::my
 * @see app/Http/Controllers/TrainingPathController.php:289
 * @route '/my-trainingPaths'
 */
        myForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: my.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TrainingPathController::my
 * @see app/Http/Controllers/TrainingPathController.php:289
 * @route '/my-trainingPaths'
 */
        myForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: my.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    my.form = myForm
/**
* @see \App\Http\Controllers\TrainingPathController::trainingUnit
 * @see app/Http/Controllers/TrainingPathController.php:113
 * @route '/trainingPaths/{trainingPathId}/trainingUnit/{trainingUnitId}'
 */
export const trainingUnit = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: trainingUnit.url(args, options),
    method: 'get',
})

trainingUnit.definition = {
    methods: ["get","head"],
    url: '/trainingPaths/{trainingPathId}/trainingUnit/{trainingUnitId}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TrainingPathController::trainingUnit
 * @see app/Http/Controllers/TrainingPathController.php:113
 * @route '/trainingPaths/{trainingPathId}/trainingUnit/{trainingUnitId}'
 */
trainingUnit.url = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    trainingPathId: args[0],
                    trainingUnitId: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        trainingPathId: args.trainingPathId,
                                trainingUnitId: args.trainingUnitId,
                }

    return trainingUnit.definition.url
            .replace('{trainingPathId}', parsedArgs.trainingPathId.toString())
            .replace('{trainingUnitId}', parsedArgs.trainingUnitId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingPathController::trainingUnit
 * @see app/Http/Controllers/TrainingPathController.php:113
 * @route '/trainingPaths/{trainingPathId}/trainingUnit/{trainingUnitId}'
 */
trainingUnit.get = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: trainingUnit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TrainingPathController::trainingUnit
 * @see app/Http/Controllers/TrainingPathController.php:113
 * @route '/trainingPaths/{trainingPathId}/trainingUnit/{trainingUnitId}'
 */
trainingUnit.head = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: trainingUnit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TrainingPathController::trainingUnit
 * @see app/Http/Controllers/TrainingPathController.php:113
 * @route '/trainingPaths/{trainingPathId}/trainingUnit/{trainingUnitId}'
 */
    const trainingUnitForm = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: trainingUnit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TrainingPathController::trainingUnit
 * @see app/Http/Controllers/TrainingPathController.php:113
 * @route '/trainingPaths/{trainingPathId}/trainingUnit/{trainingUnitId}'
 */
        trainingUnitForm.get = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: trainingUnit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TrainingPathController::trainingUnit
 * @see app/Http/Controllers/TrainingPathController.php:113
 * @route '/trainingPaths/{trainingPathId}/trainingUnit/{trainingUnitId}'
 */
        trainingUnitForm.head = (args: { trainingPathId: string | number, trainingUnitId: string | number } | [trainingPathId: string | number, trainingUnitId: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: trainingUnit.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    trainingUnit.form = trainingUnitForm
/**
* @see \App\Http\Controllers\TrainingPathController::enroll
 * @see app/Http/Controllers/TrainingPathController.php:176
 * @route '/trainingPaths/{id}/enroll'
 */
export const enroll = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: enroll.url(args, options),
    method: 'post',
})

enroll.definition = {
    methods: ["post"],
    url: '/trainingPaths/{id}/enroll',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TrainingPathController::enroll
 * @see app/Http/Controllers/TrainingPathController.php:176
 * @route '/trainingPaths/{id}/enroll'
 */
enroll.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return enroll.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingPathController::enroll
 * @see app/Http/Controllers/TrainingPathController.php:176
 * @route '/trainingPaths/{id}/enroll'
 */
enroll.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: enroll.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\TrainingPathController::enroll
 * @see app/Http/Controllers/TrainingPathController.php:176
 * @route '/trainingPaths/{id}/enroll'
 */
    const enrollForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: enroll.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TrainingPathController::enroll
 * @see app/Http/Controllers/TrainingPathController.php:176
 * @route '/trainingPaths/{id}/enroll'
 */
        enrollForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: enroll.url(args, options),
            method: 'post',
        })
    
    enroll.form = enrollForm
/**
* @see \App\Http\Controllers\TrainingPathController::unenroll
 * @see app/Http/Controllers/TrainingPathController.php:194
 * @route '/trainingPaths/{id}/enroll'
 */
export const unenroll = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: unenroll.url(args, options),
    method: 'delete',
})

unenroll.definition = {
    methods: ["delete"],
    url: '/trainingPaths/{id}/enroll',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\TrainingPathController::unenroll
 * @see app/Http/Controllers/TrainingPathController.php:194
 * @route '/trainingPaths/{id}/enroll'
 */
unenroll.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return unenroll.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingPathController::unenroll
 * @see app/Http/Controllers/TrainingPathController.php:194
 * @route '/trainingPaths/{id}/enroll'
 */
unenroll.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: unenroll.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\TrainingPathController::unenroll
 * @see app/Http/Controllers/TrainingPathController.php:194
 * @route '/trainingPaths/{id}/enroll'
 */
    const unenrollForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: unenroll.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TrainingPathController::unenroll
 * @see app/Http/Controllers/TrainingPathController.php:194
 * @route '/trainingPaths/{id}/enroll'
 */
        unenrollForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: unenroll.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    unenroll.form = unenrollForm
/**
* @see \App\Http\Controllers\TrainingUnitNoteController::notes
 * @see app/Http/Controllers/TrainingUnitNoteController.php:36
 * @route '/trainingPaths/{trainingPathId}/notes'
 */
export const notes = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: notes.url(args, options),
    method: 'get',
})

notes.definition = {
    methods: ["get","head"],
    url: '/trainingPaths/{trainingPathId}/notes',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TrainingUnitNoteController::notes
 * @see app/Http/Controllers/TrainingUnitNoteController.php:36
 * @route '/trainingPaths/{trainingPathId}/notes'
 */
notes.url = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return notes.definition.url
            .replace('{trainingPathId}', parsedArgs.trainingPathId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TrainingUnitNoteController::notes
 * @see app/Http/Controllers/TrainingUnitNoteController.php:36
 * @route '/trainingPaths/{trainingPathId}/notes'
 */
notes.get = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: notes.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TrainingUnitNoteController::notes
 * @see app/Http/Controllers/TrainingUnitNoteController.php:36
 * @route '/trainingPaths/{trainingPathId}/notes'
 */
notes.head = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: notes.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TrainingUnitNoteController::notes
 * @see app/Http/Controllers/TrainingUnitNoteController.php:36
 * @route '/trainingPaths/{trainingPathId}/notes'
 */
    const notesForm = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: notes.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TrainingUnitNoteController::notes
 * @see app/Http/Controllers/TrainingUnitNoteController.php:36
 * @route '/trainingPaths/{trainingPathId}/notes'
 */
        notesForm.get = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: notes.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TrainingUnitNoteController::notes
 * @see app/Http/Controllers/TrainingUnitNoteController.php:36
 * @route '/trainingPaths/{trainingPathId}/notes'
 */
        notesForm.head = (args: { trainingPathId: string | number } | [trainingPathId: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: notes.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    notes.form = notesForm
const trainingPaths = {
    index: Object.assign(index, index),
show: Object.assign(show, show),
reviews: Object.assign(reviews, reviews),
my: Object.assign(my, my),
trainingUnit: Object.assign(trainingUnit, trainingUnit),
enroll: Object.assign(enroll, enroll),
unenroll: Object.assign(unenroll, unenroll),
trainingUnits: Object.assign(trainingUnits, trainingUnits),
notes: Object.assign(notes, notes),
}

export default trainingPaths