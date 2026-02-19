/**
 * VM Sessions List Page
 * Sprint 2 - Phase 2
 * Displays user's active VM sessions
 */

import { Head, Link } from '@inertiajs/react';
import {
  AlertCircle,
  Clock,
  Loader2,
  Monitor,
  Terminal,
  Skull,
  ArrowRight,
} from 'lucide-react';
import { useMemo } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useVMSessions } from '@/hooks/useVMSessions';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import type { VMSessionStatus } from '@/types/vm.types';

const OS_ICONS = {
  windows: Monitor,
  linux: Terminal,
  kali: Skull,
};

const OS_COLORS = {
  windows: 'bg-blue-500',
  linux: 'bg-orange-500',
  kali: 'bg-purple-500',
};

const STATUS_COLORS: Record<VMSessionStatus, 'default' | 'secondary' | 'destructive' | 'outline'> =
  {
    pending: 'default',
    provisioning: 'default',
    active: 'default',
    expiring: 'destructive',
    expired: 'destructive',
    failed: 'destructive',
    terminated: 'secondary',
  };

export default function SessionsIndexPage() {
  const { sessions, loading, error } = useVMSessions();

  const breadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      {
        title: 'Sessions',
        href: '/sessions',
      },
    ],
    []
  );

  const activeSessions = sessions.filter((s) => s.status === 'active');
  const provisioning = sessions.filter((s) => s.status === 'provisioning' || s.status === 'pending');
  const inactive = sessions.filter(
    (s) => s.status === 'expired' || s.status === 'failed' || s.status === 'terminated'
  );

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return 'Expired';
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  if (loading) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Sessions" />
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading sessions...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Sessions" />
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
      <Head title="Sessions" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">VM Sessions</h1>
            <p className="text-muted-foreground mt-2">Manage your active and past VM sessions</p>
          </div>
          <Button asChild>
            <Link href={dashboard().url}>
              Launch New VM
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        {sessions.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">No VM sessions yet</p>
              <Button asChild>
                <Link href={dashboard().url}>Launch Your First VM</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Active Sessions */}
            {activeSessions.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-green-600" />
                  Active Sessions ({activeSessions.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {activeSessions.map((session) => {
                    const OSIcon = OS_ICONS[session.template.os_type];
                    const osColor = OS_COLORS[session.template.os_type];

                    return (
                      <Card key={session.id} className="flex flex-col">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${osColor} text-white`}>
                                <OSIcon className="h-5 w-5" />
                              </div>
                              <div>
                                <CardTitle className="text-base">
                                  {session.template.name}
                                </CardTitle>
                                <CardDescription className="text-xs">
                                  {session.node_name}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge variant="default" className="bg-green-600">
                              Active
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="flex-1 pb-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {formatTimeRemaining(session.time_remaining_seconds)}
                            </span>
                            <Badge variant="outline" className="capitalize">
                              {session.session_type}
                            </Badge>
                          </div>
                        </CardContent>
                        <div className="border-t p-3">
                          <Button asChild className="w-full" size="sm">
                            <Link href={`/sessions/${session.id}`}>
                              View Details
                              <ArrowRight className="h-3 w-3 ml-2" />
                            </Link>
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Provisioning Sessions */}
            {provisioning.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                  Provisioning ({provisioning.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {provisioning.map((session) => {
                    const OSIcon = OS_ICONS[session.template.os_type];
                    const osColor = OS_COLORS[session.template.os_type];

                    return (
                      <Card key={session.id} className="flex flex-col opacity-75">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${osColor} text-white`}>
                                <OSIcon className="h-5 w-5" />
                              </div>
                              <div>
                                <CardTitle className="text-base">
                                  {session.template.name}
                                </CardTitle>
                              </div>
                            </div>
                            <Badge variant="default" className="bg-blue-600 capitalize">
                              {session.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                          <p className="text-xs text-muted-foreground">
                            Your VM is being provisioned. This may take a few minutes...
                          </p>
                        </CardContent>
                        <div className="border-t p-3">
                          <Button asChild className="w-full" size="sm" variant="outline">
                            <Link href={`/sessions/${session.id}`}>
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Inactive Sessions */}
            {inactive.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-gray-600" />
                  Inactive ({inactive.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {inactive.map((session) => {
                    const OSIcon = OS_ICONS[session.template.os_type];
                    const osColor = OS_COLORS[session.template.os_type];

                    return (
                      <Card key={session.id} className="flex flex-col opacity-60">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${osColor} text-white opacity-60`}>
                                <OSIcon className="h-5 w-5" />
                              </div>
                              <div>
                                <CardTitle className="text-base text-muted-foreground">
                                  {session.template.name}
                                </CardTitle>
                              </div>
                            </div>
                            <Badge
                              variant={STATUS_COLORS[session.status]}
                              className="capitalize"
                            >
                              {session.status}
                            </Badge>
                          </div>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
