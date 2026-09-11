/**
 * Prev/next neighbours for a detail page, given the ordered list the routes
 * were generated from and the current item's index in it.
 *
 * Pure, no Astro imports — independently unit-testable (neighbours.test.ts),
 * which is the point: this is a repeat of a bug that already shipped on
 * /collections/[slug] (ARCHITECTURE.md §20) and it is not obvious by reading.
 *
 * THREE cases, not two:
 *
 *   n <= 1  both null — there is nothing to link, and the section is skipped
 *           entirely rather than linking back to the page you are on.
 *   n === 2 NO WRAP. Index 0 gets `next` only; index 1 gets `prev` only, so
 *           exactly one link renders per page.
 *   n >= 3  wraps — the last item's `next` is the first.
 *
 * The middle case is the whole reason this function exists. The naive
 * modular arithmetic —
 *
 *     prev = list[(i - 1 + n) % n]
 *     next = list[(i + 1) % n]
 *
 * — is correct for every n except 2, where both expressions resolve to the
 * same index: at n=2, i=0 that is (0-1+2)%2 === 1 and (0+1)%2 === 1. Each
 * page then renders "Previous" and "Next" pointing at one identical
 * document. That is exactly what shipped on the collections pages.
 */

export interface Neighbours<T> {
  prev: T | null;
  next: T | null;
}

export function getNeighbours<T>(list: readonly T[], index: number): Neighbours<T> {
  const n = list.length;

  // Nothing to point at. Callers skip the whole prev/next section on this.
  if (n <= 1) return { prev: null, next: null };

  // No wrap at two: wrapping here would make both links the same document.
  if (n === 2) {
    return index === 0 ? { prev: null, next: list[1] } : { prev: list[0], next: null };
  }

  return {
    prev: list[(index - 1 + n) % n],
    next: list[(index + 1) % n],
  };
}
