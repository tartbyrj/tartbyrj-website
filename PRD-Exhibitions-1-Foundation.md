# PRD 1 — Exhibitions Foundation (schema, types, queries, utils)

**Project:** T.Art by RJ
**Depends on:** nothing
**Blocks:** PRD 2 (homepage section), PRD 3 (/exhibitions pages)
**Reference:** ARCHITECTURE.md §5 (schemas), §22 (homepage section, locked), §23 (exhibitions pages, locked)

> This PRD is instructions only. Claude Code writes all code. Do not copy any
> field list here into a component — schema is the source of truth, and the Zod
> type is derived from it.

---

## 1. Objective

Stand up the entire data layer for Exhibitions — Sanity schema, Zod type, GROQ
queries, shared data accessor, and two pure utility functions — so that PRD 2
and PRD 3 are pure presentation work with zero data plumbing left in them.

Nothing in this PRD renders anything. At the end of it the site looks
unchanged; `npx astro check` is clean; a developer can create an Exhibition
document in Studio and fetch it.

**Do not build any UI in this PRD.**

---

## 2. Files to create

| Path | Purpose |
|---|---|
| `src/sanity/schemas/exhibition.ts` | Sanity document schema |
| `src/types/exhibition.ts` | Zod schema + inferred TS type |
| `src/lib/exhibitions/data.ts` | Shared memoized fetch accessor |
| `src/lib/exhibitions/tense.ts` | Pure tense derivation (upcoming/current/past) |
| `src/lib/exhibitions/format.ts` | Pure date-range formatter |

## 3. Files to modify

| Path | Change |
|---|---|
| `src/sanity/schemas/index.ts` | Register `exhibition` in `schemaTypes` |
| `src/lib/sanity/queries.ts` | Add the GROQ queries listed in §7 |

---

## 4. Task 1 — Sanity schema (`exhibition`)

Create the document schema. Title in Studio: **Exhibition**.

### Fields

| Field | Type | Required | Notes for Claude Code |
|---|---|---|---|
| `title` | string | yes | — |
| `slug` | slug | yes | Auto-generate from `title`, max 96 |
| `type` | string | yes | Radio/dropdown list, exactly these five options: `Solo exhibition`, `Group exhibition`, `Mural commission`, `Art fair`, `Workshop`. Store the display string as the value — no separate value/label split, no lowercase slugs. |
| `startDate` | date | yes | Date only, no time |
| `endDate` | date | yes | Date only. Custom validation: must be on or after `startDate`, with a clear error message |
| `venue` | string | yes | e.g. "Tawa Art House" |
| `city` | string | yes | — |
| `country` | string | no | — |
| `tagline` | string | no | Max 80. Studio description: the short italic line under the title, e.g. "New works by Rupjyoti Baruah". Leave blank if it only restates the title. |
| `excerpt` | text | no | Max 200, rows 2. Studio description: 1–2 lines shown on the exhibitions list card only. Not the full statement. |
| `coverImage` | image | no | `hotspot: true`. Studio description must say it is optional and the layout degrades gracefully without it |
| `altText` | string | no | Alt text for `coverImage`. Only used where the image stands alone (see §11) |
| `address` | text | no | Rows 3. Full street address for the detail page and directions link |
| `openingReception` | string | no | Opening night, verbatim display text — e.g. "Friday 13 November, 6:00 – 9:00 pm". **Not a `datetime`** — see the note below the table |
| `hours` | string | no | e.g. "Tuesday — Sunday, 10 am — 7 pm" |
| `admission` | string | no | `initialValue: 'Free entry'` |
| `statement` | text | no | Rows 8. Detail-page body copy |
| `pullQuote` | string | no | Max 160. Doubles as the no-image fallback panel on the list — see PRD 3 |
| `artworks` | array of references → `artwork` | no | "Works on view" on the detail page |
| `gallery` | array of images | no | Installation shots. `hotspot: true` on each |
| `link` | url | no | External venue website |
| `seo` | object | no | Same shape as `artwork.seo`: `metaTitle`, `metaDescription`, `ogImage` |

> **Why `openingReception` is a string, not a `datetime`.** Sanity's datetime
> widget resolves what the editor types against the *editor's own browser
> timezone*. RJ authors from both Dubai and Assam, so a Dubai show entered
> from Assam stores an instant 1.5 hours off the intended wall-clock time, and
> no output formatting recovers it. A companion timezone field would only
> yield a correctly-formatted wrong answer — worse than plain text, because it
> looks trustworthy. The value is display-only: it is **not** in the
> `ExhibitionEvent` JSON-LD (which uses the exhibition's own `startDate` /
> `endDate`) and does not need to be machine-readable. It renders verbatim.
> This mirrors `hours`, a plain string for the same reason — keep the two
> consistent. Changed 2026-09-10, while zero exhibition documents were
> published, so it cost no migration.

