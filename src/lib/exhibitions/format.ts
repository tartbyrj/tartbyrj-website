/**
 * Pure formatter, no markup, no CSS knowledge — the component owns
 * `font-variant-numeric: tabular-nums`, not this file. Independently
 * unit-testable (format.test.ts).
 */

import { isValidISODate } from './date-validation.ts';

// Sanity `date` fields are plain YYYY-MM-DD strings with no timezone.
// Parsing via Date.UTC and formatting with timeZone: 'UTC' keeps every
// comparison and render on the same calendar day the string names — the
// same reasoning as tense.ts's string-comparison approach, applied here
// through Intl instead since this function needs real month names.
//
// Callers must check isValidISODate() first. An unvalidated malformed
// string (bad shape, or a value Date.UTC silently rolls over — month 13,
// Feb 30) becomes an Invalid Date that Intl.DateTimeFormat.format() throws
// a RangeError on — uncaught, that takes down the entire static build, not
// just the one exhibition's page.
function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

const dayFormatter = new Intl.DateTimeFormat('en-GB', { day: 'numeric', timeZone: 'UTC' });
const dayMonthFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
});
const fullFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatDateRange(startDate: string, endDate?: string | null): string {
  // A malformed startDate degrades to the raw string instead of throwing —
  // this is display text on a page that otherwise renders fine, not a
  // reason to fail the build. See the note on parseISODate above.
  if (!isValidISODate(startDate)) return startDate;

  const start = parseISODate(startDate);
  if (!endDate || !isValidISODate(endDate)) return fullFormatter.format(start);

  const end = parseISODate(endDate);
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const sameMonth = sameYear && start.getUTCMonth() === end.getUTCMonth();
  const sameDay = sameMonth && start.getUTCDate() === end.getUTCDate();

  if (sameDay) return fullFormatter.format(start);
  if (sameMonth) return `${dayFormatter.format(start)} – ${fullFormatter.format(end)}`;
  if (sameYear) return `${dayMonthFormatter.format(start)} – ${fullFormatter.format(end)}`;
  return `${fullFormatter.format(start)} – ${fullFormatter.format(end)}`;
}
