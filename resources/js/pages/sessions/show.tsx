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
import { Head, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GuacamoleViewer } from '@/components/GuacamoleViewer';
import { SessionCameraPanel } from '@/components/SessionCameraPanel';
import { SessionCountdown } from '@/components/SessionCountdown';
import { SessionExtendButton } from '@/components/SessionExtendButton';
import { SessionHardwarePanel } from '@/components/SessionHardwarePanel';
import { TerminateSessionButton } from '@/components/TerminateSessionButton';
import { Button } from '@/components/ui/button';
import { useVMSession } from '@/hooks/useVMSessions';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import admin from '@/routes/admin';
import type { Camera } from '@/types/camera.types';
import type { VMSession } from '@/types/vm.types';

interface SessionPageProps {
  sessionId?: string;
  session?: VMSession;
}

const SPLIT_MIN_LEFT_PX = 520;
const SPLIT_MIN_RIGHT_PX = 500;
const SPLIT_STEP_PERCENT = 5;
const SPLIT_FALLBACK_MIN_PERCENT = 25;
const SPLIT_FALLBACK_MAX_PERCENT = 75;

function getSplitBoundsPercent(containerWidth: number): {
  minPercent: number;
  maxPercent: number;
} {
  if (containerWidth <= 0) {
    return {
      minPercent: SPLIT_FALLBACK_MIN_PERCENT,
      maxPercent: SPLIT_FALLBACK_MAX_PERCENT,
    };
  }

  const minPercent = Math.max(
    SPLIT_FALLBACK_MIN_PERCENT,
    (SPLIT_MIN_LEFT_PX / containerWidth) * 100,
  );

  const maxPercent = Math.min(
    SPLIT_FALLBACK_MAX_PERCENT,
    100 - (SPLIT_MIN_RIGHT_PX / containerWidth) * 100,
  );

  if (minPercent >= maxPercent) {
    return {
      minPercent: SPLIT_FALLBACK_MIN_PERCENT,
      maxPercent: SPLIT_FALLBACK_MAX_PERCENT,
    };
  }

  return { minPercent, maxPercent };
}

function clampSplitLeftPercent(value: number, containerWidth: number): number {
  const { minPercent, maxPercent } = getSplitBoundsPercent(containerWidth);
  return Math.min(maxPercent, Math.max(minPercent, value));
}

