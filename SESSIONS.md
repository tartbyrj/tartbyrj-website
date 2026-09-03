# T.Art by RJ — Session Log
> Compact handoff document. One entry per work session.
> Paste last 1-2 entries at top of new Claude Code session for instant context.
> Project: Astro v7 + Sanity (ID: tuvy3sp7) + Cloudflare Pages
> Artist: Rupjyoti Baruah | Studio: T.Art by RJ

---

## Session: 2026-09-02 (cont'd) — `/impeccable audit` of /artist, sitewide detector sweep, deck alt-text pipeline

> **RESUMING? START HERE. FIX QUEUE IS COMPLETE (8/8) — then a `/code-review
> high` pass on the diff found 8 more real issues in items 1, 2, and 5–8's own
> code, 6 of which are now also fixed.** Six files uncommitted total — see
> notes below for what's in each. DESIGN.md (item 8) is gitignored,
> working-tree only, nothing to commit there. Two unrelated content findings
> (placeholder alt text on the homepage, placeholder Statement text on a live
> collection) are still flagged but not fixed — both need a Studio edit, not
> code, see below.

### Code review round — `/code-review high` on the uncommitted diff
Run by the user against everything above, not by me. Found 8 issues; I
verified each against the actual source before touching anything (per
receiving-code-review — technical rigor, not blind implementation), then
fixed 6, corrected one of my own inaccurate claims, and left one unfixed with
its risk documented. All fixes re-passed `astro check` (0/0/0) and
`npm run build` (clean, 32 pages).

**Fixed:**
- **Plate-button `aria-label` carried the full alt transcription.** Item 1's
  own aria-label appended `pageAlts[i]` — up to 553 characters — to the
  thumbnail button that OPENS the lightbox, not just to the lightbox `<img
  alt>` where it belongs. A screen reader would announce the entire spread
  transcription as that button's accessible name on focus, before the dialog
  even opened, once per page in the grid. Fixed: the button's aria-label is
  back to `View page N of M full screen`; `data-alts` and the lightbox
  `img.alt` still carry the full text, verified separately in the built HTML
  (`data-alts` lengths unchanged at 450/553; new aria-labels confirmed short).
- **`surface-contrast.mjs` had a real correctness bug: small elements or
  fractional `devicePixelRatio` produced a silent false PASS.** `sweep()`'s
  loop had no iterations when a glyph box was shorter/narrower than the 16px
  window even after padding, or when a fractional dpr made every sampled
  coordinate non-integer (NaN from indexing a typed array at a non-integer
  offset) — either way `min` stayed `Infinity`, and `Infinity >= 4.5` reports
  PASS for a selector that was never actually measured. Ported the two
  defensive patterns already proven correct in `footer-contrast.mjs`: `|| y
  === y1` / `|| x === x1` loop fallbacks, and `Math.round()` at the point
  coordinates are used to index pixels. Re-ran all four saved geometry/
  screenshot pairs from item 2's verification through the fixed tool — **same
  numbers as before** (dpr was 2, an integer, throughout this session, so the
  bug never fired on anything already reported) — but the tool is now correct
  for any future run at a fractional dpr or on a smaller selector.
- **`.cursor-ring`'s border thickened on hover** — a real regression from
  item 5, and my own "pixel-identical" claim for that fix was wrong.
  `transform: scale(1.4706)` scales the entire painted box, border stroke
  included, so the declared 1px border rendered at ~1.47px on hover. Added
  `border-width: 0.68px` (`= 1 ÷ 1.4706`) to the hover state to scale back
  toward 1px. **Not exact**: browsers snap hairline border-widths to the
  nearest device-pixel-aligned value before any transform runs — measured
  live at dpr 2, the declared 0.68px reads back as computed `0.5px`, not
  0.68px — so the compensation is a real improvement, not perfect parity, and
  the exact result is dpr-dependent. Judged not worth chasing further: this
  is a decorative, `opacity: 0.5` ring, true pixel parity across every dpr
  would require not scaling the border at all (a separate non-scaled
  pseudo-element for the stroke), and that's real complexity this element
  doesn't earn. **Correcting my earlier claim:** item 5's "pixel-identical" /
  "exact match" language was accurate for the outer box dimensions only
  (confirmed via `getBoundingClientRect`: 5×5 and 50×50, unchanged) — it did
  not hold for the border stroke, which I hadn't checked. Both are documented
  in the CSS now, not just in this log.
- **`--intro-muted`'s own comment mis-cited its precedent.** It claimed to
  follow "the same pattern as tokens.css's `--footer-text`/`--footer-muted`"
  — factually wrong, since those live in `tokens.css` (global) and
  `--intro-muted` was deliberately declared inside `artist.astro`'s own
  component style. Corrected the comment to name the real, applicable
  precedent already in the same file: `--scrim`, which is page-local for the
  identical reason (a value with exactly one consumer, no reuse case). Did
  **not** move the token to `tokens.css` — that would fix the letter of
  CLAUDE.md's "add it to tokens.css first" rule while breaking the file's own
  already-established `--scrim` pattern for genuinely page-specific values.
- **Sanity fetch and `getImage()` ran sequentially with no dependency between
  them.** `raw = await client.fetch(...)` then, ~80 lines later, `backdrop =
  await getImage(...)` — the latter's only input is a static local import,
  independent of the Sanity result. Restructured to `Promise.all([...])`,
  moved the BACKDROP comment block up to sit with it. Build-time-only (SSG),
  so the real-world saving is small on a 32-page build, but it was a free,
  zero-risk fix. Verified the page still renders correctly after the
  restructure: backdrop image resolved, biography text present, portrait
  loaded — checked live, not assumed from the diff.

**Left unfixed, with the risk written down:**
- **`storyPages`'s new alt field is named `alt`; `artwork.ts`'s equivalent is
  `altText`.** Real inconsistency. **Not renamed**, because renaming a Sanity
  field name is a dataset change, not a code change: two collection documents
  already have real alt text authored under the key `alt` in the live
  production dataset (see the code-review-triggering session's own work,
  above). Renaming the schema field without first migrating those values to
  the new key would make Studio show them as empty — not deleted, but
  invisible to the next person who opens it, which is worse than leaving the
  inconsistency named and explained. Documented inline in
  `sanity/schemas/collection.ts`: fix via a proper Sanity migration that
  copies `storyPages[].alt` → `storyPages[].altText` across the dataset
  first, then rename the field.

**Investigated, not a bug:**
- **`surface-contrast.mjs` duplicates `footer-contrast.mjs`'s WCAG math
  instead of sharing a module.** True — `luminance()`, `contrast()`, `over()`,
  `parseRgba()`, `windowMean()` are near-verbatim copies, no `scripts/lib/`
  exists for them to share. Not extracted this session: `footer-contrast.mjs`
  is a working, independently-relied-on tool nothing here required touching,
  and there are exactly two consumers of this math today. Documented in
  `surface-contrast.mjs`'s own header as an acknowledged risk (a fix to one's
  constants or math has to be applied to both, and neither will warn you if
  they drift) with the extraction path named for whenever a third surface or
  an actual disagreement between the two makes it worth doing.

### Completed
- **`/impeccable audit src/pages/artist.astro`** — scored **15/20 (Good)**.
  A11y 3 · Performance 3 · Theming 3 · Responsive 3 · Integrity 3.
  Implementation Integrity verdict: **PASS** (zero hex in ~700 lines of CSS,
  two-voice type rule held, one-accent rule held, portrait ratio locked to the
  source file). Full finding list is the fix queue below.
- **Sitewide detector sweep** — `detect.mjs` over `src/pages src/layouts
  src/components`: 66 findings across 8 files. Ran specifically to decide two
  questions the single-page audit could not answer (see Decisions).
- **Deck alt-text pipeline built and shipped** (fix queue item 1). `storyPages`
  images now carry an author-supplied `alt`; the lightbox sets `img.alt` per
  page and the plate buttons append it to their `aria-label`.
- **`scripts/surface-contrast.mjs`** — new, committed. Generalises
  `footer-contrast.mjs`'s 16×16px local sweep to any photographic text surface
  by sampling a screenshot instead of re-rendering the background stack.
  Written to measure the /artist intro (queue item 2) and to stop that method
  being rebuilt from prose a third time. **Read its header before using it** —
  it documents the two measurement traps that produced false numbers in this
  session.
- **Fix queue item 2 — `.location` contrast, fixed.** New page-scoped token
  `--intro-muted` on `.artist` (light `rgba(26,20,18,0.68)`, dark
  `rgba(240,235,227,0.58)`), used only by `.location` — same pattern as
  tokens.css's `--footer-text`/`--footer-muted`, not a global bump to
  `--text-muted` (everything else on this backdrop already cleared 4.5 by a
  wide margin). Re-verified with `surface-contrast.mjs` against a fresh
  production build/screenshot, same method as the audit: **light 4.40→5.25:1,
  dark 4.47→5.53:1**, both now real passes. Screenshot-diffed against the
  pre-fix render — no visible change.
- **Fix queue item 3 — `.available-item` 88px, fixed.** `clamp(32px, 7.3vw,
  88px)` → `clamp(32px, 6.6vw, 80px)`. 6.6vw, not left at 7.3vw, to hold the
  original crossover viewport (~1205px, where the fluid value first hits the
  cap) constant — only the ceiling moved, not the shape of the curve.
  Verified at 1920px: `.available-item` and the homepage hero name
  (`.hero-name`) both resolve to exactly **80px** — tied, not exceeding, which
  is what DESIGN.md's "single largest text on the site" claim requires. At
  1024px the rendered size (67.584px) matches `1024 × 0.066` to the decimal,
  confirming the curve math. No horizontal overflow, no wrapping regression at
  1024/1440/1920 — screenshotted at 1440 dark theme, three-item list reads
  clean. Stale comment claiming this size was "pushed a further step past the
  original ceiling" removed; replaced with the 80px-cap rationale and a
  pointer back to how it was decided (grep every clamp ceiling in the repo,
  not by eye).
