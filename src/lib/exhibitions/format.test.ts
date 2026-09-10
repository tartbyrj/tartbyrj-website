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
