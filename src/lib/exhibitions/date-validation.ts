/**
 * Shared by format.ts and tense.ts so a malformed Sanity `date` string
 * (bad shape, or a value Date.UTC would silently roll over — e.g. month 13,
 * or Feb 30 becoming March 2) is treated identically by both: rejected
 * before either does a string comparison or an Intl.DateTimeFormat call.
 */
export function isValidISODate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;

  const [year, month, day] = dateStr.split('-').map(Number);
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  // Date.UTC normalises out-of-range fields instead of rejecting them
  // (month 13 rolls into next January, Feb 30 rolls into March) — round-trip
  // the parsed value and compare it back against the input to catch that.
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
