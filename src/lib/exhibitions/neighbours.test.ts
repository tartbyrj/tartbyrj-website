import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getNeighbours } from './neighbours.ts';

// Minimal shape — getNeighbours only ever reads identity, never fields.
const a = { title: 'A', slug: 'a' };
const b = { title: 'B', slug: 'b' };
const c = { title: 'C', slug: 'c' };
const d = { title: 'D', slug: 'd' };

test('a single exhibition has no neighbours at all', () => {
  assert.deepEqual(getNeighbours([a], 0), { prev: null, next: null });
});

test('an empty list has no neighbours', () => {
  assert.deepEqual(getNeighbours([], 0), { prev: null, next: null });
});

// The bug this whole module exists to prevent: (i-1+n)%n and (i+1)%n both
// resolve to the *same* index when n === 2, so each page linked "Previous"
// and "Next" at one identical document. Shipped live on /collections/[slug].
test('with exactly two, the first gets next only — and it is not itself', () => {
  const { prev, next } = getNeighbours([a, b], 0);
  assert.equal(prev, null);
  assert.equal(next, b);
});

test('with exactly two, the second gets prev only — and it is not itself', () => {
  const { prev, next } = getNeighbours([a, b], 1);
  assert.equal(prev, a);
  assert.equal(next, null);
});

test('with three or more it wraps: first prev is the last', () => {
  const { prev, next } = getNeighbours([a, b, c], 0);
  assert.equal(prev, c);
  assert.equal(next, b);
});

test('with three or more it wraps: last next is the first', () => {
  const { prev, next } = getNeighbours([a, b, c], 2);
  assert.equal(prev, b);
  assert.equal(next, a);
});

test('a middle item points at its true neighbours', () => {
  const { prev, next } = getNeighbours([a, b, c], 1);
  assert.equal(prev, a);
  assert.equal(next, c);
});

// Guards the invariant directly rather than case by case: whatever the list
// length, a page must never offer a link back to the page you are already on.
test('no exhibition is ever its own neighbour, at any list length', () => {
  // Every item distinct — a repeated object would make an identity check
  // report a false self-link on the duplicate.
  for (const list of [[a], [a, b], [a, b, c], [a, b, c, d]]) {
    for (let i = 0; i < list.length; i++) {
      const { prev, next } = getNeighbours(list, i);
      assert.notEqual(prev, list[i], `prev self-linked at n=${list.length}, i=${i}`);
      assert.notEqual(next, list[i], `next self-linked at n=${list.length}, i=${i}`);
    }
  }
});
