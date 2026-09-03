# CLAUDE.md — T.Art by RJ
> Read this file at the start of every session before touching any code.
> Also read SESSIONS.md (last 2 entries) for recent changes.
> Source of truth for all conventions: ARCHITECTURE.md

---

## Project Identity
- **Site:** T.Art by RJ (studio name — always mixed case, spaces)
- **Artist:** Rupjyoti Baruah (full name, correct spelling)
- **Purpose:** Premium artist portfolio — paintings, collections, workshops, commissions
- **Stack:** Astro v7 · Tailwind CSS v4 · Sanity CMS v3 · Cloudflare Pages
- **Repo root:** `tartbyrj/`

---

## Commands
```bash
npm run dev          # dev server → http://localhost:4321
npm run build        # static build → dist/
npm run preview      # preview built site
npx astro check      # TypeScript check — must be 0 errors before commit
npx sanity dev       # Sanity Studio standalone (not needed — Studio at /studio)
```

---

## Environment Variables
```
# .env (never commit)
PUBLIC_SANITY_PROJECT_ID=tuvy3sp7
PUBLIC_SANITY_DATASET=production
```
Add both to Cloudflare Pages dashboard under Settings → Environment Variables.

---

## Sanity
```
Project ID:  tuvy3sp7
Dataset:     production
Studio URL:  http://localhost:4321/studio  (dev)
             https://tartbyrj.com/studio   (prod)
Plan:        Free
```

### Schemas (src/sanity/schemas/)
| File | Type | Key fields |
|---|---|---|
| `artwork.ts` | document | title, slug, image (hotspot), year, medium, dimensions, available, price, collection (ref), featured, altText |
| `collection.ts` | document | title, tagline, slug, year, location, description ("Statement" — short pull quote transcribed from the deck, not a prose paragraph), coverImage, storyPages[] (each image also carries an `alt` field — a full transcription of that spread, not a caption; see Zod schema notes below), artworks[] (refs), seo |
| `index.ts` | — | exports schemaTypes = [artwork, collection] |

### GROQ Queries (src/lib/sanity/queries.ts)
- `FEATURED_ARTWORKS_QUERY` — featured==true, limit 6
- `ALL_ARTWORKS_QUERY` — all artworks, order year desc
- `ARTWORK_BY_SLUG_QUERY` — single artwork, dereferences collection→{title,slug}
- `COLLECTIONS_INDEX_QUERY` — homepage section 2, limit 4, includes artworkCount
- `COLLECTIONS_ALL_QUERY` — /collections index, no limit, order year desc,
  includes tagline + artworkCount. Separate from COLLECTIONS_INDEX_QUERY
  above (that one caps at 4 for the homepage).
- `ARTWORK_TOTAL_QUERY` — not in this file. It was drafted
  (count(*[_type=="artwork" && defined(slug.current)])) to power a
  /collections head-block "VIEW ALL WORKS" link, then removed along with
  that link in the same session once it was cut in favour of the nav's
  WORKS item. Note left here so it isn't re-added without a real consumer.
- `COLLECTION_BY_SLUG_QUERY` — single collection, dereferences artworks[]
- `COLLECTION_NEIGHBOURS_QUERY` — title + slug for every collection, order
  year desc. Feeds getStaticPaths on collections/[slug] and the prev/next
  links, so routes and neighbour data can't drift apart.
- `ABOUT_QUERY` — aboutPage singleton. **Always returns `null`** — `aboutPage`
  isn't a registered schema (see ARCHITECTURE.md §5), so no such document can
  exist in Studio yet. The Artist page runs on hardcoded local content instead.
  Name kept as ABOUT_QUERY deliberately: it is named for the Sanity document
  type it queries (`aboutPage`), not for the route that consumes it, and the
  schema type has not been renamed. Renaming the route to /artist does not
  rename the query.

---

