/**
 * CameraStatusBadge — shows camera status with color-coded badge.
 * Sprint 4 — Camera streaming
 */

import { Badge } from '@/components/ui/badge';
import type { CameraStatus } from '@/types/camera.types';

interface CameraStatusBadgeProps {
  status: CameraStatus;
  label: string;
}

const STATUS_STYLES: Record<CameraStatus, string> = {
  active: 'bg-success/10 text-success border-success/30',
  inactive: 'bg-muted text-muted-foreground',
  error: 'bg-destructive/10 text-destructive border-destructive/30',
};

export function CameraStatusBadge({ status, label }: CameraStatusBadgeProps) {
  return (
    <Badge variant="outline" className={`${STATUS_STYLES[status]} text-xs`}>
      {label}
    </Badge>
  );
}
