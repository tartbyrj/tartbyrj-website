/**
 * Local contrast sweep for ANY photographic text surface, from a screenshot.
 *
 * Sibling to scripts/footer-contrast.mjs. Same method (ARCHITECTURE.md §18):
 * a 16x16px window at rendered scale, swept across the box the GLYPHS occupy —
 * not the block box, not the whole section, and never a slice average.
 *
 * WHY A SECOND TOOL: footer-contrast.mjs re-renders the footer's background
 * stack from its source layers (bg-primary + texture + scrim), which makes it
 * exact but footer-only. This one samples a real screenshot of the composited
 * page instead, so it works on any surface without modelling its paint order —
 * at the cost of needing a browser to produce the input. Written for the
 * /artist intro, which has a photographic backdrop and, unlike the footer, no
 * contrast tokens of its own (see SESSIONS.md 2026-09-02 cont'd, finding P1).
 *
 * footer-contrast.mjs opens by noting that the previous version of ITS method
 * was throwaway and had to be rebuilt from prose. Same reason this is
 * committed rather than left in a scratchpad. Do not delete it when /artist
 * next looks fine.
 *
 * DUPLICATION, ACKNOWLEDGED: luminance(), contrast(), over(), parseRgba() and
 * windowMean() below are near-verbatim copies of the same functions in
 * footer-contrast.mjs, not imports from a shared module — there is no
 * scripts/lib/ for the two to share. Deliberately not extracted this session:
 * footer-contrast.mjs is a working, independently-relied-on tool that
 * predates this one, and refactoring it to share code is a real change to a
 * file nothing here required touching, for a codebase that has exactly two
 * consumers of this math. If either script's WCAG math, WINDOW/STRIDE/AA_*
 * constants, or rgba parsing ever needs a fix, apply it to BOTH files and
 * verify both — they will not warn you that they've drifted apart. Extracting
 * a shared `scripts/lib/contrast.mjs` is the correct fix if a third surface
 * ever needs this, or if the two are caught disagreeing.
 *
 * ── HOW TO PRODUCE THE INPUTS ──────────────────────────────────────────────
 * Both come from the PRODUCTION BUILD (`npm run build && npm run preview`),
 * never the dev server: the Astro dev toolbar is a dark pill that floats over
 * page content and will be sampled as if it were background. That mistake
 * produced a bogus 1.05:1 reading the first time this was run.
 *
 * 1. Geometry — in the browser console, per theme:
 *
 *      document.documentElement.setAttribute('data-theme', 'light');
 *      document.querySelectorAll('.reveal').forEach(e => e.classList.add('visible'));
 *      const sel = ['.title-lead', '.prose p', '.location'];   // your targets
 *      const boxes = [];
 *      for (const s of sel) document.querySelectorAll(s).forEach((el, i) => {
 *        const cs = getComputedStyle(el);
 *        const range = document.createRange(); range.selectNodeContents(el);
 *        for (const r of range.getClientRects()) {
 *          if (r.width < 2 || r.height < 2) continue;
 *          boxes.push({ sel: s + (i ? `[${i}]` : ''), color: cs.color,
 *            fontSize: cs.fontSize, fontWeight: cs.fontWeight,
 *            x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height });
 *        }
 *      });
 *      copy(JSON.stringify({ dpr: devicePixelRatio, boxes }));
 *
 *    Range.getClientRects(), not getBoundingClientRect(): the latter returns
 *    the element's block box, which on a left-aligned line includes trailing
 *    whitespace no glyph occupies. Sweeping that samples background the text
 *    never sits on and reports contrast that is not real.
 *
 * 2. Background plate — hide the text, then full-page screenshot:
 *
 *      .copy, .copy * { visibility: hidden !important }
 *
 *    The descendant selector is required. `visibility: hidden` on the parent
 *    alone is overridden by anything that re-asserts `visible` on a child —
 *    .reveal.visible does exactly that, and the first run of this measured
 *    ink glyphs against ink glyphs because of it. ALWAYS verify with
 *    getComputedStyle(el).visibility === 'hidden' on a leaf node, and eyeball
 *    the crop, before trusting a single number.
 *
 * Run: node scripts/surface-contrast.mjs <geometry.json> <plate.png> [label]
 */
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const WINDOW = 16; // px, at rendered scale
const STRIDE = 4; // px between window origins — overlapping, so hot spots aren't stepped over
const AA_NORMAL = 4.5;
const AA_LARGE = 3.0; // >=24px, or >=18.66px at weight 700+

