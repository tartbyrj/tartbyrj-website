/**
 * Turns src/assets/about/artist.png into a real transparent cutout.
 *
 * The source file was exported with the editor's transparency checkerboard
 * flattened INTO the pixels — alpha is 255 everywhere, and what looks like
 * empty space is opaque grey squares (~#f3f3f3 / ~#d8d8d8). Composited over
 * the About page background that checkerboard would simply be visible.
 *
 * Three passes, in this order for a reason:
 *
 *   1. Key every pixel that looks like checkerboard — near-neutral grey at one
 *      of the two tones. A global key rather than a flood fill inward from the
 *      border: the checkerboard has pockets the artist's silhouette closes off
 *      from the edge, and a fill can't reach those, so they survive as loose
 *      grey squares floating beside him.
 *   2. Put back anything the key hit that ISN'T reachable from the border —
 *      those are holes punched inside the artist himself (a neutral highlight
 *      on the shirt at just the wrong value), not background.
 *   3. Keep only the largest remaining blob, which drops the stray cells that
 *      pass 2 because they're enclosed. He is one solid silhouette, so this
 *      needs no threshold of its own.
 *
 * The mask is then feathered by a pixel and cropped to the subject.
 *
 * Run: node scripts/key-artist-cutout.mjs
 */
import sharp from 'sharp';

const SRC = 'src/assets/about/artist.png';
const OUT = 'src/assets/about/artist-cutout.png';

// Checkerboard tones, and how far from neutral/either tone a pixel may sit and
// still count as background. Generous on tone, tight on neutrality — the
// artist's shirt is a warm beige, so channel spread is what separates it from
// any grey.
const TONES = [243, 216];
const TONE_TOLERANCE = 14;
const MAX_CHANNEL_SPREAD = 14;

const isBackground = (r, g, b) => {
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  if (spread > MAX_CHANNEL_SPREAD) return false;
  const lum = (r + g + b) / 3;
  return TONES.some((tone) => Math.abs(lum - tone) <= TONE_TOLERANCE);
};

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;

// ── 1. Global tone key ───────────────────────────────────────────────────────
const bg = new Uint8Array(W * H);
for (let i = 0; i < W * H; i++) {
  const o = i * C;
  if (isBackground(data[o], data[o + 1], data[o + 2])) bg[i] = 1;
}

// ── 2. Keep only the largest keyed-out-of blob ─────────────────────────
// Some checkerboard cells sit a shade outside the tones above and survive the
// key as loose grey squares. The artist is one solid silhouette and by far the
// biggest thing left, so taking the largest component alone clears every one of
// them without another threshold to tune — and it has to happen BEFORE holes
// are filled, or the enclosed pockets of checkerboard between those squares get
// restored as "interior" and the squares end up welded to him.
const label = new Int32Array(W * H).fill(-1);
let best = -1;
let bestSize = 0;

for (let seed = 0; seed < W * H; seed++) {
  if (bg[seed] || label[seed] !== -1) continue;
  const id = seed;
  let size = 0;
  const queue = [seed];
  label[seed] = id;
  while (queue.length) {
    const i = queue.pop();
    size++;
    const x = i % W;
    const y = (i - x) / W;
    const visit = (nx, ny) => {
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) return;
      const n = ny * W + nx;
      if (bg[n] || label[n] !== -1) return;
      label[n] = id;
      queue.push(n);
    };
    visit(x + 1, y); visit(x - 1, y); visit(x, y + 1); visit(x, y - 1);
  }
  if (size > bestSize) { bestSize = size; best = id; }
}

let islands = 0;
for (let i = 0; i < W * H; i++) {
  if (!bg[i] && label[i] !== best) { bg[i] = 1; islands++; }
}
console.log(`islands    ${islands} stray px dropped, subject blob ${bestSize} px`);

// ── 3. Fill small holes inside the subject ──────────────────────────────────
// Keyed pixels that can't be walked back to the image border without crossing
// the subject are holes punched inside him — a neutral highlight on the shirt
// landing at just the wrong value — and get put back.
//
// Only the small ones, though. A couple of checkerboard cells sit in the
// concave pocket between his forearm and his body, where his own outline seals
// them off from the border, so they read as "interior" on this test exactly the
// way a highlight does and were the last two grey squares left in the output.
// Size is what actually separates the two cases here: measured against this
// photo, genuine holes come out at 56px and under (the biggest is the
// pocket above — most are 1-6px) while a checkerboard cell is 531-1708px.
// 200 sits between the two with real margin either side (~3.6x the largest
// real hole, ~2.7x under the smallest checkerboard cell), not tuned to the
// edge of either. Re-measure both ends on a new source photo before
// trusting this number unchanged — a different pose or crop could shift
// either distribution.
const HOLE_MAX_PX = 200;

