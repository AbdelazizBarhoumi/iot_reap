/**
 * Session History Page
 * Shows past VM sessions (expired, terminated, failed).
 * Active sessions are managed via Dashboard.
 */

import { Head, Link } from '@inertiajs/react';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Clock,
  History,
  Loader2,
  Monitor,
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


const STATUS_COLORS: Record<VMSessionStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'default',
  provisioning: 'default',
  active: 'default',
  expiring: 'destructive',
  expired: 'secondary',
  failed: 'destructive',
  terminated: 'outline',
};

const STATUS_LABELS: Record<VMSessionStatus, string> = {
  pending: 'Pending',
  provisioning: 'Provisioning',
  active: 'Active',
  expiring: 'Expiring',
  expired: 'Expired',
  failed: 'Failed',
  terminated: 'Terminated',
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
    []
  );

  // Filter to show only completed sessions (history)
  const historySessions = sessions.filter(
    (s) => s.status === 'expired' || s.status === 'failed' || s.status === 'terminated'
  );

  // Also track active sessions for a notice
  const activeSessions = sessions.filter(
    (s) => s.status === 'active' || s.status === 'provisioning' || s.status === 'pending' || s.status === 'expiring'
  );

  // Group history by date
  const sessionsByDate = useMemo(() => {
    const groups: Record<string, typeof historySessions> = {};
    historySessions.forEach((session) => {
      const dateKey = new Date(session.created_at).toLocaleDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(session);
    });
    return Object.entries(groups).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime());
  }, [historySessions]);

  if (loading) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Session History" />
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading session history...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Session History" />
        <div className="flex flex-1 flex-col gap-6 p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Session History" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <History className="h-8 w-8" />
              Session History
            </h1>
            <p className="text-muted-foreground mt-2">
              View your past VM sessions. For active sessions, go to the Dashboard.
            </p>
          </div>
          <Button asChild>
            <Link href={dashboard().url}>
              Go to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Active sessions notice */}
        {activeSessions.length > 0 && (
          <Alert>
            <Monitor className="h-4 w-4" />
            <AlertDescription>
              You have {activeSessions.length} active session(s).{' '}
              <Link href={dashboard().url} className="font-medium underline">
                Go to Dashboard
              </Link>{' '}
              to manage them.
            </AlertDescription>
          </Alert>
        )}

        {/* History stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{historySessions.length}</p>
                <p className="text-sm text-muted-foreground">Total Past Sessions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">
                  {historySessions.filter((s) => s.status === 'terminated' || s.status === 'expired').length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-destructive">
                  {historySessions.filter((s) => s.status === 'failed').length}
                </p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Session history list */}
        {historySessions.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No session history yet</p>
              <Button asChild>
                <Link href={dashboard().url}>Launch Your First VM</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {sessionsByDate.map(([dateKey, dateSessions]) => (
              <div key={dateKey}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {dateKey}
                </h3>
                <div className="space-y-2">
                  {dateSessions.map((session) => (
                    <Card key={session.id} className="hover:bg-muted/50 transition-colors">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                              <Monitor className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">VM #{session.vm_id}</p>
                              <p className="text-sm text-muted-foreground">
                                {session.node_name} • {session.protocol?.toUpperCase()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right text-sm">
                              <p className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatDate(session.created_at)}
                              </p>
                              {session.expires_at && (
                                <p className="text-xs text-muted-foreground">
                                  Duration: {formatDuration(session.created_at, session.expires_at)}
                                </p>
                              )}
                            </div>
                            <Badge variant={STATUS_COLORS[session.status]} className="capitalize">
                              {STATUS_LABELS[session.status]}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
