# T.Art by RJ — Session Log
> Compact handoff document. One entry per work session.
> Paste last 1-2 entries at top of new Claude Code session for instant context.
> Project: Astro v7 + Sanity (ID: tuvy3sp7) + Cloudflare Pages
> Artist: Rupjyoti Baruah | Studio: T.Art by RJ

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
