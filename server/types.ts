import type { Request } from 'express';

export interface DbUser {
  id: number;
  username: string;
  password_hash: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface DbEmployee {
  id: number;
  user_id: number;
  employee_id: string;
  name: string;
  department: string;
  manager: string;
  rating: number;
  is_frozen: number;
  created_at: string;
}

export interface DbUserSettings {
  user_id: number;
  target_percentages: string;
  deviation_threshold: number;
  theme: string;
}

export interface JwtPayload {
  userId: number;
  username: string;
  role: 'admin' | 'user';
}

export interface DbSavedDataset {
  id: number;
  user_id: number;
  name: string;
  employees: string;
  settings: string;
  created_at: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}
