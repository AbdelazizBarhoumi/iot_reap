/**
 * Period Selector Component
 * Shared component for selecting time period in analytics pages.
 */
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { getPeriodOptions } from '@/lib/analytics.utils';

interface PeriodSelectorProps {
    value: string;
    onPeriodChange: (period: string) => void;
    onRefresh?: () => void;
    showRefresh?: boolean;
}

export function PeriodSelector({
    value,
    onPeriodChange,
    onRefresh,
    showRefresh = false,
}: PeriodSelectorProps) {
    const options = getPeriodOptions();

    return (
        <div className="flex items-center gap-3">
            <Select value={value} onValueChange={onPeriodChange}>
                <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {showRefresh && (
                <Button
                    variant="outline"
                    size="icon"
                    onClick={onRefresh}
                    title="Refresh data"
                >
                    <RefreshCw className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
