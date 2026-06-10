import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import analytics from './analytics'
import trainingPaths from './trainingPaths'
import vmAssignments from './vm-assignments'
import reservations from './reservations'
import nodes from './nodes'
import proxmoxServers from './proxmox-servers'
import hardware from './hardware'
import vmReservations from './vm-reservations'
import cameras from './cameras'
import users from './users'
import finance from './finance'
import refunds from './refunds'
import payouts from './payouts'
import maintenance from './maintenance'
import forum from './forum'
import trainingUnitAssignments from './trainingUnit-assignments'
import alerts from './alerts'
import activityLogs from './activity-logs'
/**
* @see \App\Http\Controllers\Admin\AdminAnalyticsController::dashboard
 * @see app/Http/Controllers/Admin/AdminAnalyticsController.php:25
 * @route '/admin/dashboard'
 */
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/admin/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminAnalyticsController::dashboard
 * @see app/Http/Controllers/Admin/AdminAnalyticsController.php:25
 * @route '/admin/dashboard'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminAnalyticsController::dashboard
 * @see app/Http/Controllers/Admin/AdminAnalyticsController.php:25
 * @route '/admin/dashboard'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminAnalyticsController::dashboard
 * @see app/Http/Controllers/Admin/AdminAnalyticsController.php:25
 * @route '/admin/dashboard'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminAnalyticsController::dashboard
 * @see app/Http/Controllers/Admin/AdminAnalyticsController.php:25
 * @route '/admin/dashboard'
 */
    const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dashboard.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminAnalyticsController::dashboard
 * @see app/Http/Controllers/Admin/AdminAnalyticsController.php:25
 * @route '/admin/dashboard'
 */
        dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminAnalyticsController::dashboard
 * @see app/Http/Controllers/Admin/AdminAnalyticsController.php:25
 * @route '/admin/dashboard'
 */
        dashboardForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    dashboard.form = dashboardForm
/**
 * @see routes/admin.php:34
 * @route '/admin/infrastructure'
 */
export const infrastructure = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: infrastructure.url(options),
    method: 'get',
})

infrastructure.definition = {
    methods: ["get","head"],
    url: '/admin/infrastructure',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/admin.php:34
 * @route '/admin/infrastructure'
 */
infrastructure.url = (options?: RouteQueryOptions) => {
    return infrastructure.definition.url + queryParams(options)
}

/**
 * @see routes/admin.php:34
 * @route '/admin/infrastructure'
 */
infrastructure.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: infrastructure.url(options),
    method: 'get',
})
/**
 * @see routes/admin.php:34
 * @route '/admin/infrastructure'
 */
infrastructure.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: infrastructure.url(options),
    method: 'head',
})

    /**
 * @see routes/admin.php:34
 * @route '/admin/infrastructure'
 */
    const infrastructureForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: infrastructure.url(options),
        method: 'get',
    })

            /**
 * @see routes/admin.php:34
 * @route '/admin/infrastructure'
 */
        infrastructureForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: infrastructure.url(options),
            method: 'get',
        })
            /**
 * @see routes/admin.php:34
 * @route '/admin/infrastructure'
 */
        infrastructureForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: infrastructure.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    infrastructure.form = infrastructureForm
const admin = {
    dashboard: Object.assign(dashboard, dashboard),
analytics: Object.assign(analytics, analytics),
infrastructure: Object.assign(infrastructure, infrastructure),
trainingPaths: Object.assign(trainingPaths, trainingPaths),
vmAssignments: Object.assign(vmAssignments, vmAssignments),
reservations: Object.assign(reservations, reservations),
nodes: Object.assign(nodes, nodes),
proxmoxServers: Object.assign(proxmoxServers, proxmoxServers),
hardware: Object.assign(hardware, hardware),
vmReservations: Object.assign(vmReservations, vmReservations),
cameras: Object.assign(cameras, cameras),
users: Object.assign(users, users),
finance: Object.assign(finance, finance),
refunds: Object.assign(refunds, refunds),
payouts: Object.assign(payouts, payouts),
maintenance: Object.assign(maintenance, maintenance),
forum: Object.assign(forum, forum),
trainingUnitAssignments: Object.assign(trainingUnitAssignments, trainingUnitAssignments),
alerts: Object.assign(alerts, alerts),
activityLogs: Object.assign(activityLogs, activityLogs),
}

export default admin