## Key File Paths
```
src/
  layouts/Layout.astro          ← base shell (nav, footer, cursor, theme, SEO)
  components/ui/ThemeToggle.astro
  lib/sanity/client.ts          ← Sanity client + urlFor() helper
  lib/sanity/queries.ts         ← all GROQ query strings
  lib/site.ts                   ← SINGLE SOURCE for email/Instagram/Behance —
                                    footer + contact.astro both import this,
                                    never hardcode these values elsewhere
  styles/global.css             ← @import tokens.css, @font-face, base rules
  styles/tokens.css             ← ALL CSS custom properties (light + dark)
  types/artwork.ts              ← ArtworkSchema (Zod) + Artwork type
  types/collection.ts           ← CollectionSchema (Zod) + Collection type
  pages/
    index.astro                 ← homepage
    works/index.astro           ← all artworks grid
    works/[slug].astro          ← individual artwork + JSON-LD
    collections/index.astro     ← editorial index (alternating cover/text
                                    rows, no work-thumbnail preview — see
                                    ARCHITECTURE.md §21)
    collections/[slug].astro    ← collection detail (storyPages + artworks)
    artist.astro                ← the Artist page, at /artist. Was about.astro
                                    at /about until 2026-09-02; nav label is
                                    "Artist". Sanity query is still
                                    ABOUT_QUERY (named for the document type,
                                    not the route)
    about.astro                 ← redirect stub only, no markup —
                                    Astro.redirect('/artist', 301). Kept so
                                    live inbound links and bookmarks to /about
                                    don't 404. Static build, so this emits a
                                    meta-refresh page, not a real 3xx
    contact.astro               ← form is v2 placeholder; IG link now reads
                                    from lib/site.ts, not hardcoded
    studio/                     ← Sanity Studio (via @sanity/astro)
public/fonts/                   ← self-hosted WOFF2 (7 files)
scripts/footer-contrast.mjs     ← 16×16px window sweep over the rendered
                                    footer plate — re-run before touching
                                    footer colors, height, or the texture
                                    breakpoint. See ARCHITECTURE.md §18.
scripts/surface-contrast.mjs    ← same 16×16px method, generalised to any
                                    photographic text surface (currently the
                                    /artist intro backdrop) via a real
                                    screenshot instead of re-rendering the
                                    background stack. Sibling to
                                    footer-contrast.mjs, not a replacement —
                                    read its own header before running it;
                                    it documents two measurement traps
                                    (Astro dev toolbar sampled as background,
                                    `.reveal.visible` overriding
                                    `visibility:hidden`) that produced false
                                    numbers the first time each was hit.
sanity.config.ts                ← Sanity Studio config
ARCHITECTURE.md                 ← full project spec (source of truth)
SESSIONS.md                     ← session log (read last 2 entries on start)
.env                            ← never commit
```

---

## Design System

### Fonts (self-hosted WOFF2 — NO Google Fonts CDN)
| Font | Weights | Variable | Usage |
|---|---|---|---|
| Cormorant Garamond | 300, 400, 300i, 400i | `var(--font-serif)` | Display, headings, quotes |
| Jost | 300, 400, 500 | `var(--font-sans)` | Body, nav, labels, metadata |

### Theme System
- Default: **light** (`data-theme="light"` on `<html>`)
- Toggle: sun/moon button in nav → saves to `localStorage` key `theme`
- Init: inline script in `<head>` (non-deferred) → reads localStorage → prefers-color-scheme → `'light'`
- Switch: `document.documentElement.setAttribute('data-theme', value)`

### CSS Variables (never use hex in components)
```css
/* Light theme (:root default) */
--bg-primary: #faf7f4      --text-primary: #1a1412
--bg-secondary: #f2ede8    --text-secondary: rgba(26,20,18,0.72)
--bg-elevated: #e8e0d8     --text-muted: rgba(26,20,18,0.62)
--accent: #7a4f2a          --accent-dim: rgba(122,79,42,0.25)
--border: rgba(26,20,18,0.09)

/* Dark theme ([data-theme="dark"]) */
--bg-primary: #080706      --text-primary: #f0ebe3
--bg-secondary: #100e0d    --text-secondary: rgba(240,235,227,0.55)
--text-muted: rgba(240,235,227,0.50)
--accent: #c9a96e          --accent-dim: rgba(201,169,110,0.30)
```
`--text-secondary` / `--text-muted` were raised from earlier values (0.52/0.28
light) after those measured below WCAG AA 4.5:1. Don't lower them without
re-measuring contrast against every background they sit on.

Full token list in `src/styles/tokens.css`.

### Footer texture (light + dark, both themes)
The footer — and only the footer — carries a painted-plaster photographic
background, via `--footer-texture` / `--footer-scrim` / `--footer-text` /
`--footer-muted` in `tokens.css`. Assets: `public/images/footer-{light,dark}.{avif,webp}`.
Below 480px viewport width the texture image layer is dropped entirely (too
small to resolve as texture at that scale) — scrim and bleed stay. See
ARCHITECTURE.md §18.

**The nav deliberately does not get this treatment.** `#nav` is
`position: fixed` and sits over the hero and every artwork on scroll — a
second painted surface there would permanently compete with the paintings.
The footer is past the last artwork, so a textured band reads as "the wall
the work is hung on" instead.

**Footer layout (as of 2026-08-19):** two-tier, three-column
(Brand / Explore / Connect) — not the original single-row flex. Explore
renders from the same `navLinks` array the header uses; don't hand-write a
second link list. Email + social URLs come from `src/lib/site.ts`, never
hardcoded in a component. Full rationale, the height/crop tradeoff, and the
contrast sweep results: ARCHITECTURE.md §18.

