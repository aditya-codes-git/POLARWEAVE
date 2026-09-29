import * as XLSX from 'xlsx';
import { DatasetColumn } from '@polarweave/types';

export interface ParsedTabularResult {
  sheetNames: string[];
  columns: DatasetColumn[];
  rowCount: number;
  previewRows: Record<string, unknown>[];
  detectedVariables: string[];
}

export function parseTabularBuffer(buffer: Buffer): ParsedTabularResult {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const firstSheetName = workbook.SheetNames[0] || 'Sheet1';
  const worksheet = workbook.Sheets[firstSheetName];

  if (!worksheet) {
    return {
      sheetNames: [],
      columns: [],
      rowCount: 0,
      previewRows: [],
      detectedVariables: []
    };
  }

  const rawJson: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, { defval: null });
  const rowCount = rawJson.length;
  const previewRows = rawJson.slice(0, 10);

  // Infer columns and datatypes
  const sample = rawJson.slice(0, 50);
  const columnNames = rawJson.length > 0 ? Object.keys(rawJson[0]) : [];

  const columns: DatasetColumn[] = columnNames.map((name) => {
    let type: DatasetColumn['datatype'] = 'string';
    const lower = name.toLowerCase();

    // Variable & datatype heuristics
    if (lower.includes('lat') || lower.includes('lon') || lower.includes('coord')) {
      type = 'coordinate';
    } else if (lower.includes('date') || lower.includes('time') || lower.includes('timestamp')) {
      type = 'date';
    } else {
      // Check values
      const numericCount = sample.filter((r) => r[name] !== null && typeof r[name] === 'number').length;
      if (numericCount > sample.length * 0.7) {
        type = 'numeric';
      }
    }

    let unit = '';
    if (lower.includes('temp')) unit = '°C';
    else if (lower.includes('depth') || lower.includes('thickness') || lower.includes('elevation')) unit = 'm';
    else if (lower.includes('salinity')) unit = 'PSU';
    else if (lower.includes('density')) unit = 'kg/m³';
    else if (lower.includes('pressure')) unit = 'hPa';
    else if (lower.includes('aerosol') || lower.includes('carbon')) unit = 'ng/m³';

    return {
      name,
      datatype: type,
      unit: unit || undefined
    };
  });

  const detectedVariables = columns
    .filter((c) => c.datatype === 'numeric' || c.datatype === 'coordinate')
    .map((c) => c.name);

  return {
    sheetNames: workbook.SheetNames,
    columns,
    rowCount,
    previewRows,
    detectedVariables
  };
}
