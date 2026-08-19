/**
 * Local contrast sweep for the footer's photographic band.
 *
 * ARCHITECTURE.md §18 records the method but the tool that implemented it was
 * throwaway and did not survive the session that wrote it, so the next person
 * to touch footer colour had to rebuild it from the prose. This is that tool,
 * committed. Do not delete it when the footer next looks fine.
 *
 * WHY NOT SLICE AVERAGES: splitting the strip into ~10 vertical bands and
 * measuring text against each band's mean colour smooths away exactly the
 * pixel-level variance that makes type feel washed out on a photograph. That
 * method passed a link colour that measured 3.39:1 locally over a single gold
 * block. The unit here is a 16x16px window at the image's RENDERED scale,
 * swept across the box the glyphs actually occupy — not the block box, and not
 * the whole strip.
 *
 * WHAT IT MODELS: the footer's real background stack, in paint order —
 *   background-color: var(--bg-primary)      (opaque, fully covered below)
 *   var(--footer-texture)                    (background-size: cover,
 *                                             background-position: right center)
 *   linear-gradient(var(--footer-scrim), …)  (flat wash over the texture)
 * The top-edge bleed gradient is deliberately NOT modelled: it only occupies
 * the first --bleed pixels, no text sits there, and where it does apply it
 * pulls the plate toward --bg-primary, which raises contrast in both themes.
 * Omitting it is the conservative direction.
 *
 * Text alpha is composited over the sampled local background, then the ratio
 * is taken between that composite and the same background — which is how an
 * rgba() text token actually renders.
 *
 * Geometry comes from the real browser, not from arithmetic: run the
 * evaluate_script in the session notes (or any equivalent) to dump tight
 * Range.getClientRects() boxes per element, footer-relative, to JSON.
 *
 * Run: node scripts/footer-contrast.mjs <geometry.json> [...more.json]
 */
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const WINDOW = 16; // px, at rendered scale
const STRIDE = 4; // px between window origins — overlapping, so hot spots aren't stepped over
const AA_NORMAL = 4.5;

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
  if (!m) throw new Error(`unparseable colour: ${str}`);
  const parts = m[1].split(/[,/]/).map((p) => parseFloat(p.trim()));
  return { rgb: parts.slice(0, 3), alpha: parts.length > 3 ? parts[3] : 1 };
}

// Below this width Layout.astro drops the --footer-texture background-image
// layer entirely (kept as scrim + --bg-primary bleed only) — the single-column
// mobile footer scales the ~8.6:1 strip to several multiples of the viewport
// width at that point, so cover renders a soft gradient rather than legible
// texture. Below this width this script must render the SAME flat plate the
// browser does, or it measures a background nobody ever sees.
const TEXTURE_DROP_BELOW_VW = 480;

const THEMES = {
  light: {
    texture: 'public/images/footer-light.avif',
    scrim: 'rgba(250, 247, 244, 0.28)',
    bgPrimary: [250, 247, 244],
  },
  dark: {
    texture: 'public/images/footer-dark.avif',
    scrim: 'rgba(8, 7, 6, 0.36)',
    bgPrimary: [8, 7, 6],
  },
  // Text colours are read per-element from the geometry dump (getComputedStyle),
  // so this script never has to keep its own copy of --footer-text/--footer-muted
  // in sync with tokens.css. Whatever the browser resolved is what gets measured.
};

/**
 * Below TEXTURE_DROP_BELOW_VW: no image layer, just the flat scrim composited
 * over --bg-primary — exactly what the <480px media query in Layout.astro
 * renders. (The bleed gradient is still skipped, per renderPlate's own doc
 * comment: no text sits in it, and it only pulls the plate lighter/darker
 * toward --bg-primary, which is the conservative direction either way — and
 * below this width the plate already IS --bg-primary.) Returns raw RGB at
 * footer pixel scale, same shape as renderPlate's return.
 */
function renderFlatPlate(bgPrimary, scrimStr, fw, fh) {
  const W = Math.round(fw);
  const H = Math.round(fh);
  const scrim = parseRgba(scrimStr);
  const px = over(scrim.rgb, bgPrimary, scrim.alpha).map(Math.round);
  const data = Buffer.alloc(W * H * 3);
  for (let i = 0; i < data.length; i += 3) {
    data[i] = px[0]; data[i + 1] = px[1]; data[i + 2] = px[2];
  }
  return { data, width: W, height: H, sourceSlice: { from: 0, of: 0 } };
}

/**
 * Reproduce `background-size: cover; background-position: right center` exactly,
 * then flatten the scrim over it. Returns raw RGB at footer pixel scale.
 */
async function renderPlate(texturePath, scrimStr, fw, fh) {
  const W = Math.round(fw);
  const H = Math.round(fh);
  const meta = await sharp(texturePath).metadata();
  const scale = Math.max(W / meta.width, H / meta.height);
  const rw = Math.round(meta.width * scale);
  const rh = Math.round(meta.height * scale);

  const scrim = parseRgba(scrimStr);
  const { data } = await sharp(texturePath)
    .resize(rw, rh, { fit: 'fill' })
    .extract({
      left: Math.max(0, rw - W), // right-anchored
      top: Math.max(0, Math.round((rh - H) / 2)), // centered
      width: Math.min(W, rw),
      height: Math.min(H, rh),
    })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Flatten the scrim wash in place.
  for (let i = 0; i < data.length; i += 3) {
    data[i] = scrim.rgb[0] * scrim.alpha + data[i] * (1 - scrim.alpha);
    data[i + 1] = scrim.rgb[1] * scrim.alpha + data[i + 1] * (1 - scrim.alpha);
    data[i + 2] = scrim.rgb[2] * scrim.alpha + data[i + 2] * (1 - scrim.alpha);
  }
  return { data, width: Math.min(W, rw), height: Math.min(H, rh), sourceSlice: { from: rw - W, of: rw } };
}

