/**
 * Completion Funnel Component
 * Horizontal bar chart showing student progression stages.
 */
import {
    Bar,
    BarChart,
    Cell,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FunnelStage } from '@/types/analytics.types';
interface CompletionFunnelProps {
    data: FunnelStage[];
    title?: string;
}
const COLORS = [
    'hsl(var(--primary))',
    'hsl(262 83% 58%)', // Purple
    'hsl(200 98% 39%)', // Blue
    'hsl(174 72% 40%)', // Teal
    'hsl(142 76% 36%)', // Green
    'hsl(45 93% 47%)', // Yellow/Gold
];
export function CompletionFunnel({
    data,
    title = 'Completion Funnel',
}: CompletionFunnelProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={data}
                            margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
                        >
                            <XAxis
                                type="number"
                                domain={[0, 100]}
                                tickFormatter={(v) => `${v}%`}
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                className="text-muted-foreground"
                            />
                            <YAxis
                                type="category"
                                dataKey="stage"
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                width={100}
                                className="text-muted-foreground"
                            />
                            <Bar
                                dataKey="percentage"
                                radius={[0, 4, 4, 0]}
                                label={(props) => {
                                    const x = Number(props.x ?? 0);
                                    const y = Number(props.y ?? 0);
                                    const width = Number(props.width ?? 0);
                                    const height = Number(props.height ?? 0);
                                    const value = Number(props.value ?? 0);
                                    return (
                                        <text
                                            x={x + width + 8}
                                            y={y + height / 2}
                                            fill="currentColor"
                                            textAnchor="start"
                                            dominantBaseline="middle"
                                            className="text-xs font-semibold"
                                        >
                                            {value}%
                                        </text>
                                    );
                                }}
                            >
                                {data.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}


