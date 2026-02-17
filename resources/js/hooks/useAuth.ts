import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clear = useAuthStore((s) => s.clear);

  const logout = useCallback(() => {
    // session cookie will be cleared by backend; clear UI state only
    setUser(null);
    clear();
  }, [setUser, clear]);

  return { user, setUser, logout, clear };
}
