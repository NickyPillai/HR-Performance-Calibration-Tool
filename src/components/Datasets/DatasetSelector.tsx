import { useState } from 'react';
import { useDatasetStore } from '../../store/useDatasetStore';
import { useEmployeeStore } from '../../store/useEmployeeStore';
import { useThemeStore } from '../../store/useThemeStore';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export function DatasetSelector() {
  const savedDatasets = useDatasetStore((s) => s.savedDatasets);
  const activeDatasetName = useDatasetStore((s) => s.activeDatasetName);
  const loadDataset = useDatasetStore((s) => s.loadDataset);
  const deleteDataset = useDatasetStore((s) => s.deleteDataset);
  const isLoading = useDatasetStore((s) => s.isLoading);
  const employees = useEmployeeStore((s) => s.employees);
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  const [selectedId, setSelectedId] = useState<string>('');

  const handleLoad = async () => {
    if (!selectedId) return;

    const id = Number(selectedId);
    if (employees.length > 0 && !activeDatasetName) {
      if (!confirm('Loading a dataset will replace your current unsaved data. Continue?')) {
        return;
      }
    }

    try {
      await loadDataset(id);
      setSelectedId('');
      toast.success('Dataset loaded successfully');
    } catch {
      toast.error('Failed to load dataset');
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    const dataset = savedDatasets.find((d) => d.id === Number(selectedId));
    if (!dataset) return;

    if (!confirm(`Delete dataset "${dataset.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteDataset(Number(selectedId));
      setSelectedId('');
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

        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className={clsx(
            'px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 min-w-[200px]',
            isDark
              ? 'bg-slate-700 border-slate-600 text-slate-100'
              : 'bg-gray-50 border-gray-300 text-gray-900'
          )}
        >
          <option value="">-- Select a dataset --</option>
          {savedDatasets.map((ds) => (
            <option key={ds.id} value={ds.id}>
              {ds.name} ({new Date(ds.created_at).toLocaleDateString()})
            </option>
          ))}
        </select>

        <button
          onClick={handleLoad}
          disabled={!selectedId || isLoading}
          className={clsx(
            'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors border',
            selectedId && !isLoading
              ? 'bg-cyan-600 hover:bg-cyan-700 text-white border-cyan-500'
              : isDark
                ? 'bg-slate-700 text-slate-500 border-slate-600 cursor-not-allowed'
                : 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
          )}
        >
          {isLoading ? 'Loading...' : 'Load'}
        </button>

        <button
          onClick={handleDelete}
          disabled={!selectedId}
          className={clsx(
            'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors border',
            selectedId
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
      </div>
    </div>
  );
}
