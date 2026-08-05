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
| `collection.ts` | document | title, slug, year, location, description, coverImage, storyPages[], artworks[] (refs), seo |
| `index.ts` | — | exports schemaTypes = [artwork, collection] |

### GROQ Queries (src/lib/sanity/queries.ts)
- `FEATURED_ARTWORKS_QUERY` — featured==true, limit 6
- `ALL_ARTWORKS_QUERY` — all artworks, order year desc
- `ARTWORK_BY_SLUG_QUERY` — single artwork, dereferences collection→{title,slug}
- `ALL_COLLECTIONS_QUERY` — all collections, includes artworkCount
- `COLLECTION_BY_SLUG_QUERY` — single collection, dereferences artworks[]
- `ABOUT_QUERY` — aboutPage singleton

---

## Key File Paths
```
src/
  layouts/Layout.astro          ← base shell (nav, footer, cursor, theme, SEO)
  components/ui/ThemeToggle.astro
  lib/sanity/client.ts          ← Sanity client + urlFor() helper
  lib/sanity/queries.ts         ← all GROQ query strings
  styles/global.css             ← @import tokens.css, @font-face, base rules
  styles/tokens.css             ← ALL CSS custom properties (light + dark)
  types/artwork.ts              ← ArtworkSchema (Zod) + Artwork type
  types/collection.ts           ← CollectionSchema (Zod) + Collection type
  pages/
    index.astro                 ← homepage
    works/index.astro           ← all artworks grid
    works/[slug].astro          ← individual artwork + JSON-LD
    collections/index.astro     ← all collections grid
    collections/[slug].astro    ← collection detail (storyPages + artworks)
    about.astro
    contact.astro               ← v2 placeholder
    studio/                     ← Sanity Studio (via @sanity/astro)
public/fonts/                   ← self-hosted WOFF2 (7 files)
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
--bg-secondary: #f2ede8    --text-secondary: rgba(26,20,18,0.52)
--bg-elevated: #e8e0d8     --text-muted: rgba(26,20,18,0.28)
--accent: #7a4f2a          --accent-dim: rgba(122,79,42,0.25)
--border: rgba(26,20,18,0.09)

/* Dark theme ([data-theme="dark"]) */
--bg-primary: #080706      --text-primary: #f0ebe3
--bg-secondary: #100e0d    --text-secondary: rgba(240,235,227,0.55)
--accent: #c9a96e          --accent-dim: rgba(201,169,110,0.30)
```
Full token list in `src/styles/tokens.css`.

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
- `artwork.collection` field: `.nullish()` not `.optional()` — GROQ returns `null` (not `undefined`) when no collection assigned. Shape supports both dereferenced `{title,slug}` and raw `{_ref}`.
- `collection.artworkCount`: `z.number().optional()` — computed field from GROQ, would be stripped otherwise.

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
- `.reveal` + `.reveal.visible` classes defined in global.css — use them for all scroll animations
- `text-transform: uppercase` on labels/eyebrows is intentional — do not remove from `.nav-links a`, `.footer-links a`, `.hero-eyebrow`, `.sec-label`

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

---

## Current Build State
```
Pages built:  8
Deployed:     tartbyrj.pages.dev (Cloudflare Pages, auto-deploy from main)
Sanity:       webhook → Cloudflare deploy hook, live
TS errors:    0
Build:        clean
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
- About page — needs real Sanity `aboutPage` singleton content
- Analytics — Cloudflare Web Analytics snippet in Layout.astro