/** WCAG 2.x relative luminance from 0-255 sRGB. */
function luminance([r, g, b]) {
  const f = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** src over dst, both 0-255 triples, alpha 0-1. */
function over(src, dst, alpha) {
  return src.map((c, i) => c * alpha + dst[i] * (1 - alpha));
}

function parseRgba(str) {
  const m = /rgba?\(([^)]+)\)/.exec(str);
  if (!m) throw new Error(`unparseable color: ${str}`);
  const p = m[1].split(/[,/]/).map((s) => parseFloat(s.trim()));
  return { rgb: [p[0], p[1], p[2]], alpha: p.length > 3 ? p[3] : 1 };
}

/** Mean colour of one WINDOW-sized patch, clamped to the plate. */
function windowMean(img, x0, y0) {
  let r = 0, g = 0, b = 0, n = 0;
  const xEnd = Math.min(img.width, x0 + WINDOW);
  const yEnd = Math.min(img.height, y0 + WINDOW);
  for (let y = Math.max(0, y0); y < yEnd; y++) {
    for (let x = Math.max(0, x0); x < xEnd; x++) {
      const i = (y * img.width + x) * 3;
      r += img.data[i]; g += img.data[i + 1]; b += img.data[i + 2]; n++;
    }
  }
  return n ? [r / n, g / n, b / n] : null;
}

/**
 * Worst local contrast over one glyph box. Text alpha is composited over the
 * sampled local background and the ratio taken against that same background —
 * which is how an rgba() token actually renders.
 */
function sweep(img, el, dpr) {
  const { rgb, alpha } = parseRgba(el.color);
  const px = (v) => Math.round(v * dpr);
  const pad = 2 * dpr;
  const x1 = px(el.x) - pad, y1 = px(el.y) - pad;
  const x2 = px(el.x + el.w) + pad, y2 = px(el.y + el.h) + pad;
  let min = Infinity, at = null;
  // Both loop conditions carry `|| y === y1` / `|| x === x1`, same as
  // footer-contrast.mjs's sweep(): without it, a glyph box shorter or
  // narrower than WINDOW (16px) after padding produces zero iterations, `min`
  // never leaves Infinity, and the caller's `min >= threshold` check reports a
  // false PASS for a selector that was never actually sampled. Coordinates are
  // rounded at the point they're used to index the pixel buffer — `dpr` is
  // read live from the browser and is not guaranteed to be an integer (125%
  // OS display scaling, browser zoom), and windowMean() indexes a raw
  // Uint8Array/Buffer, which silently returns undefined for a non-integer
  // index rather than throwing; that propagates to NaN, which then never
  // satisfies `c < min`, silently dropping every corrupted window and
  // degenerating to the same Infinity-stays-PASS failure by a different path.
  for (let y = y1; y <= y2 - WINDOW || y === y1; y += STRIDE) {
    for (let x = x1; x <= x2 - WINDOW || x === x1; x += STRIDE) {
      const bg = windowMean(img, Math.round(x), Math.round(y));
      if (!bg) continue;
      const c = contrast(over(rgb, bg, alpha), bg);
      if (c < min) { min = c; at = [Math.round(x), Math.round(y)]; }
    }
  }
  return { min, at };
}

const [geomPath, imgPath, label = 'surface'] = process.argv.slice(2);
if (!geomPath || !imgPath) {
  console.error('usage: node scripts/surface-contrast.mjs <geometry.json> <plate.png> [label]');
  process.exit(2);
}

const g = JSON.parse(readFileSync(geomPath, 'utf8'));
const geom = g.result ?? g; // tolerate a devtools-wrapped dump
const raw = await sharp(imgPath).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const img = { data: raw.data, width: raw.info.width, height: raw.info.height };

console.log(`\n=== ${label} === plate ${img.width}x${img.height}, dpr ${geom.dpr}`);

// One row per selector, carrying its worst window across every line box it
// occupies — a selector passes only if its worst line passes.
const worst = new Map();
for (const el of geom.boxes) {
  const size = parseFloat(el.fontSize);
  const bold = parseInt(el.fontWeight, 10) >= 700;
  const threshold = size >= 24 || (bold && size >= 18.66) ? AA_LARGE : AA_NORMAL;
  const { min, at } = sweep(img, el, geom.dpr);
  const key = el.sel.replace(/\[\d+\]$/, '');
  const prev = worst.get(key);
  if (!prev || min < prev.min) worst.set(key, { min, at, threshold, size, color: el.color });
}

let fails = 0;
for (const [sel, r] of worst) {
  const ok = r.min >= r.threshold;
  if (!ok) fails++;
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${sel.padEnd(18)} ${String(Math.round(r.size)).padStart(3)}px  ` +
      `min ${r.min.toFixed(2)}:1  (needs ${r.threshold})  worst @ ${r.at?.join(',')}  ${r.color}`
  );
}
console.log(`${fails} failing selector(s)`);
process.exit(fails > 0 ? 1 : 0);
