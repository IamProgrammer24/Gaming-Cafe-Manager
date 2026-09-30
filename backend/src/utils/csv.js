// Cells starting with these characters can run as formulas when opened in Excel.
// Customer names are typed by users, so we defuse them with a leading apostrophe.
const FORMULA_START = /^[=+\-@\t\r]/;

export function csvCell(value) {
  if (value === null || value === undefined) return "";
  let s = String(value);
  if (FORMULA_START.test(s)) s = `'${s}`;
  if (/[",\r\n]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

// The BOM makes Excel read the file as UTF-8, so non-English names display correctly.
export const toCsv = (rows) =>
  "\uFEFF" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
