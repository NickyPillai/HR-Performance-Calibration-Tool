import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FileUploader } from './components/DataImport/FileUploader';
import { PercentageSplit } from './components/PercentageManager/PercentageSplit';
import { BellCurveChart } from './components/BellCurve/BellCurveChart';
import { DistributionStats } from './components/BellCurve/DistributionStats';
import { EmployeeTable } from './components/EmployeeTable/EmployeeTable';
import { DatasetSelector } from './components/Datasets/DatasetSelector';
import { SaveDatasetModal } from './components/Datasets/SaveDatasetModal';
import { useEmployeeStore } from './store/useEmployeeStore';
import { usePercentageStore } from './store/usePercentageStore';
import { useThemeStore } from './store/useThemeStore';
import { useAuthStore } from './store/useAuthStore';
import { useDatasetStore } from './store/useDatasetStore';
import { downloadSampleTemplate } from './lib/generators/templateGenerator';
import clsx from 'clsx';

function App() {
  const clearAll = useEmployeeStore((state) => state.clearAll);
  const employees = useEmployeeStore((state) => state.employees);
  const resetToDefault = usePercentageStore((state) => state.resetToDefault);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const activeDatasetName = useDatasetStore((s) => s.activeDatasetName);
  const setActiveDatasetName = useDatasetStore((s) => s.setActiveDatasetName);
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [showSaveModal, setShowSaveModal] = useState(false);

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      clearAll();
      resetToDefault();
      setActiveDatasetName(null);
      toast.success('All data has been reset!');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={clsx('min-h-screen transition-colors', isDark ? 'bg-slate-900' : 'bg-gray-100')}>
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
              {/* User info */}
              <span className={clsx('text-sm font-medium', isDark ? 'text-slate-300' : 'text-gray-600')}>
                {user?.username}
                {user?.role === 'admin' && (
                  <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded bg-amber-600 text-white">Admin</span>
                )}
              </span>

              {/* Active dataset badge */}
              {activeDatasetName && (
                <span className={clsx(
                  'text-xs px-2 py-1 rounded-full font-medium truncate max-w-[160px]',
                  isDark ? 'bg-cyan-900/40 text-cyan-300 border border-cyan-700' : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                )}>
                  {activeDatasetName}
                </span>
              )}

              {/* Admin Panel Link */}
              {user?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className={clsx(
                    'px-3 py-2 rounded-lg transition-colors border text-sm font-medium',
                    isDark
                      ? 'bg-slate-700 hover:bg-slate-600 text-amber-300 border-slate-600'
                      : 'bg-gray-100 hover:bg-gray-200 text-amber-700 border-gray-300'
                  )}
                >
                  Admin Panel
                </button>
              )}

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

              {/* Logout */}
              <button
                onClick={handleLogout}
                className={clsx(
                  'px-3 py-2 rounded-lg transition-colors border text-sm font-medium',
                  isDark
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
                )}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="space-y-4">
          {/* Dataset Selector - above import section */}
          <section>
            <DatasetSelector />
          </section>

          {/* File Uploader and Target Distribution Side by Side */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className={clsx('text-lg font-semibold', isDark ? 'text-cyan-400' : 'text-cyan-700')}>
                  Import Employee Data
                </h2>
                <button
                  onClick={downloadSampleTemplate}
                  className={clsx(
                    'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors border flex items-center gap-2',
                    isDark
                      ? 'bg-slate-700 hover:bg-slate-600 text-cyan-300 border-slate-600'
                      : 'bg-gray-100 hover:bg-gray-200 text-cyan-700 border-gray-300'
                  )}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Sample Template
                </button>
              </div>
              <FileUploader />
            </div>
            <div>
              <PercentageSplit />
            </div>
          </section>

          {/* Visualization Section */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BellCurveChart />
            <DistributionStats />
          </section>

          {/* Employee Table */}
          <section>
            <EmployeeTable />
          </section>

          {/* Save Button */}
          <section className="flex justify-end">
            <button
              onClick={() => setShowSaveModal(true)}
              disabled={employees.length === 0}
              className={clsx(
                'px-6 py-2.5 text-sm font-medium rounded-lg transition-colors shadow-lg flex items-center gap-2',
                employees.length > 0
                  ? 'bg-cyan-600 hover:bg-cyan-700 text-white border border-cyan-500'
                  : isDark
                    ? 'bg-slate-700 text-slate-500 border border-slate-600 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed'
              )}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Dataset
            </button>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className={clsx(
        'border-t mt-6',
        isDark ? 'bg-slate-800 border-cyan-500' : 'bg-white border-cyan-600'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className={clsx('text-center text-sm', isDark ? 'text-slate-400' : 'text-gray-500')}>
            HR Performance Calibration Tool - Built with React, TypeScript, and Tailwind CSS
          </p>
        </div>
      </footer>

      {/* Save Dataset Modal */}
      <SaveDatasetModal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)} />
    </div>
  );
}

export default App;
