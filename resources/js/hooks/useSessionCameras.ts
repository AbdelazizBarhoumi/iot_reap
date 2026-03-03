/**
 * useSessionCameras — fetches and manages cameras for a VM session.
 * Sprint 4 — Camera streaming & PTZ control
 *
 * Provides:
 *  - cameras list with control state
 *  - acquire/release control
 *  - PTZ move commands
 *  - auto-refresh on control changes
 */

import { useCallback, useEffect, useState } from 'react';
import { cameraApi } from '@/api/camera.api';
import type { Camera, CameraPTZDirection } from '@/types/camera.types';

interface UseSessionCamerasReturn {
  cameras: Camera[];
  loading: boolean;
  error: string | null;
  /** The camera currently controlled by this session (if any). */
  controlledCamera: Camera | null;
  /** The camera the user selected to view in the feed panel. */
  selectedCamera: Camera | null;
  selectCamera: (camera: Camera | null) => void;
  acquireControl: (cameraId: number) => Promise<void>;
  releaseControl: (cameraId: number) => Promise<void>;
  move: (cameraId: number, direction: CameraPTZDirection) => Promise<void>;
  refetch: () => void;
}

export function useSessionCameras(sessionId: string | undefined): UseSessionCamerasReturn {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);

  const fetchCameras = useCallback(async () => {
    if (!sessionId) return;
    try {
      const data = await cameraApi.list(sessionId);
      setCameras(data);
      setError(null);

      // Update the selected camera with fresh data
      if (selectedCamera) {
        const updated = data.find(c => c.id === selectedCamera.id);
        if (updated) {
          setSelectedCamera(updated);
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load cameras';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [sessionId, selectedCamera?.id]);

  useEffect(() => {
    fetchCameras();
  }, [sessionId]);

  // The camera THIS session currently controls
  const controlledCamera = cameras.find(c =>
    c.control?.session_id === sessionId,
  ) ?? null;

  const acquireControl = useCallback(async (cameraId: number) => {
    if (!sessionId) return;
    try {
      await cameraApi.acquireControl(sessionId, cameraId);
      await fetchCameras();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to acquire control';
      setError(msg);
      throw e;
    }
  }, [sessionId, fetchCameras]);

  const releaseControl = useCallback(async (cameraId: number) => {
    if (!sessionId) return;
    try {
      await cameraApi.releaseControl(sessionId, cameraId);
      await fetchCameras();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to release control';
      setError(msg);
      throw e;
    }
  }, [sessionId, fetchCameras]);

  const move = useCallback(async (cameraId: number, direction: CameraPTZDirection) => {
    if (!sessionId) return;
    try {
      await cameraApi.move(sessionId, cameraId, direction);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to move camera';
      setError(msg);
      throw e;
    }
  }, [sessionId]);

  const selectCamera = useCallback((camera: Camera | null) => {
    setSelectedCamera(camera);
  }, []);

  return {
    cameras,
    loading,
    error,
    controlledCamera,
    selectedCamera,
    selectCamera,
    acquireControl,
    releaseControl,
    move,
    refetch: fetchCameras,
  };
}
