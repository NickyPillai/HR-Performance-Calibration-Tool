// Rating types for performance ratings (1-5)
export type Rating = 1 | 2 | 3 | 4 | 5;

// Target percentage split across all 5 ratings
export interface PercentageSplit {
  rating1: number;
  rating2: number;
  rating3: number;
  rating4: number;
  rating5: number;
}

// Distribution analysis comparing actual vs target
export interface RatingDistribution {
  rating: Rating;
  actualCount: number;
  actualPercentage: number;
  targetPercentage: number;
  deviation: number; // actualPercentage - targetPercentage
  hasDeviation: boolean; // |deviation| > threshold
}

// Chart data points for bell curve visualization
export interface BellCurveDataPoint {
  rating: number; // 1-5
  actualCount: number;
  targetCount: number;
  hasDeviation: boolean;
}

// Default percentage split (bell curve)
export const DEFAULT_PERCENTAGES: PercentageSplit = {
  rating1: 10,
  rating2: 20,
  rating3: 40,
  rating4: 20,
  rating5: 10,
};

// Deviation threshold for highlighting (2%)
export const DEVIATION_THRESHOLD = 2;
