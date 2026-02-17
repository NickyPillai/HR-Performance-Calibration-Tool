import { useState } from 'react';
import type { Employee } from '../../types/employee';
import type { Rating } from '../../types/rating';
import { useEmployeeStore } from '../../store/useEmployeeStore';
import { useThemeStore } from '../../store/useThemeStore';
import clsx from 'clsx';

interface EmployeeRowProps {
  employee: Employee;
}

export function EmployeeRow({ employee }: EmployeeRowProps) {
  const updateEmployee = useEmployeeStore((state) => state.updateEmployee);
  const toggleFreeze = useEmployeeStore((state) => state.toggleFreeze);
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const [localData, setLocalData] = useState({
    name: employee.name,
    department: employee.department,
    manager: employee.manager,
    employeeId: employee.employeeId,
    rating: employee.rating,
  });

  const handleFieldChange = (field: string, value: string | Rating) => {
    if (employee.isFrozen) return;
    setLocalData((prev) => ({ ...prev, [field]: value }));
    updateEmployee(employee.id, { [field]: value });
  };

  const handleToggleFreeze = () => {
    toggleFreeze(employee.id);
  };

  const inputClass = clsx(
    'w-full px-2 py-1 text-sm border rounded focus:outline-none',
    employee.isFrozen
      ? isDark
        ? 'bg-slate-600 border-slate-500 text-slate-400 cursor-not-allowed'
        : 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
      : isDark
        ? 'bg-slate-700 border-slate-600 text-slate-100 focus:ring-2 focus:ring-cyan-500'
        : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-cyan-500'
  );

  return (
    <tr
      className={clsx(
        'transition-colors',
        employee.isFrozen && (isDark ? 'bg-indigo-900/20' : 'bg-indigo-50')
      )}
    >
      <td className="px-4 py-2">
        <input
          type="text"
          value={localData.employeeId}
          onChange={(e) => handleFieldChange('employeeId', e.target.value)}
          disabled={employee.isFrozen}
          className={inputClass}
        />
      </td>
      <td className="px-4 py-2">
        <input
          type="text"
          value={localData.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          disabled={employee.isFrozen}
          className={inputClass}
        />
      </td>
      <td className="px-4 py-2">
        <input
          type="text"
          value={localData.department}
          onChange={(e) => handleFieldChange('department', e.target.value)}
          disabled={employee.isFrozen}
          className={inputClass}
        />
      </td>
      <td className="px-4 py-2">
        <input
          type="text"
          value={localData.manager}
          onChange={(e) => handleFieldChange('manager', e.target.value)}
          disabled={employee.isFrozen}
          className={inputClass}
        />
      </td>
      <td className="px-4 py-2">
        <select
          value={localData.rating}
          onChange={(e) => handleFieldChange('rating', parseInt(e.target.value) as Rating)}
          disabled={employee.isFrozen}
          className={inputClass}
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5</option>
        </select>
      </td>
      <td className="px-4 py-2">
        <button
          onClick={handleToggleFreeze}
          className={clsx(
            'px-3 py-1 rounded text-white text-sm transition-colors font-medium',
            employee.isFrozen
              ? 'bg-amber-600 hover:bg-amber-700'
              : 'bg-cyan-600 hover:bg-cyan-700'
          )}
        >
          {employee.isFrozen ? 'Unfreeze' : 'Freeze'}
        </button>
      </td>
    </tr>
  );
}
