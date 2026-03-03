/**
 * SessionPage — Main session view with Guacamole viewer and dashboard controls.
 * Sprint 3 — US-12 / US-13
 *
 * Layout:
 *  ┌──────────────────────────────────────────────┐
 *  │ Header: template name, status badge, actions │
 *  ├──────────────┬───────────────────────────────┤
 *  │  Info panel   │   Guacamole Viewer (iframe)   │
 *  │  Countdown    │                               │
 *  │  Extend       │                               │
 *  │  Terminate    │                               │
 *  └──────────────┴───────────────────────────────┘
 *
 * Data flow:
 *  - `useSessionStatus` polls session data (status, expires_at, vm_ip_address).
 *  - `GuacamoleViewer` internally uses `useGuacamoleToken` for token lifecycle.
 *  - `SessionCountdown` counts down from `expires_at`; re-syncs after extend.
 */

import { Head, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  Copy,
  Loader2,
  Monitor,
  Clock,
  Terminal,
  Server,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { GuacamoleViewer } from '@/components/GuacamoleViewer';
import { SessionCameraPanel } from '@/components/SessionCameraPanel';
import { SessionCountdown } from '@/components/SessionCountdown';
import { SessionExtendButton } from '@/components/SessionExtendButton';
import { SessionHardwarePanel } from '@/components/SessionHardwarePanel';
import { TerminateSessionButton } from '@/components/TerminateSessionButton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSessionStatus } from '@/hooks/useSessionStatus';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { VMSessionStatus, VMSession } from '@/types/vm.types';

// ---------- Constants ----------


const STATUS_CONFIG: Record<VMSessionStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-warning/10', text: 'text-warning border-warning/30', label: 'Pending' },
  provisioning: { bg: 'bg-info/10', text: 'text-info border-info/30', label: 'Provisioning' },
  active: { bg: 'bg-success/10', text: 'text-success border-success/30', label: 'Active' },
  expiring: { bg: 'bg-warning/10', text: 'text-warning border-warning/30', label: 'Expiring' },
  expired: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Expired' },
  failed: { bg: 'bg-destructive/10', text: 'text-destructive border-destructive/30', label: 'Failed' },
  terminated: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Terminated' },
};

// ---------- Component ----------

// We intentionally keep the prop untyped because Inertia sometimes
// delivers a JsonResource wrapper (`{ data: {...} }`) instead of the raw
// session.  We'll unwrap it in the component logic below.
interface SessionPageProps {
  session: unknown;
}

