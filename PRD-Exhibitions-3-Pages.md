# PRD 3 — `/exhibitions` list page + `/exhibitions/[slug]` detail page

**Project:** T.Art by RJ
**Depends on:** PRD 1 (foundation). Can be built in parallel with PRD 2.
**Reference:** ARCHITECTURE.md §6 (JSON-LD), §8 (alt text), §19 (filtering precedent), §20 (detail-page patterns, prev/next bug), §23 (this design, locked)
**Locked design:** artifact "/exhibitions page draft"

> Instructions only. Claude Code writes all code.

---

## 1. Objective

Two routes:

- `/exhibitions` — the full record. Hero band, status filter tabs, one card per
  exhibition.
- `/exhibitions/<slug>` — one exhibition in full: statement, practical
  information, installation gallery, works on view, and `ExhibitionEvent`
  JSON-LD.

---

## 2. Files

| Path | Action |
|---|---|
| `src/pages/exhibitions/index.astro` | Create — list page |
| `src/pages/exhibitions/[slug].astro` | Create — detail page |
| `src/components/exhibitions/ExhibitionCard.astro` | Create — one list row |
| `src/components/exhibitions/ExhibitionMeta.astro` | Create — the icon + date and icon + venue lines, reused on both pages |
| `src/layouts/Layout.astro` | Modify — add the nav item (§10) |
| `src/lib/seo/jsonld.ts` | Modify — add the `ExhibitionEvent` generator |

---

## 3. `/exhibitions` — page structure, in order

1. **Hero band** — eyebrow "Exhibitions", h1, one-line italic sub. Sits at the
   top of the page under the nav, with `--nav-h` clearance.
2. **Filter tabs** — All / Upcoming / Current / Past, each with a count.
3. **Card list** — one card per exhibition, hairline-separated.
4. **Closing strip** — "Can't find what you're looking for?" + "Get in touch →"
   linking to `/contact`. On `--bg-secondary`.
5. Footer (from `Layout.astro`, unchanged).

### Hero band background — deliberately deferred

The locked design shows a painted texture bleeding in from the right behind the
hero. **Do not implement it in this PRD.** Ship the hero on flat
`--bg-primary`.

Reason: §18 documents that the footer's texture assets required a 16×16px local
contrast sweep at rendered scale — slice averages missed real failures — and
that work has not been done for this band. Implement it only as a follow-up,
and only after re-running that measurement. A flat hero is not a compromise
here; it is the correct default until measured.

### Filter tabs — behaviour (locked)

- All four tabs **always render**, each with its count from the tense helper
  (PRD 1, §9).
- The active tab gets `--text-primary` and a 2px `--accent` bottom border.
- **A tab whose count is 0 renders as a `<span aria-disabled="true">` with no
  `href` and no click handler** — out of tab order entirely, ~40% opacity.
  Today that means **Current** is disabled. This mirrors the homepage arrows:
  disabled, not hidden, so the component does not change shape when inventory
  changes.
- Filtering is **client-side**: every card is server-rendered into the DOM, and
  the tabs toggle a class. No refetch, no route change.
- **Progressive enhancement is required:** with JavaScript disabled, every card
  must be visible and the tab row must be hidden (a `<noscript>` style rule).
  Filtering is an enhancement; the complete list is the baseline.
- Keep the JS to a handful of lines, inline in the page, vanilla. No library.

**Rejected alternative — static routes per tense** (`/exhibitions/upcoming`
etc., the §19 pattern). Rejected because those paths collide with
`/exhibitions/<slug>` and would require reserving "upcoming", "current" and
"past" as forbidden slugs, and because a temporal filter over two items earns
no SEO value. Do not implement it. Documented so it is not re-litigated.

---

## 4. Exhibition card (`ExhibitionCard.astro`)

### Layout

