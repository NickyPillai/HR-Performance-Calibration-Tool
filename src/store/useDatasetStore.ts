import { create } from 'zustand';
import { apiClient } from '../lib/api/client';
import { useEmployeeStore } from './useEmployeeStore';
import { usePercentageStore } from './usePercentageStore';
import type { DatasetSummary } from '../types/dataset';

interface DatasetState {
  savedDatasets: DatasetSummary[];
  activeDatasetId: number | null;
  activeDatasetName: string | null;
  isSaving: boolean;
  isLoading: boolean;

  fetchDatasets: () => Promise<void>;
  saveDataset: (name: string) => Promise<void>;
  updateDataset: () => Promise<void>;
  loadDataset: (id: number) => Promise<void>;
  deleteDataset: (id: number) => Promise<void>;
  setActiveDatasetName: (name: string | null) => void;
}

export const useDatasetStore = create<DatasetState>()(
  (set, get) => ({
    savedDatasets: [],
    activeDatasetId: null,
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
        const { dataset } = await apiClient.saveDataset(name, employees, { targetPercentages, deviationThreshold });
        await get().fetchDatasets();
        set({ activeDatasetId: dataset.id, activeDatasetName: name, isSaving: false });
      } catch (err) {
        set({ isSaving: false });
        throw err;
      }
    },

    updateDataset: async () => {
      const { activeDatasetId, activeDatasetName } = get();
      if (!activeDatasetId || !activeDatasetName) return;
      set({ isSaving: true });
      try {
        const employees = useEmployeeStore.getState().employees;
        const { targetPercentages, deviationThreshold } = usePercentageStore.getState();
        await apiClient.updateDataset(activeDatasetId, activeDatasetName, employees, { targetPercentages, deviationThreshold });
        await get().fetchDatasets();
        set({ isSaving: false });
      } catch (err) {
        set({ isSaving: false });
        throw err;
      }
    },

    loadDataset: async (id: number) => {
      set({ isLoading: true });
      try {
        const { dataset } = await apiClient.loadDataset(id);
        // Sync employees to DB via bulk import so freeze/unfreeze works correctly
        await useEmployeeStore.getState().bulkImport(dataset.employees);
        usePercentageStore.getState().loadFromDataset(
          dataset.settings.targetPercentages,
          dataset.settings.deviationThreshold
        );
        set({ activeDatasetId: dataset.id, activeDatasetName: dataset.name, isLoading: false });
      } catch (err) {
        set({ isLoading: false });
        throw err;
      }
    },

    deleteDataset: async (id: number) => {
      try {
        await apiClient.deleteDataset(id);
        if (id === get().activeDatasetId) {
          set({ activeDatasetId: null, activeDatasetName: null });
        }
        await get().fetchDatasets();
      } catch (err) {
        throw err;
      }
    },

    setActiveDatasetName: (name: string | null) => {
      if (name === null) {
        set({ activeDatasetId: null, activeDatasetName: null });
      } else {
        set({ activeDatasetName: name });
      }
    },
  })
);
