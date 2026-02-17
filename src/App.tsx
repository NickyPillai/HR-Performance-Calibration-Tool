import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { FileUploader } from './components/DataImport/FileUploader';
import { PercentageSplit } from './components/PercentageManager/PercentageSplit';
import { BellCurveChart } from './components/BellCurve/BellCurveChart';
import { DistributionStats } from './components/BellCurve/DistributionStats';
import { EmployeeTable } from './components/EmployeeTable/EmployeeTable';
import { useEmployeeStore } from './store/useEmployeeStore';
import { usePercentageStore } from './store/usePercentageStore';
import { useThemeStore } from './store/useThemeStore';
import clsx from 'clsx';

function App() {
  const clearAll = useEmployeeStore((state) => state.clearAll);
  const resetToDefault = usePercentageStore((state) => state.resetToDefault);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isDark = theme === 'dark';

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      clearAll();
      resetToDefault();
      toast.success('All data has been reset!');
    }
  };

  return (
    <div className={clsx('min-h-screen transition-colors', isDark ? 'bg-slate-900' : 'bg-gray-100')}>
      <Toaster position="top-right" />

      {/* Header */}
      <header className={clsx(
        'shadow-lg border-b',
        isDark ? 'bg-slate-800 border-cyan-500' : 'bg-white border-cyan-600'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={clsx('text-2xl font-bold', isDark ? 'text-cyan-400' : 'text-cyan-700')}>
                HR Performance Calibration Tool
              </h1>
              <p className={clsx('text-sm mt-1', isDark ? 'text-slate-300' : 'text-gray-600')}>
                Import, adjust and calibrate employee performance ratings
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={clsx(
                  'px-3 py-2 rounded-lg transition-colors border flex items-center gap-2 text-sm font-medium',
                  isDark
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
                )}
                title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
              >
                {isDark ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
                {isDark ? 'Light' : 'Dark'}
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg border border-red-500"
              >
                Reset All Data
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* File Uploader and Target Distribution Side by Side */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className={clsx('text-lg font-semibold mb-3', isDark ? 'text-cyan-400' : 'text-cyan-700')}>
                Import Employee Data
              </h2>
              <FileUploader />
            </div>
            <div>
              <PercentageSplit />
            </div>
          </section>

          {/* Visualization Section */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BellCurveChart />
            <DistributionStats />
          </section>

          {/* Employee Table */}
          <section>
            <EmployeeTable />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className={clsx(
        'border-t mt-12',
        isDark ? 'bg-slate-800 border-cyan-500' : 'bg-white border-cyan-600'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className={clsx('text-center text-sm', isDark ? 'text-slate-400' : 'text-gray-500')}>
            HR Performance Calibration Tool - Built with React, TypeScript, and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
