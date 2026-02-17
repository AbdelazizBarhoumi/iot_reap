import { create } from 'zustand';
import type { User } from '../types/auth';

type AuthState = {
  user: User | null;
  setUser: (user: User | null) => void;
  clear: () => void;
  isAuthenticated: () => boolean;
};

// NOTE: intentionally NOT persisted — in-memory only (no localStorage)
// Session-based auth uses cookies; this store is for UI state only
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  setUser: (user) => set(() => ({ user })),
  clear: () => set(() => ({ user: null })),
  isAuthenticated: () => !!get().user,
}));