Two columns: image left (`aspect-ratio: 3/2`), text right. Same container-query
approach and the same **520px container-width threshold** as the homepage
section (PRD 2 §5) — one row on tablet and up, stacked below. Cards are
separated by `border-bottom: 1px solid var(--border)`.

### Text column, in order

| Element | Source | Notes |
|---|---|---|
| Badge | tense + `type` | One line: e.g. "Upcoming · Solo exhibition". Tense word in `--accent`, the type in `--text-muted`. Uppercase, 10.5px, `.2em` |
| Title | `title` | `--font-serif`, ~24–34px |
| Tagline | `tagline` | `--font-serif` italic, `--text-secondary`. Omit the element entirely if null |
| Date row | formatter (PRD 1) | Calendar icon + text |
| Venue row | `venue`, `city`, `country` | Map-pin icon + text |
| Excerpt | `excerpt` | 14px, `--text-secondary`, `max-width: 52ch`. Omit entirely if null |
| "View details →" | → `/exhibitions/<slug>` | 11px uppercase `--accent` |

The badge replaces any stored status field — tense comes from dates, type from
the schema. One line does both jobs.

### Icons

Use **Astro Icon**, which is already in the stack (`ri:calendar-line` and
`ri:map-pin-line`, matching the `ri:` set already used by the theme toggle).
Do not inline hand-written SVG, do not add an icon package, do not use emoji.
Icons are decorative here — the adjacent text says everything — so they must be
`aria-hidden` and must not be announced.

### No-image fallback (required, not optional)

When `coverImage` is null, the image column renders a **bordered text panel** on
`--bg-secondary` containing the exhibition's `pullQuote` in `--font-serif`
italic. If `pullQuote` is also null, the panel renders empty of text but keeps
its border and height — the card's two-column grid needs its first column
filled.

This differs from the homepage section (PRD 2 §6 state D), which collapses to a
single column instead. Both are correct: the homepage has one item and can
reflow; a list of cards cannot have one row silently change shape.

---

## 5. `/exhibitions/[slug]` — page structure, in order

1. **Back link** — "Back to Exhibitions" → `/exhibitions`. Reuse the existing
   pill treatment from `/works/[slug]` and `/collections/[slug]` verbatim —
   same component, third instance. Normal document flow, not absolutely
   positioned (§20).
2. **Head** — badge (tense · type), h1 `title`, `tagline` if present.
3. **Cover image** — `coverImage` if present, constrained (not full-bleed):
   `max-width: min(1100px, 92vw)`, `object-fit: cover` via hotspot. Omit the
   whole element if null.
4. **Body + practical info** — two columns at ≥900px container width,
   `1.25fr .85fr`:
   - **Left:** `statement` as body copy; `pullQuote` rendered as a blockquote
     with a 1px `--accent` left rule. Either may be null — omit that element,
     never render a placeholder.
   - **Right:** the practical information panel — a bordered
     `--bg-secondary` card, `align-self: start`, headed "Visiting", containing
     a definition list: Dates, Opening reception, Venue (+ `address`), Hours,
     Admission, and a Links row (venue website / directions).
     **Every row is conditional.** A null field means that row does not exist —
     no "TBC", no empty `<dd>`. If every row is null, the panel does not render.
5. **Gallery** — `gallery[]` installation shots, if non-empty. Simple stacked
   or two-column plates, lazy loaded, constrained the same way as the cover.
   Omit the section entirely when the array is empty or null.
6. **Works on view** — `artworks[]`, if non-empty. Reuse the existing work-card
   pattern from `/collections/[slug]` — do not invent a second card. Section
   head follows the §17 separator pattern with a "View all works →" secondary
   link. Omit the section entirely when empty.
7. **Prev / next exhibition** — see §6 below. Read it before writing it.
8. **Closing strip** — enquiry line → `/contact`.

### Structural rule

Order and layout are driven by **schema fields**, never by array position. Do
not treat `gallery[0]` as a hero or `artworks[0]` as special. §20 documents
exactly this failure.

---