If you touch footer colors or type sizes, don't reuse `--text-secondary` /
`--text-muted` — those are calibrated for flat `--bg-primary` /
`--bg-elevated`, and slice-average contrast checks are not sufficient on a
photographic background (see the comments in `tokens.css` and
`Layout.astro`'s footer block: local 16×16px window sweeps caught failures
that whole-strip averages missed, including a link color that measured
passing on average but failed 3.39:1 over a single gold patch). Use
`--footer-text` / `--footer-muted`, and re-measure locally, not by average,
if the source images or scrim values change.

### Homepage
Composition, section order and the rationale behind each choice live in
**ARCHITECTURE.md §17**. Read it before touching `src/pages/index.astro`.

The two rules most likely to be broken by a future session:
- **Do not add background changes to any homepage section except The Artist.**
  Every artwork-bearing section stays on `var(--bg-primary)`; The Artist
  (`var(--bg-elevated)`) is the page's single tonal break.
- **Do not duplicate collection images per breakpoint.** One `<img>` per
  collection, repositioned with CSS.

---

## Conventions — Always Follow

### TypeScript
- Run `npx astro check` before every commit — must be 0 errors, 0 warnings
- Never use `any` type — use Zod-inferred types
- All Sanity responses: `.safeParse()` + fallback, never `.parse()` (throws)

### Sanity data fetching pattern
```typescript
const raw = await client.fetch(QUERY, params).catch(() => null)
const parsed = Schema.safeParse(raw)
if (!parsed.success) { /* fallback or redirect */ }
const data = parsed.data
```

### Zod schema notes
- **Every optional field is `.nullish()`, never `.optional()`** — GROQ returns `null` (not `undefined`) for anything unset in Studio, and `.optional()` rejects `null`, which makes `parseList` drop the whole document. Instances: `artwork.collection` (also shaped to accept both the dereferenced `{title,slug}` and the raw `{_ref}`), and `image.hotspot` / `image.crop` on `artwork.image` and `collection.coverImage`.
- `collection.artworkCount`: `z.number().nullish()` — computed field from GROQ, would be stripped otherwise. `.nullish()`, not `.optional()`, per the rule above: `count()` returns `null` (not undefined) for a collection whose `artworks` array was never set.
- `collection.artworks[].image`: `.nullish().catch(null)`. The `.catch()` is required, not stylistic — this field is validated by a single `safeParse` on one document (`collections/[slug].astro`), *not* by `parseList`, so there is no per-item damage containment above it. Without the catch, one image object missing `asset` fails the item → the array → the whole collection → and the detail page redirects away. The catch degrades it to a missing thumbnail instead.
- `collection.storyPages[].alt`: `z.string().nullish()` — every deck page authored before 2026-09-02 predates this field, so it's `null` on almost all of them today, not an edge case to guard against "just in case." Field is named `alt` on this schema, `altText` on `artwork.ts` — a known, deliberate naming inconsistency, not fixed because two collection documents already have real content under the `alt` key in production Sanity and renaming without a migration would make that content look empty in Studio. See the comment on this field in `src/sanity/schemas/collection.ts` before touching either name.

### Image URLs
```typescript
// Always use urlFor from src/lib/sanity/client.ts
urlFor(image).width(1200).format('webp').quality(85).url()
// Desktop: w=1200, Mobile: w=800, Hero: w=1920
// Never serve original unoptimised files
```

### JSON-LD in Astro pages
```astro
<!-- NOT this — Astro doesn't interpolate {expr} inside <script> -->
<script type="application/ld+json">{JSON.stringify(data)}</script>

<!-- Use this instead -->
<Fragment set:html={`<script type="application/ld+json">${JSON.stringify(data)}</script>`} />
```

### CSS rules
- Zero hardcoded hex values in components — always `var(--token-name)`
- If you add a color not in tokens.css, add it there first
- **Exception:** a color-with-alpha value used in exactly one place, with no
  reuse case, can live as a custom property in that page's own `<style>`
  block instead — `--scrim` and `--intro-muted` in `artist.astro` are the
  precedent. The tokens.css rule exists to stop hex/rgba scattering across
  components with no single source of truth; a value that already has one
  source (the one page that uses it) isn't what the rule is protecting
  against. Don't reach for this for anything with a plausible second
  consumer — that goes in tokens.css.
- `.reveal` + `.reveal.visible` classes defined in global.css — use them for all scroll animations
- `text-transform: uppercase` on labels/eyebrows is intentional — do not remove from `.nav-links a`, `.footer-links a`, `.hero-eyebrow`, `.sec-label`
- `.ci-eyebrow` and `.works-eyebrow` share font-size/letter-spacing (11px,
  0.22em) intentionally — any future eyebrow component should match this,
  not invent a third value
