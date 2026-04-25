/**
 * Analytics Utilities
 * Common formatting and helper functions for analytics pages.
 */

/**
 * Format a number as currency (USD)
 */
export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

/**
 * Format a date string to short format (e.g., "Jan 15")
 */
export const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
};

/**
 * Format a date string to include time (e.g., "Jan 15 3:45 PM")
 */
export const formatDateTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

/**
 * Format a number with thousands separator
 */
export const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US').format(value);
};

/**
 * Format a number as percentage
 */
export const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
};

/**
 * Format bytes to human readable format (KB, MB, GB)
 */
export const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get period label from period key
 */
export const getPeriodLabel = (period: string): string => {
    const labels: Record<string, string> = {
        '7d': 'Last 7 days',
        '30d': 'Last 30 days',
        '90d': 'Last 90 days',
        '12m': 'Last 12 months',
    };
    return labels[period] || period;
};

/**
 * Get all available period options
 */
export const getPeriodOptions = (): Array<{ value: string; label: string }> => {
    return [
        { value: '7d', label: 'Last 7 days' },
        { value: '30d', label: 'Last 30 days' },
        { value: '90d', label: 'Last 90 days' },
        { value: '12m', label: 'Last 12 months' },
    ];
};

/**
 * Determine trend color and icon based on change value
 */
export const getTrendStyle = (
    value: number,
): { color: string; direction: 'up' | 'down' | 'neutral' } => {
    if (value === 0) {
        return { color: 'text-muted-foreground', direction: 'neutral' };
    }
    if (value > 0) {
        return { color: 'text-green-500', direction: 'up' };
    }
    return { color: 'text-red-500', direction: 'down' };
};