## 6. Prev / next exhibition — three cases, not two

This is a **repeat of a bug already shipped on this site** (§20). Implement it
carefully.

| Exhibition count | Behaviour |
|---|---|
| `n <= 1` | Both null. Skip the section entirely — never link back to the page you are on |
| `n === 2` | **No wrap.** Index 0 gets `next` only; index 1 gets `prev` only. Exactly one link per page |
| `n >= 3` | Wraps: the last exhibition's `next` is the first |

The naive `(i-1+n)%n` / `(i+1)%n` arithmetic resolves to the same index when
`n === 2`, producing "Previous" and "Next" links pointing at the identical
document. That exact bug was live on `/collections/[slug]`.

**And today there are exactly two exhibitions.** This will be hit immediately,
not hypothetically.

Because either link may be absent, the container must **not** use
`justify-content: space-between` — that collapses a lone "Next" to the left
edge. Pin direction structurally: give the next-link `margin-left: auto`.

Compute neighbours in `getStaticPaths()` from the same ordered list that
generates the paths, so routes and neighbour links cannot disagree about which
exhibitions exist (§20).

---

## 7. SEO and JSON-LD

- Unique `<title>` and meta description per exhibition. Use the `seo` object
  when populated; otherwise derive from `title`, `venue`, `city` and the
  formatted date range.
- OG image: `coverImage` when present, else the site default.
- Canonical URL on both routes.
- Add an **`ExhibitionEvent`** JSON-LD generator to `src/lib/seo/jsonld.ts`
  (§6 already specifies this type). Populate `name`, `startDate`, `endDate`,
  `image`, `url`, and `location` as a `Place` with `name` and
  `address` — omit any property whose source field is null rather than emitting
  an empty string.
- **Astro does not interpolate `{expr}` inside `<script>`.** Emit the JSON-LD
  using the `<Fragment set:html={...}>` pattern documented in CLAUDE.md. A
  plain `<script type="application/ld+json">{JSON.stringify(x)}</script>` will
  silently ship the literal text.
- `/exhibitions` gets `CollectionPage` JSON-LD, matching how `/works` is
  handled.

---

## 8. Images — rules for both pages

- One `<img>` per image. Never duplicate per breakpoint.
- `urlFor()` with `fm=webp`, `q=85`, and **`fit=max`** so Sanity never upscales
  past the source (§20 — this cut up to 84% of wasted bytes on the collections
  pages).
- Widths: list card 800, detail cover 1600, gallery plates 1600.
- Explicit `width`/`height` on every image. CLS stays 0.
- `loading="lazy"` everywhere on `/exhibitions`. On the detail page, the cover
  image may be `eager` (it is above the fold); everything below it is lazy.
- **Alt text (§8):** card images sit inside links that already carry the title
  as visible text → `alt=""`. The detail-page cover image stands alone → use
  the descriptive `altText` field, falling back to a sensible derived string.
  Gallery images stand alone → descriptive alt required.

---

## 9. Empty and degraded states — checklist

| Situation | Required behaviour |
|---|---|
| Zero exhibitions | `/exhibitions` renders the hero and a single quiet line of copy. Tabs do not render. Nav item is not generated (§10) |
| Tab count 0 | Tab renders disabled, not hidden |
| No `coverImage` | List: bordered `pullQuote` panel. Detail: cover element omitted |
| No `excerpt` | Element omitted, no reflow gap |
| No `statement` and no `pullQuote` | Left column of the detail body omitted; practical panel goes full width |
| Every practical field null | Panel does not render |
| Empty `gallery` / `artworks` | Those sections do not render |
| Sanity unreachable at build | `getAllExhibitions()` returns `[]` → the zero-exhibitions path above. The build must not fail |

---

## 10. Navigation

Add **Exhibitions** to the nav in `Layout.astro`, positioned per the locked
design: after Collections, before About.