### Hard rules for this schema

1. **Do NOT add a `status`, `isUpcoming`, `isCurrent`, `featured` or `archived`
   field.** Tense is derived from dates at build time (Task 4). A stored flag
   will be forgotten and the site will advertise a closed show. This is a
   locked decision — ARCHITECTURE.md §22.
2. **Do NOT add a `year` field.** It is derivable from `startDate`. The v1
   draft in §5 had one; it is dropped.
3. Every optional field must be genuinely optional in Studio — no
   `validation: Rule.required()` on anything not marked required above.

### Studio preview

Configure `preview` to show `title` as the heading, and a subtitle combining
`type` and the start date's year. Use `coverImage` as the preview media when
present. This matters — RJ will be picking from a list of these.

### Ordering

Add an `orderings` entry: **Start date, newest first** (`startDate desc`), and
make it the default ordering in Studio.

---

## 5. Task 2 — Register the schema

Add `exhibition` to the exported `schemaTypes` array in
`src/sanity/schemas/index.ts`. Confirm the document type appears in Studio at
`/studio` after `npm run dev`.

---

## 6. Task 3 — Zod type (`src/types/exhibition.ts`)

Mirror the pattern already used in `src/types/collection.ts`. Export both the
Zod schema (`ExhibitionSchema`) and the inferred type (`Exhibition`).

### Non-negotiable rules (each of these is a bug this project has already shipped once)

1. **Every optional field uses `.nullish()`, never `.optional()`.** GROQ
   returns `null`, not `undefined`, for anything unset in Studio, and
   `.optional()` rejects `null`, which silently drops the whole document.
2. **`coverImage` and each `gallery[]` item:** shape must accept `hotspot` and
   `crop` as `.nullish()`.
3. **`artworks[]` item images use `.nullish().catch(null)`.** The `.catch()` is
   required, not stylistic — the detail page validates one document with a
   single `safeParse`, so there is no per-item damage containment above it.
   Without the catch, one artwork missing an image asset fails the item → the
   array → the whole exhibition → and the detail page 404s. The catch degrades
   it to a missing thumbnail.
4. **`type` is `z.string().nullish()`, NOT `z.enum([...])`.** If a taxonomy
   label is renamed later while old documents still carry the previous string,
   an enum makes `safeParse` drop the exhibition entirely. Unknown values are
   filtered at the presentation layer, where failing is cheap. This is the
   exact lesson from ARCHITECTURE.md §19.
5. Export a `parseList` helper (or reuse the existing one if the project
   already has a shared one) so a single malformed document drops itself, not
   the whole list.

---

## 7. Task 4 — GROQ queries (`src/lib/sanity/queries.ts`)

Add these, following the naming convention already in the file.

| Query name | Returns |
|---|---|
| `EXHIBITIONS_ALL_QUERY` | Every exhibition with a defined slug, ordered `startDate desc`. Projects every field needed by both the list card and the homepage section. Does **not** dereference `artworks[]` or project `gallery[]` — those are detail-page only. |
| `EXHIBITION_BY_SLUG_QUERY` | One exhibition by `slug.current`, all fields, with `artworks[]` dereferenced to `{ _id, title, slug, image, year, medium }` and `gallery[]` projected in full. |

### Rules

1. **`coverImage` must be null-guarded inside the GROQ projection**, using the
   same `select(defined(coverImage.asset) => ...)` pattern already used by
   `COLLECTIONS_ALL_QUERY`. The Zod schema requires `asset`, so a
   half-populated image object would fail `safeParse` and silently drop the
   exhibition. The guard belongs in the query, not in Zod. See §21.
2. Filter on `defined(slug.current)` in both queries — an unpublished draft
   without a slug must never generate a route.
3. Do **not** add a separate count query. Counts for the filter tabs (PRD 3)
   are derived in memory from the single fetch.
4. Do **not** add a query that filters by tense. Tense is computed in JS after
   the fetch — GROQ has no access to build time in a way that is worth the
   complexity here, and one fetch serving every route is the §19 pattern.

---

## 8. Task 5 — Shared accessor (`src/lib/exhibitions/data.ts`)

Export `getAllExhibitions()`. It must:

1. Fetch `EXHIBITIONS_ALL_QUERY` once, `.catch(() => null)` on the client call.
2. Validate with `parseList` / `safeParse` — never `.parse()`.
3. Return an empty array (never throw, never return null) when Sanity is
   unreachable or the response fails validation. Every consumer must be able
   to treat "no exhibitions" as a normal state.
4. **Memoize at module scope for production builds**, so every route in a
   given build sees the same snapshot — and **skip the cache when
   `import.meta.env.DEV`**, because Vite's HMR cannot know a Studio edit
   happened. Copy the exact pattern from `src/lib/works/data.ts`
   (`getAllArtworks()`); do not invent a second caching approach.