- **Fix queue item 4 — `.available-cta` touch target, fixed.** Was 189×25px
  against DESIGN.md's 44px floor. Fixed with a `::before` expanded hit area
  (`position: absolute; height: 44px`, vertically centred via
  `top:50%; transform:translateY(-50%)`) rather than padding — padding would
  have pushed the underline away from the text or grown the visible box.
  Zero visual change: underline, type size and weight are byte-identical to
  before. This is the pattern WCAG 2.2's own understanding doc for SC 2.5.8
  describes for a thin inline link that must stay visually thin. Verified by
  hit-testing `elementFromPoint` at offsets from the visible box's centre:
  hits the anchor from **−22px to +20px**, misses outside that — a real 44px
  clickable band, not just a claim. Screenshotted before/after: pixel-identical.
- **Fix queue item 5 — cursor `width`/`height` transition, fixed, sitewide.**
  `Layout.astro`'s `.cursor`/`.cursor-ring` hover transition moved from
  `width, height` (layout properties) to `transform: scale()`
  (compositor-only). Boxes now stay fixed at 9px/34px in both states — only
  the paint scales. Scale factors (0.5556, 1.4706) are exact ratios of the old
  hover sizes (5/9, 50/34), chosen so the visual result is pixel-identical, not
  approximate. `translate(-50%,-50%)` (the existing centring transform)
  resolves against the element's own unscaled box before `scale()` applies in
  the same transform list, so centring is unaffected. Verified: rest-state
  `getComputedStyle` width/height unchanged (9px/34px) with
  `transitionProperty: transform`; hovered a real nav link via the
  chrome-devtools `hover` tool and read `getBoundingClientRect()` post-
  transition — **5×5px cursor, 50×50px ring, exact match to the pre-fix
  values**. Also checked the one place that manipulates these nodes directly:
  the collection lightbox physically moves `#cursor`/`#cursor-ring` into the
  `<dialog>` while open (to escape top-layer stacking) — confirmed that still
  works and the nodes keep `transitionProperty: transform` after the move.
- **Fix queue item 6 — `will-change` never released, fixed.** Was a static
  CSS declaration on `.backdrop`'s resting rule, so it held a compositor layer
  open for the page's entire lifetime — including under reduced-motion, where
  the parallax script's whole `if` branch (and the only place that ever writes
  a transform) never runs. Moved from CSS into that same branch in the script,
  set once alongside the scroll listeners rather than toggled on/off, since
  there's no point in this page's lifecycle where the parallax "ends" while
  the section still exists to release it into. Verified both branches for
  real, not by reading code alone: normal motion —
  `backdrop.style.willChange` is `'transform'` and the transform actually
  moves on scroll (`matrix(1,0,0,1,0,49.75)` at scrollY 400). Reduced motion —
  forced via an `initScript` that monkey-patches `matchMedia()` for
  `prefers-reduced-motion` before the page's own scripts run (this MCP's
  `emulate` tool has no media-feature override, so this was the only way to
  drive a *real* reduced-motion pass rather than reasoning from the source):
  `getComputedStyle(backdrop).willChange` reads **`'auto'`**, and the
  transform stays at identity even after scrolling — confirms the leak is
  actually gone, not just reasoned away.
- **Fix queue item 7 — one of the two off-scale radii, fixed; the other
  confirmed a false positive, not touched.**
  - `.deck-cta` (`collections/[slug].astro`) — `border-radius: 2px` → `0`.
    This is the mobile-only bar that replaces the plate grid as the way into
    the deck lightbox below 768px: it sits in normal document flow, not
    floating over an image, so per DESIGN.md's Sharp-vs-Pill rule it's the
    sharp register, same as every other CTA and panel on the site — not a
    third, in-between value. Verified live at 500px: `borderRadius: '0px'`,
    and confirmed still `display: none` at 1024px (no regression to the
    breakpoint itself). Screenshotted — reads as a clean rectangle CTA,
    unchanged otherwise.
  - `#main-content:focus-visible` / global `a:focus-visible,button:focus-visible`
    (`Layout.astro:440`, `global.css:144`) — **left at 1px, not a real
    finding.** Read both rules: identical values (`outline: 2px solid
    var(--accent); outline-offset: 3px; border-radius: 1px`), duplicated only
    because Astro's scoped CSS can't reach elements outside its own component
    (documented in both files' own comments — `#main-content` lives in
    Layout.astro's markup so it needs the scoped copy, `a`/`button` need the
    unscoped one to reach every other component). This is an accessibility
    focus-ring detail applied consistently sitewide, not a
    content/component shape decision — DESIGN.md's Sharp-vs-Pill rule
    governs artwork frames, buttons, chips, badges, not outline rendering.
    Rounding a 2px outline sitting 3px off a rectangle to 0 or 6 or 999 would
    look worse, not more on-system. Detector false positive; do not
    "fix" this if it resurfaces.
- **All six fixes uncommitted, three files.** `src/pages/artist.astro` (items
  2, 3, 4, 6), `src/layouts/Layout.astro` (item 5), and
  `src/pages/collections/[slug].astro` (item 7); `astro check` 0/0/0, build
  clean 32 pages after each. Not yet git-added.
- **Fix queue item 8 — DESIGN.md regenerated. FIX QUEUE COMPLETE.**
  "Elevation & Depth" no longer cites the two deleted /artist shadows
  (`drop-shadow(0 24px 34px …)` on the cutout, `box-shadow: 0 18px 46px …` on
  the framed-portrait fallback) — both gone since the studio-photo rebuild
  earlier this session. The section now names shadow's one surviving use (the
  homepage hero plate) and says explicitly that /artist is border-only now,
  not silently drops the old claim. Grepped for `88px`, `cursor-hover`,
  `is-cutout`, `is-framed`, `4 / 5` and other implementation numbers touched
  this session — none appear in DESIGN.md, so no further doc drift from items
  2–7 to chase. Three "About page" → "Artist page" wording fixes elsewhere in
  the doc (Overview, Paper Elevated, Headline), left over from the route
  rename earlier this session. **`DESIGN.md` is gitignored** (this session's
  earlier decision) — this edit exists only in the working tree, same as the
  PRODUCT.md edits from the rename. No code touched, so no check/build to
  re-run for this item.

### Second new finding — not fixed, flagged only
- **Placeholder statement text shipped live on a real collection.**
  `worlds-within-walls`'s Statement field (the pull-quote under the tagline)
  reads literally **"this is sample collection"** — confirmed by direct
  `getComputedStyle`/`textContent` read against the live page, at both mobile
  and desktop widths, not a rendering artifact. Same class of bug as the
  Threshold placeholder alt text above: real test/scaffold copy left in a
  Sanity field on a document that is otherwise fully published and live on
  the site's actual collections index. Found incidentally while
  screenshotting the mobile `.deck-cta` fix; out of scope for this session's
  fix queue, not fixed. Content fix in Studio → Collections → Worlds Within
  Walls → Description (Statement).

### New finding — not fixed, flagged only
- **Placeholder alt text shipped live on the homepage.** The "Threshold"
  artwork tile's `alt` (and its `<img>` alt) is the Sanity field's own
  *help text* — `"Describe what is visible in the painting — subject, medium,
  and mood. Used by screen readers and Google Images. Example: ..."` — not a
  real description. Found incidentally while snapshotting the homepage a11y
  tree to verify fix 5; not part of the audit or the fix queue, and not fixed
  this session (out of scope for a cursor CSS change). Real WCAG 1.1.1 fail,
  worse than an empty alt: a screen reader reads the *instructions* as if they
  were the painting. Fix in Sanity Studio → Works → Threshold → Alt text; this
  is a content fix, not a code fix.

### Fix queue — resume here

| # | P | Finding | File | Status |
|---|---|---|---|---|
| 1 | P2 | Deck pages had no alt-text field at all | `sanity/schemas/collection.ts`, `types/collection.ts`, `collections/[slug].astro` | **DONE** |
| 1b | — | Alt field `string` → `text` (rows 4) so Studio gives a textarea | `sanity/schemas/collection.ts` | **DONE** |
| 2 | P1 | `.location` fails WCAG AA over the intro backdrop — was 4.40:1 light / 4.47:1 dark, needs 4.5 | `artist.astro:454-457` | **DONE (uncommitted)** — now 5.25:1 / 5.53:1 via new `--intro-muted` token |
| 3 | P2 | `.available-item` `clamp(32px, 7.3vw, 88px)` — 88px is the largest type on the site, over DESIGN.md's 80px Display ceiling | `artist.astro:549` | **DONE (uncommitted)** — now `clamp(32px, 6.6vw, 80px)`, ties the hero at 80px |
| 4 | P2 | `.available-cta` was **189×25px**, vs the 44px floor DESIGN.md states for chips | `artist.astro:555` | **DONE (uncommitted)** — `::before` expanded hit area, visible box unchanged |
| 5 | P2 | `.cursor` / `.cursor-ring` animated `width`/`height` — layout properties, on a mouse-tracking element, **sitewide** | `Layout.astro:474,482` | **DONE (uncommitted)** — `transform: scale()`, pixel-identical hover sizes |
| 6 | P3 | `will-change: transform` on `.backdrop` was never released; stayed set under reduced-motion where the script never runs | `artist.astro:312` | **DONE (uncommitted)** — moved into the script's own motion-branch, verified both branches |
| 7 | P3 | Off-scale radii: `2px`, `1px` (DESIGN.md scale is 0 / 6px / 999px) | `collections/[slug].astro:546`, `Layout.astro:440` | **DONE (uncommitted)** — `.deck-cta` fixed to 0; `#main-content`/global focus-ring 1px confirmed false positive, left alone |
| 8 | P3 | DESIGN.md "Elevation & Depth" still cites the cutout `drop-shadow` and framed-portrait `box-shadow` — both deleted; /artist now has **zero** shadows. Also still said "About page" | DESIGN.md | **DONE (gitignored — working-tree only)** |

