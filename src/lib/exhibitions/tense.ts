/**
 * Pure, no Astro/DOM imports — independently unit-testable (tense.test.ts).
 *
 * Known limitation: this site is a static build, so tense is frozen at build
 * time — a show that opens tomorrow still reads "upcoming" until the next
 * deploy. Mitigation, in order of preference (not implemented here): a daily
 * scheduled Cloudflare deploy hook, or keep labels this coarse rather than a
 * live countdown.
 */

import { isValidISODate } from './date-validation.ts';

export type Tense = 'upcoming' | 'current' | 'past';

interface DatedExhibition {
  startDate?: string | null;
  endDate?: string | null;
}

// Sanity `date` fields come back as plain YYYY-MM-DD strings with no
// timezone. Comparing those directly as strings (ISO 8601 date-only strings
// sort lexicographically the same as chronologically) avoids running them
// through `new Date()` and comparing instants, which would introduce a
// timezone offset bug — Cloudflare builds in UTC, RJ's shows are in UAE and
// India, so an instant comparison can flip a show's tense several hours
// early or late depending on the build machine's zone.
function todayISODate(today: Date): string {
  return today.toISOString().slice(0, 10);
}

export function getTense(exhibition: DatedExhibition, today: Date = new Date()): Tense {
  const { startDate, endDate } = exhibition;
  if (!startDate || !endDate) return 'past';
  // A malformed date (bad shape, or out-of-range values Date.UTC would
  // silently roll over) must not reach the raw string comparison below:
  // e.g. 'not-a-date' sorts after any real ISO date and would otherwise be
  // misclassified 'upcoming'. Matches the documented fallback for
  // unparseable dates — the same 'past' as a missing date.
  if (!isValidISODate(startDate) || !isValidISODate(endDate)) return 'past';

  const todayDate = todayISODate(today);
  if (startDate > todayDate) return 'upcoming';
  if (endDate < todayDate) return 'past';
  return 'current';
}

export function countByTense(
  exhibitions: DatedExhibition[],
  today: Date = new Date()
): Record<Tense, number> {
  const counts: Record<Tense, number> = { upcoming: 0, current: 0, past: 0 };
  for (const exhibition of exhibitions) {
    counts[getTense(exhibition, today)]++;
  }
  return counts;
}
