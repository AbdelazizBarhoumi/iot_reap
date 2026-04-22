import client from './client';

export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface SystemAlert {
    id: number;
    severity: AlertSeverity;
    title: string;
    description: string | null;
    source: string | null;
    acknowledged: boolean;
    acknowledged_at: string | null;
    acknowledged_by: string | null;
    resolved: boolean;
    resolved_at: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
}

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

export interface PaginatedAlertsResponse {
    data: SystemAlert[];
    meta: PaginationMeta;
}

export interface AlertStats {
    total: number;
    unacknowledged: number;
    unresolved: number;
    critical: number;
    by_severity: Record<string, number>;
    by_source: Record<string, number>;
}

export interface ListAlertsParams {
    page?: number;
    per_page?: number;
    severity?: AlertSeverity;
    source?: string;
    status?: 'acknowledged' | 'unacknowledged';
}

export const alertsApi = {
    async listAlerts(params: ListAlertsParams = {}): Promise<PaginatedAlertsResponse> {
        const { data } = await client.get<PaginatedAlertsResponse>('/admin/alerts', {
            params,
        });

        return data;
    },

    async getUnacknowledgedAlerts(): Promise<SystemAlert[]> {
        const { data } = await client.get<{ data: SystemAlert[] }>('/admin/alerts/unacknowledged');

        return data.data;
    },

    async getAlertStats(): Promise<AlertStats> {
        const { data } = await client.get<AlertStats>('/admin/alerts/stats');

        return data;
    },

    async acknowledgeAlert(alertId: number): Promise<SystemAlert> {
        const { data } = await client.post<{ message: string; data: SystemAlert }>(
            `/admin/alerts/${alertId}/acknowledge`,
        );

        return data.data;
    },

    async acknowledgeAllAlerts(): Promise<void> {
        await client.post('/admin/alerts/acknowledge-all');
    },

    async resolveAlert(alertId: number): Promise<SystemAlert> {
        const { data } = await client.post<{ message: string; data: SystemAlert }>(
            `/admin/alerts/${alertId}/resolve`,
        );

        return data.data;
    },

    async deleteAlert(alertId: number): Promise<void> {
        await client.delete(`/admin/alerts/${alertId}`);
    },
};
