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
import {
  AlertCircle,
  ArrowLeft,
  Copy,
  Loader2,
  Monitor,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { GuacamoleViewer } from '@/components/GuacamoleViewer';
import { SessionCountdown } from '@/components/SessionCountdown';
import { SessionExtendButton } from '@/components/SessionExtendButton';
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


const STATUS_COLORS: Record<VMSessionStatus, string> = {
  pending: 'bg-yellow-500',
  provisioning: 'bg-blue-500',
  active: 'bg-green-500',
  expiring: 'bg-orange-500',
  expired: 'bg-red-500',
  failed: 'bg-red-600',
  terminated: 'bg-gray-500',
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
        <div className="flex flex-1 flex-col gap-6 p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button variant="outline" size="sm" onClick={() => router.visit('/sessions')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sessions
          </Button>
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
  const osColor = 'bg-gray-500';
  const statusColor = STATUS_COLORS[ds.status as VMSessionStatus];
  const isActive = ds.status === 'active';
  const isAlive = isActive || ds.status === 'expiring';
  const isPending = ds.status === 'pending' || ds.status === 'provisioning';

  // ---------- Render ----------
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Session ${ds.id.substring(0, 8)}…`} />

      <div className="flex flex-1 flex-col gap-6 p-6">
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`rounded-lg p-3 text-white ${osColor}`}>
              <OSIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Session {ds.id.substring(0,8)}</h1>
              <div className="mt-2 flex items-center gap-2">
                <code className="rounded bg-muted px-2 py-1 text-sm text-muted-foreground">
                  {ds.id}
                </code>
                <Button variant="ghost" size="sm" onClick={handleCopyId} className="h-auto p-1">
                  <Copy className="h-4 w-4" />
                </Button>
                {copied && <span className="text-xs text-green-600">Copied!</span>}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Badge className={`${statusColor} capitalize text-white`}>{ds.status}</Badge>

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
        </div>

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
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar — session info */}
          <div className="space-y-6 lg:col-span-1">
            {/* Session Details */}
            <Card>
              <CardHeader>
                <CardTitle>Session Details</CardTitle>
                <CardDescription>Configuration and timing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">

                <InfoRow label="Node">{ds.node_name}</InfoRow>

                <InfoRow label="Protocol">
                  <Badge variant="outline" className="uppercase">
                    {ds.protocol}
                  </Badge>
                </InfoRow>

                {ds.vm_ip_address && (
                  <InfoRow label="VM IP Address">
                    <code className="text-sm">{ds.vm_ip_address}</code>
                  </InfoRow>
                )}

                <InfoRow label="Created">
                  {new Date(ds.created_at).toLocaleString()}
                </InfoRow>

                <InfoRow label="Expires">
                  {effectiveExpiresAt
                    ? new Date(effectiveExpiresAt).toLocaleString()
                    : '—'}
                </InfoRow>
              </CardContent>
            </Card>

            {/* Template Specs */}
          </div>

          {/* Main — Guacamole viewer */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Remote Desktop</CardTitle>
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
