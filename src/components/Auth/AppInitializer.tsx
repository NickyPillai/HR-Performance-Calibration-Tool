import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useEmployeeStore } from '../../store/useEmployeeStore';
import { usePercentageStore } from '../../store/usePercentageStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useDatasetStore } from '../../store/useDatasetStore';
import { apiClient } from '../../lib/api/client';

interface Props {
  children: React.ReactNode;
}

export function AppInitializer({ children }: Props) {
  const [isReady, setIsReady] = useState(false);
  const validateToken = useAuthStore((s) => s.validateToken);
  const fetchEmployees = useEmployeeStore((s) => s.fetchEmployees);
  const fetchSettings = usePercentageStore((s) => s.fetchSettings);
  const setTheme = useThemeStore((s) => s.setTheme);
  const fetchDatasets = useDatasetStore((s) => s.fetchDatasets);

  useEffect(() => {
    const init = async () => {
      const valid = await validateToken();
      if (valid) {
        await Promise.all([
          fetchEmployees(),
          fetchSettings(),
          fetchDatasets(),
          apiClient.getSettings().then((settings) => {
            setTheme(settings.theme as 'dark' | 'light');
          }).catch(() => {}),
        ]);
      }
      setIsReady(true);
    };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isReady) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <div className="text-cyan-400 text-lg font-medium">Loading application...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
