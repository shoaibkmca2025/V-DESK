/**
 * CSV writing (RFC 4180, CRLF line ends) for staff exports.
 *
 * Spreadsheet apps run a cell that starts with = + - @ (or tab / carriage return) as a formula, so a lead named
 * "=HYPERLINK(...)" could attack whoever opens the export (CSV injection). Such cells get a leading apostrophe,
 * which Excel and Google Sheets hide and treat as "this is text" — so "+91 98765 43210" still displays as typed.
 */

const FORMULA_START = /^[=+\-@\t\r]/;

export function csvCell(value) {
  if (value === null || value === undefined) return '';
  let text = value instanceof Date ? value.toISOString() : String(value);
  if (typeof value === 'string' && FORMULA_START.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** One CSV line, CRLF-terminated. */
export function csvRow(values) {
  return `${values.map(csvCell).join(',')}\r\n`;
}
