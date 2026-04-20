/**
 * Enrollment Chart Component
 * Area chart showing enrollments and completions over time.
 */
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/analytics.utils';
import type { EnrollmentChartPoint } from '@/types/analytics.types';
interface EnrollmentChartProps {
    data: EnrollmentChartPoint[];
    title?: string;
}
export function EnrollmentChart({
    data,
    title = 'Enrollments & Completions',
}: EnrollmentChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient
                                    id="enrollmentGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="hsl(var(--primary))"
                                        stopOpacity={0.3}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="hsl(var(--primary))"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                                <linearGradient
                                    id="completionGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="hsl(142 76% 36%)"
                                        stopOpacity={0.3}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="hsl(142 76% 36%)"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                className="stroke-muted"
                            />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                className="text-muted-foreground"
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                                className="text-muted-foreground"
                            />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg border bg-background p-3 shadow-md">
                                                <p className="text-sm font-medium">
                                                    {formatDate(
                                                        label as string,
                                                    )}
                                                </p>
                                                <div className="mt-2 space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                                        <span className="text-sm text-muted-foreground">
                                                            Enrollments:{' '}
                                                            {payload[0]?.value}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="h-2 w-2 rounded-full"
                                                            style={{
                                                                background:
                                                                    'hsl(142 76% 36%)',
                                                            }}
                                                        />
                                                        <span className="text-sm text-muted-foreground">
                                                            Completions:{' '}
                                                            {payload[1]?.value}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="enrollments"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                fill="url(#enrollmentGradient)"
                            />
                            <Area
                                type="monotone"
                                dataKey="completions"
                                stroke="hsl(142 76% 36%)"
                                strokeWidth={2}
                                fill="url(#completionGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-primary" />
                        <span className="text-sm text-muted-foreground">
                            Enrollments
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div
                            className="h-3 w-3 rounded-full"
                            style={{ background: 'hsl(142 76% 36%)' }}
                        />
                        <span className="text-sm text-muted-foreground">
                            Completions
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}


