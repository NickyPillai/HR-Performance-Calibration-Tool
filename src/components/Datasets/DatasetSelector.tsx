import { useDatasetStore } from '../../store/useDatasetStore';
import { useEmployeeStore } from '../../store/useEmployeeStore';
import { useThemeStore } from '../../store/useThemeStore';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export function DatasetSelector() {
  const savedDatasets = useDatasetStore((s) => s.savedDatasets);
  const activeDatasetId = useDatasetStore((s) => s.activeDatasetId);
  const activeDatasetName = useDatasetStore((s) => s.activeDatasetName);
  const loadDataset = useDatasetStore((s) => s.loadDataset);
  const deleteDataset = useDatasetStore((s) => s.deleteDataset);
  const isLoading = useDatasetStore((s) => s.isLoading);
  const employees = useEmployeeStore((s) => s.employees);
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  const handleSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) return;

    const id = Number(value);
    if (employees.length > 0 && !activeDatasetName) {
      if (!confirm('Loading a dataset will replace your current unsaved data. Continue?')) {
        e.target.value = activeDatasetId ? String(activeDatasetId) : '';
        return;
      }
    }

    try {
      await loadDataset(id);
      toast.success('Dataset loaded successfully');
    } catch {
      toast.error('Failed to load dataset');
    }
  };

  const handleDelete = async () => {
    if (!activeDatasetId) return;

    const dataset = savedDatasets.find((d) => d.id === activeDatasetId);
    if (!dataset) return;

    if (!confirm(`Delete dataset "${dataset.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteDataset(activeDatasetId);
      toast.success('Dataset deleted');
    } catch {
      toast.error('Failed to delete dataset');
    }
  };

  if (savedDatasets.length === 0) {
    return null;
  }

  return (
    <div className={clsx(
      'rounded-lg shadow-lg border p-4',
      isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
    )}>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className={clsx('text-sm font-semibold', isDark ? 'text-cyan-400' : 'text-cyan-700')}>
          Load Saved Dataset
        </h2>

        <div className="relative">
          <select
            value={activeDatasetId ? String(activeDatasetId) : ''}
            onChange={handleSelect}
            disabled={isLoading}
            className={clsx(
              'px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 min-w-[200px]',
              isDark
                ? 'bg-slate-700 border-slate-600 text-slate-100'
                : 'bg-gray-50 border-gray-300 text-gray-900',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            <option value="">-- Select a dataset --</option>
            {savedDatasets.map((ds) => (
              <option key={ds.id} value={ds.id}>
                {ds.name} ({new Date(ds.created_at).toLocaleDateString()})
              </option>
            ))}
          </select>
          {isLoading && (
            <div className="absolute inset-y-0 right-8 flex items-center">
              <svg className="animate-spin h-4 w-4 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          )}
        </div>

        <button
          onClick={handleDelete}
          disabled={!activeDatasetId || isLoading}
          className={clsx(
            'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors border',
            activeDatasetId && !isLoading
              ? 'bg-red-600 hover:bg-red-700 text-white border-red-500'
              : isDark
                ? 'bg-slate-700 text-slate-500 border-slate-600 cursor-not-allowed'
                : 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
          )}
        >
          Delete
        </button>

        {activeDatasetName && (
          <span className={clsx(
            'text-xs px-2 py-1 rounded-full font-medium truncate max-w-[200px]',
            isDark ? 'bg-cyan-900/40 text-cyan-300 border border-cyan-700' : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
          )}>
            Active: {activeDatasetName}
          </span>
        )}

        {isLoading && (
          <span className={clsx('text-xs font-medium', isDark ? 'text-cyan-300' : 'text-cyan-600')}>
            Loading dataset...
          </span>
        )}
      </div>
    </div>
  );
}
