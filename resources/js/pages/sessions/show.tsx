/**
 * VM Session Detail Page
 * Sprint 3 — US-12/US-13 (Guacamole Viewer + Dashboard)
 *
 * Shows the active session with:
 *  - Guacamole iframe viewer with token auto-refresh
 *  - Live countdown timer (HH:MM:SS)
 *  - Extend / Terminate buttons
 *  - Session info sidebar with cameras and hardware
 */
import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { GuacamoleViewer } from '@/components/GuacamoleViewer';
import { SessionCameraPanel } from '@/components/SessionCameraPanel';
import { SessionCountdown } from '@/components/SessionCountdown';
import { SessionExtendButton } from '@/components/SessionExtendButton';
import { SessionHardwarePanel } from '@/components/SessionHardwarePanel';
import { TerminateSessionButton } from '@/components/TerminateSessionButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVMSessions } from '@/hooks/useVMSessions';
import AppLayout from '@/layouts/app-layout';

interface SessionPageProps {
  sessionId: string;
}

export default function SessionShowPage({ sessionId }: SessionPageProps) {
  const { sessions, loading } = useVMSessions();
  const session = sessions.find(s => s.id === sessionId);

  const handleSessionExtended = (_newExpiresAt: string) => {
    // Session list will refresh automatically via useVMSessions
  };

  const handleSessionTerminated = () => {
    // Session will be removed from list automatically
  };

  if (loading) {
    return (
      <AppLayout>
        <Head title="Loading Session..." />
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-4 animate-pulse text-lg font-semibold">Loading session...</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!session) {
    return (
      <AppLayout>
        <Head title="Session Not Found" />
        <div className="flex h-screen flex-col items-center justify-center">
          <div className="text-center">
            <h1 className="mb-2 text-2xl font-bold">Session not found</h1>
            <p className="mb-4 text-muted-foreground">This session may have expired or been terminated.</p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Head title={`Session: ${session.id}`} />
      <div className="h-screen flex flex-col">
        {/* Header with Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold">VM Session</h1>
                <p className="text-sm text-muted-foreground">{session.template?.name ?? 'Unknown'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SessionCountdown expiresAt={session.expires_at} />
              <SessionExtendButton sessionId={session.id} onExtended={handleSessionExtended} />
              <TerminateSessionButton sessionId={session.id} onTerminated={handleSessionTerminated} />
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="flex flex-1 gap-4 overflow-hidden p-4">
          {/* Guacamole Viewer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 rounded-lg border border-border/40 bg-background overflow-hidden"
          >
            {session.guacamole_url ? (
              <GuacamoleViewer sessionId={session.id} isActive={session.status === 'active'} />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted/50">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Initializing connection...</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Sidebar with Cameras and Hardware */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-96 flex flex-col gap-4 overflow-y-auto"
          >
            {/* Cameras */}
            <SessionCameraPanel sessionId={session.id} isActive={session.status === 'active'} />

            {/* Hardware */}
            <SessionHardwarePanel sessionId={session.id} isActive={session.status === 'active'} />

            {/* Session Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Session Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Session ID</p>
                  <p className="font-mono text-xs">{session.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="capitalize">{session.status}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Template</p>
                  <p>{session.template?.name ?? 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Node</p>
                  <p>{session.node?.node_name ?? session.node_name}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}