export default function SessionShowPage({ sessionId, session: initialSession }: SessionPageProps) {
  const resolvedSessionId = sessionId ?? initialSession?.id;
  const { session: fetchedSession, loading: fetchingSession } = useVMSession(
    initialSession ? undefined : resolvedSessionId,
  );
  const session = initialSession ?? fetchedSession;
  const loading = fetchingSession;
  const [isCameraSplitActive, setIsCameraSplitActive] = useState(false);
  const [isCameraFeedFocused, setIsCameraFeedFocused] = useState(false);
  const [splitLeftWidth, setSplitLeftWidth] = useState<number>(58);
  const [isResizingSplit, setIsResizingSplit] = useState(false);
  const [splitBounds, setSplitBounds] = useState<{
    minPercent: number;
    maxPercent: number;
  }>({
    minPercent: SPLIT_FALLBACK_MIN_PERCENT,
    maxPercent: SPLIT_FALLBACK_MAX_PERCENT,
  });
  const splitContainerRef = useRef<HTMLDivElement | null>(null);

  const handleCameraSelectionChange = useCallback((camera: Camera | null) => {
    const isActive = camera !== null;

    setIsCameraSplitActive(isActive);

    if (!isActive) {
      setIsCameraFeedFocused(false);
      setIsResizingSplit(false);
      setSplitBounds({
        minPercent: SPLIT_FALLBACK_MIN_PERCENT,
        maxPercent: SPLIT_FALLBACK_MAX_PERCENT,
      });
    }
  }, []);

  const handleCameraFeedFocusChange = useCallback((focused: boolean) => {
    setIsCameraFeedFocused(focused);

    if (!focused) {
      return;
    }

    const width = splitContainerRef.current?.getBoundingClientRect().width ?? 0;
    const bounds = getSplitBoundsPercent(width);

    setSplitBounds(bounds);
    setSplitLeftWidth(bounds.minPercent);
  }, []);

  useEffect(() => {
    if (!isCameraSplitActive || !isResizingSplit) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const container = splitContainerRef.current;
      if (!container) {
        return;
      }

      const rect = container.getBoundingClientRect();
      const relativeX = event.clientX - rect.left;
      const ratio = (relativeX / rect.width) * 100;
      const clampedRatio = clampSplitLeftPercent(ratio, rect.width);

      setSplitLeftWidth(clampedRatio);
    };

    const stopResize = () => {
      setIsResizingSplit(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopResize);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopResize);
    };
  }, [isCameraSplitActive, isResizingSplit]);

  useEffect(() => {
    if (!isCameraSplitActive) {
      return;
    }

    const syncSplitBounds = () => {
      const width = splitContainerRef.current?.getBoundingClientRect().width ?? 0;
      const bounds = getSplitBoundsPercent(width);

      setSplitBounds(bounds);

      setSplitLeftWidth((current) =>
        clampSplitLeftPercent(current, width),
      );
    };

    syncSplitBounds();
    window.addEventListener('resize', syncSplitBounds);

    return () => {
      window.removeEventListener('resize', syncSplitBounds);
    };
  }, [isCameraSplitActive]);

  const handleMakeCameraWider = useCallback(() => {
    const width = splitContainerRef.current?.getBoundingClientRect().width ?? 0;
    setSplitLeftWidth((current) =>
      clampSplitLeftPercent(current - SPLIT_STEP_PERCENT, width),
    );
  }, []);

  const handleMakeVmWider = useCallback(() => {
    const width = splitContainerRef.current?.getBoundingClientRect().width ?? 0;
    setSplitLeftWidth((current) =>
      clampSplitLeftPercent(current + SPLIT_STEP_PERCENT, width),
    );
  }, []);

  const handleSessionExtended = (_newExpiresAt: string) => {
    // Session list will refresh automatically via useVMSessions
  };

  const { auth } = usePage().props as { auth: { user?: { role?: string } } };
  const isAdmin = auth?.user?.role === 'admin';

  const handleBack = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();

      if (isAdmin) {
        router.visit(admin.dashboard.url());
        return;
      }

      if (window.history.length > 1) {
        window.history.back();
        return;
      }

      router.visit(dashboard().url);
    },
    [isAdmin],
  );

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
            <Button variant="ghost" size="sm" onClick={handleBack}>
              Back to Dashboard
            </Button>
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
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-lg font-semibold">VM Session</h1>
                <p className="text-sm text-muted-foreground">
                  {session.vm_id ? `VM #${session.vm_id}` : session.node_name ?? 'Unknown VM'}
                </p>
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
        <div
          ref={splitContainerRef}
          className={
            isCameraSplitActive
              ? 'relative flex flex-1 items-stretch overflow-hidden p-4'
              : 'flex flex-1 gap-4 overflow-hidden p-4'
          }
        >
          {/* Guacamole Viewer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`min-w-0 overflow-hidden rounded-lg border border-border/40 bg-background ${
              isCameraSplitActive
                ? 'shrink-0 pr-2 transition-[width] duration-150'
                : 'flex-1'
            }`}
            style={
              isCameraSplitActive
                ? { width: `${splitLeftWidth}%` }
                : undefined
            }
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

          {isCameraSplitActive && (
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize session split"
              className="relative w-3 shrink-0 self-stretch cursor-col-resize"
              onPointerDown={(event) => {
                event.preventDefault();
                setIsResizingSplit(true);
              }}
            >
              <div
                className={`absolute inset-y-0 left-1/2 w-px -translate-x-1/2 ${
                  isResizingSplit ? 'bg-info' : 'bg-border'
                }`}
              />
              <div
                className={`absolute left-1/2 top-1/2 h-10 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border ${
                  isResizingSplit
                    ? 'border-info/40 bg-info/10'
                    : 'border-border bg-background'
                }`}
              />
            </div>
          )}

          {/* Sidebar with Cameras and Hardware */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={
              isCameraSplitActive
                ? 'min-w-0 flex flex-1 flex-col gap-4 overflow-y-auto pl-2'
                : 'w-96 flex flex-col gap-4 overflow-y-auto'
            }
          >
            {isCameraSplitActive && !isCameraFeedFocused && (
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMakeCameraWider}
                  disabled={splitLeftWidth <= splitBounds.minPercent}
                >
                  Camera Wider
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMakeVmWider}
                  disabled={splitLeftWidth >= splitBounds.maxPercent}
                >
                  VM Wider
                </Button>
              </div>
            )}

            {/* Cameras */}
            <SessionCameraPanel
              sessionId={session.id}
              isActive={session.status === 'active'}
              onCameraSelectionChange={handleCameraSelectionChange}
              onFeedFocusChange={handleCameraFeedFocusChange}
            />

            {!isCameraSplitActive && (
              <>
                {/* Hardware */}
                <SessionHardwarePanel
                  sessionId={session.id}
                  isActive={session.status === 'active'}
                />
              </>
            )}
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}

