import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminUserController::index
 * @see app/Http/Controllers/Admin/AdminUserController.php:27
 * @route '/admin/users'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/users',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminUserController::index
 * @see app/Http/Controllers/Admin/AdminUserController.php:27
 * @route '/admin/users'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminUserController::index
 * @see app/Http/Controllers/Admin/AdminUserController.php:27
 * @route '/admin/users'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminUserController::index
 * @see app/Http/Controllers/Admin/AdminUserController.php:27
 * @route '/admin/users'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminUserController::index
 * @see app/Http/Controllers/Admin/AdminUserController.php:27
 * @route '/admin/users'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminUserController::index
 * @see app/Http/Controllers/Admin/AdminUserController.php:27
 * @route '/admin/users'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminUserController::index
 * @see app/Http/Controllers/Admin/AdminUserController.php:27
 * @route '/admin/users'
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
* @see \App\Http\Controllers\Admin\AdminUserController::show
 * @see app/Http/Controllers/Admin/AdminUserController.php:68
 * @route '/admin/users/{user}'
 */
export const show = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/users/{user}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminUserController::show
 * @see app/Http/Controllers/Admin/AdminUserController.php:68
 * @route '/admin/users/{user}'
 */
show.url = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { user: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    user: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        user: typeof args.user === 'object'
                ? args.user.id
                : args.user,
                }

    return show.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminUserController::show
 * @see app/Http/Controllers/Admin/AdminUserController.php:68
 * @route '/admin/users/{user}'
 */
show.get = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminUserController::show
 * @see app/Http/Controllers/Admin/AdminUserController.php:68
 * @route '/admin/users/{user}'
 */
show.head = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminUserController::show
 * @see app/Http/Controllers/Admin/AdminUserController.php:68
 * @route '/admin/users/{user}'
 */
    const showForm = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminUserController::show
 * @see app/Http/Controllers/Admin/AdminUserController.php:68
 * @route '/admin/users/{user}'
 */
        showForm.get = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminUserController::show
 * @see app/Http/Controllers/Admin/AdminUserController.php:68
 * @route '/admin/users/{user}'
 */
        showForm.head = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Admin\AdminUserController::approveTeacher
 * @see app/Http/Controllers/Admin/AdminUserController.php:130
 * @route '/admin/users/{user}/approve-teacher'
 */
export const approveTeacher = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approveTeacher.url(args, options),
    method: 'post',
})

approveTeacher.definition = {
    methods: ["post"],
    url: '/admin/users/{user}/approve-teacher',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminUserController::approveTeacher
 * @see app/Http/Controllers/Admin/AdminUserController.php:130
 * @route '/admin/users/{user}/approve-teacher'
 */
approveTeacher.url = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { user: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    user: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        user: typeof args.user === 'object'
                ? args.user.id
                : args.user,
                }

    return approveTeacher.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminUserController::approveTeacher
 * @see app/Http/Controllers/Admin/AdminUserController.php:130
 * @route '/admin/users/{user}/approve-teacher'
 */
approveTeacher.post = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approveTeacher.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminUserController::approveTeacher
 * @see app/Http/Controllers/Admin/AdminUserController.php:130
 * @route '/admin/users/{user}/approve-teacher'
 */
    const approveTeacherForm = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: approveTeacher.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminUserController::approveTeacher
 * @see app/Http/Controllers/Admin/AdminUserController.php:130
 * @route '/admin/users/{user}/approve-teacher'
 */
        approveTeacherForm.post = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: approveTeacher.url(args, options),
            method: 'post',
        })
    
    approveTeacher.form = approveTeacherForm
/**
* @see \App\Http\Controllers\Admin\AdminUserController::revokeTeacherApproval
 * @see app/Http/Controllers/Admin/AdminUserController.php:152
 * @route '/admin/users/{user}/revoke-teacher-approval'
 */
export const revokeTeacherApproval = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: revokeTeacherApproval.url(args, options),
    method: 'post',
})

