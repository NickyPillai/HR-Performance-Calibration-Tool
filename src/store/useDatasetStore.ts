import { create } from 'zustand';
import { apiClient } from '../lib/api/client';
import { useEmployeeStore } from './useEmployeeStore';
import { usePercentageStore } from './usePercentageStore';
import type { DatasetSummary } from '../types/dataset';

interface DatasetState {
  savedDatasets: DatasetSummary[];
  activeDatasetName: string | null;
  isSaving: boolean;
  isLoading: boolean;

  fetchDatasets: () => Promise<void>;
  saveDataset: (name: string) => Promise<void>;
  loadDataset: (id: number) => Promise<void>;
  deleteDataset: (id: number) => Promise<void>;
  setActiveDatasetName: (name: string | null) => void;
}

export const useDatasetStore = create<DatasetState>()(
  (set, get) => ({
    savedDatasets: [],
    activeDatasetName: null,
    isSaving: false,
    isLoading: false,

    fetchDatasets: async () => {
      try {
        const { datasets } = await apiClient.listDatasets();
        set({ savedDatasets: datasets });
      } catch {
        // Keep empty on failure
      }
    },

    saveDataset: async (name: string) => {
      set({ isSaving: true });
      try {
        const employees = useEmployeeStore.getState().employees;
        const { targetPercentages, deviationThreshold } = usePercentageStore.getState();
        await apiClient.saveDataset(name, employees, { targetPercentages, deviationThreshold });
        await get().fetchDatasets();
        set({ activeDatasetName: name, isSaving: false });
      } catch (err) {
        set({ isSaving: false });
        throw err;
      }
    },

    loadDataset: async (id: number) => {
      set({ isLoading: true });
      try {
        const { dataset } = await apiClient.loadDataset(id);
        useEmployeeStore.getState().setEmployees(dataset.employees);
        usePercentageStore.getState().loadFromDataset(
          dataset.settings.targetPercentages,
          dataset.settings.deviationThreshold
        );
        set({ activeDatasetName: dataset.name, isLoading: false });
      } catch (err) {
        set({ isLoading: false });
        throw err;
      }
    },

    deleteDataset: async (id: number) => {
      try {
        await apiClient.deleteDataset(id);
        const deleted = get().savedDatasets.find((d) => d.id === id);
        if (deleted && deleted.name === get().activeDatasetName) {
          set({ activeDatasetName: null });
        }
        await get().fetchDatasets();
      } catch (err) {
        throw err;
      }
    },

    setActiveDatasetName: (name: string | null) => {
      set({ activeDatasetName: name });
    },
  })
);
