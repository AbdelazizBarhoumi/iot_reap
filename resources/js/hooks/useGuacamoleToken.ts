/**
 * Hook for fetching and auto-refreshing Guacamole auth tokens.
 * Sprint 3 — US-12/US-13
 *
 * Fetches a one-time token from the backend, then schedules
 * automatic refresh 30 seconds before expiry so the viewer
 * iframe never goes stale.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { vmSessionApi } from '@/api/vm.api';
import type { GuacamoleTokenResponse } from '@/types/vm.types';

interface UseGuacamoleTokenResult {
  /** The current viewer URL (includes token). Null while loading or on error. */
  viewerUrl: string | null;
  /** Full token response from the backend. */
  tokenData: GuacamoleTokenResponse | null;
  /** True while the initial token is being fetched. */
  loading: boolean;
  /** Error message if fetch failed. */
  error: string | null;
  /** Manually trigger a token refresh (e.g. on retry button click). */
  refresh: () => void;
}

/**
 * Fetches a Guacamole auth token for the given session and
 * automatically refreshes it 30 seconds before expiry.
 *
 * @param sessionId - The VM session UUID.
 * @param enabled   - Set to `false` to disable fetching (e.g. when session is not yet active).
 */
export function useGuacamoleToken(
  sessionId: string,
  enabled = true,
): UseGuacamoleTokenResult {
  const [tokenData, setTokenData] = useState<GuacamoleTokenResponse | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  // Counter to trigger re-fetches (incremented by the user's "refresh" or auto-timer)
  const [fetchCounter, setFetchCounter] = useState(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Manual refresh callback exposed to callers
  const refresh = useCallback(() => {
    setFetchCounter((c) => c + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    async function doFetch() {
      setLoading(true);
      setError(null);

      try {
        const data = await vmSessionApi.getGuacamoleToken(sessionId);
        if (cancelled) return;

        setTokenData(data);
        setLoading(false);

        // Schedule automatic refresh 30 s before expiry (min 5 s)
        const refreshIn = Math.max((data.expires_in - 30) * 1000, 5_000);
        timerRef.current = setTimeout(() => {
          if (!cancelled) {
            setFetchCounter((c) => c + 1);
          }
        }, refreshIn);
      } catch (e) {
        if (cancelled) return;
        const message =
          e instanceof Error ? e.message : 'Failed to fetch Guacamole token';
        setError(message);
        setLoading(false);
      }
    }

    doFetch();

    return () => {
      cancelled = true;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
    // fetchCounter drives re-fetches (manual refresh + auto-timer)
  }, [sessionId, enabled, fetchCounter]);

  const viewerUrl = tokenData?.viewer_url ?? null;

  return { viewerUrl, tokenData, loading, error, refresh };
}
