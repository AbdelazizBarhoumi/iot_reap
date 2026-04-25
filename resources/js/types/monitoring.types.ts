/**
 * Monitoring types for system health dashboard
 */
export type SystemStatus = 'healthy' | 'warning' | 'critical' | 'unknown';
export type MetricTrend = 'up' | 'down' | 'stable';
export interface SystemMetric {
    id: string;
    name: string;
    value: number;
    unit: string;
    max?: number;
    status: SystemStatus;
    trend?: MetricTrend;
    trendValue?: number;
    history?: MetricDataPoint[];
}
export interface MetricDataPoint {
    timestamp: string;
    value: number;
}
export interface SystemHealth {
    overall: SystemStatus;
    lastChecked: string;
    services: ServiceHealth[];
    metrics: SystemMetric[];
}
export interface ServiceHealth {
    id: string;
    name: string;
    status: SystemStatus;
    latency?: number;
    uptime?: number;
    lastError?: string;
    lastErrorAt?: string;
}
export interface AlertItem {
    id: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    title: string;
    message: string;
    source: string;
    timestamp: string;
    acknowledged: boolean;
}
export interface ActivityLogItem {
    id: string;
    type: 'vm' | 'user' | 'trainingPath' | 'system' | 'security';
    action: string;
    details: string;
    user?: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
}
