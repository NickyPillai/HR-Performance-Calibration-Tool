import type { Rating } from './rating';

// Employee data structure
export interface Employee {
  id: string; // UUID
  employeeId: string; // Employee ID from import
  name: string;
  department: string;
  manager: string;
  rating: Rating; // Performance rating 1-5
  isFrozen: boolean; // Whether the row is frozen (non-editable)
}

// Employee data from import (before adding metadata)
export interface ImportedEmployee {
  employeeId: string;
  name: string;
  department: string;
  manager: string;
  rating: Rating;
}

// Employee with partial updates for editing
export type EmployeeUpdate = Partial<Omit<Employee, 'id'>>;
