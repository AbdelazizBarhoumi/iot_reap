import client from './client';

export interface ActivityLogEntry {
    id: number;
    type: string;
    action: string;
    description: string;
    user_id: number | null;
    user_name: string | null;
    user_avatar: string | null;
    ip_address: string | null;
    metadata: Record<string, unknown> | null;
    status: string;
    created_at: string;
}

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

export interface PaginatedActivityLogsResponse {
    data: ActivityLogEntry[];
    meta: PaginationMeta;
}

export interface ActivityLogStats {
    total: number;
    by_type: Record<string, number>;
    by_user: Record<string, number>;
    by_status: Record<string, number>;
}

export interface ListActivityLogsParams {
    page?: number;
    per_page?: number;
    type?: string;
    action?: string;
    user_id?: number;
    status?: string;
    days?: number;
}

export interface RecentActivityParams {
    limit?: number;
    type?: string;
    user_id?: number;
}

export const activityLogsApi = {
    async listActivityLogs(
        params: ListActivityLogsParams = {},
    ): Promise<PaginatedActivityLogsResponse> {
        const { data } = await client.get<PaginatedActivityLogsResponse>('/admin/activity-logs', {
            params,
        });

        return data;
    },

    async getRecentActivity(params: RecentActivityParams = {}): Promise<ActivityLogEntry[]> {
        const { data } = await client.get<{ data: ActivityLogEntry[] }>('/admin/activity-logs/recent', {
            params,
        });

        return data.data;
    },

    async getActivityStats(days = 7): Promise<ActivityLogStats> {
        const { data } = await client.get<ActivityLogStats>('/admin/activity-logs/stats', {
            params: { days },
        });

        return data;
    },

    async getUserActivity(
        userId: number,
        params: Omit<ListActivityLogsParams, 'user_id'> = {},
    ): Promise<PaginatedActivityLogsResponse> {
        const { data } = await client.get<PaginatedActivityLogsResponse>('/admin/activity-logs/user', {
            params: {
                ...params,
                user_id: userId,
            },
        });

        return data;
    },
};