Item 8 is deliberately last: regenerate DESIGN.md only after 2–7 land, or it
documents a state that is about to change again.

### Decisions
- **88px vs DESIGN.md's 80px: the page is wrong, the doc is right.** Settled by
  the sweep, not by taste. `88px` appears exactly once in the codebase
  (`artist.astro:549`); `80px` appears once (the homepage hero Display, which
  matches DESIGN.md); every other ceiling is ≤74px. DESIGN.md's claim that the
  hero name is "the single largest text on the site" holds everywhere except
  this one line. Fix by lowering the artist page.
- **The CTA touch-target fix is local, not shared.** Three CTA classes exist
  with three different sizes — `.available-cta` 13px/4px, `.ci-cta` 11px/3px,
  `.collection-link` 10px. No shared class to fix once.
- **No generated fallback alt text for deck pages.** A positional string
  ("Page 03 of 15") would be a third announcement of what the dialog label and
  the `aria-live` counter already say twice, while describing nothing. Empty
  alt keeps the image decorative instead of adding noise. Rationale is
  commented at the `pageAlts` definition so it is not "fixed" later.
- **`alt` field is not `required()`** — mandatory would block publishing every
  existing collection until all pages are back-filled.

### Verified false positives — do not re-report
- **`em-dash-overuse`** on `artist.astro` and `Layout.astro`. Measured: 53
  em-dashes in artist.astro, **52 in code comments**, 1 in the meta
  description. Layout.astro: 81 total, **71 in comments**. The detector counts
  comments as body text. This rule is noise in this codebase.
- **`broken-image`** on `collections/[slug].astro:326`. The static
  `<img class="lightbox-img" alt="">` is correct — alt is assigned at runtime
  by `show()`. Detector cannot see that.
- **7 of 8 `design-system-font-size`** findings. DESIGN.md's *prose* documents
  Body as "15–16px" and Label as "10–15px" — ranges. Its *sidecar* encodes
  single values (16px, 11px). The detector reads the sidecar. `10px` is used 13
  times across 5 files: settled convention, not drift. The sidecar needs
  ranges; the code is fine.
- **Two `<footer>` elements** on /artist do NOT create duplicate `contentinfo`
  landmarks — `.colophon`'s nearest sectioning ancestor is `section.intro`, so
  it maps to generic. Checked, not assumed.

### How the contrast numbers were produced
Production build only (`npm run build && npm run preview`), 1440px, both
themes, `scripts/surface-contrast.mjs`. Two traps burned real time and are now
documented in that script's header — repeating them produces confident wrong
numbers, not obvious errors:
1. **The Astro dev toolbar** is a dark floating pill that sits over page
   content and gets sampled as background. It produced a 1.05:1 reading on
   `.prose p` that survived until the region was cropped and eyeballed.
2. **`visibility: hidden` on `.copy` alone does not hide the text** —
   `.reveal.visible` re-asserts `visible` on descendants. The first sweep
   measured ink glyphs against ink glyphs. Use `.copy, .copy *` and verify on
   a leaf node.

### Open — on RJ, not on code
- **13 of 15 deck pages still have no alt text** (`Worlds Within Walls`). Two
  are written and good — they transcribe the spread's words *and* describe the
  painting, which is what WCAG 1.1.1 + 1.4.5 need for text-baked-into-pixels.
  Studio path: Collections → Story Pages → each page → Alt text.
- Nav tagline "WHERE TASTE & ART BLENDS" — **4th flag**. Still unresolved.

### Rejected / Deferred
- **Deck pixel page-numbering mismatch — dropped by decision.** Spread pixels
  read "03 / 18" and "04 / 18" while the lightbox counter reads "01 / 15" and
  "02 / 15"; both are visible at once. Needs a deck re-export, same batch as
  the tracked "Rupiyoti" pixel typo. Explicitly deprioritised this session.
- Sitewide per-page audits (`/impeccable audit` on the other 7 routes) — not
  run. Only `/artist` was audited in depth; the detector sweep is mechanical
  and does not measure contrast, touch targets, or responsive behaviour
  anywhere else.

### Next Session Candidates
- Fix queue items 2 → 7, then 8
- Re-run `/impeccable audit src/pages/artist.astro` to confirm the score moves
- `/impeccable audit src/layouts/Layout.astro` — best value per run, since nav
  and footer chrome ship on every page

---

## Session: 2026-09-02 — Artist page: studio-photo rebuild + `/about` → `/artist` route rename

### Completed
- Route rename: `src/pages/about.astro` → `src/pages/artist.astro`. Nav +
  footer label "About" → "Artist" (one `navLinks` entry in `Layout.astro`
  feeds both; label stays mixed-case and is uppercased by the existing
  `.nav-links a` / `.footer-links a` rules — no new casing introduced).
  Redirect stub at `/about` → `Astro.redirect('/artist', 301)`. Verified
  live: `/about` lands on `/artist`.
- The stub emits, on a static build:
  `<meta http-equiv="refresh" content="0;url=/artist">` +
  `<link rel="canonical" href="/artist">` + `noindex` + a manual anchor
  fallback. The `301` argument is inert until an SSR/hybrid adapter exists
  — it is what a real server *would* send. Dev server does issue a true 301
  (there is a server), so don't read dev behaviour as proof of prod.
- Updated: `Layout.astro` (navLinks entry + the nav-offset comment listing
  `150px /about`), `index.astro` (Artist teaser link + one comment
  cross-ref), CLAUDE.md, ARCHITECTURE.md, PRODUCT.md,
  `src/assets/artist/README.md`, `src/assets/about/README.md` — all
  `/about` refs swapped. Page shell class `.about` → `.artist` (markup +
  base rule + dark-theme rule). Zero `href="/about"` left anywhere in
  `dist/`.
- **New in ARCHITECTURE.md §15: "Renaming an existing route (developer
  workflow)."** Written this session — the redirect-stub pattern was not
  documented before, so anything referring to it "per ARCHITECTURE.md"
  points at a section authored here, not a pre-existing rule.
- `ABOUT_QUERY` name kept as-is — named for the unregistered `aboutPage`
  schema type, not the route. `src/assets/about/` folder name also kept —
  pure churn to rename, no functional gain. Both documented inline.
