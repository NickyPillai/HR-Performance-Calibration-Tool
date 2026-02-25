import { create } from 'zustand';
import type { Employee, ImportedEmployee, EmployeeUpdate } from '../types/employee';
import type { Rating } from '../types/rating';
import { apiClient } from '../lib/api/client';

interface EmployeeState {
  employees: Employee[];
  isLoading: boolean;

  // Actions
  fetchEmployees: () => Promise<void>;
  setEmployees: (employees: Employee[]) => void;
  addEmployee: () => Promise<void>;
  deleteEmployee: (id: string) => void;
  updateEmployee: (id: string, updates: EmployeeUpdate) => void;
  bulkImport: (employees: ImportedEmployee[]) => void;
  toggleFreeze: (id: string) => void;
  clearAll: () => void;

  // Selectors
  getEmployeeById: (id: string) => Employee | undefined;
  getEmployeesByRating: (rating: Rating) => Employee[];
}

export const useEmployeeStore = create<EmployeeState>()(
  (set, get) => ({
    employees: [],
    isLoading: false,

    fetchEmployees: async () => {
      set({ isLoading: true });
      try {
        const { employees } = await apiClient.getEmployees();
        set({ employees, isLoading: false });
      } catch {
        set({ isLoading: false });
      }
    },

    setEmployees: (employees: Employee[]) => {
      set({ employees });
    },

    addEmployee: async () => {
      try {
        const { employee } = await apiClient.addEmployee({
          employeeId: '',
          name: '',
          department: '',
          manager: '',
          rating: 3,
        });
        set((state) => ({
          employees: [employee, ...state.employees],
        }));
      } catch {
        // Refetch on failure
        get().fetchEmployees();
      }
    },

    deleteEmployee: async (id: string) => {
      // Optimistic update
      set((state) => ({
        employees: state.employees.filter((emp) => emp.id !== id),
      }));
      try {
        await apiClient.deleteEmployee(id);
      } catch {
        get().fetchEmployees();
      }
    },

    updateEmployee: async (id: string, updates: EmployeeUpdate) => {
      // Optimistic update
      set((state) => ({
        employees: state.employees.map((emp) =>
          emp.id === id && !emp.isFrozen ? { ...emp, ...updates } : emp
        ),
      }));

      try {
        await apiClient.updateEmployee(id, updates);
      } catch {
        get().fetchEmployees();
      }
    },

    bulkImport: async (importedEmployees: ImportedEmployee[]) => {
      set({ isLoading: true });
      try {
        const { employees } = await apiClient.bulkImportEmployees(importedEmployees);
        set({ employees, isLoading: false });
      } catch (err) {
        set({ isLoading: false });
        throw err;
      }
    },

    toggleFreeze: async (id: string) => {
      // Optimistic update
      set((state) => ({
        employees: state.employees.map((emp) =>
          emp.id === id ? { ...emp, isFrozen: !emp.isFrozen } : emp
        ),
      }));

      try {
        await apiClient.toggleFreezeEmployee(id);
      } catch {
        get().fetchEmployees();
      }
    },

    clearAll: async () => {
      set({ employees: [] });
      try {
        await apiClient.deleteAllEmployees();
      } catch {
        get().fetchEmployees();
      }
    },

    // Selectors
    getEmployeeById: (id: string) => {
      return get().employees.find((emp) => emp.id === id);
    },

    getEmployeesByRating: (rating: Rating) => {
      return get().employees.filter((emp) => emp.rating === rating);
    },
  })
);
