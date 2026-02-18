import type { Employee } from './employee';
import type { PercentageSplit } from './rating';

export interface DatasetSettings {
  targetPercentages: PercentageSplit;
  deviationThreshold: number;
}

export interface DatasetSummary {
  id: number;
  name: string;
  created_at: string;
}

export interface FullDataset extends DatasetSummary {
  employees: Employee[];
  settings: DatasetSettings;
}
