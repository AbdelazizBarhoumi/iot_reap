/**
 * System Health Overview Component
 *
 * Displays overall system health with:
 * - Status indicator (healthy/warning/critical)
 * - Service status cards
 * - Quick metrics overview
 * - Last updated timestamp
 */
import { motion } from 'framer-motion';
import {
    Activity,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    HelpCircle,
    RefreshCw,
    Clock,
    Server,
    Database,
    Wifi,
    Shield,
    Cpu,
    HardDrive,
    Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type {
    SystemHealth,
    ServiceHealth,
    SystemStatus,
} from '@/types/monitoring.types';
interface SystemHealthOverviewProps {
    health: SystemHealth;
    onRefresh?: () => void;
    isRefreshing?: boolean;
}
const statusConfig: Record<
    SystemStatus,
    { icon: typeof CheckCircle2; color: string; bg: string; label: string }
> = {
    healthy: {
        icon: CheckCircle2,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        label: 'Healthy',
    },
    warning: {
        icon: AlertTriangle,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
        label: 'Warning',
    },
    critical: {
        icon: XCircle,
        color: 'text-red-500',
        bg: 'bg-red-500/10',
        label: 'Critical',
    },
    unknown: {
        icon: HelpCircle,
        color: 'text-muted-foreground',
        bg: 'bg-muted',
        label: 'Unknown',
    },
};
const serviceIcons: Record<string, typeof Server> = {
    proxmox: Server,
    guacamole: Wifi,
    database: Database,
    mqtt: Zap,
    storage: HardDrive,
    security: Shield,
    default: Cpu,
};
function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}
function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}
interface ServiceCardProps {
    service: ServiceHealth;
    index: number;
}
function ServiceCard({ service, index }: ServiceCardProps) {
    const config = statusConfig[service.status];
    const StatusIcon = config.icon;
    const ServiceIcon = serviceIcons[service.id] || serviceIcons.default;
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
                'rounded-xl border p-4 transition-colors',
                service.status === 'critical' &&
                    'border-red-500/30 bg-red-50/50 dark:bg-red-950/20',
                service.status === 'warning' &&
                    'border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20',
                service.status === 'healthy' && 'hover:border-emerald-500/30',
            )}
        >
            <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-lg',
                            config.bg,
                        )}
                    >
                        <ServiceIcon className={cn('h-5 w-5', config.color)} />
                    </div>
                    <div>
                        <h4 className="font-medium">{service.name}</h4>
                        <div className="mt-0.5 flex items-center gap-1.5">
                            <StatusIcon
                                className={cn('h-3.5 w-3.5', config.color)}
                            />
                            <span
                                className={cn(
                                    'text-xs font-medium',
                                    config.color,
                                )}
                            >
                                {config.label}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                {service.latency !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Latency</span>
                        <span
                            className={cn(
                                'font-mono',
                                service.latency > 500
                                    ? 'text-amber-500'
                                    : 'text-foreground',
                            )}
                        >
                            {service.latency}ms
                        </span>
                    </div>
                )}
                {service.uptime !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Uptime</span>
                        <span className="font-mono text-foreground">
                            {formatUptime(service.uptime)}
                        </span>
                    </div>
                )}
            </div>
            {service.lastError && (
                <div className="mt-3 rounded-lg bg-red-100 p-2 dark:bg-red-900/20">
                    <p className="line-clamp-2 text-xs text-red-600 dark:text-red-400">
                        {service.lastError}
                    </p>
                    {service.lastErrorAt && (
                        <p className="mt-1 text-[10px] text-red-500/70">
                            {formatTime(service.lastErrorAt)}
                        </p>
                    )}
                </div>
            )}
        </motion.div>
    );
}
export function SystemHealthOverview({
    health,
    onRefresh,
    isRefreshing = false,
}: SystemHealthOverviewProps) {
    const overallConfig = statusConfig[health.overall];
    const OverallIcon = overallConfig.icon;
    const healthyCount = health.services.filter(
        (s) => s.status === 'healthy',
    ).length;
    const warningCount = health.services.filter(
        (s) => s.status === 'warning',
    ).length;
    const criticalCount = health.services.filter(
        (s) => s.status === 'critical',
    ).length;
    return (
        <div className="space-y-6">
            {/* Overall Health Card */}
            <Card className="overflow-hidden">
                <div
                    className={cn('h-1', overallConfig.bg.replace('/10', ''))}
                />
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <motion.div
                                className={cn(
                                    'flex h-14 w-14 items-center justify-center rounded-2xl',
                                    overallConfig.bg,
                                )}
                                animate={
                                    health.overall === 'critical'
                                        ? {
                                              scale: [1, 1.05, 1],
                                          }
                                        : {}
                                }
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <OverallIcon
                                    className={cn(
                                        'h-7 w-7',
                                        overallConfig.color,
                                    )}
                                />
                            </motion.div>
                            <div>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    System Health
                                    <Badge
                                        className={cn(
                                            overallConfig.bg,
                                            overallConfig.color,
                                            'border-0',
                                        )}
                                    >
                                        {overallConfig.label}
                                    </Badge>
                                </CardTitle>
                                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Clock className="h-3.5 w-3.5" />
                                    Last checked:{' '}
                                    {formatTime(health.lastChecked)}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRefresh}
                            disabled={isRefreshing}
                            className="gap-1.5"
                        >
                            <RefreshCw
                                className={cn(
                                    'h-4 w-4',
                                    isRefreshing && 'animate-spin',
                                )}
                            />
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Quick Stats */}
                    <div className="mb-6 grid grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/20">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            <div>
                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {healthyCount}
                                </p>
                                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                                    Healthy
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg bg-amber-50 p-3 dark:bg-amber-950/20">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            <div>
                                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                    {warningCount}
                                </p>
                                <p className="text-xs text-amber-600/70 dark:text-amber-400/70">
                                    Warning
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg bg-red-50 p-3 dark:bg-red-950/20">
                            <XCircle className="h-5 w-5 text-red-500" />
                            <div>
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    {criticalCount}
                                </p>
                                <p className="text-xs text-red-600/70 dark:text-red-400/70">
                                    Critical
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Metrics Overview */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {health.metrics.slice(0, 4).map((metric) => (
                            <div
                                key={metric.id}
                                className="rounded-lg border bg-muted/30 p-3"
                            >
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm font-medium">
                                        {metric.name}
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            'px-1.5 py-0 text-[10px]',
                                            statusConfig[metric.status].color,
                                            'border-current',
                                        )}
                                    >
                                        {metric.status}
                                    </Badge>
                                </div>
                                <div className="flex items-end gap-1">
                                    <span className="text-2xl font-bold">
                                        {metric.value}
                                    </span>
                                    <span className="mb-0.5 text-sm text-muted-foreground">
                                        {metric.unit}
                                    </span>
                                </div>
                                {metric.max && (
                                    <Progress
                                        value={
                                            (metric.value / metric.max) * 100
                                        }
                                        className={cn(
                                            'mt-2 h-1.5',
                                            metric.status === 'warning' &&
                                                '[&>[data-state=complete]]:bg-amber-500',
                                            metric.status === 'critical' &&
                                                '[&>[data-state=complete]]:bg-red-500',
                                        )}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            {/* Service Cards */}
            <div>
                <h3 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold">
                    <Activity className="h-5 w-5 text-primary" />
                    Services
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {health.services.map((service, index) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
