import { z } from 'zod';

// Zod schema for validating imported employee data
export const ImportedEmployeeSchema = z.object({
  employeeId: z
    .string()
    .min(1, 'Employee ID is required')
    .transform((val) => val.trim()),
  name: z
    .string()
    .min(1, 'Name is required')
    .transform((val) => val.trim()),
  department: z
    .string()
    .min(1, 'Department is required')
    .transform((val) => val.trim()),
  manager: z
    .string()
    .min(1, 'Manager is required')
    .transform((val) => val.trim()),
  rating: z
    .union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
      // Also accept string numbers and convert them
      z.string().transform((val) => parseInt(val, 10)),
      z.number(),
    ])
    .transform((val) => {
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      if (![1, 2, 3, 4, 5].includes(num)) {
        throw new z.ZodError([
          {
            code: 'custom',
            path: ['rating'],
            message: 'Rating must be 1, 2, 3, 4, or 5',
          },
        ]);
      }
      return num as 1 | 2 | 3 | 4 | 5;
    }),
});

// Validation error result
export interface ValidationError {
  row: number;
  field: string;
  message: string;
  value: any;
}

// Validate multiple employees and return errors
export function validateEmployees(data: any[]): {
  validEmployees: z.infer<typeof ImportedEmployeeSchema>[];
  errors: ValidationError[];
} {
  const validEmployees: z.infer<typeof ImportedEmployeeSchema>[] = [];
  const errors: ValidationError[] = [];

  data.forEach((row, index) => {
    try {
      const validated = ImportedEmployeeSchema.parse(row);
      validEmployees.push(validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        (error as z.ZodError).issues.forEach((err: z.ZodIssue) => {
          errors.push({
            row: index + 1, // 1-indexed for user display
            field: err.path.join('.'),
            message: err.message,
            value: (row as Record<string, unknown>)?.[err.path[0] as string],
          });
        });
      } else {
        errors.push({
          row: index + 1,
          field: 'unknown',
          message: 'Unknown validation error',
          value: row,
        });
      }
    }
  });

  return { validEmployees, errors };
}
