/**
 * Justified-row packing for the /works gallery.
 *
 * Pure TypeScript — no Astro, no DOM, no measuring. It runs in page frontmatter
 * at build time, which is the whole point: the browser receives finished
 * geometry and never reflows a gallery.
 *
 * What it computes is the *composition* of each row (which works sit together,
 * and in what proportion), not a set of literal pixel widths to be hardcoded
 * into the page. The caller renders each item as a `share` of its row, so the
 * gallery stays fluid at every viewport while keeping exactly the proportions
 * decided here. `width` and `height` are still returned in pixels because the
 * <img> width/height attributes need real numbers to reserve space with.
 *
 * `containerWidth` is therefore a *reference* width, not a promise about the
 * viewport. Pick one that represents the layout at its intended size; rows
 * scale proportionally away from it.
 */

/** Fallback proportion for an image with no usable metadata — 4:5 portrait,
 *  the commonest painting proportion in this collection and the ratio the old
 *  grid cropped every tile to. An artwork with incomplete metadata is laid out
 *  on this assumption rather than dropped. */
export const DEFAULT_ASPECT_RATIO = 0.8;

export interface JustifiableItem {
  /** width / height. Missing, zero, negative or non-finite falls back. */
  readonly aspectRatio?: number | null;
}

export interface JustifyOptions {
  /** Reference width of the row container, in px. */
  containerWidth: number;
  /** Height a row aims for before it is justified to the container. */
  targetHeight: number;
  /** Horizontal space between tiles, in px. */
  gap: number;
  /** Floor for a row's height. Governs *composition*, not just the final
   *  number: a row that would justify below this gives its last item back to
   *  the next row rather than collapsing into a strip of thumbnails. */
  minHeight?: number;
  /** Ceiling for a row's height. Bounds the row left behind by that split,
   *  which is short and therefore scales up — an unbounded one is the
   *  "enormous sparse row" this layout is famous for. */
  maxHeight?: number;
  fallbackAspectRatio?: number;
}

export interface PackedItem<T> {
  item: T;
  /** Resolved proportion actually used (never zero, never NaN). */
  aspectRatio: number;
  /** Rendered width at `containerWidth`, in px. */
  width: number;
  /** width / (containerWidth − gaps). Shares in a full row sum to 1; in a
   *  clamped or final row they sum to less, and the row under-fills by
   *  exactly that much at every viewport. */
  share: number;
}

export interface PackedRow<T> {
  items: PackedItem<T>[];
  /** Height shared by every item in the row, in px. */
  height: number;
  /** Total horizontal gap in the row: gap × (items − 1). */
  gapTotal: number;
  /** True for the trailing partial row, which is never scaled up to fill. */
  isLastRow: boolean;
  /** True when minHeight/maxHeight changed the height, so the row deliberately
   *  does not span the container. Useful in tests and when debugging a route
   *  that renders sparse. */
  clamped: boolean;
}

function positiveOr(value: number | null | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback;
}

export function justifyRows<T extends JustifiableItem>(
  items: readonly T[],
  options: JustifyOptions
): PackedRow<T>[] {
  const fallbackRatio = positiveOr(options.fallbackAspectRatio, DEFAULT_ASPECT_RATIO);
  const containerWidth = positiveOr(options.containerWidth, 1);
  const targetHeight = positiveOr(options.targetHeight, 1);
  const gap = Math.max(0, positiveOr(options.gap, 0));
  const minHeight = Math.max(0, positiveOr(options.minHeight, 0));
  const maxHeight = positiveOr(options.maxHeight, Number.POSITIVE_INFINITY);

  const rows: PackedRow<T>[] = [];
  let pending: { item: T; aspectRatio: number }[] = [];
  let ratioSum = 0;

  function closeRow(isLastRow: boolean): void {
    if (pending.length === 0) return;

    const gapTotal = gap * (pending.length - 1);
    // Floor of 1 so a container narrower than its own gaps still divides.
    const available = Math.max(1, containerWidth - gapTotal);

    // A closed row is justified: its height is whatever makes the widths sum to
    // the container exactly. The final row is the opposite case — left at
    // targetHeight and never stretched to fill, which is the single most common
    // failure of this layout pattern.
    const rawHeight = isLastRow ? targetHeight : available / ratioSum;
    const clampedHeight = Math.min(Math.max(rawHeight, minHeight), maxHeight);

    // Overflow guard, and the only thing allowed to overrule a clamp. Raising a
    // row's height widens it, so an unchecked minHeight would push the row past
    // the container and hand the page a horizontal scrollbar. Splitting the row
    // (see the loop) is how the floor is normally honoured; this catches the one
    // case a split cannot help — a single work too wide to reach the floor on
    // its own — by letting it render short rather than overflow.
    const height = Math.min(clampedHeight, available / ratioSum);
    const clamped = height !== rawHeight;

    rows.push({
      isLastRow,
      height,
      gapTotal,
      clamped,
      items: pending.map(({ item, aspectRatio }) => {
        const width = aspectRatio * height;
        return { item, aspectRatio, width, share: width / available };
      }),
    });

    pending = [];
    ratioSum = 0;
  }

  /** Width the pending row would occupy if laid out at the target height. */
  const widthAtTarget = () => ratioSum * targetHeight + gap * (pending.length - 1);
  /** Height the pending row lands on once justified to the container. */
  const justifiedHeight = () =>
    Math.max(1, containerWidth - gap * (pending.length - 1)) / ratioSum;

  // Strictly in order. Reading order is the sort order the GROQ query chose,
  // and packing must not become a second, invisible sort.
  for (const item of items) {
    const aspectRatio = positiveOr(item.aspectRatio, fallbackRatio);
    pending.push({ item, aspectRatio });
    ratioSum += aspectRatio;

    if (widthAtTarget() < containerWidth) continue;

    // The row is full. But "full" can still be too short to look at: one very
    // wide work joining a row of four already-wide ones justifies everything
    // down to a strip. When that happens the newcomer is handed back to the
    // next row, and the row it left behind — now under-wide — scales up to
    // fill, bounded by maxHeight.
    const overflow = pending.length > 1 && justifiedHeight() < minHeight ? pending.at(-1) : undefined;

    if (overflow) {
      pending = pending.slice(0, -1);
      ratioSum -= overflow.aspectRatio;
      closeRow(false);

      pending = [overflow];
      ratioSum = overflow.aspectRatio;
      // That work may be wide enough to fill a row by itself; close it now
      // rather than let it gather neighbours it would only squash again.
      if (widthAtTarget() >= containerWidth) closeRow(false);
      continue;
    }

    closeRow(false);
  }

  closeRow(true);

  return rows;
}
