/**
 * Hook for managing Guacamole connection profiles per protocol.
 */

import { useCallback, useEffect, useState } from 'react';
import { connectionPreferencesApi } from '@/api/vm.api';
import type { ConnectionProfile } from '@/types/vm.types';

interface ProfilesState {
  rdp: ConnectionProfile[];
  vnc: ConnectionProfile[];
  ssh: ConnectionProfile[];
}

interface UseConnectionPreferencesResult {
  profiles: ProfilesState;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  savePreferences: (protocol: string, params: Record<string, string | boolean | number>) => Promise<void>;
  hasProfilesForProtocol: (protocol: string) => boolean;
}

export function useConnectionPreferences(): UseConnectionPreferencesResult {
  const [profiles, setProfiles] = useState<ProfilesState>({ rdp: [], vnc: [], ssh: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await connectionPreferencesApi.getAll();
      setProfiles(data ?? { rdp: [], vnc: [], ssh: [] });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load connection profiles';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const savePreferences = useCallback(async (protocol: string, params: Record<string, string | boolean | number>) => {
    try {
      await connectionPreferencesApi.save(protocol, params);
      await fetchProfiles();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to save connection preferences';
      throw new Error(message);
    }
  }, [fetchProfiles]);

  const hasProfilesForProtocol = useCallback((protocol: string) => {
    const protocolProfiles = profiles[protocol as keyof ProfilesState];
    return protocolProfiles && protocolProfiles.length > 0;
  }, [profiles]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return { profiles, loading, error, refetch: fetchProfiles, savePreferences, hasProfilesForProtocol };
}
