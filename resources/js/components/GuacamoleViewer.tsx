/**
 * GuacamoleViewer — Canvas-based Guacamole remote desktop viewer.
 *
 * Uses guacamole-common-js (Guacamole.Client + Guacamole.WebSocketTunnel).
 * Sprint 3 — US-12
 *
 * Token lifecycle:
 *  1. Fetch one-time token + tunnel metadata from backend.
 *  2. Open a WebSocket tunnel to the Guacamole server.
 *  3. Render the remote display on an HTML5 Canvas.
 *  4. Auto-refresh token 30 s before expiry — reconnects seamlessly.
 *
 * Connection preservation:
 *  The backend stores `guacamole_connection_id` on the session. On page
 *  refresh the same connection is reused — no duplicate connections created.
 */
import Guacamole from 'guacamole-common-js';
import {
    AlertCircle,
    Expand,
    Loader2,
    Minimize,
    RefreshCw,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGuacamoleToken } from '@/hooks/useGuacamoleToken';
// ─── Types ────────────────────────────────────────────────────────────────────
export interface GuacamoleViewerProps {
    /** VM session UUID. */
    sessionId: string;
    /** Whether the session is currently active and ready for a token fetch. */
    isActive: boolean;
    /** Protocol label shown in the toolbar (e.g. "RDP", "VNC"). */
    protocol?: string;
    /** VM IP address displayed for informational purposes. */
    vmIpAddress?: string | null;
}
/** Subset of Guacamole.Client.State we care about. */
const GuacState = {
    IDLE: 0,
    CONNECTING: 1,
    WAITING: 2,
    CONNECTED: 3,
    DISCONNECTING: 4,
    DISCONNECTED: 5,
} as const;
type GuacStateValue = (typeof GuacState)[keyof typeof GuacState];
const STATE_LABELS: Record<GuacStateValue, string> = {
    [GuacState.IDLE]: 'Idle',
    [GuacState.CONNECTING]: 'Connecting…',
    [GuacState.WAITING]: 'Waiting…',
    [GuacState.CONNECTED]: 'Connected',
    [GuacState.DISCONNECTING]: 'Disconnecting…',
    [GuacState.DISCONNECTED]: 'Disconnected',
};
// ─── Pure helpers (no side-effects) ───────────────────────────────────────────
/**
 * Build the connection parameters string for `Guacamole.Client.connect()`.
 *
 * guacamole-common-js WebSocketTunnel appends "?" + connectData to the
 * tunnel URL inside connect(), so we must NOT pre-append params to the URL.
 */
function buildConnectParams(
    token: string,
    connectionId: string,
    dataSource: string,
    width: number,
    height: number,
    dpi: number,
): string {
    return new URLSearchParams({
        token,
        GUAC_DATA_SOURCE: dataSource,
        GUAC_ID: connectionId,
        GUAC_TYPE: 'c',
        GUAC_WIDTH: String(width),
        GUAC_HEIGHT: String(height),
        GUAC_DPI: String(dpi),
    }).toString();
}
// Use displayRef for size measurement, not containerRef
// displayRef is the actual canvas mount point
function getTargetSize(container: HTMLElement): { w: number; h: number } {
    if (document.fullscreenElement) {
        return {
            w: window.innerWidth,
            h: window.innerHeight, // already correct from previous fix
        };
    }
    const { width, height } = container.getBoundingClientRect();
    return {
        w: Math.round(width) || 1024,
        h: Math.round(height) || 576,
    };
}
/**
 * Scale the Guacamole display to fill the container while preserving the
 * remote desktop's aspect ratio (letter/pillar-box if needed).
 */