revokeTeacherApproval.definition = {
    methods: ["post"],
    url: '/admin/users/{user}/revoke-teacher-approval',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminUserController::revokeTeacherApproval
 * @see app/Http/Controllers/Admin/AdminUserController.php:152
 * @route '/admin/users/{user}/revoke-teacher-approval'
 */
revokeTeacherApproval.url = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { user: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    user: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        user: typeof args.user === 'object'
                ? args.user.id
                : args.user,
                }

    return revokeTeacherApproval.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminUserController::revokeTeacherApproval
 * @see app/Http/Controllers/Admin/AdminUserController.php:152
 * @route '/admin/users/{user}/revoke-teacher-approval'
 */
revokeTeacherApproval.post = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: revokeTeacherApproval.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminUserController::revokeTeacherApproval
 * @see app/Http/Controllers/Admin/AdminUserController.php:152
 * @route '/admin/users/{user}/revoke-teacher-approval'
 */
    const revokeTeacherApprovalForm = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: revokeTeacherApproval.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminUserController::revokeTeacherApproval
 * @see app/Http/Controllers/Admin/AdminUserController.php:152
 * @route '/admin/users/{user}/revoke-teacher-approval'
 */
        revokeTeacherApprovalForm.post = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: revokeTeacherApproval.url(args, options),
            method: 'post',
        })
    
    revokeTeacherApproval.form = revokeTeacherApprovalForm
/**
* @see \App\Http\Controllers\Admin\AdminUserController::suspend
 * @see app/Http/Controllers/Admin/AdminUserController.php:80
 * @route '/admin/users/{user}/suspend'
 */
export const suspend = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: suspend.url(args, options),
    method: 'post',
})

suspend.definition = {
    methods: ["post"],
    url: '/admin/users/{user}/suspend',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminUserController::suspend
 * @see app/Http/Controllers/Admin/AdminUserController.php:80
 * @route '/admin/users/{user}/suspend'
 */
suspend.url = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { user: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    user: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        user: typeof args.user === 'object'
                ? args.user.id
                : args.user,
                }

    return suspend.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminUserController::suspend
 * @see app/Http/Controllers/Admin/AdminUserController.php:80
 * @route '/admin/users/{user}/suspend'
 */
suspend.post = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: suspend.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminUserController::suspend
 * @see app/Http/Controllers/Admin/AdminUserController.php:80
 * @route '/admin/users/{user}/suspend'
 */
    const suspendForm = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: suspend.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminUserController::suspend
 * @see app/Http/Controllers/Admin/AdminUserController.php:80
 * @route '/admin/users/{user}/suspend'
 */
        suspendForm.post = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: suspend.url(args, options),
            method: 'post',
        })
    
    suspend.form = suspendForm
/**
* @see \App\Http\Controllers\Admin\AdminUserController::unsuspend
 * @see app/Http/Controllers/Admin/AdminUserController.php:97
 * @route '/admin/users/{user}/unsuspend'
 */
export const unsuspend = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unsuspend.url(args, options),
    method: 'post',
})

unsuspend.definition = {
    methods: ["post"],
    url: '/admin/users/{user}/unsuspend',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminUserController::unsuspend
 * @see app/Http/Controllers/Admin/AdminUserController.php:97
 * @route '/admin/users/{user}/unsuspend'
 */
unsuspend.url = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { user: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    user: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        user: typeof args.user === 'object'
                ? args.user.id
                : args.user,
                }

    return unsuspend.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminUserController::unsuspend
 * @see app/Http/Controllers/Admin/AdminUserController.php:97
 * @route '/admin/users/{user}/unsuspend'
 */
unsuspend.post = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unsuspend.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminUserController::unsuspend
 * @see app/Http/Controllers/Admin/AdminUserController.php:97
 * @route '/admin/users/{user}/unsuspend'
 */
    const unsuspendForm = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: unsuspend.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminUserController::unsuspend
 * @see app/Http/Controllers/Admin/AdminUserController.php:97
 * @route '/admin/users/{user}/unsuspend'
 */
        unsuspendForm.post = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: unsuspend.url(args, options),
            method: 'post',
        })
    
    unsuspend.form = unsuspendForm
/**
* @see \App\Http\Controllers\Admin\AdminUserController::updateRole
 * @see app/Http/Controllers/Admin/AdminUserController.php:113
 * @route '/admin/users/{user}/role'
 */
export const updateRole = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateRole.url(args, options),
    method: 'patch',
})

