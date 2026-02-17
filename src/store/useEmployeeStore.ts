import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Employee, ImportedEmployee, EmployeeUpdate } from '../types/employee';
import type { Rating } from '../types/rating';

interface EmployeeState {
  employees: Employee[];

  // Actions
  setEmployees: (employees: Employee[]) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, updates: EmployeeUpdate) => void;
  bulkImport: (employees: ImportedEmployee[]) => void;
  toggleFreeze: (id: string) => void;
  clearAll: () => void;

  // Selectors
  getEmployeeById: (id: string) => Employee | undefined;
  getEmployeesByRating: (rating: Rating) => Employee[];
}

// Helper to generate UUID
const generateId = (): string => {
  return crypto.randomUUID();
};

export const useEmployeeStore = create<EmployeeState>()(
  persist(
    (set, get) => ({
      employees: [],

      setEmployees: (employees: Employee[]) => {
        set({ employees });
      },

      addEmployee: (employee: Employee) => {
        set((state) => ({
          employees: [...state.employees, employee],
        }));
      },

      updateEmployee: (id: string, updates: EmployeeUpdate) => {
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === id && !emp.isFrozen
              ? {
                  ...emp,
                  ...updates,
                }
              : emp
          ),
        }));
      },

      bulkImport: (importedEmployees: ImportedEmployee[]) => {
        const newEmployees: Employee[] = importedEmployees.map((emp) => ({
          id: generateId(),
          employeeId: emp.employeeId,
          name: emp.name,
          department: emp.department,
          manager: emp.manager,
          rating: emp.rating,
          isFrozen: false,
        }));

        set({ employees: newEmployees });
      },

      toggleFreeze: (id: string) => {
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === id ? { ...emp, isFrozen: !emp.isFrozen } : emp
          ),
        }));
      },

      clearAll: () => {
        set({ employees: [] });
      },

      // Selectors
      getEmployeeById: (id: string) => {
        return get().employees.find((emp) => emp.id === id);
      },

      getEmployeesByRating: (rating: Rating) => {
        return get().employees.filter((emp) => emp.rating === rating);
      },
    }),
    {
      name: 'hr-calibration-employees',
    }
  )
);
