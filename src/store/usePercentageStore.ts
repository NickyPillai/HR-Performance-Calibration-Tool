import { create } from 'zustand';
import { type PercentageSplit, DEFAULT_PERCENTAGES, DEVIATION_THRESHOLD, type Rating } from '../types/rating';
import { apiClient } from '../lib/api/client';

interface PercentageState {
  targetPercentages: PercentageSplit;
  deviationThreshold: number;

  // Actions
  fetchSettings: () => Promise<void>;
  updateTargetPercentage: (rating: Rating, percentage: number) => void;
  setTargetPercentages: (percentages: PercentageSplit) => void;
  setDeviationThreshold: (threshold: number) => void;
  resetToDefault: () => void;

  // Computed
  isValid: () => boolean;
  getSum: () => number;
}

export const usePercentageStore = create<PercentageState>()(
  (set, get) => ({
    targetPercentages: DEFAULT_PERCENTAGES,
    deviationThreshold: DEVIATION_THRESHOLD,

    fetchSettings: async () => {
      try {
        const settings = await apiClient.getSettings();
        set({
          targetPercentages: settings.targetPercentages,
          deviationThreshold: settings.deviationThreshold,
        });
      } catch {
        // Keep defaults on failure
      }
    },

    updateTargetPercentage: (rating: Rating, percentage: number) => {
      set((state) => {
        const newPercentages = {
          ...state.targetPercentages,
          [`rating${rating}`]: percentage,
        };
        apiClient.updateSettings({ targetPercentages: newPercentages }).catch(() => {});
        return { targetPercentages: newPercentages };
      });
    },

    setTargetPercentages: (percentages: PercentageSplit) => {
      set({ targetPercentages: percentages });
      apiClient.updateSettings({ targetPercentages: percentages }).catch(() => {});
    },

    setDeviationThreshold: (threshold: number) => {
      set({ deviationThreshold: threshold });
      apiClient.updateSettings({ deviationThreshold: threshold }).catch(() => {});
    },

    resetToDefault: () => {
      set({ targetPercentages: DEFAULT_PERCENTAGES, deviationThreshold: DEVIATION_THRESHOLD });
      apiClient.updateSettings({
        targetPercentages: DEFAULT_PERCENTAGES,
        deviationThreshold: DEVIATION_THRESHOLD,
      }).catch(() => {});
    },

    isValid: () => {
      const sum = get().getSum();
      return sum === 100;
    },

    getSum: () => {
      const percentages = get().targetPercentages;
      return (
        percentages.rating1 +
        percentages.rating2 +
        percentages.rating3 +
        percentages.rating4 +
        percentages.rating5
      );
    },
  })
);
