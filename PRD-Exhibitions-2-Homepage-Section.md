# PRD 2 — Homepage Exhibitions Section (section 5)

**Project:** T.Art by RJ
**Depends on:** PRD 1 (foundation) — must be complete and `astro check` clean
**Reference:** ARCHITECTURE.md §17 (homepage composition), §22 (this section, locked)
**Locked design:** artifact "v2 — side-by-side homepage section"

> Instructions only. Claude Code writes all code.
> This design is **locked**. If something here seems wrong, stop and raise it —
> do not silently improve it.

---

## 1. Objective

Build homepage section 5: a single upcoming exhibition, presented as one
feature block — image frame left, details right — plus prev/next arrows that
are disabled until there is more than one show to cycle through.

Not a grid. Not a carousel that auto-advances. Not a card list. At the current
inventory (one upcoming, one past) a grid reads as broken, not sparse.

---

## 2. Files

| Path | Action |
|---|---|
| `src/components/exhibitions/ExhibitionsSection.astro` | Create — the whole section |
| `src/pages/index.astro` | Modify — import and place the section |

Create the `src/components/exhibitions/` directory. PRD 3 will add siblings to
it, so name the folder now.

---

## 3. Placement in the homepage

Insert **after** The Artist section (`id="artist"`), **before** the footer.
Give the section `id="exhibitions"` — the nav anchors to it.

### Background rule — do not violate

The section sits on `var(--bg-primary)`. The Artist section stays the single
tonal break on the homepage (`--bg-elevated`). Adding a background change here
breaks a locked decision (§17). No exceptions, including "just a subtle tint".

---

## 4. Data selection logic

Call `getAllExhibitions()` in the component's frontmatter, then:

1. Build the **feature set**: all exhibitions whose tense is `current` or
   `upcoming`, sorted by `startDate` **ascending** (soonest first — note this is
   the opposite of the query's default `desc` order).
2. The **featured exhibition** is `featureSet[0]`.
3. **If the feature set is empty**, fall back to the single most recent `past`
   exhibition. The section still renders — see §6 state B.
4. **If there are no exhibitions at all**, render nothing: the component
   returns null/empty, and the homepage must not leave an empty `<section>`,
   stray separator, or vertical gap behind. See §6 state C.

---

## 5. Layout (locked)

### Structure, in DOM order

1. **Section head** — the standard §17 separator pattern:
   `border-top: 1px solid var(--border-strong)`, `padding-top: 22px`, uppercase
   eyebrow **"Exhibitions"** on the left, **"View all exhibitions →"** linking
   to `/exhibitions` on the right.
   The eyebrow is the word "Exhibitions" only. **Never "Upcoming
   Exhibitions"** — §22 dropped that wording deliberately.
2. **Feature block** — two columns:
   - Left: image frame, `aspect-ratio: 4/3`
   - Right: the detail stack (§6)

### Breakpoint — read this carefully, it is the one bug this design already hit

Use a **container query**, not a viewport media query, scoped to the section's
own wrapper (`container-type: inline-size`).

- **≥ 520px container width:** two columns, `minmax(200px, 380px) 1fr`
- **< 520px container width:** single column, image above text, image drops to
  `aspect-ratio: 3/2`

The threshold is **520px of container width**, and it is deliberately low. An
earlier version used 860px and collapsed to the stacked mobile layout on real
laptops, because the section's available width — after page padding and
wrapper insets — never reached 860. Do not raise this number without measuring
the actual rendered container width at 1440px, 1024px and 768px viewports.

---

## 6. Content (locked)

### State A — an upcoming or current exhibition exists (the normal case)

Right column, in order:

| Element | Source | Styling notes |
|---|---|---|
| Kicker | `type` | 11px, uppercase, `letter-spacing: .2em`, `--text-muted` |
| Title | `title` | `--font-serif`, weight 300, clamped ~28–42px, `text-wrap: balance` |
| Dates | formatter from PRD 1 | 14px, `--text-secondary`, `font-variant-numeric: tabular-nums` |
| Venue line | `venue`, `city`, `country` | `--font-serif` italic, `--text-secondary`. Join with commas; omit `country` gracefully if null |
| Footer row | — | `border-top: 1px solid var(--border)`, `padding-top`, flex row, space-between |
| ↳ "View details" link | → `/exhibitions/<slug>` | 11px uppercase, `--accent`, trailing arrow |
| ↳ Prev/next arrows | — | Right-aligned pair, see §7 |

**Nothing else.** No description paragraph, no opening hours, no admission, no
facts grid, no second CTA button. All of that was cut deliberately in §22 —
it lives on `/exhibitions` and the detail page. If it looks sparse in
isolation, that is the intent: the homepage says a show exists and hands off.

### State B — no upcoming or current exhibition

Same component, one branch:

- Kicker becomes the muted word **"Most recent"** followed by `type`
- Title, dates, venue render identically
- "View details" stays
- Arrows are disabled (there is exactly one item in this fallback)

Do **not** render an empty state, a "coming soon" line, or a placeholder card.

### State C — no exhibitions at all

Render nothing. Also ensure the nav's Exhibitions item is not generated in this
case (coordinate with PRD 3, which owns the nav change) — an empty
`/exhibitions` page is worse than no exhibitions page.

### State D — featured exhibition has no `coverImage`

The feature block collapses to a **single full-width text column**, centred
within the section's max width. Do **not** render a grey placeholder box, a
broken image frame, or an icon in the image column. `coverImage` is nullable
and will frequently be null at launch.

---

## 7. Prev/next arrows

- Two circular buttons, ~38px, `1px solid var(--border-strong)`, transparent
  fill, chevron glyphs, `--text-secondary`.
- They cycle through the **feature set** (§4) — not the full archive.
- **When the feature set length ≤ 1** (which is the case today): render both
  buttons with the `disabled` attribute, `aria-disabled="true"`, ~35% opacity,
  `cursor: default`, and **bind no JavaScript at all**.
- They are rendered disabled, **not hidden** — so the component does not
  visibly change shape the day a second show is added.
- When the set has 2+ items: all items render in the DOM, one visible at a
  time; the buttons swap which is shown. Vanilla JS only, inline in the
  component, no library, no Motion One. Respect `prefers-reduced-motion` by
  skipping any crossfade and swapping instantly.
- Every button needs a real `aria-label` ("Previous exhibition" / "Next
  exhibition"). Icon-only buttons with no accessible name are an
  accessibility-score failure and this project targets 100.

---

## 8. Images

- One `<img>` per exhibition. **Never** render the same image twice to serve
  different breakpoints — reposition one element with CSS. This is a locked
  rule (§17) and doubles image weight when broken, because Chrome downloads
  `display: none` images.
- `urlFor()` with `w=1200` desktop / `w=800` mobile, `fm=webp`, `q=85`, plus
  `fit=max` so Sanity never upscales past the source (§20 lesson).
- Explicit `width` and `height` attributes — CLS must stay 0.
- `loading="lazy"` — this section is far below the fold on every viewport.
- `object-fit: cover`, with `object-position` driven by the hotspot when set.
- **Alt text:** the image sits inside a link whose visible text already
  includes the exhibition title, so use `alt=""` to avoid the screen reader
  announcing the title twice (§8). Use the descriptive `altText` field only
  where the image stands alone — which on this section it does not.

---

## 9. Styling rules

- **Zero hardcoded hex values.** Every colour is a `var(--token)`. If a needed
  colour does not exist, add it to `tokens.css` first.
- Both themes must be correct. Verify by toggling — the section uses only
  existing tokens, so this should be automatic; confirm it anyway.
- Add `.reveal` to the feature block so it fades up on scroll via the existing
  `IntersectionObserver` in `Layout.astro`. Do not write a new observer.
- Eyebrow typography must match the existing shared value: 11px, `.22em`
  letter-spacing, same as `.ci-eyebrow` / `.works-eyebrow` (§21). Do not
  invent a third eyebrow size.
- Focus states: every link and button needs a visible `:focus-visible` style.

---

## 10. Acceptance criteria

1. With one upcoming exhibition in Sanity: section renders image left, details
   right at 1440px, 1280px, 1024px and 768px viewport widths — **verify all
   four**, this is where the previous version failed.
2. At 375px: stacked, image on top at 3:2.
3. Arrows render disabled and are not focusable when only one upcoming show
   exists.
4. Unpublish the upcoming exhibition → section switches to "Most recent" using
   the past show, no layout break.
5. Unpublish all exhibitions → section vanishes cleanly, no empty gap or stray
   border on the homepage.
6. Remove the cover image from the featured exhibition → single centred text
   column, no grey box.
7. Both themes correct. Lighthouse Performance ≥ 98 and Accessibility 100 on
   the homepage, unchanged from before this section existed.
8. `npx astro check` clean.

---

## 11. Claude Code kickoff prompt

```
Read CLAUDE.md, ARCHITECTURE.md §17 and §22, then implement
PRD-Exhibitions-2-Homepage-Section.md.

PRD 1 (foundation) must already be done — use getAllExhibitions(), the tense
helper and the date formatter from src/lib/exhibitions/. Do not re-fetch or
re-derive any of that inside the component.

Build src/components/exhibitions/ExhibitionsSection.astro and place it in
index.astro after the Artist section, before the footer, with id="exhibitions".

Locked design constraints — do not deviate:
- Image left / details right in ONE row on desktop and tablet
- Container query at 520px container width, NOT a viewport media query, and
  NOT a higher threshold. 860px was the previous value and it collapsed the
  layout on real laptops.
- Content is exactly: type kicker, title, dates, venue, "View details" link,
  prev/next arrows. No description, no facts grid, no second button.
- Eyebrow reads "Exhibitions", never "Upcoming Exhibitions"
- Section stays on --bg-primary. Do not add a background tint.
- Arrows render disabled (not hidden) when there is ≤1 upcoming exhibition,
  and bind no JS in that case.

Handle all four states: normal, no-upcoming (falls back to most recent past),
no exhibitions at all (render nothing), and no cover image (single centred
text column, never a grey placeholder box).

Test the layout at 1440, 1280, 1024, 768 and 375 px before telling me it works.
Run npx astro check — 0 errors, 0 warnings.
```