Generate the item **only when at least one exhibition exists**. A nav link to
an empty page is worse than no link. Mark it active on both `/exhibitions` and
`/exhibitions/<slug>`.

---

## 11. Styling and quality rules

- Zero hardcoded hex. Every colour a token. Add to `tokens.css` first if
  missing.
- Both themes verified by toggling, not assumed.
- Eyebrows at the shared 11px / `.22em` (§21). No third value.
- `.reveal` on cards for scroll fade-in, using the existing observer.
- Visible `:focus-visible` on every link, button and tab.
- Wide content (the practical info panel's address lines especially) must never
  cause horizontal body scroll.
- No new npm dependencies. No `any`. No `@ts-ignore`.

---

## 12. Out of scope — do not build

- The hero texture band (§3).
- "Add to calendar" / `.ics` generation. Revisit once a show is imminent.
- Deep-linking a tab via URL hash.
- Pagination or year grouping. At two exhibitions both are noise; revisit past
  ~12 entries.

---

## 13. Acceptance criteria

1. `/exhibitions` lists both exhibitions, correct badges, correct counts on all
   four tabs, Current disabled.
2. Clicking Upcoming / Past filters the list; All restores it. Disabling
   JavaScript shows all cards with no tab row.
3. `/exhibitions/<slug>` builds for **every** exhibition and renders correctly
   with only the six required fields populated — no placeholders, no empty
   panels, no layout collapse.
4. **With exactly two exhibitions:** page 1 shows only a "Next" link, page 2
   shows only a "Previous" link, and neither links to itself. Verify by
   clicking both.
5. Removing a cover image gives the bordered pull-quote panel on the list and
   omits the cover on the detail page.
6. Nav shows Exhibitions and marks it active on both routes; with all
   exhibitions unpublished, the nav item is gone.
7. `ExhibitionEvent` JSON-LD is present, valid, and passes Google's Rich
   Results Test.
8. Row layout verified at 1440 / 1280 / 1024 / 768 / 375 px.
9. Lighthouse on `/exhibitions`: Performance ≥ 98, Accessibility 100, Best
   Practices 100, SEO 100.
10. `npx astro check` clean. `npm run build` succeeds and the page count
    increases by 1 + (number of exhibitions).

---

## 14. Claude Code kickoff prompt

```
Read CLAUDE.md and ARCHITECTURE.md §6, §8, §17, §20, §23, then implement
PRD-Exhibitions-3-Pages.md.

PRD 1 must be done first — use getAllExhibitions(), the tense helper and the
date formatter from src/lib/exhibitions/.

Build in this order, reporting after each step:
1. src/components/exhibitions/ExhibitionMeta.astro (icon rows)
2. src/components/exhibitions/ExhibitionCard.astro
3. src/pages/exhibitions/index.astro (hero, tabs, list, closing strip)
4. src/pages/exhibitions/[slug].astro (detail)
5. ExhibitionEvent generator in src/lib/seo/jsonld.ts
6. Nav item in Layout.astro

Critical, in order of how likely they are to bite:
- Prev/next has THREE cases. At n===2 there must be NO wrap: page 1 gets Next
  only, page 2 gets Prev only. The %n arithmetic gives both pages the same
  target and this exact bug already shipped on /collections/[slug]. There are
  exactly 2 exhibitions today, so this WILL happen.
- Tabs filter client-side. All cards server-rendered. With JS off, all cards
  visible and the tab row hidden via noscript.
- A tab with count 0 is a span with aria-disabled, no href, out of tab order.
- JSON-LD must use the Fragment set:html pattern, not a plain script tag.
- Card images inside title links get alt="". The detail cover and gallery
  images stand alone and need descriptive alt.
- Every practical-info row is conditional; if all are null the panel does not
  render at all.
- fit=max on every urlFor call.

Do NOT build: the hero texture band, .ics calendar files, hash-linked tabs,
pagination.

Verify at 1440/1280/1024/768/375. Run npx astro check — 0 errors, 0 warnings.
```
