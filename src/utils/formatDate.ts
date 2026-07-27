// Single source of truth for date display across the app — every date shown to
// a user (listings, detail pages, popups, exports) must render DD/MM/YYYY.
// Native <input type="date"> pickers are exempt — their display is OS-controlled
// and can't be restyled; only what's shown AFTER a value is read back is formatted here.

function toDate(value: string | number | Date): Date {
  if (value instanceof Date) return value;
  if (typeof value === 'number') return new Date(value);
  // Date-only strings (YYYY-MM-DD) parse as UTC midnight in native Date, which
  // shifts a day backward in negative-offset timezones — pin to local noon instead.
  return new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value);
}

export function formatDate(value: string | number | Date | null | undefined, fallback = ''): string {
  if (value === null || value === undefined || value === '') return fallback;
  const d = toDate(value);
  if (isNaN(d.getTime())) return fallback;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

export function formatDateTime(value: string | number | Date | null | undefined, fallback = ''): string {
  if (value === null || value === undefined || value === '') return fallback;
  const d = toDate(value);
  if (isNaN(d.getTime())) return fallback;
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${formatDate(d)} ${time}`;
}

export function formatDateRange(start: string | number | Date | null | undefined, end: string | number | Date | null | undefined, fallback = ''): string {
  if (!start && !end) return fallback;
  return `${formatDate(start, fallback)} - ${formatDate(end, fallback)}`;
}