- Artist page hero image rebuilt: cutout PNG → full studio photo
  (`src/assets/artist/rupjyoti-portrait.jpeg`, renamed from a
  double-extension upload). `object-fit: contain`,
  `aspect-ratio: 1023/1537` (source's true ratio), border
  `1px solid var(--border-strong)` applied directly to
  `.portrait :global(img)` — not a wrapper, since `object-fit: contain` +
  locked ratio makes img edge = box edge. `:global()` is required: the
  `<img>` comes from Astro's `<Image>` and carries no scope attribute.
- **If the portrait source is ever swapped, update the `aspect-ratio` pair
  to match the new file.** `contain` letterboxes a mismatch rather than
  cropping it — visible, but still wrong. Noted in the CSS and in
  `src/assets/artist/README.md`.
- New content shell: `.intro-shell`, `max-width: 1500px; margin: 0 auto` —
  the only centring mechanism, horizontal only. `.intro` stays full-bleed
  so the plaster texture runs edge to edge past the cap. Desktop is
  `grid-template-columns: 40fr 60fr` with `align-items: start` (fr, not %,
  so the ratio holds at ultra-wide). 40 over 45: at the 1500px cap 40 gives
  a 578×868px photo; 45 puts it near 980px tall and lets the photograph
  outweigh the text beside it.
- All old cutout code removed: `--portrait-lift`, `.is-cutout`,
  `.is-framed`, the `aspect-ratio: 4/5` branch, `object-position: bottom`
  crop, plus `--portrait-col` / `--portrait-nudge-x` / `--copy-nudge-x`
  (transform hacks that only existed to place a free-standing cutout).
  Confirmed via grep — zero hits anywhere in repo or docs. `artist-cutout.png`
  and `scripts/key-artist-cutout.mjs` still exist on disk but are no longer
  imported by anything; both READMEs now say so and mark them safe to delete.
- Verified both breakpoints: desktop 27" — full body incl. feet, no crop.
  Mobile/small screen — photo truncated only by normal scroll (page taller
  than viewport), not a CSS bug; full image visible on scroll.
- Measured in Chrome, shell width / L·R margin / image box / rendered-vs-
  natural ratio delta: **1280** 1126.4 / 76.8·76.8 / 435.2×653.9 / −0.03% ·
  **1440** 1267.2 / 86.4·86.4 / 489.6×735.6 / +0.02% · **1920** 1500 capped
  / 210·210 / 577.6×867.8 / −0.04% · **2560** 1500 capped / 530·530 /
  577.6×867.8 / −0.04%. Deltas are sub-pixel rounding — no distortion, and
  the photo is byte-identical at 1920 and 2560 as intended. Stacks at 899px
  (image capped 420px, centred), grid at 900px. `scrollWidth` never exceeds
  viewport at any width tested.
- `npx astro check` 0 errors / 0 warnings / 0 hints (34 files).
  `npm run build` clean, **32 pages** (was 31 — the `/about` stub adds one).

### Decisions
- Chose full studio photo over cutout extraction — no background-removal
  rework needed, zero re-crop risk, ships faster
- Border on image itself, not container — avoids double-box, geometry stays
  exact
- Redirect via `Astro.redirect()` accepted as meta-refresh (not true 301) —
  consistent with the existing static-build limitation, not a new gap. If a
  real 301 is ever needed on Cloudflare Pages that is a `_redirects` file in
  `public/`, not this stub.
- Breakpoint reused, not invented: 900px was already `about.astro`'s own
  intro-stack threshold

### Rejected / Deferred
- Renaming `ABOUT_QUERY` / `src/assets/about/` — rejected, would create
  schema-name mismatch / pure-churn risk for no gain
- Rewriting older SESSIONS.md entries that mention `about.astro` — rejected,
  it is a dated append-only record; the rename is captured in CLAUDE.md and
  ARCHITECTURE.md instead

### Escalate
- Nav tagline "WHERE TASTE & ART BLENDS" — still live, still unresolved.
  Flagged 3rd time this project. Needs RJ/KD decision before further work
  builds around it.

### Next Session Candidates
- Resolve nav tagline copy
- Confirm `/about` redirect behavior once real adapter/SSR is in place
  (Phase 5) — meta-refresh is a known interim gap
- If a sitemap integration is ever added, the `/about` stub needs `noindex`
  handling in it (the stub already emits the tag itself)

---

## Session: 2026-08-19 — Footer redesign: three-column layout, 25%+ height cut, contrast-verified

### Completed
- Footer rebuilt from single-row flex to two-tier layout: `.footer-tier1`
  (3-col grid — Brand / Explore / Connect) over `.footer-tier2` (copyright +
  back-to-top bar). Driven by a real gap: every enquiry path on the site
  funneled to Instagram DMs, with no address a gallery or collector's
  assistant could put in a calendar invite.
- New `src/lib/site.ts` — single typed source for `email`, `instagram`,
  `behance`. Footer and `contact.astro` both import it; the Contact page's
  Instagram link had drifted from the footer's once already under the old
  hardcoded-in-two-places setup.
- Footer nav now maps the same `navLinks` array the header renders, instead
  of a second hardcoded link list.
- `--footer-logo-h` cut in two passes: 180px → 132px → **72px desktop /
  44px mobile** (final). `.footer-descriptor` max-width widened 34ch → 48ch
  (wraps the same copy to 2 lines instead of 3 — layout change, not a copy
  edit; 48ch is an empirically-verified threshold, not eyeballed — 46ch
  still measured 3 lines). Total footer height: 529px→392px desktop
  (−25.9%), 922px→690px mobile (−25.2%). Nothing removed or hidden to hit
  the target — height came from sizing/spacing only.
- Texture image layer dropped below 480px viewport width — at that size
  `cover` scaled the 8.6:1 strip to several multiples of viewport width, so
  only 4.9–5.4% of it was ever visible (measured). Scrim + bleed stay.
  `scripts/footer-contrast.mjs` carries a matching
  `TEXTURE_DROP_BELOW_VW = 480` so tool and implementation can't drift.
- Two fixes: `.footer-logo-text` fallback used `--text-primary` (page
  token) on the photographic surface, now `--footer-text`.
  `#main-content:focus-visible` fell through to the browser's default blue
  outline on the back-to-top path (the global `a`/`button` focus-ring rule
  can't reach a bare `<main>`) — added a scoped rule matching the site's
  gold ring, confirmed via `getComputedStyle` in both themes.
- Full contrast sweep (`scripts/footer-contrast.mjs`, 16×16px window
  method) run across all 6 viewport/theme combinations post-change: every
  element clears AA 4.5:1, tightest is 5.27:1 (900, light). Full table in
  ARCHITECTURE.md §18.
- Plate-wide worst-window sweep (independent of content) run at old (332px)
  and new (392px) heights, both themes: confirms the height cut didn't
  erode the surface's floor — dark `--footer-muted` moved 4.57→4.55:1, a
  0.02 drift. Flagged as a documented trap: that worst window is the empty
  gutter between Brand and Explore, no content sits there today, but it's
  the number to re-check first if anything does.
- `npx astro check`: 0 errors/warnings/hints. `npm run build`: clean,
  36 pages.

### Decisions
- 11px column headings (`.footer-heading`) take `--footer-text` (0.94),
  not `--footer-muted` (0.88) — the shared eyebrow spec (11px/0.22em,
  `.ci-eyebrow`/`.works-eyebrow`) governs geometry only; footer color choice
  is a separate axis. Verified: 11px heading clears AA with more margin
  than the 12px copyright line in 4 of 6 configurations.
- `--footer-logo-h`'s original 180px rationale (keep the lockup's baked-in
  tagline legible) explicitly revised, not just overridden: the descriptor
  line now carries that wording as live text, and the `<Image>` `alt`
  attribute carries it for anyone who can't see the image, so the image's
  internal tagline is decorative-only now.
- `src/lib/site.ts` over a Sanity `siteSettings` singleton for contact
  URLs — three values that change roughly never don't justify a schema, a
  fetch, and a new failure mode on every page rendering the footer.

### Rejected
- Newsletter signup — no ESP, no list, no privacy policy; a box that goes
  nowhere is worse than none.
- Multi-column sitemap — five pages on the site, would duplicate Explore.
- Phone number / street address — home-studio safety; city-level location
  is enough.
- Payment / trust badges — no checkout exists yet.

### Deferred (with concrete trigger)
- **Privacy / Terms / Refund-Shipping policy** — not needed while the site
  sets no cookies and collects no data. Trigger: Phase 5 (Stripe/Snipcart +
  Formspree) ships. `.footer-tier2` bar has room reserved.

### Not Verified / follow-up
- **Resolved** (external code review, same session): this entry originally
  flagged the in-code comments on `--footer-logo-h` (base rule and the
  900px media block) as still citing 96px/76px→52px from an earlier tuning
  pass. Checked directly against `Layout.astro` — both comments now cite
  the current 72px/44px values. No outstanding action.

---

## Session: 2026-08-17 → 2026-08-18 — Collection detail resilience, empty-floor state, code-review rounds 6–8, merge + push to main

### Completed
- **storyPages[] / empty-collection floor** (first task this session):
  `storyPages[]` items get `.nullish().catch(null)` — Studio's "Add item"
  button inserts a bare `{_key, _type:'image'}` before upload, and
  publishing at that moment previously failed `safeParse` and redirected
  the whole collection page to `/collections`. `/collections/[slug]` also
  gained an explicit floor: when `storyPages`, `artworks` and
  `description` are all empty, it renders `coverImage` as a single plate
  plus one line of copy ("More from this collection coming soon…")
  instead of a near-blank page, falling back to text-only if `coverImage`
  is null too. Verified against the real "Transforming Walls Into
  Stories" document, which currently has no deck, no linked works and no
  statement — confirmed in the build output that this collection now
  renders the floor state instead of an empty page.
- **Three rounds of `/code-review` (rounds 6–8 of an 8-round total —
  rounds 1–5 predate this session, see 08-15 entry below) run against the
  full branch diff before merge.** Each round surfaced real, verifiable
  defects:
  - *Round 6*: `.works-empty`'s centered text got asymmetric left-only
    padding from the `.works-head`/`.filter-bar` rail-offset rule;
    `.empty-floor-img` had no `aspect-ratio`, so a non-3:2 cover would
    reflow on load; `artworkCount`'s GROQ filter didn't match the detail
    page's render filter (an artwork with an `_id` but no slug was
    counted but never shown); a stale code comment said `.optional()`
    where the schema actually uses `.nullish()`.
  - *Round 7*: lightbox click-outside-to-close was dead code
    (`.lightbox-stage` covers the dialog's full content box, so
    `event.target === dialog` could never fire); `COLLECTION_BY_SLUG_QUERY`
    projected `coverImage` unguarded, so a half-populated cover could
    redirect the whole page (worse than the index-page drop round 6's fix
    guarded against); `artworks[]` item objects lacked the `.catch(null)`
    their own schema comment claimed to provide; ARCHITECTURE.md §21 had
    just been rewritten but contradicted the code it was rewritten to
    match, in the same commit; "View collection — 1 pages" read as a
    typo; a work card with a null `title` had no accessible name at all.
  - *Round 8*: fixing round 7's stale comment introduced a second stale
    comment 20 lines below it (deleted, not reworded); the eyebrow/title
    margin change from round 6 left `.works-eyebrow` and `.works-title`
    flush against each other; the swipe handler had no touch-count guard,
    so a two-finger pinch on a deck plate could get misread as a
    page-turn swipe; `safeParse` failures on `[slug].astro` and fetch
    failures on `collections/index.astro` redirected/degraded silently
    with nothing in the build log; the `artworkCount` fix from round 6
    was itself undone by round 7's `.catch(null)` fix (a wrong-typed
    field is now counted by GROQ but dropped client-side) — flagged as a
    design decision, not patched blind, left deferred; `.sr-only` (also
    flagged in round 7) remains unused — flagged again, still deferred.
- Round 8's mechanical findings (margin, touch guard, two silent-failure
  logs, `LIGHTBOX_W` documentation) fixed in a final pass; the two
  design-scope findings (`<dialog>` fallback, `artworkCount` drift) and
  the recurring `.sr-only` gap left deferred rather than patched under
  time pressure.
- Committed as `731f446` — every fix from this session's two tasks (the
  storyPages/empty-floor work plus rounds 6–8) as one commit, message
  documents the three deferred items so they aren't lost next session.
