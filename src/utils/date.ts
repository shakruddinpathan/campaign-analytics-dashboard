// The data stores dates as "YYYY-MM-DD" strings, but the shadcn Calendar
// works with JavaScript Date objects in the user's LOCAL time zone.
// These two helpers convert between them without any time-zone shift.

/** "2026-07-05" → Date for 5 July 2026, 00:00 local time */
export function isoToLocalDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Date (local) → "2026-07-05" */
export function localDateToIso(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
