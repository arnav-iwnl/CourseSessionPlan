import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Export multiple datasets to a single Excel file with multiple sheets.
 * @param {Array} datasets - An array of objects, each containing `data` (JSON array) and `sheetName` (string).
 * @param {string} fileName - The name of the Excel file.
 */
export const exportToExcel = (datasets, fileName) => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Add each dataset as a sheet
  datasets.forEach(({ data, sheetName }) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });

  // Write the workbook and trigger the download
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, `${fileName}.xlsx`);
};
