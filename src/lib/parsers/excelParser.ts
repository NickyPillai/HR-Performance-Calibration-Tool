import * as XLSX from 'xlsx';

/**
 * Parse Excel (.xlsx, .xls) or CSV files and return data as array of objects
 */
export async function parseExcelFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // Get the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false, // Return formatted strings instead of raw values
          defval: '', // Default value for empty cells
        });

        resolve(jsonData);
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsBinaryString(file);
  });
}

/**
 * Parse CSV files
 */
export async function parseCSVFile(file: File): Promise<any[]> {
  // CSV files are also handled by the xlsx library
  return parseExcelFile(file);
}

/**
 * Normalize column names to match expected format
 * Handles various column name formats (e.g., "Employee ID", "EmployeeID", "employee_id")
 */
export function normalizeData(data: any[]): any[] {
  const columnMapping: Record<string, string> = {
    'employee id': 'employeeId',
    employeeid: 'employeeId',
    employee_id: 'employeeId',
    emp_id: 'employeeId',
    id: 'employeeId',

    name: 'name',
    'employee name': 'name',
    fullname: 'name',
    full_name: 'name',

    department: 'department',
    dept: 'department',
    dep: 'department',

    manager: 'manager',
    supervisor: 'manager',
    'manager name': 'manager',

    rating: 'rating',
    'performance rating': 'rating',
    score: 'rating',
    'performance score': 'rating',
  };

  return data.map((row) => {
    const normalized: any = {};

    Object.keys(row).forEach((key) => {
      const lowerKey = key.toLowerCase().trim();
      const mappedKey = columnMapping[lowerKey] || key;
      normalized[mappedKey] = row[key];
    });

    return normalized;
  });
}

/**
 * Check if file type is supported
 */
export function isSupportedFileType(file: File): boolean {
  const supportedTypes = [
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'text/csv', // .csv
    'application/csv',
  ];

  const supportedExtensions = ['.xls', '.xlsx', '.csv'];

  return (
    supportedTypes.includes(file.type) ||
    supportedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
  );
}