- Merged to `main` as `7eeaed7`. Not a fast-forward — `main` carried a
  merge commit (`d61daaa`, PR #5) not on `all-works` — but
  `git diff all-works` on the merged tree came back empty: byte-identical,
  not just conflict-free.
- Pushed to `origin/main`: clean fast-forward `d61daaa..7eeaed7`, no
  force. This triggers the Cloudflare Pages auto-deploy from `main`.
  Deploy independently confirmed after the fact: curl'd
  tartbyrj.pages.dev directly and diffed the served CSS/JS against a
  fresh local build of main at 7eeaed7 — byte-identical file hash,
  and four fixes from different review rounds (empty-floor CSS,
  works-eyebrow spacing, pinch-guard JS, lightbox stage-target JS) all
  present in the served output. Not a Cloudflare dashboard/build-log
  check — content-hash equivalence, which is strong evidence the live
  site is serving this commit and not a stale cache.
- `npx astro check` (0 errors/warnings/hints) and `npm run build`
  (36 pages, clean) run and passed at every stage: pre-fix, after each
  round's fixes, and post-merge.
- CLAUDE.md's Deployment section "not yet merged" note removed; Current
  Build State block updated to match.

### Decisions
- Stopped the review loop at round 8 deliberately, not because it came
  back clean — round 8 still found two functional bugs. Rounds 7 and 8
  were each increasingly finding second-order effects of the *previous*
  round's own fixes (round 7: stale comment + doc/code mismatch from
  round 6's fixes; round 8: the `artworkCount` drift caused by round 7's
  own `.catch(null)` fix) rather than independent pre-existing defects —
  read as the review loop nearing convergence, and a real stopping
  signal on its own terms, not just an arbitrary round cap.