function fitDisplayToContainer(
    display: Guacamole.Display,
    container: HTMLElement,
): void {
    const remoteW = display.getWidth();
    const remoteH = display.getHeight();
    if (!remoteW || !remoteH) return;
    const { w, h } = getTargetSize(container);
    display.scale(Math.min(w / remoteW, h / remoteH));
}
// ─── Sub-components ───────────────────────────────────────────────────────────
function WaitingForSession({ vmIpAddress }: { vmIpAddress?: string | null }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
                Waiting for session to become active&hellip;
            </p>
            {vmIpAddress && (
                <p className="mt-1 text-xs text-muted-foreground">
                    VM IP: {vmIpAddress}
                </p>
            )}
        </div>
    );
}
function LoadingSkeleton() {
    return (
        <div className="space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="aspect-video w-full rounded-lg" />
        </div>
    );
}
function ErrorState({
    message,
    onRetry,
}: {
    message: string;
    onRetry: () => void;
}) {
    return (
        <div className="space-y-4">
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
            </Alert>
            <Button variant="outline" size="sm" onClick={onRetry}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
            </Button>
        </div>
    );
}
interface ToolbarProps {
    protocol?: string;
    vmIpAddress?: string | null;
    connectionState: GuacStateValue;
    isFullscreen: boolean;
    onReconnect: () => void;
    onToggleFullscreen: () => void;
}
function Toolbar({
    protocol,
    vmIpAddress,
    connectionState,
    isFullscreen,
    onReconnect,
    onToggleFullscreen,
}: ToolbarProps) {
    const isConnected = connectionState === GuacState.CONNECTED;
    const stateLabel = STATE_LABELS[connectionState] ?? 'Unknown';
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {protocol && (
                    <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium uppercase">
                        {protocol}
                    </span>
                )}
                {vmIpAddress && <span>Connected to {vmIpAddress}</span>}
                <span
                    className={[
                        'rounded px-2 py-0.5 text-xs font-medium',
                        isConnected
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
                    ].join(' ')}
                >
                    {stateLabel}
                </span>
            </div>
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onReconnect}
                    title="Reconnect"
                >
                    <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleFullscreen}
                    title="Toggle fullscreen"
                >
                    {isFullscreen ? (
                        <Minimize className="h-4 w-4" />
                    ) : (
                        <Expand className="h-4 w-4" />
                    )}
                </Button>
            </div>
        </div>
    );
}
// ─── Main component ───────────────────────────────────────────────────────────
export function GuacamoleViewer({
    sessionId,
    isActive,
    protocol,
    vmIpAddress,
}: GuacamoleViewerProps) {
    const { tokenData, loading, error, refresh } = useGuacamoleToken(
        sessionId,
        isActive,
    );
    const displayRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const clientRef = useRef<Guacamole.Client | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [connectionState, setConnectionState] = useState<GuacStateValue>(
        GuacState.IDLE,
    );
    const [connectionError, setConnectionError] = useState<string | null>(null);
    // ── Sync fullscreen state with the browser (e.g. user presses Escape) ──────
    useEffect(() => {
        const onFullscreenChange = () =>
            setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () =>
            document.removeEventListener(
                'fullscreenchange',
                onFullscreenChange,
            );
    }, []);
    // ── Core Guacamole connection ─────────────────────────────────────────────
    useEffect(() => {
        if (!tokenData || !displayRef.current) return;
        const displayEl = displayRef.current;
        const containerEl = displayEl;
        let currentState: GuacStateValue = GuacState.IDLE;
        // Tear down any existing client before creating a new one.
        if (clientRef.current) {
            try {
                clientRef.current.disconnect();
            } catch {
                /* ignore */
            }
            displayEl.replaceChildren();
        }
        // ── Open the tunnel ─────────────────────────────────────────────────────
        const { w: width, h: height } = getTargetSize(containerEl);
        const dpi = Math.round(window.devicePixelRatio * 96);
        const connectParams = buildConnectParams(
            tokenData.token,
            tokenData.connection_id,
            tokenData.data_source,
            width,
            height,
            dpi,
        );
        if (process.env.NODE_ENV === 'development') {
            console.debug('[GuacamoleViewer] tunnel url', tokenData.tunnel_url);
            console.debug('[GuacamoleViewer] connect params', connectParams);
            // Expose full URL for quick console inspection during development.
            // cast through unknown because TS thinks `window` is not indexable
            (window as unknown as Record<string, unknown>).lastGuacTunnelUrl =
                `${tokenData.tunnel_url}?${connectParams}`;
        }
        const tunnel = new Guacamole.WebSocketTunnel(tokenData.tunnel_url);
        const client = new Guacamole.Client(tunnel);
        clientRef.current = client;
        // ── Client event handlers ───────────────────────────────────────────────
        client.onstatechange = (state: number) => {
            const s = state as GuacStateValue;
            currentState = s;
            console.debug(
                '[GuacamoleViewer] state →',
                STATE_LABELS[s] ?? state,
            );
            setConnectionState(s);
            if (s === GuacState.CONNECTING) setConnectionError(null);
            if (s === GuacState.DISCONNECTED)
                setConnectionError('Remote desktop connection closed.');

            if (s === GuacState.CONNECTED) {
                // Ensure a first size sync only after tunnel is ready.
                const { w, h } = getTargetSize(containerEl);
                try {
                    client.sendSize(w, h);
                } catch {
                    // ignore transient race during state transitions
                }
                fitDisplayToContainer(guacDisplay, containerEl);
            }
        };
        client.onerror = (status: Guacamole.Status) => {
            console.error('[GuacamoleViewer] error', status);
            setConnectionError(
                `Remote desktop error: ${status?.message ?? 'Unknown error'}`,
            );
        };
        // ── Attach display canvas ───────────────────────────────────────────────
        const guacDisplay = client.getDisplay();
        displayEl.appendChild(guacDisplay.getElement());
        // Rescale whenever the remote end reports a new canvas size.
        guacDisplay.onresize = () =>
            fitDisplayToContainer(guacDisplay, containerEl);
        // ── Input — keyboard ────────────────────────────────────────────────────
        // Listen on the whole document so the user doesn't need to click the
        // canvas first; return false to suppress browser default behaviour.
        const keyboard = new Guacamole.Keyboard(document);
        keyboard.onkeydown = (keysym: number) => {
            client.sendKeyEvent(1, keysym);
            return false;
        };
        keyboard.onkeyup = (keysym: number) => {
            client.sendKeyEvent(0, keysym);
        };
        // ── Input — mouse ───────────────────────────────────────────────────────
        const mouse = new Guacamole.Mouse(guacDisplay.getElement());
        mouse.onEach(
            ['mousedown', 'mousemove', 'mouseup'],
            (event: Guacamole.Event) => {
                client.sendMouseState(
                    (event as Guacamole.Mouse.Event).state,
                    true,
                );
            },
        );
        // ── Connect ─────────────────────────────────────────────────────────────
        client.connect(connectParams);
        // ── Resize handling ─────────────────────────────────────────────────────
        //
        // A single ResizeObserver on the container handles everything:
        //   • Window resizes     → container rect changes → observer fires.
        //   • Fullscreen enter/exit → container rect changes → observer fires.
        //   • Flex/grid reflow   → container rect changes → observer fires.
        //
        // Debounced at 100 ms — imperceptible to the user, eliminates the flood
        // of intermediate frames that would otherwise saturate the WebSocket.
        let resizeTimer: ReturnType<typeof setTimeout> | null = null;
        const applyResize = () => {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (currentState !== GuacState.CONNECTED) {
                    return;
                }
                const { w, h } = getTargetSize(containerEl);
                try {
                    client.sendSize(w, h);
                } catch {
                    // ignore transient race during reconnect/disconnect
                    return;
                }
                fitDisplayToContainer(guacDisplay, containerEl);
            }, 100);
        };
        const resizeObserver = new ResizeObserver(applyResize);
        resizeObserver.observe(containerEl);
        // ── Cleanup ─────────────────────────────────────────────────────────────
        return () => {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeObserver.disconnect();
            keyboard.onkeydown = null;
            keyboard.onkeyup = null;
            try {
                client.disconnect();
            } catch {
                /* ignore */
            }
            clientRef.current = null;
            displayEl.replaceChildren();
        };
    }, [tokenData]);
    // ── Fullscreen toggle ─────────────────────────────────────────────────────
    const toggleFullscreen = useCallback(async () => {
        if (!containerRef.current) return;
        if (document.fullscreenElement) {
            await document.exitFullscreen();
        } else {
            await containerRef.current.requestFullscreen();
        }
        // State is synced via the 'fullscreenchange' listener above.
    }, []);
    // ─── Render ───────────────────────────────────────────────────────────────
    if (!isActive) {
        return <WaitingForSession vmIpAddress={vmIpAddress} />;
    }
    if (loading) {
        return <LoadingSkeleton />;
    }
    // Show the fatal error state only when we have no live connection to fall back on.
    if ((error || connectionError) && !tokenData) {
        return (
            <ErrorState
                message={
                    error ??
                    connectionError ??
                    'Could not load the remote desktop viewer.'
                }
                onRetry={refresh}
            />
        );
    }
    const isConnected = connectionState === GuacState.CONNECTED;
    return (
        <div
            ref={containerRef}
            className="flex flex-col gap-2 rounded-lg bg-background"
        >
            {/* Toolbar */}
            <Toolbar
                protocol={protocol}
                vmIpAddress={vmIpAddress}
                connectionState={connectionState}
                isFullscreen={isFullscreen}
                onReconnect={refresh}
                onToggleFullscreen={toggleFullscreen}
            />
            {/* Inline connection error — only shown when not currently connected */}
            {connectionError && !isConnected && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{connectionError}</AlertDescription>
                </Alert>
            )}
            {/* Guacamole canvas mount point */}
            <div
                ref={displayRef}
                className={[
                    'w-full overflow-hidden bg-black',
                    isFullscreen
                        ? 'fixed inset-0 rounded-none border-0' // true fullscreen: cover entire viewport
                        : 'aspect-video rounded-lg border', // normal: 16:9 ratio
                ].join(' ')}
                style={{ cursor: isConnected ? 'none' : 'default' }}
            />
        </div>
    );
}
