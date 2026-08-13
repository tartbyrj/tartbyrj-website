/**
 * Filter logic for /works, shared by the filter route's getStaticPaths() and by
 * the gallery component that draws the filter bar. Both have to agree about
 * which filters exist, or the bar links to a route that was never generated.
 */

import { PAINT_TYPES, SURFACES, type TaxonomyOption } from '../taxonomy';
import type { Artwork } from '../../types/artwork';

/**
 * The URL segment, not the Sanity field name. `/works/medium/oil` reads better
 * to a visitor than `/works/paint-type/oil` and matches the word used in the
 * caption under every tile — but it filters on the `paintType` tag array, never
 * on the free-text `medium` display string. The two are allowed to disagree;
 * only the tags decide what a filter route contains.
 */
export type FilterKind = 'medium' | 'surface';

/**
 * Up to one selection per axis, both optional and independent. `/works` is
 * `{ medium: null, surface: null }`; a combo route like
 * `/works/medium/watercolour/surface/canvas` is both populated. There is no
 * third state — a work can't be filtered to two paint types or two surfaces
 * at once by chip click, so each axis is a single slot, not a set.
 */
export interface FilterState {
  medium: TaxonomyOption | null;
  surface: TaxonomyOption | null;
}

export const EMPTY_FILTER: FilterState = { medium: null, surface: null };

export function optionsFor(kind: FilterKind): readonly TaxonomyOption[] {
  return kind === 'medium' ? PAINT_TYPES : SURFACES;
}

/**
 * An artwork with null tags matches nothing. That is deliberate: legacy work
 * uploaded before the taxonomy existed appears on /works and nowhere else,
 * rather than being guessed into a group from its medium string.
 */
export function matchesFilter(artwork: Artwork, kind: FilterKind, value: string): boolean {
  if (kind === 'medium') return (artwork.paintType ?? []).includes(value);
  return artwork.surface === value;
}

/** Both axes apply as AND when both are set — a combo route shows the
 *  intersection, not the union. An axis left null imposes no constraint. */
export function filterArtworks(artworks: readonly Artwork[], state: FilterState): Artwork[] {
  return artworks.filter(
    (artwork) =>
      (!state.medium || matchesFilter(artwork, 'medium', state.medium.value)) &&
      (!state.surface || matchesFilter(artwork, 'surface', state.surface.value))
  );
}

/**
 * Taxonomy options that at least one artwork carries, in taxonomy order.
 *
 * This is what keeps a filter link and a generated route in step. The old chip
 * row offered Oil and Watercolour whether or not anything was tagged with them,
 * and clicking one emptied the grid with no explanation; here an option that
 * matches nothing is neither routed nor rendered, so a dead filter cannot exist.
 *
 * Single-axis only — used to decide which /works/medium/<x> and
 * /works/surface/<x> routes to generate. Combo routes are decided separately
 * in getStaticPaths, since "at least one match on this axis alone" doesn't
 * imply "at least one match combined with a specific value on the other axis."
 */
export function availableOptions(
  artworks: readonly Artwork[],
  kind: FilterKind
): TaxonomyOption[] {
  return optionsFor(kind).filter((option) =>
    artworks.some((artwork) => matchesFilter(artwork, kind, option.value))
  );
}

/**
 * Ordered URL segments for a filter state — medium before surface, matching
 * the /works/medium/<value>/surface/<value> route shape. Empty for the
 * unfiltered state. Shared by getStaticPaths, which needs the bare segment
 * string for `params.filter`, and the chip bar, which needs it as a full href
 * — one segment order, so a route and a link to it can never disagree on it.
 */
export function filterSegments(state: FilterState): string[] {
  const segments: string[] = [];
  if (state.medium) segments.push('medium', state.medium.value);
  if (state.surface) segments.push('surface', state.surface.value);
  return segments;
}

export function filterPath(state: FilterState): string {
  const segments = filterSegments(state);
  return segments.length ? `/works/${segments.join('/')}` : '/works';
}

export type ChipStatus = 'active' | 'enabled' | 'disabled';

