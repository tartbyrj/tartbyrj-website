/**
 * Filter taxonomy for /works — the single source of truth for the controlled
 * tag vocabulary.
 *
 * Three consumers read from here and none of them may redeclare the lists:
 *   1. src/sanity/schemas/artwork.ts — the option lists Studio renders
 *   2. src/types/artwork.ts          — parses the values back as plain strings
 *   3. the /works routes             — build the filter groups and validate
 *
 * Note what this file is NOT: it is not the `medium` field. `medium` stays a
 * free-text display string ("Acrylic and ink on canvas") shown under each tile.
 * These tags exist only so a work can be queried into a filter group. Nothing
 * derives one from the other, in either direction.
 *
 * Order is meaningful — the arrays are the display order of the filter chips,
 * not alphabetical. Paint types run most to least common in the collection so
 * the chips a visitor is likeliest to want sit leftmost.
 */

export type TaxonomyOption = {
  /** Lowercase, URL-safe. Persisted in Sanity and used in query params. */
  readonly value: string;
  /** Human-readable. The only string ever rendered. */
  readonly title: string;
};

export const PAINT_TYPES = [
  { value: 'acrylic', title: 'Acrylic' },
  { value: 'oil', title: 'Oil' },
  { value: 'watercolour', title: 'Watercolour' },
  { value: 'mixed', title: 'Mixed' },
  { value: 'charcoal', title: 'Charcoal' },
  { value: 'ink', title: 'Ink' },
] as const satisfies readonly TaxonomyOption[];

export const SURFACES = [
  { value: 'canvas', title: 'Canvas' },
  { value: 'paper', title: 'Paper' },
  { value: 'wall', title: 'Wall' },
] as const satisfies readonly TaxonomyOption[];

/**
 * Shape Sanity's `options.list` expects. Returns a fresh mutable array each
 * call because the schema builder's types reject the `as const` readonly ones.
 */
export function toSanityOptions(
  options: readonly TaxonomyOption[]
): { title: string; value: string }[] {
  return options.map(({ title, value }) => ({ title, value }));
}