const outside = new Uint8Array(W * H);
const stack = [];
const push = (x, y) => {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = y * W + x;
  if (outside[i] || !bg[i]) return;
  outside[i] = 1;
  stack.push(i);
};

for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); }
for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y); }

while (stack.length) {
  const i = stack.pop();
  const x = i % W;
  const y = (i - x) / W;
  push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
}

const seen = new Uint8Array(W * H);
let holes = 0;
let pockets = 0;

for (let seed = 0; seed < W * H; seed++) {
  if (!bg[seed] || outside[seed] || seen[seed]) continue;
  const members = [seed];
  seen[seed] = 1;
  for (let head = 0; head < members.length; head++) {
    const i = members[head];
    const x = i % W;
    const y = (i - x) / W;
    const visit = (nx, ny) => {
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) return;
      const n = ny * W + nx;
      if (!bg[n] || outside[n] || seen[n]) return;
      seen[n] = 1;
      members.push(n);
    };
    visit(x + 1, y); visit(x - 1, y); visit(x, y + 1); visit(x, y - 1);
  }
  if (members.length > HOLE_MAX_PX) { pockets++; continue; }
  for (const i of members) bg[i] = 0;
  holes += members.length;
}

console.log(`holes      ${holes} px restored as subject, ${pockets} large pocket(s) left keyed`);

// ── Alpha, then a one-pixel feather ──────────────────────────────────────────
// Pixels bordering the keyed region are part checkerboard, part subject — a
// hard 0/255 cut there leaves a grey fringe. Eroding the subject by a pixel
// drops the worst of that fringe, and blurring the alpha softens what's left
// so the edge doesn't read as cut out with scissors.
const alpha = Buffer.alloc(W * H);
for (let i = 0; i < W * H; i++) alpha[i] = bg[i] ? 0 : 255;

const eroded = Buffer.from(alpha);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    if (!alpha[i]) continue;
    const neighbourIsBg =
      (x > 0 && !alpha[i - 1]) || (x < W - 1 && !alpha[i + 1]) ||
      (y > 0 && !alpha[i - W]) || (y < H - 1 && !alpha[i + W]);
    if (neighbourIsBg) eroded[i] = 0;
  }
}

// Separable box blur, written out rather than handed to sharp: sharp expands a
// 1-channel raw buffer to 3 channels on the way out, so reading the result back
// as a single alpha plane silently reads at the wrong stride and shreds the
// mask into stripes.
const boxBlur = (src, radius) => {
  const tmp = Buffer.alloc(W * H);
  const out = Buffer.alloc(W * H);
  const span = radius * 2 + 1;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let sum = 0;
      for (let d = -radius; d <= radius; d++) {
        sum += src[y * W + Math.min(W - 1, Math.max(0, x + d))];
      }
      tmp[y * W + x] = sum / span;
    }
  }
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
      let sum = 0;
      for (let d = -radius; d <= radius; d++) {
        sum += tmp[Math.min(H - 1, Math.max(0, y + d)) * W + x];
      }
      out[y * W + x] = sum / span;
    }
  }
  return out;
};

const softAlpha = boxBlur(eroded, 1);

for (let i = 0; i < W * H; i++) data[i * C + 3] = softAlpha[i];

// ── Crop to the subject ──────────────────────────────────────────────────────
let minX = W, maxX = -1, minY = H, maxY = -1;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (data[(y * W + x) * C + 3] > 8) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

const cropW = maxX - minX + 1;
const cropH = maxY - minY + 1;

await sharp(data, { raw: { width: W, height: H, channels: C } })
  .extract({ left: minX, top: minY, width: cropW, height: cropH })
  .png({ compressionLevel: 9 })
  .toFile(OUT);

const keptPct = ((1 - bg.reduce((n, v) => n + v, 0) / (W * H)) * 100).toFixed(1);
console.log(`source     ${W}x${H}`);
console.log(`subject    ${keptPct}% of pixels`);
console.log(`bbox       x ${minX}-${maxX}  y ${minY}-${maxY}`);
console.log(`wrote      ${OUT}  ${cropW}x${cropH}  (aspect ${(cropW / cropH).toFixed(3)})`);
