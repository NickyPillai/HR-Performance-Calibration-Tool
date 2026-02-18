import { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useEmployeeStore } from '../../store/useEmployeeStore';
import { usePercentageStore } from '../../store/usePercentageStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useFilterStore } from '../../store/useFilterStore';
import { calculateDistribution, generateBellCurveData } from '../../lib/calculators/distributionCalculator';
import clsx from 'clsx';

export function BellCurveChart() {
  const allEmployees = useEmployeeStore((state) => state.employees);
  const targetPercentages = usePercentageStore((state) => state.targetPercentages);
  const deviationThreshold = usePercentageStore((state) => state.deviationThreshold);
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const departmentFilter = useFilterStore((s) => s.departmentFilter);
  const managerFilter = useFilterStore((s) => s.managerFilter);
  const setDepartmentFilter = useFilterStore((s) => s.setDepartmentFilter);
  const setManagerFilter = useFilterStore((s) => s.setManagerFilter);
  const clearFilters = useFilterStore((s) => s.clearFilters);

  const departments = useMemo(() =>
    [...new Set(allEmployees.map((e) => e.department))].sort(),
    [allEmployees]
  );

  const managers = useMemo(() => {
    const source = departmentFilter
      ? allEmployees.filter((e) => e.department === departmentFilter)
      : allEmployees;
    return [...new Set(source.map((e) => e.manager))].sort();
  }, [allEmployees, departmentFilter]);

  const employees = useMemo(() =>
    allEmployees
      .filter((e) => !departmentFilter || e.department === departmentFilter)
      .filter((e) => !managerFilter || e.manager === managerFilter),
    [allEmployees, departmentFilter, managerFilter]
  );

  const hasFilters = departmentFilter || managerFilter;

  const chartData = useMemo(() => {
    if (employees.length === 0) {
      return [];
    }

    const distribution = calculateDistribution(employees, targetPercentages, deviationThreshold);
    const bellCurveData = generateBellCurveData(distribution, employees.length);

    return bellCurveData.map((point) => ({
      rating: `Rating ${point.rating}`,
      actualCount: point.actualCount,
      targetCount: point.targetCount,
      hasDeviation: point.hasDeviation,
    }));
  }, [employees, targetPercentages, deviationThreshold]);

  const axisColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#475569' : '#e2e8f0';
  const tooltipBg = isDark ? '#0f172a' : '#ffffff';
  const tooltipBorder = isDark ? '#22d3ee' : '#0891b2';

  const selectClass = clsx(
    'px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-cyan-500',
    isDark
      ? 'bg-slate-700 border-slate-600 text-slate-100'
      : 'bg-white border-gray-300 text-gray-900'
  );

  if (allEmployees.length === 0) {
    return (
      <div className={clsx(
        'rounded-lg shadow-lg border p-4',
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      )}>
        <h2 className={clsx('text-lg font-semibold mb-4', isDark ? 'text-cyan-400' : 'text-cyan-700')}>
          Bell Curve Distribution
        </h2>
        <div className={clsx('text-center py-12', isDark ? 'text-slate-400' : 'text-gray-500')}>
          No data to display. Please import employee data first.
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(
      'rounded-lg shadow-lg border p-4',
      isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
    )}>
      <h2 className={clsx('text-lg font-semibold mb-3', isDark ? 'text-cyan-400' : 'text-cyan-700')}>
        Bell Curve Distribution
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="flex items-center gap-2">
          <label className={clsx('text-xs font-medium', isDark ? 'text-slate-400' : 'text-gray-500')}>Department:</label>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className={selectClass}
          >
            <option value="">All</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className={clsx('text-xs font-medium', isDark ? 'text-slate-400' : 'text-gray-500')}>Manager:</label>
          <select
            value={managerFilter}
            onChange={(e) => setManagerFilter(e.target.value)}
            className={selectClass}
          >
            <option value="">All</option>
            {managers.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className={clsx(
              'text-xs px-2 py-1 rounded transition-colors',
              isDark ? 'text-cyan-400 hover:bg-slate-700' : 'text-cyan-600 hover:bg-gray-100'
            )}
          >
            Clear Filters
          </button>
        )}
        {hasFilters && (
          <span className={clsx('text-xs', isDark ? 'text-amber-400' : 'text-amber-600')}>
            Showing {employees.length} of {allEmployees.length} employees
          </span>
        )}
      </div>

      {employees.length === 0 ? (
        <div className={clsx('text-center py-8', isDark ? 'text-slate-400' : 'text-gray-500')}>
          No employees match the selected filters.
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="rating"
                stroke={axisColor}
                label={{ value: 'Performance Rating', position: 'insideBottom', offset: -15, fill: axisColor }}
                tick={{ fill: axisColor, fontSize: 13 }}
              />
              <YAxis
                stroke={axisColor}
                label={{ value: 'Number of Employees', angle: -90, position: 'insideLeft', fill: axisColor }}
                tick={{ fill: axisColor, fontSize: 13 }}
                domain={[0, employees.length]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className={clsx(
                        'border rounded p-3 shadow-lg text-sm',
                        isDark ? 'bg-slate-900 border-cyan-500' : 'bg-white border-cyan-600'
                      )} style={{ backgroundColor: tooltipBg, borderColor: tooltipBorder }}>
                        <p className={clsx('font-semibold', isDark ? 'text-cyan-300' : 'text-cyan-700')}>{data.rating}</p>
                        <p className="text-blue-400">
                          Actual: {data.actualCount} employees
                        </p>
                        <p className="text-green-500">
                          Target: {data.targetCount} employees
                        </p>
                        {data.hasDeviation && (
                          <p className="text-xs text-red-400 mt-1">⚠ Deviation detected</p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Actual count bars - brighter colors for visibility */}
              <Bar dataKey="actualCount" barSize={60}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.hasDeviation
                      ? (isDark ? '#f87171' : '#ef4444')
                      : (isDark ? '#22d3ee' : '#06b6d4')
                    }
                  />
                ))}
              </Bar>

              {/* Target count line */}
              <Line
                type="monotone"
                dataKey="targetCount"
                stroke={isDark ? '#facc15' : '#d97706'}
                strokeWidth={3}
                dot={{ r: 6, fill: isDark ? '#facc15' : '#d97706', stroke: isDark ? '#a16207' : '#92400e', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>

          <div className="mt-3 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className={clsx('w-4 h-4 rounded shadow-sm', isDark ? 'bg-cyan-400' : 'bg-cyan-500')}></div>
              <span className={isDark ? 'text-slate-300' : 'text-gray-600'}>Actual (Normal)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={clsx('w-4 h-4 rounded shadow-sm', isDark ? 'bg-red-400' : 'bg-red-500')}></div>
              <span className={isDark ? 'text-slate-300' : 'text-gray-600'}>Actual (Deviation)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={clsx('w-4 h-4 rounded shadow-sm', isDark ? 'bg-yellow-400' : 'bg-amber-600')}></div>
              <span className={isDark ? 'text-slate-300' : 'text-gray-600'}>Target</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
