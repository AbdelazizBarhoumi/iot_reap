/**
 * Session History Page
 * Shows past VM sessions (expired, terminated, failed).
 * Active sessions are managed via Dashboard.
 */
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    ArrowRight,
    Calendar,
    CheckCircle2,
    Clock,
    History,
    Loader2,
    Monitor,
    XCircle,
} from 'lucide-react';
import { useMemo } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useVMSessions } from '@/hooks/useVMSessions';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import type { VMSessionStatus } from '@/types/vm.types';
const STATUS_CONFIG: Record<
    VMSessionStatus,
    { label: string; className: string }
> = {
    pending: {
        label: 'Pending',
        className: 'bg-warning/10 text-warning border-warning/30',
    },
    provisioning: {
        label: 'Provisioning',
        className: 'bg-warning/10 text-warning border-warning/30',
    },
    active: {
        label: 'Active',
        className: 'bg-success/10 text-success border-success/30',
    },
    expiring: {
        label: 'Expiring',
        className: 'bg-destructive/10 text-destructive border-destructive/30',
    },
    expired: { label: 'Expired', className: 'bg-muted text-muted-foreground' },
    failed: {
        label: 'Failed',
        className: 'bg-destructive/10 text-destructive border-destructive/30',
    },
    terminated: {
        label: 'Terminated',
        className: 'bg-muted text-muted-foreground',
    },
};
function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
function formatDuration(start: string, end: string): string {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
}
export default function SessionHistoryPage() {
    const { sessions, loading, error } = useVMSessions();
    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [{ title: 'Session History', href: '/sessions' }],
        [],
    );
    // Filter to show only completed sessions (history)
    const historySessions = sessions.filter(
        (s) =>
            s.status === 'expired' ||
            s.status === 'failed' ||
            s.status === 'terminated',
    );
    // Also track active sessions for a notice — exclude sessions whose
    // time has actually run out (backend lazy expiration may not have
    // processed them yet when the fetch happened).
    const activeSessions = sessions.filter(
        (s) =>
            (s.status === 'active' ||
                s.status === 'provisioning' ||
                s.status === 'pending' ||
                s.status === 'expiring') &&
            s.time_remaining_seconds > 0,
    );
    // Group history by date
    const sessionsByDate = useMemo(() => {
        const groups: Record<string, typeof historySessions> = {};
        historySessions.forEach((session) => {
            const dateKey = new Date(session.created_at).toLocaleDateString();
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(session);
        });
        return Object.entries(groups).sort(
            ([a], [b]) => new Date(b).getTime() - new Date(a).getTime(),
        );
    }, [historySessions]);
    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Session History" />
                <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            Loading session history...
                        </p>
                    </div>
                </div>
            </AppLayout>
        );
    }
    if (error) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Session History" />
                <div className="min-h-screen bg-background">
                    <div className="container py-8">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    </div>
                </div>
            </AppLayout>
        );
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Session History" />
            <div className="min-h-screen bg-background">
                <div className="container py-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                <History className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="font-heading text-3xl font-bold text-foreground">
                                    Session History
                                </h1>
                                <p className="text-muted-foreground">
                                    View your past VM sessions
                                </p>
                            </div>
                        </div>
                        <Button
                            className="bg-info text-info-foreground hover:bg-info/90"
                            asChild
                        >
                            <Link href={dashboard().url}>
                                Go to Dashboard
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </motion.div>
                    {/* Active sessions notice */}
                    {activeSessions.length > 0 && (
                        <Alert>
                            <Monitor className="h-4 w-4" />
                            <AlertDescription>
                                You have {activeSessions.length} active
                                session(s).{' '}
                                <Link
                                    href={dashboard().url}
                                    className="font-medium underline"
                                >
                                    Go to Dashboard
                                </Link>{' '}
                                to manage them.
                            </AlertDescription>
                        </Alert>
                    )}
                    {/* History stats */}
                    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="shadow-card">
                                <CardContent className="flex items-center gap-4 p-5">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                        <History className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Total Past Sessions
                                        </p>
                                        <p className="font-heading text-2xl font-bold text-foreground">
                                            {historySessions.length}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="shadow-card">
                                <CardContent className="flex items-center gap-4 p-5">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10 text-success">
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Completed
                                        </p>
                                        <p className="font-heading text-2xl font-bold text-foreground">
                                            {
                                                historySessions.filter(
                                                    (s) =>
                                                        s.status ===
                                                            'terminated' ||
                                                        s.status === 'expired',
                                                ).length
                                            }
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="shadow-card">
                                <CardContent className="flex items-center gap-4 p-5">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                                        <XCircle className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Failed
                                        </p>
                                        <p className="font-heading text-2xl font-bold text-foreground">
                                            {
                                                historySessions.filter(
                                                    (s) =>
                                                        s.status === 'failed',
                                                ).length
                                            }
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                    {/* Session history list */}
                    {historySessions.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Card className="shadow-card">
                                <CardContent className="py-12 text-center">
                                    <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-success/40" />
                                    <p className="mb-4 text-muted-foreground">
                                        No session history yet
                                    </p>
                                    <Button
                                        className="bg-info text-info-foreground hover:bg-info/90"
                                        asChild
                                    >
                                        <Link href={dashboard().url}>
                                            Launch Your First VM
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        <div className="space-y-6">
                            {sessionsByDate.map(
                                ([dateKey, dateSessions], groupIndex) => (
                                    <motion.div
                                        key={dateKey}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            delay: 0.4 + groupIndex * 0.1,
                                        }}
                                    >
                                        <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-medium text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            {dateKey}
                                        </h3>
                                        <div className="space-y-2">
                                            {dateSessions.map((session) => {
                                                const status =
                                                    STATUS_CONFIG[
                                                        session.status
                                                    ];
                                                return (
                                                    <Card
                                                        key={session.id}
                                                        className="shadow-card transition-all hover:shadow-card-hover"
                                                    >
                                                        <CardContent className="py-4">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                                                        <Monitor className="h-5 w-5 text-muted-foreground" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-heading font-medium">
                                                                            VM #
                                                                            {
                                                                                session.vm_id
                                                                            }
                                                                        </p>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            {
                                                                                session.node_name
                                                                            }{' '}
                                                                            •{' '}
                                                                            {session.protocol?.toUpperCase()}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    <div className="text-right text-sm">
                                                                        <p className="flex items-center gap-1 text-muted-foreground">
                                                                            <Clock className="h-3 w-3" />
                                                                            {formatDate(
                                                                                session.created_at,
                                                                            )}
                                                                        </p>
                                                                        {session.expires_at && (
                                                                            <p className="text-xs text-muted-foreground">
                                                                                Duration:{' '}
                                                                                {formatDuration(
                                                                                    session.created_at,
                                                                                    session.expires_at,
                                                                                )}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={`text-xs ${status.className}`}
                                                                    >
                                                                        {
                                                                            status.label
                                                                        }
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                ),
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

