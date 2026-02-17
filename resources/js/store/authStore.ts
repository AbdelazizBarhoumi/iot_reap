import create from 'zustand';
import type { User } from '../types/auth';

type AuthState = {
  token: string | null;
  user: User | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  clear: () => void;
  isAuthenticated: () => boolean;
};

// NOTE: intentionally NOT persisted — in-memory only (no localStorage)
export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  setToken: (token) => set(() => ({ token })),
  setUser: (user) => set(() => ({ user })),
  clear: () => set(() => ({ token: null, user: null })),
  isAuthenticated: () => !!get().token || !!get().user,
}));
