import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../lib/api/client';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  validateToken: () => Promise<boolean>;
}

// Eagerly sync persisted token to API client on module load
try {
  const stored = localStorage.getItem('hr-calibration-auth');
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed?.state?.token) {
      apiClient.setToken(parsed.state.token);
    }
  }
} catch {
  // Ignore parse errors
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (username, password) => {
        set({ isLoading: true });
        try {
          const { token, user } = await apiClient.login(username, password);
          apiClient.setToken(token);
          set({ token, user: user as User, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (username, password) => {
        set({ isLoading: true });
        try {
          const { token, user } = await apiClient.register(username, password);
          apiClient.setToken(token);
          set({ token, user: user as User, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        apiClient.setToken(null);
        set({ token: null, user: null, isAuthenticated: false });
      },

      validateToken: async () => {
        const { token } = get();
        if (!token) return false;

        apiClient.setToken(token);
        try {
          const { user } = await apiClient.getMe();
          set({ user: user as User, isAuthenticated: true });
          return true;
        } catch {
          set({ token: null, user: null, isAuthenticated: false });
          return false;
        }
      },
    }),
    {
      name: 'hr-calibration-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
