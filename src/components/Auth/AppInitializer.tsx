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
        <div className="text-cyan-400 text-lg">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
