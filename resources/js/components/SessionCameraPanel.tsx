/**
 * SessionCameraPanel — Camera list + viewer + PTZ controls for the session page.
 * Sprint 4 — Camera streaming & PTZ control
 *
 * Layout:
 *  ┌──────────────────────────────────────────────────────────────────────┐
 *  │ Camera List (sidebar cards) │  Camera Feed (viewer + PTZ controls)  │
 *  │                             │                                        │
 *  │  [Alpha Overview]  ●       │  ┌──────────────────────────┐         │
 *  │  [Alpha Gripper]           │  │     Video Player         │         │
 *  │  [Beta Front Cam]  ●       │  │                          │         │
 *  │  ...                       │  └──────────────────────────┘         │
 *  │                             │                                        │
 *  │                             │  [Take Control] or [PTZ↑↓←→]         │
 *  └──────────────────────────────────────────────────────────────────────┘
 */
import { motion } from 'framer-motion';
import {
    Camera as CameraIcon,
    Eye,
    Gamepad2,
    Loader2,
    Lock,
    Unlock,
    Video,
    AlertCircle,
} from 'lucide-react';
import { CameraStatusBadge } from '@/components/CameraStatusBadge';
import { CameraViewer } from '@/components/CameraViewer';
import { PTZControls } from '@/components/PTZControls';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useSessionCameras } from '@/hooks/useSessionCameras';
import type {
    Camera,
    CameraPTZDirection,
    CameraResolutionPreset,
} from '@/types/camera.types';
interface SessionCameraPanelProps {
    sessionId: string;
    isActive: boolean;
}
export function SessionCameraPanel({
    sessionId,
    isActive,
}: SessionCameraPanelProps) {
    const {
        cameras,
        loading,
        error,
        controlledCamera,
        selectedCamera,
        selectCamera,
        acquireControl,
        releaseControl,
        move,
        refetch: _refetch,
        resolutions,
        changeResolution,
        changingResolution,
    } = useSessionCameras(sessionId);
    if (loading) {
        return (
            <Card className="shadow-card">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <CameraIcon className="h-4 w-4 text-info" />
                        <CardTitle className="font-heading">Cameras</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">
                            Loading cameras…
                        </span>
                    </div>
                </CardContent>
            </Card>
        );
    }
    if (error) {
        return (
            <Card className="shadow-card">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <CameraIcon className="h-4 w-4 text-info" />
                        <CardTitle className="font-heading">Cameras</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }
    if (cameras.length === 0) {
        return (
            <Card className="shadow-card">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <CameraIcon className="h-4 w-4 text-info" />
                        <CardTitle className="font-heading">Cameras</CardTitle>
                    </div>
                    <CardDescription>No cameras available</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        No robot cameras are configured. Contact your
                        administrator.
                    </p>
                </CardContent>
            </Card>
        );
    }
    const handleAcquireControl = async (cameraId: number) => {
        try {
            await acquireControl(cameraId);
        } catch {
            // Error is set in the hook
        }
    };
    const handleReleaseControl = async (cameraId: number) => {
        try {
            await releaseControl(cameraId);
        } catch {
            // Error is set in the hook
        }
    };
    const handleMove = async (direction: CameraPTZDirection) => {
        if (!controlledCamera) return;
        try {
            await move(controlledCamera.id, direction);
        } catch {
            // Error is set in the hook
        }
    };
    const handleResolutionChange = async (
        preset: CameraResolutionPreset | 'auto',
    ) => {
        if (!selectedCamera) return;
        try {
            await changeResolution(selectedCamera.id, preset);
        } catch {
            // Error is set in the hook
        }
    };
    const isControlledByMe = (camera: Camera) =>
        camera.control?.session_id === sessionId;
    const isControlledByOther = (camera: Camera) =>
        camera.is_controlled && !isControlledByMe(camera);
    return (
        <Card className="shadow-card">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CameraIcon className="h-4 w-4 text-info" />
                        <CardTitle className="font-heading">Cameras</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs">
                        {cameras.filter((c) => c.status === 'active').length} /{' '}
                        {cameras.length} online
                    </Badge>
                </div>
                <CardDescription>
                    Click a camera to view its stream. PTZ-capable cameras can
                    be controlled exclusively.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* ── Camera List ── */}
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {cameras.map((camera) => (
                        <CameraCard
                            key={camera.id}
                            camera={camera}
                            isSelected={selectedCamera?.id === camera.id}
                            isControlledByMe={isControlledByMe(camera)}
                            isControlledByOther={isControlledByOther(camera)}
                            isActive={isActive}
                            onSelect={() =>
                                selectCamera(
                                    selectedCamera?.id === camera.id
                                        ? null
                                        : camera,
                                )
                            }
                            onAcquireControl={() =>
                                handleAcquireControl(camera.id)
                            }
                            onReleaseControl={() =>
                                handleReleaseControl(camera.id)
                            }
                        />
                    ))}
                </div>
                {/* ── Camera Feed Panel (shown when a camera is selected) ── */}
                {selectedCamera && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">
                                <Video className="mr-1 inline h-4 w-4 text-info" />
                                {selectedCamera.name}
                                <span className="ml-2 text-xs text-muted-foreground">
                                    ({selectedCamera.robot_name})
                                </span>
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => selectCamera(null)}
                                className="text-xs"
                            >
                                Close
                            </Button>
                        </div>
                        {/* Video + PTZ side by side */}
                        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                            {/* Stream viewer */}
                            <CameraViewer
                                camera={selectedCamera}
                                sessionId={sessionId}
                                resolutions={resolutions}
                                onResolutionChange={handleResolutionChange}
                                changingResolution={changingResolution}
                            />
                            {/* PTZ Controls — only shown if user controls this camera */}
                            {isControlledByMe(selectedCamera) &&
                                selectedCamera.ptz_capable && (
                                    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border p-4">
                                        <p className="text-xs font-medium text-muted-foreground">
                                            <Gamepad2 className="mr-1 inline h-3 w-3" />
                                            PTZ Control
                                        </p>
                                        <PTZControls
                                            onMove={handleMove}
                                            disabled={!isActive}
                                        />
                                    </div>
                                )}
                        </div>
                    </motion.div>
                )}
            </CardContent>
        </Card>
    );
}
// ── Camera Card sub-component ──
interface CameraCardProps {
    camera: Camera;
    isSelected: boolean;
    isControlledByMe: boolean;
    isControlledByOther: boolean;
    isActive: boolean;
    onSelect: () => void;
    onAcquireControl: () => void;
    onReleaseControl: () => void;
}
function CameraCard({
    camera,
    isSelected,
    isControlledByMe,
    isControlledByOther,
    isActive,
    onSelect,
    onAcquireControl,
    onReleaseControl,
}: CameraCardProps) {
    return (
        <div
            className={`cursor-pointer rounded-lg border p-3 transition-all ${
                isSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                    : 'border-border hover:border-muted-foreground/40 hover:bg-muted/30'
            } `}
            onClick={onSelect}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter') onSelect();
            }}
        >
            {/* Top row: name + status */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CameraIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="truncate text-sm font-medium">
                        {camera.name}
                    </span>
                </div>
                <CameraStatusBadge
                    status={camera.status}
                    label={camera.status_label}
                />
            </div>
            {/* Robot name + type */}
            <p className="mt-1 truncate text-xs text-muted-foreground">
                {camera.robot_name} · {camera.type_label}
            </p>
            {/* Control state + actions */}
            <div className="mt-2 flex items-center justify-between">
                {/* PTZ indicator */}
                {camera.ptz_capable ? (
                    <Badge
                        variant="outline"
                        className="px-1.5 py-0 text-[10px]"
                    >
                        <Gamepad2 className="mr-0.5 h-2.5 w-2.5" />
                        PTZ
                    </Badge>
                ) : (
                    <Badge
                        variant="outline"
                        className="px-1.5 py-0 text-[10px] text-muted-foreground"
                    >
                        <Eye className="mr-0.5 h-2.5 w-2.5" />
                        View
                    </Badge>
                )}
                {/* Control button */}
                {camera.ptz_capable && isActive && (
                    <div onClick={(e) => e.stopPropagation()}>
                        {isControlledByMe ? (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-6 border-destructive/30 text-[10px] text-destructive hover:bg-destructive/10"
                                onClick={onReleaseControl}
                            >
                                <Unlock className="mr-0.5 h-2.5 w-2.5" />
                                Release
                            </Button>
                        ) : isControlledByOther ? (
                            <Badge
                                variant="outline"
                                className="border-warning/30 px-1.5 py-0 text-[10px] text-warning"
                            >
                                <Lock className="mr-0.5 h-2.5 w-2.5" />
                                In Use
                            </Badge>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-6 border-primary/30 text-[10px] text-primary hover:bg-primary/10"
                                onClick={onAcquireControl}
                            >
                                <Gamepad2 className="mr-0.5 h-2.5 w-2.5" />
                                Control
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}


