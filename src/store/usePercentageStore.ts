import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type PercentageSplit, DEFAULT_PERCENTAGES, DEVIATION_THRESHOLD, type Rating } from '../types/rating';

interface PercentageState {
  targetPercentages: PercentageSplit;
  deviationThreshold: number;

  // Actions
  updateTargetPercentage: (rating: Rating, percentage: number) => void;
  setTargetPercentages: (percentages: PercentageSplit) => void;
  setDeviationThreshold: (threshold: number) => void;
  resetToDefault: () => void;

  // Computed
  isValid: () => boolean;
  getSum: () => number;
}

export const usePercentageStore = create<PercentageState>()(
  persist(
    (set, get) => ({
      targetPercentages: DEFAULT_PERCENTAGES,
      deviationThreshold: DEVIATION_THRESHOLD,

      updateTargetPercentage: (rating: Rating, percentage: number) => {
        set((state) => ({
          targetPercentages: {
            ...state.targetPercentages,
            [`rating${rating}`]: percentage,
          },
        }));
      },

      setTargetPercentages: (percentages: PercentageSplit) => {
        set({ targetPercentages: percentages });
      },

      setDeviationThreshold: (threshold: number) => {
        set({ deviationThreshold: threshold });
      },

      resetToDefault: () => {
        set({ targetPercentages: DEFAULT_PERCENTAGES, deviationThreshold: DEVIATION_THRESHOLD });
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
    }),
    {
      name: 'hr-calibration-percentages',
    }
  )
);
