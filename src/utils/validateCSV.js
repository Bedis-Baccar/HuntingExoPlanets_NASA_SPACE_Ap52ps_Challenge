/**
 * Basic filename + MIME validation (fast, synchronous).
 * Returns { valid, reason?, warning? }
 */
export function validateCSV(file) {
  if (!file) return { valid: false, reason: 'No file provided' };
  const nameOk = /\.csv$/i.test(file.name || '');
  if (!nameOk) return { valid: false, reason: 'File must have .csv extension' };
  const allowedTypes = ['text/csv', 'application/vnd.ms-excel', ''];
  if (file.type && !allowedTypes.includes(file.type)) {
    return { valid: true, warning: 'Unexpected MIME type, proceeding based on extension.' };
  }
  return { valid: true };
}

/**
 * Deeper structural validation (async). Reads the first ~32KB of the file and checks for
 * presence of time & flux column headers plus at least one data row with numeric values.
 * Options: { requiredColumns?: string[], sizeLimitBytes?: number }
 * Returns { valid, reason?, columns?: string[], detectedColumns?: string[] }
 */
export async function validateCSVStructure(file, options = {}) {
  const { requiredColumns = ['time', 'flux'], sizeLimitBytes = 32 * 1024 } = options;
  const base = validateCSV(file);
  if (!base.valid) return base;

  const slice = file.slice(0, sizeLimitBytes);
  const text = await slice.text();
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return { valid: false, reason: 'CSV appears empty or missing header' };

  const header = lines[0].split(/,|;|\t/).map(h => h.trim().replace(/^"|"$/g, ''));
  const lowerHeader = header.map(h => h.toLowerCase());
  const missing = requiredColumns.filter(rc => !lowerHeader.includes(rc.toLowerCase()));
  if (missing.length) {
    return { valid: false, reason: `Missing required column(s): ${missing.join(', ')}`, columns: header };
  }

  // Validate at least one numeric row
  const dataRow = lines.slice(1).find(r => r.trim().length > 0);
  if (!dataRow) return { valid: false, reason: 'No data rows found after header', columns: header };
  const parts = dataRow.split(/,|;|\t/);
  let numericCount = 0;
  parts.forEach(p => { if (!isNaN(parseFloat(p))) numericCount++; });
  if (numericCount < 2) return { valid: false, reason: 'Insufficient numeric data in first row', columns: header };

  return { valid: true, columns: header, detectedColumns: header };
}

