import { useState, useMemo } from 'react';
import { useEmployeeStore } from '../../store/useEmployeeStore';
import { useThemeStore } from '../../store/useThemeStore';
import { EmployeeRow } from './EmployeeRow';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const PAGE_SIZE_OPTIONS = [20, 50, 100] as const;

export function EmployeeTable() {
  const employees = useEmployeeStore((state) => state.employees);
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);

  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) {
      return employees;
    }

    const query = searchQuery.trim();

    const equalsMatch = query.match(/^(\w+)\s*=\s*(.+)$/);
    if (equalsMatch) {
      const field = equalsMatch[1].toLowerCase();
      const value = equalsMatch[2].trim().toLowerCase();

      return employees.filter((emp) => {
        switch (field) {
          case 'rating':
            return emp.rating.toString() === value;
          case 'department':
          case 'dept':
            return emp.department.toLowerCase().includes(value);
          case 'manager':
            return emp.manager.toLowerCase().includes(value);
          case 'name':
            return emp.name.toLowerCase().includes(value);
          case 'employeeid':
          case 'id':
            return emp.employeeId.toLowerCase().includes(value);
          default:
            return false;
        }
      });
    }

    const lowerQuery = query.toLowerCase();
    return employees.filter((emp) => {
      const searchableText = [
        emp.employeeId,
        emp.name,
        emp.department,
        emp.manager,
        `rating ${emp.rating}`,
        emp.rating.toString(),
      ].join(' ').toLowerCase();

      return searchableText.includes(lowerQuery);
    });
  }, [employees, searchQuery]);

  // Reset to page 1 when search or page size changes
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + pageSize);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleExport = () => {
    if (employees.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      const exportData = employees.map((emp) => ({
        'Employee ID': emp.employeeId,
        'Name': emp.name,
        'Department': emp.department,
        'Manager': emp.manager,
        'Rating': emp.rating,
        'Frozen': emp.isFrozen ? 'Yes' : 'No',
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Employees');

      const timestamp = new Date().toISOString().slice(0, 10);
      const fileName = `employee_data_${timestamp}.xlsx`;

      XLSX.writeFile(wb, fileName);
      toast.success(`Exported ${employees.length} employees to ${fileName}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  if (employees.length === 0) {
    return (
      <div className={clsx(
        'rounded-lg shadow-lg border p-8 text-center',
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      )}>
        <p className={isDark ? 'text-slate-400' : 'text-gray-500'}>
          No employees loaded. Please import data using the file uploader above.
        </p>
      </div>
    );
  }

  return (
    <div className={clsx(
      'rounded-lg shadow-lg border overflow-hidden',
      isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
    )}>
      <div className={clsx(
        'px-6 py-4 border-b',
        isDark ? 'border-slate-700' : 'border-gray-200'
      )}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={clsx(
            'text-lg font-semibold',
            isDark ? 'text-cyan-400' : 'text-cyan-700'
          )}>
            Employee Data ({filteredEmployees.length} {filteredEmployees.length !== employees.length ? `of ${employees.length}` : ''} employees)
          </h2>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export to Excel
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search employees by name, ID, department, manager, or rating... (e.g., rating = 5)"
            className={clsx(
              'w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm',
              isDark
                ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400'
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
            )}
          />
          <svg
            className={clsx('absolute left-3 top-2.5 w-4 h-4', isDark ? 'text-slate-400' : 'text-gray-400')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className={clsx(
          'min-w-full divide-y',
          isDark ? 'divide-slate-700' : 'divide-gray-200'
        )}>
          <thead className={isDark ? 'bg-slate-900' : 'bg-gray-50'}>
            <tr>
              {['Employee ID', 'Name', 'Department', 'Manager', 'Rating', 'Actions'].map((header) => (
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
            {paginatedEmployees.map((employee) => (
              <EmployeeRow key={employee.id} employee={employee} />
            ))}
          </tbody>
        </table>
      </div>

      {filteredEmployees.length === 0 && searchQuery && (
        <div className={clsx('p-8 text-center', isDark ? 'text-slate-400' : 'text-gray-500')}>
          No employees found matching "{searchQuery}"
        </div>
      )}

      {/* Pagination Controls */}
      {filteredEmployees.length > 0 && (
        <div className={clsx(
          'px-6 py-3 border-t flex items-center justify-between',
          isDark ? 'border-slate-700 bg-slate-900' : 'border-gray-200 bg-gray-50'
        )}>
          <div className="flex items-center gap-3">
            <span className={clsx('text-sm', isDark ? 'text-slate-400' : 'text-gray-600')}>
              Rows per page:
            </span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className={clsx(
                'px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-cyan-500',
                isDark
                  ? 'bg-slate-700 border-slate-600 text-slate-100'
                  : 'bg-white border-gray-300 text-gray-900'
              )}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className={clsx('text-sm', isDark ? 'text-slate-400' : 'text-gray-600')}>
              {startIndex + 1}–{Math.min(startIndex + pageSize, filteredEmployees.length)} of {filteredEmployees.length}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={safePage <= 1}
                className={clsx(
                  'px-2 py-1 text-sm rounded transition-colors disabled:opacity-40',
                  isDark
                    ? 'text-slate-300 hover:bg-slate-700 disabled:hover:bg-transparent'
                    : 'text-gray-700 hover:bg-gray-200 disabled:hover:bg-transparent'
                )}
              >
                &laquo;
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className={clsx(
                  'px-2 py-1 text-sm rounded transition-colors disabled:opacity-40',
                  isDark
                    ? 'text-slate-300 hover:bg-slate-700 disabled:hover:bg-transparent'
                    : 'text-gray-700 hover:bg-gray-200 disabled:hover:bg-transparent'
                )}
              >
                &lsaquo;
              </button>
              <span className={clsx(
                'px-3 py-1 text-sm font-medium',
                isDark ? 'text-cyan-400' : 'text-cyan-700'
              )}>
                {safePage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className={clsx(
                  'px-2 py-1 text-sm rounded transition-colors disabled:opacity-40',
                  isDark
                    ? 'text-slate-300 hover:bg-slate-700 disabled:hover:bg-transparent'
                    : 'text-gray-700 hover:bg-gray-200 disabled:hover:bg-transparent'
                )}
              >
                &rsaquo;
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={safePage >= totalPages}
                className={clsx(
                  'px-2 py-1 text-sm rounded transition-colors disabled:opacity-40',
                  isDark
                    ? 'text-slate-300 hover:bg-slate-700 disabled:hover:bg-transparent'
                    : 'text-gray-700 hover:bg-gray-200 disabled:hover:bg-transparent'
                )}
              >
                &raquo;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