updateRole.definition = {
    methods: ["patch"],
    url: '/admin/users/{user}/role',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\AdminUserController::updateRole
 * @see app/Http/Controllers/Admin/AdminUserController.php:113
 * @route '/admin/users/{user}/role'
 */
updateRole.url = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { user: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    user: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        user: typeof args.user === 'object'
                ? args.user.id
                : args.user,
                }

    return updateRole.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminUserController::updateRole
 * @see app/Http/Controllers/Admin/AdminUserController.php:113
 * @route '/admin/users/{user}/role'
 */
updateRole.patch = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateRole.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Admin\AdminUserController::updateRole
 * @see app/Http/Controllers/Admin/AdminUserController.php:113
 * @route '/admin/users/{user}/role'
 */
    const updateRoleForm = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateRole.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminUserController::updateRole
 * @see app/Http/Controllers/Admin/AdminUserController.php:113
 * @route '/admin/users/{user}/role'
 */
        updateRoleForm.patch = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateRole.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateRole.form = updateRoleForm
/**
* @see \App\Http\Controllers\Admin\AdminUserController::impersonate
 * @see app/Http/Controllers/Admin/AdminUserController.php:174
 * @route '/admin/users/{user}/impersonate'
 */
export const impersonate = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: impersonate.url(args, options),
    method: 'post',
})

impersonate.definition = {
    methods: ["post"],
    url: '/admin/users/{user}/impersonate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminUserController::impersonate
 * @see app/Http/Controllers/Admin/AdminUserController.php:174
 * @route '/admin/users/{user}/impersonate'
 */
impersonate.url = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { user: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    user: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        user: typeof args.user === 'object'
                ? args.user.id
                : args.user,
                }

    return impersonate.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminUserController::impersonate
 * @see app/Http/Controllers/Admin/AdminUserController.php:174
 * @route '/admin/users/{user}/impersonate'
 */
impersonate.post = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: impersonate.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminUserController::impersonate
 * @see app/Http/Controllers/Admin/AdminUserController.php:174
 * @route '/admin/users/{user}/impersonate'
 */
    const impersonateForm = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: impersonate.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminUserController::impersonate
 * @see app/Http/Controllers/Admin/AdminUserController.php:174
 * @route '/admin/users/{user}/impersonate'
 */
        impersonateForm.post = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: impersonate.url(args, options),
            method: 'post',
        })
    
    impersonate.form = impersonateForm
/**
* @see \App\Http\Controllers\Admin\AdminUserController::deleteMethod
 * @see app/Http/Controllers/Admin/AdminUserController.php:201
 * @route '/admin/users/{user}'
 */
export const deleteMethod = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

deleteMethod.definition = {
    methods: ["delete"],
    url: '/admin/users/{user}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AdminUserController::deleteMethod
 * @see app/Http/Controllers/Admin/AdminUserController.php:201
 * @route '/admin/users/{user}'
 */
deleteMethod.url = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { user: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    user: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        user: typeof args.user === 'object'
                ? args.user.id
                : args.user,
                }

    return deleteMethod.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminUserController::deleteMethod
 * @see app/Http/Controllers/Admin/AdminUserController.php:201
 * @route '/admin/users/{user}'
 */
deleteMethod.delete = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\AdminUserController::deleteMethod
 * @see app/Http/Controllers/Admin/AdminUserController.php:201
 * @route '/admin/users/{user}'
 */
    const deleteMethodForm = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: deleteMethod.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminUserController::deleteMethod
 * @see app/Http/Controllers/Admin/AdminUserController.php:201
 * @route '/admin/users/{user}'
 */
        deleteMethodForm.delete = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: deleteMethod.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    deleteMethod.form = deleteMethodForm
const users = {
    index: Object.assign(index, index),
show: Object.assign(show, show),
approveTeacher: Object.assign(approveTeacher, approveTeacher),
revokeTeacherApproval: Object.assign(revokeTeacherApproval, revokeTeacherApproval),
suspend: Object.assign(suspend, suspend),
unsuspend: Object.assign(unsuspend, unsuspend),
updateRole: Object.assign(updateRole, updateRole),
impersonate: Object.assign(impersonate, impersonate),
delete: Object.assign(deleteMethod, deleteMethod),
}

export default users