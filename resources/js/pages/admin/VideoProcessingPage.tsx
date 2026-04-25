import { Head } from '@inertiajs/react';
import { Film, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getProcessingStats, type ProcessingStats } from '@/api/video.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { getHttpErrorMessage } from '@/lib/http-errors';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Video Processing', href: '/admin/videos' },
];

export default function VideoProcessingPage() {
    const [stats, setStats] = useState<ProcessingStats | null>(null);
    const [loading, setLoading] = useState(false);

    const loadStats = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getProcessingStats();
            setStats(data);
        } catch (error) {
            toast.error(
                getHttpErrorMessage(
                    error,
                    'Failed to load video processing stats',
                ),
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadStats();
    }, [loadStats]);

    const total = useMemo(() => {
        if (!stats) {
            return 0;
        }

        return stats.pending + stats.processing + stats.ready + stats.failed;
    }, [stats]);

    const readyPercent = useMemo(() => {
        if (!stats || total === 0) {
            return 0;
        }

        return Math.round((stats.ready / total) * 100);
    }, [stats, total]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Video Processing" />

            <div className="container space-y-6 py-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Video Processing Monitor
                        </h1>
                        <p className="text-muted-foreground">
                            Track transcoding queue status and video processing
                            outcomes.
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => void loadStats()}
                        disabled={loading}
                    >
                        <RefreshCw
                            className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                        />
                        Refresh
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground">
                                Pending
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold text-amber-600">
                            {stats?.pending ?? 0}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground">
                                Processing
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold text-blue-600">
                            {stats?.processing ?? 0}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground">
                                Ready
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold text-green-600">
                            {stats?.ready ?? 0}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground">
                                Failed
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold text-red-600">
                            {stats?.failed ?? 0}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Film className="h-5 w-5" />
                            Queue Health
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                Ready ratio
                            </span>
                            <span className="font-medium">{readyPercent}%</span>
                        </div>
                        <Progress value={readyPercent} className="h-2" />

                        <div className="grid gap-2 pt-2 text-sm text-muted-foreground sm:grid-cols-2">
                            <div>
                                <p>
                                    Total tracked videos:{' '}
                                    <span className="font-medium text-foreground">
                                        {total}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <p>
                                    Queue pressure:{' '}
                                    <span className="font-medium text-foreground">
                                        {(stats?.pending ?? 0) +
                                            (stats?.processing ?? 0)}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
