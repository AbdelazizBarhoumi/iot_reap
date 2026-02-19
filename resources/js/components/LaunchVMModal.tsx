/**
 * Launch VM Modal component.
 * Allows user to configure and launch a VM session.
 * Sprint 2 - Phase 2
 */

import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { VMTemplate, VMSessionType } from '../types/vm.types';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface LaunchVMModalProps {
  template: VMTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLaunch: (templateId: number, durationMinutes: number, sessionType: VMSessionType) => Promise<void>;
}

const DURATION_OPTIONS = [
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 240, label: '4 hours' },
];

export function LaunchVMModal({ template, open, onOpenChange, onLaunch }: LaunchVMModalProps) {
  const [duration, setDuration] = useState<number>(60);
  const [sessionType, setSessionType] = useState<VMSessionType>('ephemeral');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLaunch = async () => {
    if (!template) return;

    setLoading(true);
    setError(null);

    try {
      await onLaunch(template.id, duration, sessionType);
      onOpenChange(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to launch VM';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      setError(null);
      onOpenChange(newOpen);
    }
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Launch {template.name}</DialogTitle>
          <DialogDescription>
            Configure your VM session. The VM will be provisioned based on the selected template.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="duration">Session Duration</Label>
            <Select
              value={duration.toString()}
              onValueChange={(value) => setDuration(Number(value))}
              disabled={loading}
            >
              <SelectTrigger id="duration">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="session-type">Session Type</Label>
            <Select
              value={sessionType}
              onValueChange={(value) => setSessionType(value as VMSessionType)}
              disabled={loading}
            >
              <SelectTrigger id="session-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ephemeral">
                  Ephemeral (auto-delete after expiry)
                </SelectItem>
                <SelectItem value="persistent">
                  Persistent (manual cleanup required)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted p-3 rounded-md text-sm">
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <span>OS:</span>
              <span className="font-medium text-foreground capitalize">{template.os_type}</span>
              <span>Protocol:</span>
              <span className="font-medium text-foreground uppercase">{template.protocol}</span>
              <span>Resources:</span>
              <span className="font-medium text-foreground">
                {template.cpu_cores} CPU, {template.ram_mb / 1024}GB RAM
              </span>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleLaunch} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Launching...' : 'Launch VM'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