- Animate hover/interaction state on `transform`, never on `width`/`height`
  directly — the latter forces a layout recalculation on every frame of the
  transition, the former is compositor-only. `Layout.astro`'s `.cursor` /
  `.cursor-ring` are the reference: they used to grow/shrink via `width`/
  `height` and now do it via `transform: scale()` against a fixed box size.
  Watch for the one real gotcha this surfaced: `transform: scale()` also
  magnifies a `border`, so an element with a stroke needs a compensating
  `border-width` on the scaled state (see `.cursor-ring.cursor-hover`) — and
  that compensation is approximate, not exact, because browsers snap
  hairline border-widths to the nearest device pixel before any transform
  runs.
- A thin inline-link CTA that must clear a touch-target floor without
  growing its visible underline gets an invisible `::before` hit-area
  expansion (`position: absolute`, sized to the target, `pointer-events`
  inherited), not padding — padding either grows the visible box or pushes
  the underline away from the text. `.available-cta` in `artist.astro` is
  the reference implementation; verify with `elementFromPoint` at offsets
  from the visible box's center, not just by reading the CSS.

### Scroll reveal
```html
<!-- Add .reveal to any element that should fade up on scroll -->
<div class="reveal">...</div>
<!-- IntersectionObserver in Layout.astro handles the rest -->
```

---

## What NOT to Do
- Never import `global.css` in a page — only Layout.astro imports it
- Never load fonts from Google Fonts CDN — self-hosted only
- Never hardcode hex colors in components
- Never use `.parse()` on Sanity responses — use `.safeParse()`
- Never commit `.env`
- Never add cookie banners — Cloudflare Analytics is cookie-free
- Never skip `alt` text on artwork images
- Never defer the theme init script — must be inline in `<head>`
- Never render the same Sanity image twice in markup to serve different breakpoints — reposition one `<img>` with CSS instead
- Never derive collection-detail layout from the position or content of a storyPages array element — Sanity fields (title, tagline, location, year) drive the cover; storyPages is presentation-neutral content RJ can reorder freely. See ARCHITECTURE.md section 20.
- Never `transition: width, height` (or animate them any other way) on a hover/interaction state — use `transform: scale()` against a fixed box instead. See the CSS rules entry above for the border-width caveat this creates.
- Never put an image's full accessible description into a link/button's `aria-label` when that image also has its own `alt` read separately (e.g. a lightbox trigger) — the long text belongs on the thing it describes, not on every control that can reach it. `collections/[slug].astro`'s deck-plate buttons hit this: `aria-label` stays a short position label ("View page 3 of 15 full screen"), the full transcription lives only on the lightbox `<img alt>`.

---

## Current Build State
```
Pages:        static routes in src/pages/ plus dynamic paths from Sanity content
              (run `npm run build` output for current count)
Deployed:     tartbyrj.pages.dev (Cloudflare Pages, auto-deploy from main)
Sanity:       webhook → Cloudflare deploy hook, live
TS errors:    0 (confirmed 2026-09-02 after the /artist audit fix queue +
              code-review round — see SESSIONS.md same date)
Not verified: 700px breakpoint boundary pixel-exact (works-head/gallery
              rail split)
Build:        clean (page count varies with live Sanity content — see
              "Pages:" above; do not hardcode a number here, it will go
              stale the next time a document is published/unpublished in
              Studio. 2026-08-19: 31 at build time, was 36 earlier the same
              session — confirmed this is Sanity-content-driven, not a
              route regression: rebuilding a pre-session commit against
              today's live dataset also returns 31. 2026-09-02: 32 — a real,
              permanent +1 from the `/about` redirect stub added that
              session, not content drift; don't read a jump back down to 31
              as a route regression either)
```

---

## Deployment
Phase 3 is **done** — the site is live and rebuilds automatically:
1. ✅ CORS origins added in Sanity dashboard → API → CORS Origins
2. ✅ GitHub: `tartbyrj/tartbyrj-website`, `main`
3. ✅ Cloudflare Pages connected — build `npm run build`, output `dist`
4. ✅ Env vars set in Cloudflare: `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`
5. ✅ Sanity webhook → Cloudflare deploy hook (auto-rebuild on publish)

**Remaining — Phase 4:** custom domain `tartbyrj.com` → DNS to Cloudflare Pages

## Phase 2 Features (not yet built)
- Contact/inquiry form — Formspree (placeholder at /contact)
- Painting purchase — Stripe + Snipcart
- Lesson booking — Calendly embed
- Artist page (`/artist`) — `aboutPage` schema doesn't exist in Studio yet, not
  just unpublished; see ARCHITECTURE.md §5. Page currently runs on hardcoded
  content in `artist.astro`, not Sanity
- Upcoming Exhibitions — homepage section 5 + dedicated `/exhibitions` page
  (ARCHITECTURE.md §17); `exhibition` schema not yet registered either
- Analytics — Cloudflare Web Analytics snippet in Layout.astro
