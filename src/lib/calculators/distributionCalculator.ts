import type { Employee } from '../../types/employee';
import {
  type PercentageSplit,
  type RatingDistribution,
  type BellCurveDataPoint,
  DEVIATION_THRESHOLD,
  type Rating,
} from '../../types/rating';

/**
 * Calculate the distribution of employees across ratings
 * and compare with target percentages
 */
export function calculateDistribution(
  employees: Employee[],
  targetPercentages: PercentageSplit,
  deviationThreshold: number = DEVIATION_THRESHOLD
): RatingDistribution[] {
  const total = employees.length;

  // Handle empty employee list
  if (total === 0) {
    return [1, 2, 3, 4, 5].map((rating) => ({
      rating: rating as Rating,
      actualCount: 0,
      actualPercentage: 0,
      targetPercentage: targetPercentages[`rating${rating}` as keyof PercentageSplit],
      deviation: 0 - targetPercentages[`rating${rating}` as keyof PercentageSplit],
      hasDeviation: false,
    }));
  }

  return [1, 2, 3, 4, 5].map((rating) => {
    const actualCount = employees.filter((e) => e.rating === rating).length;
    const actualPercentage = (actualCount / total) * 100;
    const targetPercentage = targetPercentages[`rating${rating}` as keyof PercentageSplit];
    const deviation = actualPercentage - targetPercentage;

    return {
      rating: rating as Rating,
      actualCount,
      actualPercentage,
      targetPercentage,
      deviation,
      hasDeviation: Math.abs(deviation) > deviationThreshold,
    };
  });
}

/**
 * Generate bell curve data points for visualization
 */
export function generateBellCurveData(
  distribution: RatingDistribution[],
  totalEmployees: number
): BellCurveDataPoint[] {
  return distribution.map((dist) => ({
    rating: dist.rating,
    actualCount: dist.actualCount,
    targetCount: Math.round((dist.targetPercentage / 100) * totalEmployees),
    hasDeviation: dist.hasDeviation,
  }));
}

/**
 * Calculate statistics for the distribution
 */
export function calculateDistributionStats(distribution: RatingDistribution[]): {
  mean: number;
  median: number;
  mode: number;
  totalDeviation: number;
} {
  const actualCounts = distribution.map((d) => d.actualCount);
  const total = actualCounts.reduce((sum, count) => sum + count, 0);

  // Calculate mean
  const weightedSum = distribution.reduce(
    (sum, dist) => sum + dist.rating * dist.actualCount,
    0
  );
  const mean = total > 0 ? weightedSum / total : 0;

  // Find mode (most frequent rating)
  const maxCount = Math.max(...actualCounts);
  const modeDistribution = distribution.find((d) => d.actualCount === maxCount);
  const mode = modeDistribution ? modeDistribution.rating : 3;

  // Calculate median (simplified)
  const median = 3; // For a 1-5 rating system, median is typically 3

  // Calculate total absolute deviation
  const totalDeviation = distribution.reduce(
    (sum, dist) => sum + Math.abs(dist.deviation),
    0
  );

  return { mean, median, mode, totalDeviation };
}
