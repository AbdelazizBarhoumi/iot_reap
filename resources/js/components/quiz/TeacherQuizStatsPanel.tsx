import { BarChart3, CheckCircle2, Loader2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getQuizStats, type QuizStats } from '@/api/quiz.api';
import { Card, CardContent } from '@/components/ui/card';

interface TeacherQuizStatsPanelProps {
    quizId: string;
}

interface StatsState {
    isLoading: boolean;
    error: string | null;
    stats: QuizStats | null;
}

export function TeacherQuizStatsPanel({ quizId }: TeacherQuizStatsPanelProps) {
    const [state, setState] = useState<StatsState>({
        isLoading: true,
        error: null,
        stats: null,
    });

    useEffect(() => {
        let cancelled = false;

        getQuizStats(quizId)
            .then((stats) => {
                if (cancelled) {
                    return;
                }

                setState({
                    isLoading: false,
                    error: null,
                    stats,
                });
            })
            .catch(() => {
                if (cancelled) {
                    return;
                }

                setState({
                    isLoading: false,
                    error: 'Quiz statistics are unavailable right now.',
                    stats: null,
                });
            });

        return () => {
            cancelled = true;
        };
    }, [quizId]);

    if (state.isLoading) {
        return (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading quiz stats...
            </div>
        );
    }

    if (state.error || !state.stats) {
        return (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                {state.error ?? 'No statistics available yet.'}
            </div>
        );
    }

    const statCards = [
        {
            label: 'Completed Attempts',
            value: state.stats.total_attempts.toLocaleString(),
            icon: Users,
        },
        {
            label: 'Average Score',
            value: `${state.stats.average_score.toFixed(1)}%`,
            icon: BarChart3,
        },
        {
            label: 'Pass Rate',
            value: `${state.stats.pass_rate.toFixed(1)}%`,
            icon: CheckCircle2,
        },
    ];

    return (
        <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
                {statCards.map((card) => (
                    <Card key={card.label}>
                        <CardContent className="flex items-center justify-between p-4">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {card.label}
                                </p>
                                <p className="mt-1 text-2xl font-semibold">
                                    {card.value}
                                </p>
                            </div>
                            <div className="rounded-full bg-primary/10 p-3">
                                <card.icon className="h-5 w-5 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
                These metrics are based on submitted quiz attempts for this
                unit.
            </div>
        </div>
    );
}
