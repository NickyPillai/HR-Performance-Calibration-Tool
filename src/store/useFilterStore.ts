import { create } from 'zustand';

interface FilterState {
  departmentFilter: string;
  managerFilter: string;

  setDepartmentFilter: (dept: string) => void;
  setManagerFilter: (mgr: string) => void;
  clearFilters: () => void;
}

export const useFilterStore = create<FilterState>()(
  (set) => ({
    departmentFilter: '',
    managerFilter: '',

    setDepartmentFilter: (dept: string) => {
      set({ departmentFilter: dept, managerFilter: '' });
    },

    setManagerFilter: (mgr: string) => {
      set({ managerFilter: mgr });
    },

    clearFilters: () => {
      set({ departmentFilter: '', managerFilter: '' });
    },
  })
);
