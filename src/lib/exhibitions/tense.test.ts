import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getTense, countByTense } from './tense.ts';

const TODAY = new Date('2026-06-15T12:00:00Z');

test('returns upcoming when startDate is in the future', () => {
  const tense = getTense({ startDate: '2026-07-01', endDate: '2026-07-05' }, TODAY);
  assert.equal(tense, 'upcoming');
});

test('returns current when today equals startDate (inclusive start)', () => {
  const tense = getTense({ startDate: '2026-06-15', endDate: '2026-06-20' }, TODAY);
  assert.equal(tense, 'current');
});

test('returns current when today equals endDate (inclusive end)', () => {
  const tense = getTense({ startDate: '2026-06-01', endDate: '2026-06-15' }, TODAY);
  assert.equal(tense, 'current');
});

test('returns past when endDate is in the past', () => {
  const tense = getTense({ startDate: '2025-01-01', endDate: '2025-01-10' }, TODAY);
  assert.equal(tense, 'past');
});

test('returns past when startDate is missing', () => {
  const tense = getTense({ startDate: null, endDate: '2026-07-01' }, TODAY);
  assert.equal(tense, 'past');
});

test('returns past when endDate is missing', () => {
  const tense = getTense({ startDate: '2026-06-01', endDate: null }, TODAY);
  assert.equal(tense, 'past');
});

test('returns past when startDate is malformed, never misclassified upcoming', () => {
  // A raw string compare ('not-a-date' > any real ISO date) would otherwise
  // sort this after today's date and call it 'upcoming'.
  const tense = getTense({ startDate: 'not-a-date', endDate: '2026-07-01' }, TODAY);
  assert.equal(tense, 'past');
});

test('returns past when endDate is malformed', () => {
  const tense = getTense({ startDate: '2026-06-01', endDate: 'not-a-date' }, TODAY);
  assert.equal(tense, 'past');
});

test('returns past when startDate has an out-of-range month', () => {
  const tense = getTense({ startDate: '2026-13-01', endDate: '2026-07-01' }, TODAY);
  assert.equal(tense, 'past');
});

test('countByTense tallies a mixed list without recomputing per-tense filters', () => {
  const exhibitions = [
    { startDate: '2026-07-01', endDate: '2026-07-05' }, // upcoming
    { startDate: '2026-06-01', endDate: '2026-06-20' }, // current
    { startDate: '2025-01-01', endDate: '2025-01-10' }, // past
    { startDate: '2024-01-01', endDate: '2024-01-10' }, // past
  ];

  assert.deepEqual(countByTense(exhibitions, TODAY), { upcoming: 1, current: 1, past: 2 });
});