export default function SessionPage({ session: initialSession }: SessionPageProps) {
  const page = usePage();
  // initialSession may be a JsonResource wrapper ({ data: { … } }) when rendered
  // by Inertia, so we unwrap it to get the raw VMSession object.  we use
  // `unknown` here and perform a type guard rather than relying on `any`.
  const rawInitial: unknown = initialSession ?? page.props.session;

  function unwrap(raw: unknown): VMSession | null {
    if (!raw) {
      return null;
    }
    if (
      typeof raw === 'object' &&
      raw !== null &&
      'data' in (raw as Record<string, unknown>)
    ) {
      return (raw as { data: VMSession }).data;
    }
    return raw as VMSession;
  }

  const unwrapped = unwrap(rawInitial);

  // fall back to pathname so we can still fetch data when Inertia props are
  // missing (full page refresh or direct URL entry)
  const urlId = window.location.pathname.split('/').pop() || undefined;
  const sessionId = unwrapped?.id ?? urlId;

  // Expiring alert shown once
  const [expiringAlert, setExpiringAlert] = useState(false);

  const {
    session,
    loading,
    error,
    refetch,
  } = useSessionStatus(sessionId, {
    onReady: () => {},
    onExpiring: () => {
      setExpiringAlert(true);
    },
    onEnded: () => {
      // by the time we hear the 'ended' event the record may already be
      // expired/terminated. the user should return to dashboard rather than
      // stay on a dead session.
      router.visit('/dashboard');
    },
  });

  // if we were sent props from Inertia we can show them instantly while the
  // hook performs its first HTTP request. otherwise `session` will be null
  // until the client response arrives and the UI would render nothing.
  const displaySession = session ?? unwrapped; // use unwrapped prop from above

  // If the initial data we got from server is already expired/failed/terminated
  // then we shouldn't render the viewer at all. perform a client redirect back
  // to dashboard immediately (this can happen when the user manually types the
  // URL after the backend has marked the session ended).
  useEffect(() => {
    if (
      displaySession &&
      ['expired', 'terminated', 'failed'].includes(displaySession.status)
    ) {
      router.visit('/dashboard');
    }
  }, [displaySession]);

  // Track the live expires_at (may differ from server after extend)
  const [overrideExpiresAt, setOverrideExpiresAt] = useState<string | null>(null);
  const effectiveExpiresAt = overrideExpiresAt ?? displaySession?.expires_at ?? '';

  const handleExtended = useCallback(
    (newExpiresAt: string) => {
      setOverrideExpiresAt(newExpiresAt);
      setExpiringAlert(false);
      refetch();
    },
    [refetch],
  );

  const handleTerminated = useCallback(() => {
    router.visit('/sessions');
  }, []);

  const [copied, setCopied] = useState(false);
  const handleCopyId = useCallback(async () => {
    if (!displaySession) return;
    await navigator.clipboard.writeText(displaySession.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [displaySession]);

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Sessions', href: '/sessions' },
    {
      title: displaySession?.id ? `Session ${displaySession.id.substring(0, 8)}…` : 'Loading…',
      href: displaySession?.id ? `/sessions/${displaySession.id}` : '/sessions',
    },
  ];

  // ---------- Loading ----------
  // If we already have an initial session prop then we can render immediately
  if (loading && !displaySession) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Loading Session…" />
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading session details…</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // ---------- Error ----------
  if (error && !displaySession) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Error" />
        <div className="min-h-screen bg-background">
          <div className="container py-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button variant="outline" size="sm" onClick={() => router.visit('/sessions')} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sessions
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!displaySession) return null;

  // Bind a more specific type now that we know it's non-null.  We still use any
  // at the top to avoid TypeScript complaining earlier, but here's an alias for
  // clarity in the rest of this function.
  const ds = displaySession as VMSession;


  const OSIcon = Monitor;
  const statusConfig = STATUS_CONFIG[ds.status as VMSessionStatus];
  const isActive = ds.status === 'active';
  const isAlive = isActive || ds.status === 'expiring';
  const isPending = ds.status === 'pending' || ds.status === 'provisioning';

  // ---------- Render ----------
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Session ${ds.id.substring(0, 8)}…`} />

      <div className="min-h-screen bg-background">
        <div className="container py-8">
        {/* ---- Expiring alert ---- */}
        {expiringAlert && isAlive && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your session expires in less than 5 minutes. Extend now to avoid losing your work.
            </AlertDescription>
          </Alert>
        )}

        {/* ---- Header ---- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between mb-6"
        >
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${statusConfig.bg} ${statusConfig.text.split(' ')[0]}`}>
              <OSIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold text-foreground">Session {ds.id.substring(0,8)}</h1>
              <div className="mt-2 flex items-center gap-2">
                <code className="rounded bg-muted px-2 py-1 text-sm text-muted-foreground">
                  {ds.id}
                </code>
                <Button variant="ghost" size="sm" onClick={handleCopyId} className="h-auto p-1 hover:bg-muted">
                  <Copy className="h-4 w-4" />
                </Button>
                {copied && <span className="text-xs text-success">Copied!</span>}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={`${statusConfig.text} capitalize`}>{statusConfig.label}</Badge>

            {isAlive && effectiveExpiresAt && (
              <SessionCountdown expiresAt={effectiveExpiresAt} />
            )}

            {isAlive && (
              <SessionExtendButton
                sessionId={ds.id}
                onExtended={handleExtended}
              />
            )}

            {isAlive && (
              <TerminateSessionButton
                sessionId={ds.id}
                onTerminated={handleTerminated}
              />
            )}
          </div>
        </motion.div>

        {/* ---- Status alerts for non-active sessions ---- */}
        {!isAlive && !isPending && (
          <Alert variant={ds.status === 'failed' ? 'destructive' : 'default'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {ds.status === 'failed' &&
                'This session failed to provision. Please try launching a new session.'}
              {ds.status === 'expired' &&
                'This session has expired and is no longer available.'}
              {ds.status === 'terminated' &&
                'This session has been terminated.'}
            </AlertDescription>
          </Alert>
        )}

        {isPending && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Your VM is being provisioned. The remote desktop will appear automatically once
              the VM is ready…
            </AlertDescription>
          </Alert>
        )}

        {/* ---- Main grid ---- */}
        <div className="grid gap-6 lg:grid-cols-4 mt-6">
          {/* Sidebar — session info */}
          <div className="space-y-6 lg:col-span-1">
            {/* Session Details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="shadow-card">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-info" />
                    <CardTitle className="font-heading">Session Details</CardTitle>
                  </div>
                  <CardDescription>Configuration and timing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">

                  <InfoRow label="Node">{ds.node_name}</InfoRow>

                  <InfoRow label="Protocol">
                    <Badge variant="outline" className="bg-info/10 text-info border-info/30 uppercase">
                      {ds.protocol}
                    </Badge>
                  </InfoRow>

                  {ds.vm_ip_address && (
                    <InfoRow label="VM IP Address">
                      <code className="text-sm font-mono">{ds.vm_ip_address}</code>
                    </InfoRow>
                  )}

                  <InfoRow label="Created">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {new Date(ds.created_at).toLocaleString()}
                    </span>
                  </InfoRow>

                  <InfoRow label="Expires">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {effectiveExpiresAt
                        ? new Date(effectiveExpiresAt).toLocaleString()
                        : '—'}
                    </span>
                  </InfoRow>
                </CardContent>
              </Card>
            </motion.div>

            {/* USB Hardware Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <SessionHardwarePanel sessionId={ds.id} isActive={isAlive} />
            </motion.div>

            {/* Template Specs */}
          </div>

          {/* Main — Guacamole viewer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-3"
          >
            <Card className="shadow-card h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-info" />
                  <CardTitle className="font-heading">Remote Desktop</CardTitle>
                </div>
                <CardDescription>
                  {isAlive
                    ? 'Connected to your virtual machine'
                    : isPending
                      ? 'Waiting for VM to become ready…'
                      : 'Session is no longer active'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GuacamoleViewer
                  sessionId={ds.id}
                  isActive={isAlive}
                  protocol={ds.protocol}
                  vmIpAddress={ds.vm_ip_address}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ---- Camera Panel (below main grid) ---- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-6"
        >
          <SessionCameraPanel sessionId={ds.id} isActive={isAlive} />
        </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}

// ---------- Helper sub-components ----------

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="mt-1 font-medium">{children}</div>
    </div>
  );
}
