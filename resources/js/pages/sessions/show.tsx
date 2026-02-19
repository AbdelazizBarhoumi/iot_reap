/**
 * VM Session Detail Page
 * Sprint 2 - Phase 2 (US-06/US-07)
 * Displays active session status and Guacamole console
 */

import { Head, usePage } from '@inertiajs/react';
import {
  AlertCircle,
  Clock,
  Copy,
  Cpu,
  HardDrive,
  Loader2,
  Monitor,
  Terminal,
  Trash2,
  Skull,
  Zap,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useVMSession } from '@/hooks/useVMSessions';
import AppLayout from '@/layouts/app-layout';
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

const STATUS_COLORS: Record<VMSessionStatus, string> = {
  pending: 'bg-yellow-500',
  provisioning: 'bg-blue-500',
  active: 'bg-green-500',
  expiring: 'bg-orange-500',
  expired: 'bg-red-500',
  failed: 'bg-red-600',
  terminated: 'bg-gray-500',
};

interface SessionShowProps {
  session: {
    id: string;
  };
}

export default function SessionShowPage({ session: initialSession }: SessionShowProps) {
  const page = usePage();
  const sessionId = initialSession?.id || (page.props.session as { id: string })?.id;

  const { session, loading, error } = useVMSession(sessionId);
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);
  const [isTerminating, setIsTerminating] = useState(false);
  const [copied, setCopied] = useState(false);

  const breadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      {
        title: 'Sessions',
        href: '/sessions',
      },
      {
        title: session?.id ? `Session ${session.id.substring(0, 8)}...` : 'Loading...',
        href: session?.id ? `/sessions/${session.id}` : '/sessions',
      },
    ],
    [session?.id]
  );

  const handleCopyId = useCallback(async () => {
    if (!session) return;
    await navigator.clipboard.writeText(session.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [session]);

  const handleTerminate = useCallback(async () => {
    // This would call the terminate API
    // For now, this is a placeholder
    setIsTerminating(true);
    try {
      // await vmSessionApi.terminate(sessionId);
      // navigate to sessions list
    } catch {
      // Handle error
    } finally {
      setIsTerminating(false);
      setShowTerminateDialog(false);
    }
  }, []);

  if (loading) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Loading Session..." />
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading session details...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !session) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Error" />
        <div className="flex flex-1 flex-col gap-6 p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Session not found'}
            </AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  const OSIcon = OS_ICONS[session.template.os_type];
  const osColor = OS_COLORS[session.template.os_type];
  const statusColor = STATUS_COLORS[session.status];
  const isActive = session.status === 'active';
  const canConnect = isActive && session.guacamole_url;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Session ${session.id.substring(0, 8)}...`} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${osColor} text-white`}>
              <OSIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{session.template.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <code className="text-sm text-muted-foreground px-2 py-1 bg-muted rounded">
                  {session.id}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyId}
                  className="h-auto p-1"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                {copied && <span className="text-xs text-green-600">Copied!</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`${statusColor} text-white capitalize`}>
              {session.status}
            </Badge>
            {isActive && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowTerminateDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Terminate
              </Button>
            )}
          </div>
        </div>

        {/* Alert for non-active sessions */}
        {!isActive && (
          <Alert variant={session.status === 'failed' ? 'destructive' : 'default'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {session.status === 'failed' &&
                'This session failed to provision. Please try launching a new session.'}
              {session.status === 'pending' &&
                'This session is being provisioned. Please wait a moment...'}
              {session.status === 'expired' &&
                'This session has expired and is no longer available.'}
              {session.status === 'terminated' &&
                'This session has been terminated.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Grid layout */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Session Info Card */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
              <CardDescription>Configuration and timing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Session Type</p>
                  <Badge variant="outline" className="mt-1 capitalize">
                    {session.session_type}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Node</p>
                  <p className="font-medium mt-1">{session.node_name}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Time Remaining
                  </p>
                  <p className="font-medium mt-1">
                    {Math.floor(session.time_remaining_seconds / 60)} minutes
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium text-sm mt-1">
                    {new Date(session.created_at).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Expires</p>
                  <p className="font-medium text-sm mt-1">
                    {new Date(session.expires_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Template Specifications */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
              <CardDescription>Template resources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    CPU Cores
                  </span>
                  <span className="font-medium">{session.template.cpu_cores}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    RAM
                  </span>
                  <span className="font-medium">{session.template.ram_mb / 1024} GB</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    Disk
                  </span>
                  <span className="font-medium">{session.template.disk_gb} GB</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">OS Type</span>
                  <Badge variant="outline" className="capitalize">
                    {session.template.os_type}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Protocol</span>
                  <Badge variant="outline" className="uppercase">
                    {session.template.protocol}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Console/Connection */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Console Access</CardTitle>
              <CardDescription>Remote connection</CardDescription>
            </CardHeader>
            <CardContent>
              {canConnect && session.guacamole_url ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Click below to open the remote console in a new window.
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => {
                      if (session.guacamole_url) {
                        window.open(session.guacamole_url, '_blank');
                      }
                    }}
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    Open Console
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {session.status === 'provisioning'
                      ? 'Console will be available once provisioning completes.'
                      : 'Console is not available for this session.'}
                  </p>
                  <Button disabled className="w-full">
                    <Monitor className="h-4 w-4 mr-2" />
                    Open Console
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Terminate Confirmation Dialog */}
      <Dialog open={showTerminateDialog} onOpenChange={setShowTerminateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminate Session?</DialogTitle>
            <DialogDescription>
              Are you sure you want to terminate this session? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTerminateDialog(false)}
              disabled={isTerminating}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleTerminate}
              disabled={isTerminating}
            >
              {isTerminating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isTerminating ? 'Terminating...' : 'Terminate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
