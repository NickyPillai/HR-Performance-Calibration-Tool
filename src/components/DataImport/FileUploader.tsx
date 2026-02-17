import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { parseExcelFile, normalizeData, isSupportedFileType } from '../../lib/parsers/excelParser';
import { validateEmployees, type ValidationError } from '../../lib/validators/employeeValidator';
import { useEmployeeStore } from '../../store/useEmployeeStore';
import { useThemeStore } from '../../store/useThemeStore';
import clsx from 'clsx';

export function FileUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const bulkImport = useEmployeeStore((state) => state.bulkImport);
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        return;
      }

      const file = acceptedFiles[0];

      if (!isSupportedFileType(file)) {
        toast.error('Unsupported file type. Please upload Excel (.xlsx, .xls) or CSV files.');
        return;
      }

      setIsUploading(true);
      setValidationErrors([]);

      try {
        const rawData = await parseExcelFile(file);

        if (rawData.length === 0) {
          toast.error('No data found in file');
          setIsUploading(false);
          return;
        }

        const normalizedData = normalizeData(rawData);
        const { validEmployees, errors } = validateEmployees(normalizedData);

        if (errors.length > 0) {
          setValidationErrors(errors);
          toast.error(`Found ${errors.length} validation errors. Please check the errors below.`);
        }

        if (validEmployees.length > 0) {
          bulkImport(validEmployees);
          toast.success(`Successfully imported ${validEmployees.length} employees!`);
        } else {
          toast.error('No valid employees found in file');
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        toast.error('Failed to parse file. Please check the file format.');
      } finally {
        setIsUploading(false);
      }
    },
    [bulkImport]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
    },
    multiple: false,
    disabled: isUploading,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={clsx(
          'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-cyan-400 bg-cyan-900/20'
            : isDark
              ? 'border-slate-600 hover:border-cyan-500'
              : 'border-gray-300 hover:border-cyan-500',
          isUploading && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />

        <svg
          className={clsx('mx-auto h-8 w-8', isDark ? 'text-cyan-400' : 'text-cyan-600')}
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div className="mt-2">
          {isUploading ? (
            <p className={clsx('text-sm', isDark ? 'text-slate-300' : 'text-gray-600')}>Uploading and validating...</p>
          ) : isDragActive ? (
            <p className="text-sm text-cyan-400">Drop the file here...</p>
          ) : (
            <>
              <p className={clsx('text-sm', isDark ? 'text-slate-300' : 'text-gray-600')}>
                <span className={clsx('font-semibold', isDark ? 'text-cyan-400' : 'text-cyan-600')}>Click to upload</span> or drag and drop
              </p>
              <p className={clsx('text-xs mt-1', isDark ? 'text-slate-400' : 'text-gray-500')}>
                Excel (.xlsx, .xls) or CSV files
              </p>
            </>
          )}
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-red-400 mb-2">
            Validation Errors ({validationErrors.length})
          </h3>
          <div className="max-h-60 overflow-y-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-red-900/40 sticky top-0">
                <tr>
                  <th className="px-2 py-1 text-left text-red-300">Row</th>
                  <th className="px-2 py-1 text-left text-red-300">Field</th>
                  <th className="px-2 py-1 text-left text-red-300">Error</th>
                  <th className="px-2 py-1 text-left text-red-300">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-800">
                {validationErrors.map((error, index) => (
                  <tr key={index}>
                    <td className="px-2 py-1 text-red-400">{error.row}</td>
                    <td className="px-2 py-1 text-red-400">{error.field}</td>
                    <td className="px-2 py-1 text-red-400">{error.message}</td>
                    <td className="px-2 py-1 text-red-400 font-mono">
                      {String(error.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
