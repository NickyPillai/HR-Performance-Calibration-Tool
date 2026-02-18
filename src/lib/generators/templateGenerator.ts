import * as XLSX from 'xlsx';

/**
 * Generate and download a sample Excel template file
 * with the expected column headers and example rows.
 */
export function downloadSampleTemplate(): void {
  const sampleData = [
    {
      'Employee ID': 'E001',
      'Name': 'Jane Smith',
      'Department': 'Engineering',
      'Manager': 'Sarah Kim',
      'Rating': 3,
    },
    {
      'Employee ID': 'E002',
      'Name': 'John Doe',
      'Department': 'Marketing',
      'Manager': 'Tom Wilson',
      'Rating': 4,
    },
    {
      'Employee ID': 'E003',
      'Name': 'Alice Johnson',
      'Department': 'HR',
      'Manager': 'Mark Lee',
      'Rating': 5,
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);

  ws['!cols'] = [
    { wch: 14 },
    { wch: 20 },
    { wch: 16 },
    { wch: 16 },
    { wch: 8 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Employees');
  XLSX.writeFile(wb, 'employee_template.xlsx');
}
