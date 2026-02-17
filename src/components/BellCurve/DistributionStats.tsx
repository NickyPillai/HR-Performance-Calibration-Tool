import { useMemo } from 'react';
import { useEmployeeStore } from '../../store/useEmployeeStore';
import { usePercentageStore } from '../../store/usePercentageStore';
import { useThemeStore } from '../../store/useThemeStore';
import { calculateDistribution } from '../../lib/calculators/distributionCalculator';
import clsx from 'clsx';

export function DistributionStats() {
  const employees = useEmployeeStore((state) => state.employees);
  const targetPercentages = usePercentageStore((state) => state.targetPercentages);
  const deviationThreshold = usePercentageStore((state) => state.deviationThreshold);
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const distribution = useMemo(() => {
    return calculateDistribution(employees, targetPercentages, deviationThreshold);
  }, [employees, targetPercentages, deviationThreshold]);

  if (employees.length === 0) {
    return (
      <div className={clsx(
        'rounded-lg shadow-lg border p-6',
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      )}>
        <h2 className={clsx('text-lg font-semibold mb-4', isDark ? 'text-cyan-400' : 'text-cyan-700')}>
          Actual vs Target Distribution
        </h2>
        <div className={clsx('text-center py-8', isDark ? 'text-slate-400' : 'text-gray-500')}>
          No data to display
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(
      'rounded-lg shadow-lg border p-6',
      isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
    )}>
      <h2 className={clsx('text-lg font-semibold mb-4', isDark ? 'text-cyan-400' : 'text-cyan-700')}>
        Actual vs Target Distribution
      </h2>

      <div className="overflow-x-auto">
        <table className={clsx(
          'min-w-full divide-y',
          isDark ? 'divide-slate-600' : 'divide-gray-200'
        )}>
          <thead className={isDark ? 'bg-slate-900' : 'bg-gray-50'}>
            <tr>
              {['Rating', 'Target %', 'Actual %', 'Deviation', 'Count'].map((header) => (
                <th key={header} className={clsx(
                  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider',
                  isDark ? 'text-cyan-300' : 'text-cyan-700'
                )}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={clsx(
            'divide-y',
            isDark ? 'bg-slate-800 divide-slate-700' : 'bg-white divide-gray-100'
          )}>
            {distribution.map((dist) => (
              <tr
                key={dist.rating}
                className={clsx(
                  'transition-colors',
                  dist.hasDeviation && dist.deviation > 0 && (isDark ? 'bg-red-900/30' : 'bg-red-50'),
                  dist.hasDeviation && dist.deviation < 0 && (isDark ? 'bg-blue-900/30' : 'bg-blue-50')
                )}
              >
                <td className={clsx('px-4 py-3 text-sm font-medium', isDark ? 'text-slate-200' : 'text-gray-900')}>
                  Rating {dist.rating}
                </td>
                <td className={clsx('px-4 py-3 text-sm', isDark ? 'text-slate-300' : 'text-gray-700')}>
                  {dist.targetPercentage.toFixed(1)}%
                </td>
                <td className={clsx('px-4 py-3 text-sm', isDark ? 'text-slate-300' : 'text-gray-700')}>
                  {dist.actualPercentage.toFixed(1)}%
                </td>
                <td
                  className={clsx(
                    'px-4 py-3 text-sm font-medium',
                    dist.deviation > 0 && 'text-red-400',
                    dist.deviation < 0 && 'text-blue-400',
                    dist.deviation === 0 && 'text-green-400'
                  )}
                >
                  {dist.deviation > 0 && '+'}
                  {dist.deviation.toFixed(1)}%
                  {dist.hasDeviation && ' ⚠'}
                </td>
                <td className={clsx('px-4 py-3 text-sm', isDark ? 'text-slate-300' : 'text-gray-700')}>
                  {dist.actualCount}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className={isDark ? 'bg-slate-900' : 'bg-gray-50'}>
            <tr>
              <td className={clsx('px-4 py-3 text-sm font-semibold', isDark ? 'text-cyan-300' : 'text-cyan-700')}>Total</td>
              <td className={clsx('px-4 py-3 text-sm font-semibold', isDark ? 'text-slate-300' : 'text-gray-700')}>100.0%</td>
              <td className={clsx('px-4 py-3 text-sm font-semibold', isDark ? 'text-slate-300' : 'text-gray-700')}>
                {distribution
                  .reduce((sum, d) => sum + d.actualPercentage, 0)
                  .toFixed(1)}
                %
              </td>
              <td className="px-4 py-3 text-sm"></td>
              <td className={clsx('px-4 py-3 text-sm font-semibold', isDark ? 'text-slate-300' : 'text-gray-700')}>
                {employees.length}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className={clsx('mt-4 text-xs space-y-1', isDark ? 'text-slate-400' : 'text-gray-500')}>
        <p>⚠ Warning: Deviation &gt; {deviationThreshold}% from target percentage</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded"></div>
            <span>Positive deviation = more employees than target</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded"></div>
            <span>Negative deviation = fewer employees than target</span>
          </div>
        </div>
      </div>
    </div>
  );
}
