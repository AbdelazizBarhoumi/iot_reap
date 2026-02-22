/**
 * TerminateSessionButton — Confirmation dialog before terminating a VM session.
 * Sprint 3 — US-13
 *
 * When the dialog opens, available VM snapshots are fetched. The user can
 * optionally select a snapshot to revert to before the VM is stopped/deleted.
 *
 * Calls DELETE /api/sessions/{id} with optional `stop_vm` and
 * `return_snapshot` flags.
 */

import { Loader2, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { vmSessionApi } from '@/api/vm.api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { VMSnapshot } from '@/types/vm.types';

interface TerminateSessionButtonProps {
  /** VM session UUID. */
  sessionId: string;
  /** Called after successful termination. */
  onTerminated: () => void;
  /** Disable the button (e.g. session already terminated). */
  disabled?: boolean;
}

export function TerminateSessionButton({
  sessionId,
  onTerminated,
  disabled = false,
}: TerminateSessionButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Snapshot state
  const [snapshots, setSnapshots] = useState<VMSnapshot[]>([]);
  const [snapshotsLoading, setSnapshotsLoading] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<string>('');

  // Fetch snapshots when dialog opens
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function fetchSnapshots() {
      setSnapshotsLoading(true);
      try {
        const data = await vmSessionApi.listSnapshots(sessionId);
        if (!cancelled) {
          setSnapshots(data);
        }
      } catch {
        // Non-critical — just means no snapshot options shown
        if (!cancelled) {
          setSnapshots([]);
        }
      } finally {
        if (!cancelled) {
          setSnapshotsLoading(false);
        }
      }
    }

    fetchSnapshots();

    return () => {
      cancelled = true;
    };
  }, [open, sessionId]);

  const handleTerminate = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await vmSessionApi.terminate(sessionId, {
        stop_vm: true,
        return_snapshot: selectedSnapshot || null,
      });
      setOpen(false);
      onTerminated();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to terminate session.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [sessionId, onTerminated, selectedSnapshot]);

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        disabled={disabled}
        onClick={() => {
          setError(null);
          setSelectedSnapshot('');
          setOpen(true);
        }}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Terminate
      </Button>

      <Dialog open={open} onOpenChange={(v) => !loading && setOpen(v)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminate Session?</DialogTitle>
            <DialogDescription>
              This will immediately end your remote desktop connection, stop the VM,
              and clean up all resources. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {/* Snapshot selector */}
          {snapshotsLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading snapshots…
            </div>
          )}

          {!snapshotsLoading && snapshots.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="snapshot-select">
                Revert to snapshot before stopping
              </Label>
              <Select value={selectedSnapshot} onValueChange={setSelectedSnapshot}>
                <SelectTrigger id="snapshot-select">
                  <SelectValue placeholder="No rollback (keep current state)" />
                </SelectTrigger>
                <SelectContent>
                  {snapshots.map((snap) => (
                    <SelectItem key={snap.name} value={snap.name}>
                      {snap.name}
                      {snap.description ? ` — ${snap.description}` : ''}
                      {snap.snaptime
                        ? ` (${new Date(snap.snaptime * 1000).toLocaleDateString()})`
                        : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                If selected, the VM will be rolled back to this snapshot before being stopped.
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleTerminate} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Terminating…' : 'Terminate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