/** Mean colour of one WINDOW-sized patch, clamped to the plate. */
function windowMean(plate, x0, y0) {
  let r = 0, g = 0, b = 0, n = 0;
  const xEnd = Math.min(plate.width, x0 + WINDOW);
  const yEnd = Math.min(plate.height, y0 + WINDOW);
  for (let y = Math.max(0, y0); y < yEnd; y++) {
    for (let x = Math.max(0, x0); x < xEnd; x++) {
      const i = (y * plate.width + x) * 3;
      r += plate.data[i]; g += plate.data[i + 1]; b += plate.data[i + 2];
      n++;
    }
  }
  return n ? [r / n, g / n, b / n] : null;
}

function sweep(plate, el) {
  const colour = parseRgba(el.color);
  let worst = Infinity;
  let worstAt = null;
  // Pad by a couple of px: antialiased glyph edges bleed just outside the
  // Range rect, and the eye reads the patch under the whole word.
  const pad = 2;
  const x1 = el.x - pad;
  const y1 = el.y - pad;
  const x2 = el.x + el.w + pad;
  const y2 = el.y + el.h + pad;
  for (let y = y1; y <= y2 - WINDOW || y === y1; y += STRIDE) {
    for (let x = x1; x <= x2 - WINDOW || x === x1; x += STRIDE) {
      const bg = windowMean(plate, Math.round(x), Math.round(y));
      if (!bg) continue;
      const eff = over(colour.rgb, bg, colour.alpha);
      const ratio = contrast(eff, bg);
      if (ratio < worst) {
        worst = ratio;
        worstAt = { x: Math.round(x), y: Math.round(y) };
      }
    }
  }
  return { worst, worstAt };
}

const files = process.argv.slice(2);
if (!files.length) {
  console.error('usage: node scripts/footer-contrast.mjs <geometry.json> [...]');
  process.exit(1);
}

let anyFail = false;

for (const file of files) {
  const geom = JSON.parse(readFileSync(file, 'utf8'));
  const { footer, elements, vw } = geom;

  // The dump carries the theme it was captured under, because el.color is a
  // RESOLVED getComputedStyle value — light-theme text measured against the
  // dark plate returns ~1.00:1 for everything, which looks like a catastrophic
  // failure and is really just the wrong pairing. One dump per theme.
  if (!geom.theme || !THEMES[geom.theme]) {
    throw new Error(`${file}: missing or unknown "theme" field (expected light|dark)`);
  }
  const themePairs = [[geom.theme, THEMES[geom.theme]]];

  for (const [themeName, theme] of themePairs) {
    const belowDrop = vw < TEXTURE_DROP_BELOW_VW;
    const plate = belowDrop
      ? renderFlatPlate(theme.bgPrimary, theme.scrim, footer.w, footer.h)
      : await renderPlate(theme.texture, theme.scrim, footer.w, footer.h);

    console.log(
      `\n═══ ${themeName.toUpperCase()}  ·  viewport ${vw}px  ·  footer ${footer.w}×${footer.h}px`
    );
    if (belowDrop) {
      console.log(
        `    texture: DROPPED (viewport < ${TEXTURE_DROP_BELOW_VW}px) — flat ` +
          `scrim-over-bg-primary plate, matching the real background at this width`
      );
    } else {
      const pct = ((plate.sourceSlice.of - plate.sourceSlice.from) / plate.sourceSlice.of) * 100;
      console.log(
        `    texture: showing rightmost ${pct.toFixed(1)}% of the strip ` +
          `(scaled to ${plate.sourceSlice.of}px wide)`
      );
    }
    console.log('    ' + '─'.repeat(72));

    // Collapse multi-line elements to their single worst window.
    const byName = new Map();
    for (const el of elements) {
      const { worst, worstAt } = sweep(plate, el);
      const prev = byName.get(el.name);
      if (!prev || worst < prev.worst) {
        byName.set(el.name, { worst, worstAt, fontSize: el.fontSize, color: el.color });
      }
    }

    const rows = [...byName.entries()].sort((a, b) => a[1].worst - b[1].worst);
    for (const [name, r] of rows) {
      const pass = r.worst >= AA_NORMAL;
      if (!pass) anyFail = true;
      const alpha = parseRgba(r.color).alpha.toFixed(2);
      console.log(
        `    ${pass ? 'PASS' : 'FAIL'}  ${r.worst.toFixed(2).padStart(5)}:1  ` +
          `${name.padEnd(17)} ${String(r.fontSize).padStart(5)}  a=${alpha}  ` +
          `worst@ ${r.worstAt.x},${r.worstAt.y}`
      );
    }
  }
}

console.log(
  `\n${anyFail ? '✗ at least one element is under 4.5:1' : '✓ every element clears AA 4.5:1'}\n`
);
process.exit(anyFail ? 1 : 0);
