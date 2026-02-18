import { useState } from 'react';
import { useDatasetStore } from '../../store/useDatasetStore';
import { useEmployeeStore } from '../../store/useEmployeeStore';
import { useThemeStore } from '../../store/useThemeStore';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function SaveDatasetModal({ isOpen, onClose }: Props) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const savedDatasets = useDatasetStore((s) => s.savedDatasets);
  const saveDataset = useDatasetStore((s) => s.saveDataset);
  const isSaving = useDatasetStore((s) => s.isSaving);
  const employees = useEmployeeStore((s) => s.employees);
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const validate = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) return 'Dataset name is required';
    if (trimmed.length > 100) return 'Name must be 100 characters or less';
    if (savedDatasets.some((d) => d.name.toLowerCase() === trimmed.toLowerCase())) {
      return 'A dataset with that name already exists';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (employees.length === 0) {
      setError('No employees to save. Import data first.');
      return;
    }

    const validationError = validate(name);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await saveDataset(name.trim());
      toast.success(`Dataset "${name.trim()}" saved successfully`);
      setName('');
      setError('');
      onClose();
    } catch (err: any) {
      const msg = err?.message || 'Failed to save dataset';
      if (msg.includes('already exists')) {
        setError('A dataset with that name already exists');
      } else {
        setError(msg);
      }
    }
  };

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className={clsx(
        'relative rounded-lg shadow-xl border p-6 w-full max-w-md',
        isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200'
      )}>
        <h3 className={clsx('text-lg font-semibold mb-4', isDark ? 'text-cyan-400' : 'text-cyan-700')}>
          Save Dataset
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className={clsx('block text-sm font-medium mb-1', isDark ? 'text-slate-300' : 'text-gray-700')}>
              Dataset Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="e.g., Q3 2025 Calibration"
              maxLength={100}
              autoFocus
              className={clsx(
                'w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500',
                isDark
                  ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400',
                error && 'border-red-500 focus:ring-red-500'
              )}
            />
            {error && (
              <p className="mt-1 text-xs text-red-400">{error}</p>
            )}
            <p className={clsx('mt-1 text-xs', isDark ? 'text-slate-400' : 'text-gray-500')}>
              {name.length}/100 characters
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className={clsx(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors border',
                isDark
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className={clsx(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors border',
                isSaving || !name.trim()
                  ? 'bg-cyan-800 text-cyan-500 border-cyan-700 cursor-not-allowed'
                  : 'bg-cyan-600 hover:bg-cyan-700 text-white border-cyan-500'
              )}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
