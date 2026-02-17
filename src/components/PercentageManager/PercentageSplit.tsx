import { usePercentageStore } from '../../store/usePercentageStore';
import { useThemeStore } from '../../store/useThemeStore';
import type { Rating } from '../../types/rating';
import clsx from 'clsx';

export function PercentageSplit() {
  const targetPercentages = usePercentageStore((state) => state.targetPercentages);
  const updateTargetPercentage = usePercentageStore((state) => state.updateTargetPercentage);
  const resetToDefault = usePercentageStore((state) => state.resetToDefault);
  const isValid = usePercentageStore((state) => state.isValid);
  const getSum = usePercentageStore((state) => state.getSum);
  const deviationThreshold = usePercentageStore((state) => state.deviationThreshold);
  const setDeviationThreshold = usePercentageStore((state) => state.setDeviationThreshold);
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const sum = getSum();
  const valid = isValid();

  const handlePercentageChange = (rating: Rating, value: string) => {
    const numValue = parseFloat(value) || 0;
    updateTargetPercentage(rating, numValue);
  };

  const getSumColor = () => {
    if (sum === 100) return 'text-green-600';
    if (sum < 100) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSumIcon = () => {
    if (sum === 100) {
      return (
        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className={clsx(
      'rounded-lg shadow-lg border p-6',
      isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
    )}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={clsx('text-lg font-semibold', isDark ? 'text-cyan-400' : 'text-cyan-700')}>
          Target Distribution
        </h2>
        <button
          onClick={resetToDefault}
          className={clsx(
            'px-3 py-1 text-sm rounded transition-colors border',
            isDark
              ? 'bg-slate-700 hover:bg-slate-600 text-cyan-300 border-slate-600'
              : 'bg-gray-100 hover:bg-gray-200 text-cyan-700 border-gray-300'
          )}
        >
          Reset to Default
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-4">
        {[1, 2, 3, 4, 5].map((rating) => (
          <div key={rating}>
            <label className={clsx(
              'block text-sm font-medium mb-1',
              isDark ? 'text-cyan-300' : 'text-cyan-700'
            )}>
              Rating {rating}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={targetPercentages[`rating${rating}` as keyof typeof targetPercentages]}
                onChange={(e) => handlePercentageChange(rating as Rating, e.target.value)}
                className={clsx(
                  'w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-cyan-500',
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-slate-100'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                )}
              />
              <span className={clsx('absolute right-3 top-2 text-sm', isDark ? 'text-slate-400' : 'text-gray-400')}>%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Sum display */}
      <div
        className={clsx(
          'flex items-center justify-center gap-2 py-3 px-4 rounded-lg',
          valid ? 'bg-green-900/30 border border-green-600' : 'bg-orange-900/30 border border-orange-600'
        )}
      >
        {getSumIcon()}
        <span className={clsx('text-sm font-medium', isDark ? 'text-slate-300' : 'text-gray-700')}>
          Total:{' '}
          <span className={clsx('font-bold', getSumColor())}>
            {sum.toFixed(1)}%
          </span>
        </span>
        {!valid && (
          <span className={clsx('text-sm', isDark ? 'text-slate-400' : 'text-gray-500')}>
            {sum < 100
              ? `(${(100 - sum).toFixed(1)}% remaining)`
              : `(${(sum - 100).toFixed(1)}% over)`}
          </span>
        )}
      </div>

      {!valid && (
        <p className="mt-2 text-xs text-center text-orange-400">
          Percentages must sum to exactly 100%
        </p>
      )}

      {/* Deviation Threshold */}
      <div className={clsx('mt-4 pt-4 border-t', isDark ? 'border-slate-700' : 'border-gray-200')}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <label className={clsx(
              'text-sm font-medium whitespace-nowrap',
              isDark ? 'text-cyan-300' : 'text-cyan-700'
            )}>
              Warning Deviation Threshold
            </label>
            <div className="relative w-20">
              <input
                type="number"
                min="0"
                max="50"
                step="1"
                value={deviationThreshold}
                onChange={(e) => setDeviationThreshold(parseFloat(e.target.value) || 0)}
                className={clsx(
                  'w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-cyan-500',
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-slate-100'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                )}
              />
              <span className={clsx('absolute right-2 top-1.5 text-sm', isDark ? 'text-slate-400' : 'text-gray-400')}>%</span>
            </div>
          </div>
          <span className={clsx('text-xs', isDark ? 'text-slate-400' : 'text-gray-500')}>
            Deviations beyond this threshold trigger warnings
          </span>
        </div>
      </div>
    </div>
  );
}
