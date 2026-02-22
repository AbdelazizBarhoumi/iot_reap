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
  Cpu,
  HardDrive,
  Loader2,
  Monitor,
  Skull,
  Terminal,
  Zap,
} from 'lucide-react';
import { useCallback, useState } from 'react';
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

const OS_ICONS: Record<string, typeof Monitor> = {
  windows: Monitor,
  linux: Terminal,
  kali: Skull,
};

const OS_COLORS: Record<string, string> = {
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

// ---------- Component ----------

// We intentionally keep the prop untyped because Inertia sometimes
// delivers a JsonResource wrapper (`{ data: {...} }`) instead of the raw
// session.  We'll unwrap it in the component logic below.
interface SessionPageProps {
  session: any;
}

export default function SessionPage({ session: initialSession }: SessionPageProps) {
  const page = usePage();
  // initialSession may be a JsonResource wrapper ({ data: { … } }) when rendered
  // by Inertia, so we unwrap it to get the raw VMSession object.
  const rawInitial: any = initialSession ?? (page.props.session as any);
  const unwrapped = rawInitial?.data ?? rawInitial;
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
    onReady: (s) => {
    },
    onExpiring: (s) => {
      setExpiringAlert(true);
    },
    onEnded: (s) => {
      // session no longer available – send user back to list
      router.visit('/sessions');
    },
  });

  // if we were sent props from Inertia we can show them instantly while the
  // hook performs its first HTTP request. otherwise `session` will be null
  // until the client response arrives and the UI would render nothing.
  const displaySession = session ?? unwrapped; // use unwrapped prop from above

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

  // Occasionally the prop or API may return a session object that hasn't been
  // hydrated with its `template` relation yet (this was happening during the
  // Inertia visit in the browser, causing a crash).  Treat that as a
  // transitional loading state and log for investigation.
  if (!ds.template) {
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

  const OSIcon = OS_ICONS[ds.template.os_type] ?? Monitor;
  const osColor = OS_COLORS[ds.template.os_type] ?? 'bg-gray-500';
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
              <h1 className="text-3xl font-bold tracking-tight">{ds.template.name}</h1>
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
                <InfoRow label="Session Type">
                  <Badge variant="outline" className="capitalize">
                    {ds.session_type}
                  </Badge>
                </InfoRow>

                <InfoRow label="Node">{ds.node_name}</InfoRow>

                <InfoRow label="Protocol">
                  <Badge variant="outline" className="uppercase">
                    {ds.template.protocol}
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
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
                <CardDescription>Template resources</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <SpecRow icon={Cpu} label="CPU Cores" value={`${ds.template.cpu_cores}`} />
                <SpecRow icon={Zap} label="RAM" value={`${ds.template.ram_mb / 1024} GB`} />
                <SpecRow icon={HardDrive} label="Disk" value={`${ds.template.disk_gb} GB`} />
                <SpecRow
                  label="OS Type"
                  value={ds.template.os_type}
                  capitalize
                />
              </CardContent>
            </Card>
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
                protocol={ds.template.protocol}
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

interface SpecRowProps {
  icon?: typeof Cpu;
  label: string;
  value: string;
  capitalize?: boolean;
}

function SpecRow({ icon: Icon, label, value, capitalize = false }: SpecRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </span>
      <span className={`font-medium ${capitalize ? 'capitalize' : ''}`}>{value}</span>
    </div>
  );
}
