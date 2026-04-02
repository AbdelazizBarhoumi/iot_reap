/**
 * Analytics TypeScript types for Sprint 6.
 */
export interface KPIs {
    total_students: number;
    total_enrollments: number;
    enrollments_change: number;
    total_completions: number;
    completions_change: number;
    total_revenue: number;
    revenue_change: number;
    quiz_pass_rate: number;
    avg_video_minutes: number;
    period: string;
}
export interface EnrollmentChartPoint {
    date: string;
    enrollments: number;
    completions: number;
}
export interface RevenueChartPoint {
    date: string;
    revenue: number;
    sales_count?: number;
}
export interface TopCourse {
    id: number;
    title: string;
    thumbnail_url: string | null;
    value: number;
    formatted_value: string;
}
export interface FunnelStage {
    stage: string;
    count: number;
    percentage: number;
}
export interface StudentRosterItem {
    id: number;
    name: string;
    email: string;
    avatar_url: string | null;
    enrolled_at: string;
    completed_at: string | null;
    progress: number;
    is_completed: boolean;
}
export interface EarningsSummary {
    total_revenue: number;
    previous_revenue: number;
    change_percentage: number;
    period: string;
    start_date: string;
    end_date: string;
}
export interface RevenueByCourse {
    id: number;
    title: string;
    thumbnail_url: string | null;
    revenue: number;
    sales_count: number;
}
export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}
export type AnalyticsPeriod = '7d' | '30d' | '90d' | '12m';

