/**
 * Dashboard Page - VM Browser
 * Sprint 3 - Shows VMs from Proxmox + active sessions
 *
 * The user manages VMs directly on the Proxmox server.
 * This dashboard fetches and displays them so users can launch sessions.
 */

import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  Clock,
  Cpu,
  Eye,
  EyeOff,
  HardDrive,
  Loader2,
  MemoryStick,
  Monitor,
  Play,
  Power,
  RefreshCw,
  Server,
  Activity,
  History,
  Terminal,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { vmSessionApi, connectionPreferencesApi, proxmoxVMApi } from '@/api/vm.api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProxmoxVMs } from '@/hooks/useProxmoxVMs';
import { useVMSessions } from '@/hooks/useVMSessions';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import type { ConnectionProfile, ProxmoxVMInfo, VMSnapshot, CreateVMSessionRequest } from '@/types/vm.types';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: dashboard().url },
];



const DURATION_OPTIONS = [
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 240, label: '4 hours' },
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
}

function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Expired';
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m remaining`;
  return `${minutes}m remaining`;
}

export default function Dashboard() {
  const { vms, loading: vmsLoading, error: vmsError, refetch: refetchVMs } = useProxmoxVMs();
  const { sessions, loading: sessionsLoading, terminateSession, refetch: refetchSessions } = useVMSessions();

  const [selectedVM, setSelectedVM] = useState<ProxmoxVMInfo | null>(null);
  const [isLaunchOpen, setIsLaunchOpen] = useState(false);
  const [launchDuration, setLaunchDuration] = useState<number>(60);
  const [launchLoading, setLaunchLoading] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [useExisting, setUseExisting] = useState(false); // if true, connect to VM instead of cloning
  const [terminatingId, setTerminatingId] = useState<string | null>(null);

  // New launch form fields
  const [launchUsername, setLaunchUsername] = useState('');
  const [launchPassword, setLaunchPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [launchProtocol, setLaunchProtocol] = useState<string>('rdp');
  const [protocolDisabled, setProtocolDisabled] = useState(false);
  // special sentinel used by the select component for the "no snapshot" option
  // we can't use an empty string because Radix throws an error when an item value
  // is empty. The state itself will remain empty (''), we just intercept the
  // select change handler to translate back from this sentinel.
  const NO_SNAPSHOT_VALUE = '__none';
  const [launchReturnSnapshot, setLaunchReturnSnapshot] = useState<string>('');
  const [vmSnapshots, setVmSnapshots] = useState<VMSnapshot[]>([]);
  const [snapshotsLoading, setSnapshotsLoading] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState<{ rdp: ConnectionProfile[]; vnc: ConnectionProfile[]; ssh: ConnectionProfile[] }>({
    rdp: [],
    vnc: [],
    ssh: [],
  });

  const activeSessions = sessions.filter(
    (s) => s?.status === 'active' && s.time_remaining_seconds > 0
  );
  const provisioningSessions = sessions.filter(
    (s) => (s?.status === 'provisioning' || s?.status === 'pending') && s.time_remaining_seconds > 0
  );
  const hasActiveSessions = activeSessions.length > 0 || provisioningSessions.length > 0;

  // Load saved connection profiles on mount
  useEffect(() => {
    connectionPreferencesApi.getAll()
      .then((data) => setSavedProfiles(data ?? { rdp: [], vnc: [], ssh: [] }))
      .catch(() => { /* Silently ignore — profiles are optional */ });
  }, []);

  const handleOpenLaunch = useCallback((vm: ProxmoxVMInfo) => {
    setSelectedVM(vm);
    setLaunchError(null);
    setLaunchUsername('');
    setLaunchPassword('');
    setShowPassword(false);
    // disable selector when template owns protocol, allow choice for existing VMs
    setProtocolDisabled(vm.is_template);
    setLaunchReturnSnapshot('');
    setVmSnapshots([]);
    // default to using existing VM when it's not a template
    setUseExisting(!vm.is_template);
    setIsLaunchOpen(true);

    // Fetch snapshots for this VM
    setSnapshotsLoading(true);
    proxmoxVMApi.listSnapshots(vm.server_id, vm.node_id, vm.vmid)
      .then((snaps) => setVmSnapshots(snaps))
      .catch(() => setVmSnapshots([]))
      .finally(() => setSnapshotsLoading(false));
  }, []);

  const handleLaunch = useCallback(async () => {
    if (!selectedVM) return;
    setLaunchLoading(true);
    setLaunchError(null);


    try {
      // we already checked `selectedVM` above, so all required fields are defined
      const payload: CreateVMSessionRequest = {
        vmid: selectedVM.vmid,
        node_id: selectedVM.node_id,
        vm_name: selectedVM.name,
        duration_minutes: launchDuration,
        username: launchUsername || undefined,
        password: launchPassword || undefined,
        connection_preference_protocol: launchProtocol || undefined,
        return_snapshot: launchReturnSnapshot || undefined,
        use_existing: useExisting || undefined,
      };
      if (!useExisting) {
        payload.connection_preference_protocol = launchProtocol || undefined;
      }
      const session = await vmSessionApi.create(payload);
      if (!session || !session.id) {
        throw new Error('API returned invalid session');
      }
      setIsLaunchOpen(false);
      router.visit(`/sessions/${session.id}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to launch session';
      console.error('[dashboard] launch error', message, e);
      setLaunchError(message);
      // Keep dialog open so user can see the error and retry
    } finally {
      setLaunchLoading(false);
    }
  }, [selectedVM, launchDuration, launchUsername, launchPassword, launchProtocol, launchReturnSnapshot, useExisting]);

  const hasPreferencesForProtocol = useCallback(
    (protocol: string) => {
      const profiles = savedProfiles[protocol as keyof typeof savedProfiles];
      return profiles && profiles.length > 0;
    },
    [savedProfiles],
  );

  const handleTerminate = useCallback(
    async (sessionId: string) => {
      setTerminatingId(sessionId);
      try {
        await terminateSession(sessionId);
      } finally {
        setTerminatingId(null);
      }
    },
    [terminateSession]
  );

  const handleRefresh = useCallback(() => {
    refetchVMs();
    refetchSessions();
  }, [refetchVMs, refetchSessions]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="container py-8">

        {/* ─── Page Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">VM Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your virtual machines and sessions</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={vmsLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${vmsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </motion.div>

        {/* ─── Stats Overview ─── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="shadow-card hover:shadow-card-hover transition-shadow">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info/10 text-info">
                  <Monitor className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available VMs</p>
                  <p className="font-heading text-2xl font-bold text-foreground">{vms.length}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="shadow-card hover:shadow-card-hover transition-shadow">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10 text-success">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Sessions</p>
                  <p className="font-heading text-2xl font-bold text-foreground">{activeSessions.length}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="shadow-card hover:shadow-card-hover transition-shadow">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10 text-warning ${provisioningSessions.length > 0 ? '' : ''}`}>
                  <Loader2 className={`h-6 w-6 ${provisioningSessions.length > 0 ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Provisioning</p>
                  <p className="font-heading text-2xl font-bold text-foreground">{provisioningSessions.length}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="shadow-card hover:shadow-card-hover transition-shadow">
              <CardContent className="p-5">
                <Link href="/sessions" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <History className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Session History</p>
                    <p className="text-sm font-medium text-info">View past sessions →</p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ─── Active Sessions ─── */}
        {!sessionsLoading && hasActiveSessions && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-heading text-xl font-semibold text-foreground">Your Sessions</h2>
              <Badge className="bg-success/10 text-success border-success/30">{activeSessions.length + provisioningSessions.length} active</Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeSessions.map((session, i) => {
                // templates removed; use generic icon and color
                const OSIcon = Monitor;
                const isTerminating = terminatingId === session.id;
                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="flex flex-col shadow-card hover:shadow-card-hover transition-all">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
                              <OSIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <CardTitle className="font-heading text-base">VM #{session.vm_id}</CardTitle>
                              <CardDescription className="text-xs">{session.node_name}</CardDescription>
                            </div>
                          </div>
                          <Badge className="bg-success/10 text-success border-success/30 text-xs">Active</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 pb-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {formatTimeRemaining(session.time_remaining_seconds)}
                          </span>
                        </div>
                      </CardContent>
                      <div className="border-t p-3 flex gap-2">
                        <Button asChild className="flex-1 bg-info text-info-foreground hover:bg-info/90" size="sm">
                          <Link href={`/sessions/${session.id}`}>
                            Connect <ArrowRight className="h-3 w-3 ml-2" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleTerminate(session.id)} disabled={isTerminating}>
                          {isTerminating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Power className="h-3 w-3" />}
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}

              {provisioningSessions.map((session, i) => {
                const OSIcon = Monitor;
                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (activeSessions.length + i) * 0.1 }}
                  >
                    <Card className="flex flex-col shadow-card opacity-75">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
                              <OSIcon className="h-5 w-5" />
                            </div>
                            <CardTitle className="font-heading text-base">VM #{session.vm_id}</CardTitle>
                          </div>
                          <Badge className="bg-warning/10 text-warning border-warning/30 text-xs capitalize">{session.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Provisioning — this may take a few minutes...</span>
                        </div>
                      </CardContent>
                      <div className="border-t p-3">
                        <Button asChild className="w-full" size="sm" variant="outline">
                          <Link href={`/sessions/${session.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Available VMs ─── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading text-xl font-semibold text-foreground">Available VMs</h2>
              <p className="text-muted-foreground text-sm mt-1">
                VMs from your Proxmox servers — select one to start a session
              </p>
            </div>
          </div>

        {vmsError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{vmsError}</AlertDescription>
          </Alert>
        )}

        {vmsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading VMs from Proxmox...</p>
            </div>
          </div>
        ) : vms.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No VMs found. Make sure you have an active Proxmox server with online nodes.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vms.map((vm, i) => (
              <motion.div
                key={`${vm.server_id}-${vm.node_id}-${vm.vmid}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="flex flex-col shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${vm.is_template ? 'bg-info/10 text-info' : 'bg-muted text-muted-foreground'}`}>
                          {vm.is_template ? <Terminal className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                        </div>
                        <div>
                          <CardTitle className="font-heading text-lg">{vm.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 text-xs">
                            <Server className="h-3 w-3" />
                            {vm.server_name} / {vm.node_name}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className={
                          vm.status === 'running'
                            ? 'bg-success/10 text-success border-success/30'
                            : vm.status === 'stopped'
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-warning/10 text-warning border-warning/30'
                        }
                      >
                        {vm.status}
                      </Badge>
                      {vm.is_template && (
                        <Badge variant="outline" className="bg-info/10 text-info border-info/30 text-xs">
                          Template
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5"><HardDrive className="h-3.5 w-3.5" /> VMID</span>
                        <span className="font-mono font-medium text-foreground">{vm.vmid}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5" /> CPU</span>
                        <span className="font-medium text-foreground">{vm.cpus} cores</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5"><MemoryStick className="h-3.5 w-3.5" /> RAM</span>
                        <span className="font-medium text-foreground">{formatBytes(vm.maxmem)}</span>
                      </div>
                      {vm.maxdisk > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5"><HardDrive className="h-3.5 w-3.5" /> Disk</span>
                          <span className="font-medium text-foreground">{formatBytes(vm.maxdisk)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-info text-info-foreground hover:bg-info/90" onClick={() => handleOpenLaunch(vm)}>
                      <Play className="h-4 w-4 mr-2" />
                      {vm.is_template ? 'Launch Session' : 'Connect'}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
        </div>
      </div>

      {/* ─── Launch Session Dialog ─── */}
      <Dialog open={isLaunchOpen} onOpenChange={(open) => { if (!launchLoading) setIsLaunchOpen(open); }}>
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Launch Session — {selectedVM?.name}</DialogTitle>
            <DialogDescription>
              {useExisting
                ? 'This will connect to the existing VM.'
                : 'A clone of this VM will be created for your session.'}
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            {/* VM Info summary */}
            {selectedVM && (
              <div className="bg-muted p-3 rounded-md text-sm">
                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                  <span>VMID:</span>
                  <span className="font-mono font-medium text-foreground">{selectedVM.vmid}</span>
                  <span>Node:</span>
                  <span className="font-medium text-foreground">{selectedVM.node_name}</span>
                  <span>CPU / RAM:</span>
                  <span className="font-medium text-foreground">
                    {selectedVM.cpus} cores, {formatBytes(selectedVM.maxmem)}
                  </span>
                </div>
              </div>
            )}

            {/* Session Duration */}
            <div className="grid gap-2">
              <Label htmlFor="launch-duration">Session Duration</Label>
              <Select value={launchDuration.toString()} onValueChange={(v) => setLaunchDuration(Number(v))} disabled={launchLoading}>
                <SelectTrigger id="launch-duration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value.toString()}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


            {/* Connection Protocol */}
            <div className="grid gap-2">
              <Label htmlFor="launch-protocol">Connection Protocol</Label>
              <Select value={launchProtocol} onValueChange={setLaunchProtocol} disabled={launchLoading || protocolDisabled}>
                <SelectTrigger id="launch-protocol">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rdp">
                    RDP (Remote Desktop)
                    {hasPreferencesForProtocol('rdp') ? ' ★' : ''}
                  </SelectItem>
                  <SelectItem value="vnc">
                    VNC
                    {hasPreferencesForProtocol('vnc') ? ' ★' : ''}
                  </SelectItem>
                  <SelectItem value="ssh">
                    SSH
                    {hasPreferencesForProtocol('ssh') ? ' ★' : ''}
                  </SelectItem>
                </SelectContent>
              </Select>
              {hasPreferencesForProtocol(launchProtocol) && (
                <p className="text-xs text-muted-foreground">
                  ★ Your saved {launchProtocol.toUpperCase()} preferences will be applied to this connection.
                </p>
              )}
              {protocolDisabled && (
                <p className="text-xs text-muted-foreground">Protocol locked to VM default for existing connection</p>
              )}
            </div>

            {/* Credentials */}
            <div className="grid gap-2">
              <Label htmlFor="launch-username">Username <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                id="launch-username"
                value={launchUsername}
                onChange={(e) => setLaunchUsername(e.target.value)}
                placeholder="VM login username"
                disabled={launchLoading}
                autoComplete="off"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="launch-password">Password <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <div className="relative">
                <Input
                  id="launch-password"
                  type={showPassword ? 'text' : 'password'}
                  value={launchPassword}
                  onChange={(e) => setLaunchPassword(e.target.value)}
                  placeholder="VM login password"
                  disabled={launchLoading}
                  autoComplete="off"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Credentials are encrypted and stored only for the session duration.
              </p>
            </div>

            {/* Return to Snapshot (optional)
                shown for all session launches, whether cloning or connecting
                directly. */}
            <div className="grid gap-2">
              <Label htmlFor="launch-snapshot">Return to Snapshot <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Select
                value={launchReturnSnapshot}
                onValueChange={(v) => {
                  // translate the sentinel back into an empty string state
                  if (v === NO_SNAPSHOT_VALUE) {
                    setLaunchReturnSnapshot('');
                  } else {
                    setLaunchReturnSnapshot(v);
                  }
                }}
                disabled={launchLoading || snapshotsLoading}
              >
                <SelectTrigger id="launch-snapshot">
                  <SelectValue placeholder={snapshotsLoading ? 'Loading snapshots...' : 'No snapshot (default)'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SNAPSHOT_VALUE}>No snapshot (default)</SelectItem>
                  {vmSnapshots
                    .filter((s) => s.name !== 'current')
                    .map((snap) => (
                      <SelectItem key={snap.name} value={snap.name}>
                        {snap.name}
                        {snap.description ? ` — ${snap.description}` : ''}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The VM will be reverted to this snapshot when the session ends.
              </p>
            </div>

            {/* Error display */}
            {launchError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{launchError}</AlertDescription>
              </Alert>
            )}

            {/* Progress indicator during activation */}
            {launchLoading && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Starting VM and preparing remote desktop connection. This may take up to a minute...
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLaunchOpen(false)} disabled={launchLoading}>Cancel</Button>
            <Button onClick={handleLaunch} disabled={launchLoading}>
              {launchLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {launchLoading ? 'Launching...' : useExisting ? 'Connect' : 'Launch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
