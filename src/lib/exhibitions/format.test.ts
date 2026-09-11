import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDateRange } from './format.ts';

test('same month and year renders "14 – 28 November 2026"', () => {
  assert.equal(formatDateRange('2026-11-14', '2026-11-28'), '14 – 28 November 2026');
});

test('different month, same year renders "28 November – 4 December 2026"', () => {
  assert.equal(formatDateRange('2026-11-28', '2026-12-04'), '28 November – 4 December 2026');
});

test('different year renders "28 December 2026 – 4 January 2027"', () => {
  assert.equal(formatDateRange('2026-12-28', '2027-01-04'), '28 December 2026 – 4 January 2027');
});

test('same day renders a single date, no dash', () => {
  assert.equal(formatDateRange('2026-11-14', '2026-11-14'), '14 November 2026');
});

test('missing endDate renders the start date alone, never "Invalid Date"', () => {
  assert.equal(formatDateRange('2026-11-14', null), '14 November 2026');
  assert.equal(formatDateRange('2026-11-14', undefined), '14 November 2026');
});

test('malformed startDate degrades to the raw string instead of throwing', () => {
  assert.doesNotThrow(() => formatDateRange('not-a-date', '2026-11-14'));
  assert.equal(formatDateRange('not-a-date', '2026-11-14'), 'not-a-date');
});

test('startDate with an out-of-range month degrades instead of throwing', () => {
  // Date.UTC(2026, 12, 14) silently rolls month 13 into January 2027 —
  // isValidISODate must catch this before it reaches Intl.DateTimeFormat.
  assert.doesNotThrow(() => formatDateRange('2026-13-14', null));
  assert.equal(formatDateRange('2026-13-14', null), '2026-13-14');
});

test('malformed endDate falls back to formatting startDate alone', () => {
  assert.doesNotThrow(() => formatDateRange('2026-11-14', 'not-a-date'));
  assert.equal(formatDateRange('2026-11-14', 'not-a-date'), '14 November 2026');
});