/**
 * Three-state read on a single taxonomy chip. Always computed against the
 * full dataset — never against whatever slice the current route happens to be
 * displaying below the chip bar — so the chip bar's shape never depends on
 * which page it's rendered on.
 *
 * Same-axis candidates (the other paint types, while a paint type is the
 * active filter) are checked against the whole dataset with no combining:
 * clicking one *replaces* that axis and drops the other one entirely — see
 * hrefFor() — so "does the page this leads to have anything, at all" is the
 * full-dataset question, not the combo one.
 *
 * Cross-axis candidates (surface chips while a medium filter is active and
 * has no surface of its own yet, and vice versa) are checked against the
 * subset the active filter already narrows to, because clicking one *adds*
 * that axis to what's already active — a chip that would land on zero
 * results is exactly what "disabled" exists to prevent.
 */
export function chipStatus(
  allArtworks: readonly Artwork[],
  state: FilterState,
  kind: FilterKind,
  value: string
): ChipStatus {
  const own = state[kind];
  if (own && own.value === value) return 'active';

  if (own) {
    return allArtworks.some((artwork) => matchesFilter(artwork, kind, value))
      ? 'enabled'
      : 'disabled';
  }

  const otherKind: FilterKind = kind === 'medium' ? 'surface' : 'medium';
  const other = state[otherKind];
  const pool = other
    ? allArtworks.filter((artwork) => matchesFilter(artwork, otherKind, other.value))
    : allArtworks;

  return pool.some((artwork) => matchesFilter(artwork, kind, value)) ? 'enabled' : 'disabled';
}

/**
 * Where a chip for (kind, value) points, given what's already active.
 *
 * Three cases, matched to chipStatus's classification:
 *  - This axis is already active and `value` is its own current value: a
 *    de-select. Falls back to the other axis's single-axis route, or /works
 *    if nothing else is active — never a self-link.
 *  - This axis is already active with a *different* value: a same-axis
 *    replace. Drops the other axis too, exactly as a single-axis chip always
 *    has — a same-axis click has never combined with anything.
 *  - This axis isn't active yet: combines with whatever the other axis
 *    already has, which is the fix for the bug where a cross-axis chip's href
 *    silently dropped the filter that was already applied.
 */
export function hrefFor(state: FilterState, kind: FilterKind, value: string): string {
  const own = state[kind];
  const otherKind: FilterKind = kind === 'medium' ? 'surface' : 'medium';
  const other = state[otherKind];

  let nextOwn: TaxonomyOption | null;
  let nextOther: TaxonomyOption | null;

  if (own) {
    const isDeselect = own.value === value;
    nextOwn = isDeselect ? null : optionFor(kind, value);
    nextOther = isDeselect ? other : null;
  } else {
    nextOwn = optionFor(kind, value);
    nextOther = other;
  }

  const next: FilterState =
    kind === 'medium'
      ? { medium: nextOwn, surface: nextOther }
      : { medium: nextOther, surface: nextOwn };

  return filterPath(next);
}

function optionFor(kind: FilterKind, value: string): TaxonomyOption | null {
  return optionsFor(kind).find((option) => option.value === value) ?? null;
}

/** "Watercolour works", "Canvas works", "Watercolour on Canvas" for a combo —
 *  the conventional "medium on surface" art-label phrasing — or "Works" for
 *  the unfiltered view. One source for both the page <title> and its H1, so
 *  the two can't drift. */
export function filterHeading(state: FilterState): string {
  if (state.medium && state.surface) return `${state.medium.title} on ${state.surface.title}`;
  if (state.medium) return `${state.medium.title} works`;
  if (state.surface) return `${state.surface.title} works`;
  return 'Works';
}

/** Meta description for a filter route. Assumes at least one axis is set —
 *  only called from routes that always have one, never from /works. */
export function filterDescription(state: FilterState): string {
  const medium = state.medium?.title.toLowerCase();
  const surface = state.surface?.title.toLowerCase();
  if (medium && surface) return `Paintings by Rupjyoti Baruah worked in ${medium} on ${surface}.`;
  if (medium) return `Paintings by Rupjyoti Baruah worked in ${medium}.`;
  return `Paintings by Rupjyoti Baruah on ${surface}.`;
}