---

## 9. Task 6 — Tense derivation (`src/lib/exhibitions/tense.ts`)

A pure function, no Astro imports, no DOM, independently unit-testable.

**Signature intent:** takes an exhibition (or its two date strings) and returns
one of `'upcoming' | 'current' | 'past'`.

### Rules

| Condition | Result |
|---|---|
| `startDate` is in the future | `upcoming` |
| `startDate` ≤ today ≤ `endDate` | `current` |
| `endDate` is in the past | `past` |

### Implementation constraints

1. **Compare date-only values, not timestamps.** Sanity `date` fields come back
   as `YYYY-MM-DD` strings. Parse them as calendar dates and compare against
   today's calendar date. Do not run them through `new Date()` and compare
   instants — that introduces a timezone offset bug where a show flips tense
   several hours early or late depending on the build machine's zone.
   Cloudflare builds in UTC; RJ's shows are in UAE and India.
2. An exhibition on its `endDate` is still `current`. Inclusive on both ends.
3. If either date is missing or unparseable, return `past` and do not throw.
   A malformed exhibition must not break the build or hijack the homepage's
   featured slot.
4. Export a second helper that, given the full list, returns the counts per
   tense — PRD 3's tabs need it and must not recompute it three times.

### Known limitation to document in a code comment

The site is statically built. Tense is frozen at build time, so a show that
opens tomorrow still reads `upcoming` until the next deploy. Mitigations, in
order of preference — implement none of them in this PRD, just leave the
comment:

- A daily scheduled Cloudflare deploy hook (recommended, ~1 line of config).
- Coarse, build-safe labels only — which is why §22 forbids a live countdown.

---

## 10. Task 7 — Date range formatter (`src/lib/exhibitions/format.ts`)

Pure function. Takes `startDate` and `endDate`, returns one display string.

| Case | Output |
|---|---|
| Same month and year | `14 – 28 November 2026` |
| Different month, same year | `28 November – 4 December 2026` |
| Different year | `28 December 2026 – 4 January 2027` |
| Same day | `14 November 2026` |
| Missing `endDate` | Render the start date alone — never `14 – Invalid Date` |

### Rules

1. Use an **en dash** (`–`) with spaces either side, not a hyphen.
2. Locale: `en-GB` day-first. No US month-first anywhere on this site.
3. This function returns a string only. It does not return markup and does not
   know about CSS. The `font-variant-numeric: tabular-nums` styling belongs to
   the component, not here.

---

## 11. Cross-cutting conventions (apply to every task above)

- `npx astro check` must report **0 errors, 0 warnings** before this PRD is
  considered done.
- No `any`. No `as any`. No `// @ts-ignore`.
- No new npm dependencies. Everything here is achievable with what is
  installed.
- Do not import `global.css` anywhere — only `Layout.astro` does.

---

## 12. Acceptance criteria

1. `exhibition` appears in Sanity Studio and a complete document can be created
   and published, with only the six required fields filled.
2. A document with **only** the required fields (no image, no tagline, no
   excerpt, no statement) validates and is returned by `getAllExhibitions()`.
3. A document with a deliberately broken image (asset removed) still validates
   and returns with `coverImage: null` — it does not disappear.
4. Tense function returns the correct value for: a show starting next month, a
   show running right now, a show that ended last year, and a show with a null
   `endDate`.
5. Date formatter produces each of the five cases in §10 correctly.
6. `npx astro check` clean.
7. **The site renders exactly as it does today** — no visual change, since
   nothing consumes this data yet.

---

## 13. Claude Code kickoff prompt

```
Read CLAUDE.md and ARCHITECTURE.md §5, §19, §21 first, then implement
PRD-Exhibitions-1-Foundation.md in full.

This PRD is data layer only — do NOT build any UI, page, or component.

Work in this order and stop after each numbered task to report what you did:
1. src/sanity/schemas/exhibition.ts + register in schemas/index.ts
2. src/types/exhibition.ts (Zod)
3. GROQ queries in src/lib/sanity/queries.ts
4. src/lib/exhibitions/data.ts
5. src/lib/exhibitions/tense.ts
6. src/lib/exhibitions/format.ts

Pay specific attention to these, they are prior shipped bugs in this repo:
- .nullish() never .optional() on every optional field
- coverImage null-guarded in the GROQ projection, not in Zod
- artworks[].image needs .nullish().catch(null)
- type is z.string().nullish(), never z.enum()
- getAllExhibitions must copy the DEV-cache-skip pattern from
  src/lib/works/data.ts exactly
- tense.ts compares calendar dates, not timestamps (timezone bug)

Do not add a status/featured/year field to the schema.
Run npx astro check at the end. It must be 0 errors 0 warnings.
```
