/**
 * SessionCountdown — Live HH:MM:SS countdown timer.
 * Sprint 3 — US-13
 *
 * - Updates every second via `setInterval`.
 * - Turns amber when ≤ 10 min remain, red when ≤ 5 min.
 * - Cleans up interval on unmount.
 */

import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface SessionCountdownProps {
  /** ISO-8601 expiry timestamp. */
  expiresAt: string;
  /** Optional CSS class for the outer wrapper. */
  className?: string;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatRemaining(totalSeconds: number): string {
  if (totalSeconds <= 0) return '00:00:00';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function SessionCountdown({ expiresAt, className }: SessionCountdownProps) {
  const [remaining, setRemaining] = useState<number>(() =>
    Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)),
  );

  useEffect(() => {
    const expiresMs = new Date(expiresAt).getTime();

    const id = setInterval(() => {
      const diff = Math.max(0, Math.floor((expiresMs - Date.now()) / 1000));
      setRemaining(diff);

      if (diff <= 0) {
        clearInterval(id);
      }
    }, 1_000);

    return () => clearInterval(id);
  }, [expiresAt]);

  const isAmber = remaining > 0 && remaining <= 600;  // ≤ 10 min
  const isRed = remaining > 0 && remaining <= 300;    // ≤ 5 min
  const isExpired = remaining <= 0;

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-mono tabular-nums transition-colors',
        isExpired && 'bg-destructive/10 text-destructive',
        isRed && !isExpired && 'bg-red-500/10 text-red-600 dark:text-red-400',
        isAmber && !isRed && !isExpired && 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        !isAmber && !isExpired && 'bg-muted text-foreground',
        className,
      )}
    >
      <Clock className="h-4 w-4 shrink-0" />
      <span>{isExpired ? 'Expired' : formatRemaining(remaining)}</span>
    </div>
  );
}
