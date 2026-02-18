import { create } from 'zustand';
import { apiClient } from '../lib/api/client';

type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  (set) => ({
    theme: 'dark',
    toggleTheme: () =>
      set((state) => {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        apiClient.updateSettings({ theme: newTheme }).catch(() => {});
        return { theme: newTheme };
      }),
    setTheme: (theme) => set({ theme }),
  })
);
