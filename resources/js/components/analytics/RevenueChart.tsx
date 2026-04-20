/**
 * Revenue Chart Component
 * Bar chart showing daily revenue.
 */
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatCurrency } from '@/lib/analytics.utils';
import type { RevenueChartPoint } from '@/types/analytics.types';
interface RevenueChartProps {
    data: RevenueChartPoint[];
    title?: string;
}
export function RevenueChart({ data, title = 'Revenue' }: RevenueChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
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
                                tickFormatter={formatCurrency}
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
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
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    Revenue:{' '}
                                                    {formatCurrency(
                                                        payload[0]
                                                            ?.value as number,
                                                    )}
                                                </p>
                                                {payload[0]?.payload
                                                    ?.sales_count !==
                                                    undefined && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Sales:{' '}
                                                        {
                                                            payload[0].payload
                                                                .sales_count
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar
                                dataKey="revenue"
                                fill="hsl(var(--primary))"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}