- `LIGHTBOX_W` (3200) left higher than `PLATE_W` (1920) despite both
  currently producing byte-identical output (today's deck sources are
  1920×1080, `fit=max` won't upscale) — documented as intentional
  headroom for the tracked 3840×2160 re-export rather than lowered to
  match, so a future session doesn't "fix" it right before the re-export
  makes the gap real.
- `.works-eyebrow` carries the restored gap as a bottom margin, not
  `.works-title` as a top margin — matches the pattern both
  `.ci-eyebrow`/`.ci-title` and `.intro-eyebrow`/`.intro-title` already
  use, keeping every title at `margin: 0` rather than introducing a
  fourth one-off spacing convention.
- The `artworkCount` drift and the `<dialog>`-unsupported mobile fallback
  were both left unpatched by explicit instruction rather than fixed
  blind in the final round — both need a design decision (which surface
  is authoritative; how to feature-detect and fall back), not a
  mechanical one-liner.

### Deferred (with concrete triggers)
- **`artworkCount` count-vs-render-filter drift**: GROQ's `count()` can
  check referential existence (`defined(@->_id)`, `defined(@->slug.current)`)
  but can't see client-side Zod validation failures — a document that
  fails item-level parsing (e.g. `year` arriving as a string) is counted
  by GROQ but dropped by the page's render filter after `.catch(null)`.
  Real fix is computing `artworkCount` from the parsed array's length
  instead of a separate GROQ field, removing the duplicate source of
  truth. Trigger: next session that touches either `artworkCount` query,
  scoped as its own task.
- **`<dialog>`-unsupported mobile fallback**: below 768px the deck is
  reachable only through a button that opens a `<dialog>`; if `<dialog>`
  isn't supported (iOS Safari < 15.4) or the module script fails to
  load, the button does nothing and a phone visitor sees zero deck
  content. Needs a feature-detection + fallback design, not a line edit.
  Trigger: before public launch / domain connect (Phase 4).
- **`.sr-only` / deck accessibility**: still zero consumers in `src/`.
  Deck pages (Canva exports) carry all their content as pixels with no
  text alternative — plates and the lightbox both ship `alt=""`. Flagged
  again in rounds 7 and 8 of this session's review (also flagged in
  earlier sessions per SESSIONS.md's Aug 13 entry) — a recurring tracked
  gap, not a new finding each time. Real fix needs a caption/altText
  field on the `storyPages` schema plus transcription content from RJ.
  Trigger: when RJ next supplies deck content, or before public launch,
  whichever comes first.

### Escalate
- **"Rupiyoti" typo** (should be "Rupjyoti") is baked into the Worlds
  Within Walls deck's pixels and is live on `main`/tartbyrj.pages.dev via
  that collection's cover thumbnail and lightbox — tracked since the
  08-13/08-14 sessions, not newly discovered here. Still needs the deck
  re-export at 3840×2160 with corrected spelling; this session did not
  touch deck assets.
- **"Worlds Within Walls" shows "1 work" against its 15-page deck** — not
  a code bug, the collection genuinely has only one linked `artwork`
  document in Sanity. Confirmed in this session's build output
  (`/collections` renders "1 work" for this row). Needs Studio content
  entry (RJ or KD), not a code change — do not "fix" by removing the
  count display; the count is accurate to the data, the data is what's
  incomplete.

### Not Verified
- 700px breakpoint boundary, pixel-by-pixel (carried over from the
  08-14 entry, still not checked at the exact boundary)
- `<dialog>`-unsupported fallback behavior on an actual iOS Safari < 15.4
  device — reasoned about from code, not tested live

### Next Session Candidates
- Deck re-export (typo + resolution) — see Escalate above
- Upload remaining ~14 artwork documents for Worlds Within Walls in Studio
- `artworkCount` refactor (compute from parsed array length, drop the
  separate GROQ field) — see Deferred above
- `<dialog>` mobile fallback design — see Deferred above
- Verify 700px breakpoint boundary in devtools

---

## Session: 2026-08-15 — Filter-bar rail alignment, prev/next duplicate fix, schema cleanup

*(Reconstructed from commit messages `c348ea3` / `d1b7cfd` — no live
session log was written at the time; not this session's own work, listed
here only so the log has no gap before the entry above.)*

### Completed
- `.filter-bar` given the same `padding-left` rail offset as
  `.works-head` at `>=700px` — it had none, so the filter chips sat at
  the old left edge while the eyebrow/h1 above had already moved.
- Collection prev/next neighbours no longer duplicate when exactly 2
  collections exist: `(i-1+n)%n` and `(i+1)%n` resolve to the same index
  at `n=2`, so both pages rendered two links pointing at the same
  collection. `.neighbours` also stopped depending on `space-between`,
  which broke with a single child.
- `CollectionNeighbourSchema` consolidated to one definition in
  `types/collection.ts` instead of an inline duplicate in `parseList()`.
- `CollectionSchema.artworks` given a real per-item shape (nullish
  fields, nullable items) so `[slug].astro`'s two `(artwork: any)` casts
  could be removed.
- `.sr-only`'s comment reworded to describe the mechanism generically
  instead of citing the rejected `storyPages[0]`-as-cover design.

---

## Session: 2026-08-14 — Collections index redesign, /works head alignment

### Completed
- `/collections` rebuilt as editorial index — see ARCHITECTURE.md §21 for
  full spec. Eyebrow "COLLECTIONS", single-line h1 ("Where each collection
  holds a moment lived"), alternating cover/text rows, cover-only (no
  work-thumbnail preview — rejected, see §21), meta line singular/plural
  work count, 0-count segment omitted gracefully
- `COLLECTIONS_ALL_QUERY` added to queries.ts. `ARTWORK_TOTAL_QUERY` was
  also added mid-session to power a draft "VIEW ALL WORKS" head-block
  link, then removed in the same session once that link was cut in
  favour of the existing nav WORKS item — queries.ts carries neither the
  link nor the query today
- `.works-head` (`WorksGallery.astro`) left-aligned to the gallery's
  image column via `--rail-w` + `--rail-gap` (existing custom properties,
  no new one added), dropping to 0 below 700px in the same media query
  the rail itself uses
- `.works-eyebrow` brought to parity with `.ci-eyebrow` (11px,
  0.22em letter-spacing) — this was unintentional drift, not a design
  choice, now shared
- `.works-title` line-height/margin tightened to match `.ci-title`
  rhythm; font-size clamp intentionally left alone (see §21 — Works
  needs a denser heading than Collections' editorial one)

### Decisions
- Eyebrow "COLLECTIONS" not "COLLECTIONS & WORKS" — page indexes
  collections only, no individual artwork appears on it, so the label
  must not claim content it doesn't have
- Work-thumbnail preview strip rejected — duplicates the detail page one
  click away, and a fixed 1–2 slot layout breaks at 0 or 1 works, same
  class of problem as `storyPages[0]` (§20)
- Headline copy chosen to cover the full range of what "a collection" is
  on this site — not just painting series, but community workshops and
  mural documentation too — deliberately avoids "paintings"/"walls"
  language
- `.works-head` alignment target is the gallery image column, not an
  arbitrary offset — anchored to `--rail-w`/`--rail-gap` so it can't
  drift from the grid it's aligning to

### Bugs / drift caught
- `.works-eyebrow` vs `.ci-eyebrow` had silently diverged (10px/0.14em
  vs 11px/0.22em) despite doing the same visual job on sibling pages —
  not a deliberate difference, now unified
- ARCHITECTURE.md §21, as drafted mid-session, described the
  `ARTWORK_TOTAL_QUERY` cover-image GROQ guard and the query's removal
  status inaccurately (wrong field name in the `select()` snippet; said
  the query still existed with no consumer after it had already been
  deleted). Caught and corrected before the doc was left as source of
  truth — see §21's cover-image and page-head paragraphs for the
  corrected text.

### Rejected / Deferred
- Work-thumbnail preview strip on collection rows — see Decisions above
- Second head-block CTA ("VIEW ALL WORKS") — cut, nav already covers it

### Not Verified
- 700px breakpoint boundary, pixel-by-pixel (e.g. 690–710px) — both
  `.works-head` padding and `.year-group`'s grid split share one
  `min-width: 700px` query so they should flip atomically, but this
  wasn't checked at the exact boundary, only at 440px and 1440px
- `coverImage: null` row rendering — reviewed in code, not currently
  visually exercised since both live collections now have real covers

### Escalate
- The "Rupiyoti" (should be "Rupjyoti") typo baked into deck pixels is
  now visible on `/collections` index (cover thumbnail), not just the
  detail-page lightbox as previously scoped in the 2026-08-13 entry.
  This raises it from "blocks launch quality" to "currently live and
  publicly visible on two pages" — bump priority on the deck re-export
- Hotspot-math duplication: this session's `coverFocus()` (collections
  index) duplicates the crop-relative hotspot correction already in
  `workGeometry()` (homepage `index.astro`). Flagged, not consolidated —
  this is the second occurrence of a pattern §19 already went through
  once with `cropAdjustedAspectRatio`. Concrete trigger: consolidate the
  next time any third file needs cover-image hotspot math, don't leave
  this open-ended

### Next Session Candidates
- Deck re-export (typo + resolution) — see Escalate above, now higher
  priority than previously scoped
- Consolidate hotspot/crop correction logic if a third caller appears
- Verify 700px breakpoint boundary in devtools

---

## Session: 2026-08-13 (cont'd) — Collection detail page rebuild

### Completed
- `src/pages/collections/[slug].astro` fully rebuilt: page head (in-flow
  back-link pill + intro), statement (conditional pull quote), story-page
  plates (contained, not full-bleed), works section (unconditional
  separator + "View all works" link), prev/next collection
- Cover changed from `storyPages[0]` full-viewport image to
  Sanity-field-driven intro (title, tagline, location, year) — see
  rejection note below
- `tagline` schema field added to `collection.ts`; `description` field
  repurposed as "Statement" (short transcribed pull quote, not prose),
  `max(240)` error / `min(60)` warning
- `COLLECTION_NEIGHBOURS_QUERY` added, feeds both `getStaticPaths` and
  prev/next links from one source
- `fit=max` added to every `urlFor()` call site in the file (cover,
  plates, lightbox, works thumb) — caps delivery at native source width
  instead of upscaling; measured saving up to 84% per lightbox image
  against current 1920×1080 source assets
- All plate images set to `loading="lazy"` (no plate is ever above the
  fold, on any viewport — eager was dead weight)
- Works section separator now unconditional at any work count, fixing a
  real bug: at 1 work, the lone card previously read as an unlabelled
  17th deck page with no section break
- "Back to All Works" pill added to `works/[slug].astro`, same component
  as collection's back-link, in-flow (not absolute)
- ARCHITECTURE.md §20 written (Collection Detail Page); §5 collection
  schema block updated; CLAUDE.md GROQ list + "What NOT to Do" updated

### Decisions
- **Cover is built from Sanity fields, not `storyPages[0]`.** Original
  spec treated the first deck page as a full-viewport splash. Rejected
  after RJ removed the splash page from this deck (duplicated the About
  page's bio) — `storyPages[0]` became an interior page ("Observation")
  rendered as if it were the entrance. Deeper reason: depending on layout
  on the position of an externally-authored array is fragile by
  construction, independent of this one incident — the same deck also had
  the artist's name misspelled ("Rupiyoti" vs. "Rupjyoti") baked into
  pixels with no way for the site to catch it. `tagline` exists
  specifically to make this possible.
- **`description` redefined as a short transcribed pull quote, not a
  prose paragraph.** The decks contain no descriptive-paragraph page and
  none is expected — RJ writes narrative into the Canva pages, not into
  Sanity. Where good marginalia exists on a cover page, transcribe it
  here rather than leave it decorative-only.
- **Statement/intro padding reduced** (statement:
  `clamp(80px,12vh,160px)` → `clamp(48px,6vh,96px)`; intro top:
  `--space-section` → half) — three max-value gaps were stacking in a row
  for what's often two lines of type.
- **Back-link pattern** (scrim/blur/pill, in-flow, no absolute positioning)
  is now one shared visual component used on both collection and work
  detail pages.

### Rejected / Deferred
- Cover-as-`storyPages[0]` full-bleed splash — rejected, see Decisions
- Mobile horizontal swipe carousel for plates — rejected earlier in
  session in favor of gated single-button reveal into the lightbox
- Restoring the deck's title/splash page to fix the cover — rejected;
  moving to Sanity fields removes the dependency entirely rather than
  patching around it

### Not Verified
- Deck re-export (typo fix "Rupiyoti"→"Rupjyoti", 3840×2160 resolution)
  — not done this session, explicitly deferred by user. Site is
  currently live with the misspelled name baked into deck pixels and
  under-resolved source assets (1920×1080) against a lightbox spec'd for
  ~2400–3200px. `fit=max` prevents upscaling waste but doesn't fix
  softness at the lightbox's target size.
- Whether other collections' decks have the same name-spelling issue —
  not checked
- Works-section separator's `count >= 2` branch — not exercised by
  current data (only one collection has any works, and it has exactly
  one). Code is a one-line conditional on an already-iterated array;
  low risk, flagged not fixed.

### Next Session Candidates
- Deck re-export: fix name spelling, re-export at 3840×2160, re-upload
  — blocks real launch quality, not code
- Populate `description` (statement) and `tagline` for collections that
  don't have them yet
- `transforming-walls-into-stories` collection has zero linked works —
  SEO-dead per earlier discussion; needs artwork documents created from
  its deck's paintings, same as the standing recommendation for
  `worlds-within-walls`
- Check `coverImage` (used on `/collections` index) vs. `storyPages[0]`
  (no longer used, but still uploaded) for the same collection — are
  they meant to be the same asset? Not reconciled this session, was
  explicitly deferred
- Confirm the `count >= 2` works-heading branch on a collection with 2+
  works, whenever one exists

---

## Session: 2026-08-11

### Completed
- Footer redesigned with a photographic painted-plaster texture, both
  themes — assets `public/images/footer-{light,dark}.{avif,webp}` (AVIF +
  WebP, 22–27KB each, no JPEG tier), new tokens `--footer-texture`,
  `--footer-scrim`, `--footer-text`, `--footer-muted` in `tokens.css`
- `footer` in `Layout.astro`: three-layer `background-image` (bleed
  gradient, scrim wash, texture), `background-position: right center`,
  1px `border-top` replaced with a 72px (48px mobile) fade of
  `--bg-primary` off the top edge
- `.footer-links a` 14px → 16px; `.footer-copy` 10px → 12px
- `.footer-links a:hover` no longer recolors to `--accent` — text stays
  `--footer-text`, `--accent` moved to an underline instead
- ARCHITECTURE.md §14 token values corrected to match `tokens.css`
  (`--text-secondary` / `--text-muted` were still showing the pre-AA-fix
  numbers from the 08-07 session); new §18 written documenting the
  header/footer decision and the contrast methodology
- CLAUDE.md CSS variable block corrected to the same current values;
  footer texture section added with a pointer back to the token comments

### Decisions
- **Nav does not get the texture; footer does.** `#nav` is
  `position: fixed` and rides over the hero and every artwork on scroll —
  a second painted surface there competes with the paintings directly.
  Also measured as a hard blocker independent of taste: the light header
  strip failed AA across its *entire* width (2.9–3.4:1) and the dark strip
  failed specifically at 70–80% width (2.7:1) — exactly where nav links and
  the theme toggle sit at desktop. The footer is past the last artwork, so
  nothing competes, and it reads as "the wall the work is hung on."
- Slice-average contrast checks are not trustworthy on a photographic
  background — first pass of this work measured contrast as ~10 vertical
  band averages and passed values that failed locally (a link color that
  averaged to a pass measured 3.39:1 over one gold patch). Switched to
  sweeping 16×16px windows across the actual text band at rendered scale.
  Documented in both CLAUDE.md and ARCHITECTURE.md §18 so it isn't
  re-litigated next session.
- Hover state on footer links moves `--accent` to an underline rather than
  the text color — measured 2.43:1 (light) / 2.82:1 (dark) as text color,
  both failing, dark especially bad (gold accent on the strip's own gold
  band). Nav's hover still recolors text to `--accent` — not touched, not
  verified against this same bar.

### Rejected / Deferred
- "Both header and footer get the texture" (user's opening ask) — rejected
  after the header contrast measurement; user confirmed footer-only
- Tinted/low-opacity texture in the nav's `.scrolled` state as a middle
  ground — rejected: a scrim strong enough to protect nav-link contrast
  defeats the point of showing texture at all
- Center-anchored background-position — rejected in favor of right-anchor;
  the gold/marble detail in both source strips sits in the right portion,
  and cover-cropping at mobile widths would hide it under center-anchor

### Not Verified
- `npx astro check` / `npm run build` — **not run against this change**.
  Sandbox's `node_modules` has macOS-native `@rolldown/binding-*` bindings
  that don't resolve on Linux; every attempt errored on module resolution,
  unrelated to the CSS edit itself. The change is CSS-only inside
  `footer`'s existing scoped `<style>` block in `Layout.astro` plus new
  custom properties in `tokens.css` — no TypeScript surface touched — but
  this is a claim, not a confirmed build. Run both locally before deploying.
- Rendered in the browser by the user (screenshot supplied, confirmed
  "looks good" for the texture; the type-size/color follow-up in this
  session was requested from that screenshot, not independently reproduced
  by Claude in a live browser)
- Print stylesheet (`@media print` strips the background-image) — written,
  not tested against an actual print/PDF render

### Next Session Candidates
- Run `npx astro check` + `npm run build` locally, confirm 0 errors before
  this ships
- Light-theme footer background-position may want its own value separate
  from dark's — the light strip's gold/tan sits mid-image rather than at
  the right edge like the dark strip, so right-anchoring crops it less
  usefully than in dark theme. Flagged, not changed — needs a look with
  the actual image open, not just the numbers
- `--accent` hover-state contrast is a pre-existing weakness of `#7a4f2a`
  independent of the footer work (nav hover has the same underlying issue,
  just never measured against a textured background) — worth its own pass
- DNS connection tartbyrj.com → Cloudflare Pages (Phase 4, carried over)

---

## Session: 2026-08-08

### Bugs
- `order(featured desc)` sorted `null` above `true` — unset `featured` toggle led the
  section instead of trailing it. Fixed to `order((featured==true) desc, year desc)`
  in `HOMEPAGE_WORKS_QUERY` — parens required, `featured==true desc` is a parse error
- `.catch(() => null)` on every Sanity `client.fetch()` call turns a broken GROQ
  query into a plausible empty state — build stays green, page just silently shows
  the fallback/zero-state. Not fixed this session; needs `console.error` inside the
  `catch`, site-wide, as its own standalone task (11 call sites across
  `index.astro`, `about.astro`, `works/index.astro`, `works/[slug].astro`,
  `collections/index.astro`, `collections/[slug].astro`)

---

## Session: 2026-08-07

### Completed
- Removed old "Selected Works" section — superseded by `#works`
- `#works` Recent Works section built: uneven grid (`1.65fr/1fr/1fr` row 1, equal 3-col row 2), featured-first + fill-to-6 with recent, meta always visible, featured badge
- `HOMEPAGE_WORKS_QUERY` in `queries.ts`: `defined(image.asset)` + `defined(slug.current)`, `[0..5]` slice, `featured desc` + `year desc` order
- Homepage singleton schema: `src/sanity/schemas/homepage.ts`, pinned id, compose button blocked in `sanity.config.ts`
- `HOMEPAGE_QUERY` + `HomepageSchema` (`src/types/homepage.ts`) wired to hero — `heroArtwork` → fallback to `featuredArtworks[0]` at artwork level not field level
- Hero gets `fetchpriority="high"`; all works tiles `loading="lazy"`
- `--nav-h: 80px` mobile override in `tokens.css`
- `ArtworkSchema` + `CollectionSchema`: `hotspot`/`crop` added as `.nullish()` (was `.optional()` — GROQ returns `null`, not `undefined`)
- Focus rings moved to `global.css` unscoped — was cid-locked to Layout only
- `--text-muted` contrast fixed to meet WCAG AA 4.5:1 both themes
- `--text-secondary` light raised `0.52` → `0.72` (3.61:1 → 6.37:1) — every text token now clears AA on every background in both themes
- `.rw-title` 14px → 17px (large tile 20px); `.rw-sub` 7px → 10px
- `prefers-reduced-motion` guard added to `.reveal` in `global.css`
- `altText` field description in `artwork.ts` updated with examples for RJ
- `tokens.css` inverted alpha comment corrected

### Decisions
- Hero image = `heroArtwork` reference on homepage singleton, not `featuredArtworks[0]` — uploading new artwork no longer replaces hero
- Fallback at artwork level not field level — prevents mismatched image + caption from two different artworks
- `Rule.required()` kept on `heroArtwork` — fallback is "no doc" state, not "unset field" state
- `.nullish()` is the project-wide rule for all Sanity fields — not a quirk of `artwork.collection`. CLAUDE.md updated to generalise
- Focus rings in `global.css` unscoped — scoped styles can never reach cross-component links
- `--text-muted` fix in `tokens.css` not locally — local fix = site-wide inconsistency
- Tap targets (`.rw-head-link`, `.rw-empty`) deferred — requires layout changes

### Rejected / Deferred
- Video in hero — Lighthouse Performance killer, defer until after audit
- `FEATURED_ARTWORKS_QUERY` rename → `HERO_ARTWORK_QUERY` — cosmetic, defer to fresh session as standalone task
- Tap target fix for text links — logged as known debt
- Per-field hero fallback — rejected, risks caption from wrong artwork
- Merging `--text-secondary` and `--text-muted` into one token — they now sit 0.10 apart in alpha and barely differ; separation belongs in size/weight/tracking. Proposal only, not started

### Bugs
- `FEATURED_ARTWORKS_QUERY` sole consumer is now hero fallback only, not Recent Works — CLAUDE.md note updated; removing it breaks hero silently
- `--gr`/`--oi`/`--or` fragile coupling — known debt, not fixed
- `sanity.config.ts` compose button originally not blocked — fixed this session
- Adding `hotspot`/`crop` as `.optional()` dropped **every** artwork from the homepage grid (GROQ returns `null`); caught only because the zero-state branch landed in the same pass
- `.reveal` starts at `opacity: 0` and waits on the IntersectionObserver, so any screenshot tool or scraper that does not run scroll events sees a blank page below the fold — not fixed

### Not Verified
- Studio compose menu with `newDocumentOptions` — code compiles, never seen in an authed browser
- Keyboard tab-through of the new focus rings — never run live
- Collection `hotspot` fix is latent: no collection has a hotspot set, so the 3/2 well change is unproven

### Next Session Candidates
- Rename `FEATURED_ARTWORKS_QUERY` → `HERO_ARTWORK_QUERY`
- The Artist section (`--bg-elevated`, teaser, portrait + pull quote) — needs real content from RJ first
- Upcoming Exhibitions section
- RJ to provide: portrait photo, real pull quote (current = reference file placeholder)
- RJ to provide: real homepage headline + lede (current = placeholder copy)
- DNS connection tartbyrj.com → Cloudflare Pages (Phase 4)
- Upload remaining painting photos + set hotspots in Studio
- Tap target fix: `.rw-head-link` and `.rw-empty` link min 24×24px

---

## Session: 2026-08-05

### Completed
- Homepage section 2 rebuilt as the **D1 collections index** — merged what were previously two separate sections (statement block + 3-card Featured Collections grid) into one editorial index
- `COLLECTIONS_INDEX_QUERY` added to `src/lib/sanity/queries.ts` — 4 collections, `year desc`, with `count(artworks)`
- Responsive across three breakpoints: two columns ≥1024px, inline 33% image rows at 640–1023px, stacked full-width images (2 rows) below 640px
- Hover **and** keyboard-focus image swap; JS scoped via `[data-collections-index]`, unbound below 1024px via `matchMedia`
- One `<img>` per collection, repositioned with `display: contents` + grid/order rather than duplicated per breakpoint
- ARCHITECTURE.md §17 written; CLAUDE.md build state and deployment corrected

### Decisions
- Section order locked: Hero → Collections → Recent Works → The Artist → Exhibitions → Footer
- **Single-break background rule** — all artwork-bearing sections on `--bg-primary`; The Artist alone uses `--bg-elevated`. Simultaneous contrast: artwork must be judged against one constant neutral
- D1 editorial index chosen over grid / rail / slider
- Row caps: 4 desktop and tablet, 2 mobile
- CTA target always `/collections`, never a slug
- `alt=""` in the index, with descriptive `altText` reserved for the detail page
- Image well `3/2`, not `4/5` — RJ's covers are landscape Canva exports
- Well aligns to the headline's cap height (measured `0.253em`, not the assumed `0.09em` — Cormorant's cap is `0.625em` against a `0.926em` ascent, and `line-height: 1.12` makes the half-leading negative)

### Rejected
- Alternating section backgrounds — reads as template, doubles up with the hairline + eyebrow separators
- Auto-advancing slider — competes with the Hero animation, WCAG 2.2.2 exposure
- Horizontal card rail — most items offscreen
- Caption-over-image cards — gradient covers the lower third of the artwork
- Full-width headline band — left too much dead space beside the headline

### Bugs
- Image well `4/5` was cropping collection titles straight off the cover → `3/2` + `max-height: 68vh`
- Column imbalance from placing the well below the lede in the left column — left ran ~3× taller than right
- Tablet row divider floated mid-gap (`align-self: center` on a short box in a tall grid row) → `align-self: stretch` with flex centering

### Next Session Candidates
- Recent Works section (grid, uneven aspect ratios, meta on hover)
- The Artist section (`--bg-elevated`)
- Upcoming Exhibitions section
- Replace placeholder headline and lede with RJ's copy (two `TODO`s in `index.astro`)
- Add `altText` field to `src/sanity/schemas/collection.ts` for the detail page
- Custom domain DNS (Phase 4)

---

## Session: 2026-07-31

### Completed
- Real content seeded in Sanity Studio — one artwork ("Worlds within walls") + one collection ("Worlds Within Walls") published
- Root cause of blank `/works` page found: `aaltText` typo in `src/types/artwork.ts` + `.optional()` not handling Sanity's `null` returns
- `src/types/artwork.ts` — fixed `aaltText` → `altText`, changed nullable fields to `.nullish()`
- `src/types/collection.ts` — `location`, `description` → `.nullish()`
- GitHub repo pushed: `tartbyrj/tartbyrj-website` on `main` (initial commit `bd4c42a`)
- Cloudflare Pages deployed: `tartbyrj.pages.dev` — build clean, 8 pages
- Env vars set in Cloudflare: `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`
- Sanity webhook → Cloudflare deploy hook wired — auto-rebuild on publish confirmed working
- CORS origins added: `localhost:4321`, `tartbyrj.pages.dev`, `tartbyrj.com`
- 14-point audit resolved: nullish Zod fields, useCdn false, zod explicit dep, collection fetch safety, altText schema field, featured query ordering, mobile menu tab order, localStorage guards, reveal no-JS fallback, back link z-index, hardcoded colors replaced with tokens, .claude settings removed from repo

### Decisions
- `useCdn: false` — webhook rebuilds must read fresh Sanity data
- Collection back link → `absolute` inside hero not `fixed` — no z-index conflict
- `noscript` style uses `is:inline` — Astro scopes regular styles to component hash
- `visibility: hidden` on mobile menu — removes hidden links from tab order natively

### Bugs
- Sanity Studio local Vite chunk error (`pane-CoSiSpvR`) — deferred, non-blocking
- `package.json` name empty — cosmetic, not fixed
- `astro.config.mjs` hardcodes Sanity project ID — inconsistent with env var pattern, not fixed

### Next Session Candidates
- Connect `tartbyrj.com` → Cloudflare Pages DNS (Phase 4)
- Upload all real painting photos + storyPages for full collections
- Fix `astro.config.mjs` hardcoded Sanity vars → read from env
- Wire real Instagram URL on contact page
- Verify `/studio` on `tartbyrj.pages.dev` works post-CORS setup

---

## 2026-07-30 — Session 1: Foundation, Sanity, Layout, all pages built

### Summary
Built the project from scratch: Sanity client/schemas/Studio route, design tokens +
self-hosted fonts, the shared `Layout.astro` (nav, custom cursor, theme toggle, mobile
menu), and all five top-level pages wired to real (Zod-validated) Sanity data with
graceful fallbacks. Site has zero content in Sanity yet — every page renders its
fallback state correctly.

### Files created
```
.env
sanity.config.ts
src/lib/sanity/client.ts          (Sanity client + urlFor() — moved from lib/sanity.ts)
src/lib/sanity/queries.ts         (6 GROQ query constants)
src/sanity/schemas/artwork.ts
src/sanity/schemas/collection.ts  (replaces an earlier `series` schema — renamed)
src/sanity/schemas/index.ts
src/types/artwork.ts              (ArtworkSchema)
src/types/collection.ts           (CollectionSchema)
src/styles/tokens.css             (light/dark CSS custom properties)
src/layouts/Layout.astro          (nav, cursor, theme toggle, mobile menu, footer)
src/components/ui/ThemeToggle.astro
src/pages/index.astro             (hero, selected works, featured collection, about teaser)
src/pages/works/index.astro       (filterable grid)
src/pages/works/[slug].astro      (detail page + JSON-LD VisualArtwork)
src/pages/about.astro
src/pages/contact.astro           (v2 placeholder — Instagram link only)
src/pages/collections/index.astro
src/pages/collections/[slug].astro
src/pages/studio/[...index].astro (via @sanity/astro integration — see gotcha below)
public/fonts/*.woff2              (7 files: Cormorant Garamond x4, Jost x3)
```

### Key decisions / gotchas (read before touching related code)
- **`/studio` route is NOT a hand-written catch-all page.** Installed the official
  `@sanity/astro` + `@astrojs/react` integration; `studioBasePath: '/studio'` in
  `astro.config.mjs` auto-injects the route. Don't add a manual
  `src/pages/studio/[...index].astro` — it would conflict.
- **`urlFor()` is typed `SanityImageSource`** (from `@sanity/image-url`), not
  `@sanity/types`' `Image` — the latter requires `asset._type`, which our Zod schemas
  don't carry. Use `SanityImageSource` for any future image-accepting helper.
- **`@sanity/image-url` default export is deprecated** — always import the named
  `createImageUrlBuilder`.
- **`artwork.collection` is `.nullish()`, not `.optional()`** — GROQ returns `null`
  (not `undefined`) when no collection is assigned. Shape accepts both the raw
  reference (`{_ref}`) and the dereferenced projection (`{title, slug}`) since
  different queries return different shapes for this field.
- **`collection.artworkCount`** is a computed GROQ field (`count(artworks)`) —
  declared in `CollectionSchema` so Zod doesn't strip it.
- **JSON-LD in Astro:** `{JSON.stringify(...)}` does NOT interpolate inside
  `<script>` tags. Use `<script type="application/ld+json" is:inline set:html={...} />`.
- **Global stylesheet import:** only `Layout.astro` imports `global.css`. Pages must
  never import it directly (was fixed once already — don't reintroduce).
- **Astro.redirect() works in this static (no-adapter) project** — confirmed via a
  throwaway test slug; it emits a meta-refresh fallback page. Used in `works/[slug]`
  and `collections/[slug]` when `.safeParse()` fails.
- **Text casing:** `.nav-logo` / `.footer-logo` render mixed-case "T.Art by RJ" as
  typed (verified via `innerText`, not just CSS reading). The `text-transform:
  uppercase` on `.hero-eyebrow` / `.label` elements is intentional label-styling —
  don't confuse the two when "why is X uppercase" comes up again.
- **Copy locked in this session:** hero eyebrow = "T.Art by RJ · Murals · Paintings ·
  Drawings"; about teaser + about-page caption both = "Artist · Muralist ·
  Storyteller" (kept in sync intentionally).

### Current state
```
Pages built:  6 (/, /works, /about, /contact, /collections, /studio)
Dynamic:      /works/[slug] — 0 paths (no Sanity content yet)
              /collections/[slug] — 0 paths (no Sanity content yet)
npx astro check:  0 errors, 0 warnings
npm run build:    clean
```

### Next session should probably
- Add real content in `/studio` (at least one artwork + one collection) so the
  dynamic routes and fallback-vs-real-data paths can be visually verified.
- Decide on Sanity CORS origins before deploying (see ARCHITECTURE.md §11).
- Phase 3 deployment steps are documented in CLAUDE.md but not started.

---

## Session: 2026-07-30

### Completed
- ARCHITECTURE.md created at project root — full project spec, design tokens, schema definitions, deployment pipeline, theming system (§13/§14)
- Astro v7 scaffolded in `tartbyrj/` — Node upgraded v20→v22 via nvm, Tailwind v4 via `@astrojs/vite`, Sanity via `@sanity/astro` (official package, not manual catch-all)
- Sanity project created — ID `tuvy3sp7`, dataset `production`, Studio at `/studio` via `@sanity/astro`
- Schemas: `src/sanity/schemas/collection.ts` (renamed from `series` — title, slug, year, location, description, coverImage, storyPages[], artworks[], seo), `artwork.ts` (ref field updated to `collection`), `index.ts`
- Foundation (2A): `public/fonts/` 7 WOFF2 files (Cormorant Garamond 300/400/italic, Jost 300/400/500), `src/styles/tokens.css` (light+dark CSS vars), `src/types/artwork.ts` + `collection.ts` (Zod), `src/lib/sanity/queries.ts` (6 GROQ constants), `src/components/ui/ThemeToggle.astro`
- Layout (2B): `src/layouts/Layout.astro` — inline theme-init script, font preloads, custom cursor (9px dot + 34px ring, lerp 0.12), fixed nav (transparent→solid at 60px), mobile hamburger overlay, footer, IntersectionObserver `.reveal`
- Pages (2C): `src/pages/index.astro`, `works/index.astro`, `works/[slug].astro`, `about.astro`, `contact.astro` — all with Zod `.safeParse()` + graceful fallbacks
- Collections pages (prior): `collections/index.astro`, `collections/[slug].astro` — storyPages full-width 16:9 stacked, paintings grid

### Decisions
- Light theme default, dark via toggle — `localStorage` key `theme`, inline init script prevents flash
- Studio name: **T.Art by RJ** (mixed case, spaces) — nav/footer logo only; hero eyebrow/labels uppercase intentional
- `series` → `collection` throughout — cleaner naming, no legacy schema kept
- Canva pages as `storyPages[]` — RJ exports JPG from Canva → uploads to Sanity `storyPages` array → site renders full-width stacked
- Self-hosted WOFF2 via google-webfonts-helper — no Google Fonts CDN (Lighthouse 98+ target)
- `Astro.redirect()` on static = meta-refresh — accepted for now, real redirects when Cloudflare adapter added in Phase 5
- `urlFor()` typed as `SanityImageSource` not strict `@sanity/types` `Image` — correct intended type
- JSON-LD via `set:html={JSON.stringify()}` — Astro doesn't interpolate `{...}` inside `<script>` tags
- `ArtworkSchema` `collection` field: all subfields `.optional()` + top-level `.nullish()` — handles dereferenced `{title,slug}`, raw `{_ref}`, `null`, and `undefined` from GROQ
- `src/lib/sanity/client.ts` (moved from flat `src/lib/sanity.ts`) — matches ARCHITECTURE.md structure

### Rejected / Deferred
- Framer/Squarespace — rejected, chose code path
- Behance iframe embed — rejected, content migrated natively to Sanity
- Google Fonts CDN — rejected, Lighthouse constraint
- Lenis smooth scroll — deferred, only if horizontal gallery needed
- Motion One / GSAP — deferred/rejected, CSS + IntersectionObserver sufficient for all current animations
- Payment/contact forms (Stripe, Formspree) — Phase 2, placeholder page in place

### Bugs Fixed
- Node v20 unsupported by `create-astro@5` — upgraded to v22 via nvm
- `global.css` imported per-page instead of Layout — moved to Layout.astro only
- `collection` inferred as `never` in `collections/[slug].astro` — fixed with `.safeParse()` + redirect pattern
- `artwork.slug` vs `artwork.slug.current` in works grid — fixed
- `scroll-behavior: smooth` in scoped style — changed to `:global(html)` since `<html>` owned by Layout
- `artworkCount` stripped by Zod — added `artworkCount: z.number().optional()` to `CollectionSchema`

### Next Session Candidates
- Add CORS origins in Sanity dashboard: `http://localhost:4321`, `https://tartbyrj.pages.dev`, `https://tartbyrj.com`
- Create GitHub repo, push first commit (`git init && git add . && git commit`)
- Connect Cloudflare Pages → GitHub repo, add env vars (`PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`)
- Add Sanity webhook → Cloudflare deploy hook (auto-rebuild on publish)
- Upload real content to Sanity Studio: paintings, collection storyPages, bio text
- Gather from Rupjyoti: all painting JPGs, 18 Canva page exports, titles/mediums/dimensions/years, bio text
