# T.Art by RJ — Project Architecture
**Artist:** Rupjyoti Baruah  
**Studio:** T.Art by RJ  
**Document version:** 1.0 — July 2025  
**Status:** Active reference — update as decisions change

---

## 0. North Star

> The real product is not the Astro site.  
> The real product is how visitors feel while experiencing Rupjyoti Baruah's work.  
> Every technical decision must pass one filter:  
> **does this help or hinder someone standing in front of his paintings?**

---

## 1. Three-Layer Architecture

```
┌─────────────────────────────────────────────┐
│             🎨 EXPERIENCE LAYER             │
│                                             │
│  Typography · Motion · Storytelling         │
│  Gallery experience · UI/UX                 │
│                                             │
│  Fonts: Cormorant Garamond (display/serif)  │
│          Jost (body/sans)                   │
│  Motion: CSS transitions + IntersectionObs  │
│  Scroll: Native smooth scroll               │
│  Theme:  Dark (#080706) + Gold (#c9a96e)    │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│           🧩 APPLICATION LAYER             │
│                                             │
│  Astro v7 · TypeScript · Tailwind CSS v4    │
│  Components · Routing · SEO · Zod           │
│  Sanity integration · Image pipeline        │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│             ⚙️ PLATFORM LAYER              │
│                                             │
│  GitHub · Cloudflare Pages · Sanity CMS     │
│  Domain · SSL · Analytics · Webhooks        │
└─────────────────────────────────────────────┘
```

---

## 2. Complete Tech Stack

### Frontend
| Tool | Version | Purpose |
|---|---|---|
| Astro | v7 | Site framework, static output |
| TypeScript | v5 | Type safety across all files |
| Tailwind CSS | v4 | Utility styling, responsive layout |
| Zod | latest | Runtime validation of Sanity API responses |
| Astro Icon | latest | SVG icon system, icons live in Git |
| Vanilla JS | — | Canvas animation, IntersectionObserver, cursor |
| Motion One | if needed | Complex animation sequences only (not default) |
| Lenis | if needed | Horizontal gallery scroll only (not default) |

### Typography (Self-Hosted — NOT Google Fonts CDN)
| Font | Weights | Usage |
|---|---|---|
| Cormorant Garamond | 300, 400, 300i, 400i | Display, headings, artist name, quotes |
| Jost | 300, 400, 500 | Body, nav, labels, metadata |

> **Critical:** Fonts must be self-hosted as WOFF2 in `public/fonts/`.  
> Google Fonts CDN kills Lighthouse Performance score. Non-negotiable.

### Content Management
| Tool | Purpose |
|---|---|
| Sanity v3 | Structured content database |
| Sanity Studio v3 | Admin UI for Rupjyoti to manage content |
| @sanity/client | Fetches content into Astro at build time |
| @sanity/image-url | Generates optimised CDN image URLs |

### Platform
| Tool | Purpose | Cost |
|---|---|---|
| GitHub | Source repository | Free |
| Cloudflare Pages | Hosting, global CDN | Free |
| Sanity CDN | Image hosting and optimisation | Free tier |
| Cloudflare Web Analytics | Privacy-first analytics, no cookies | Free |
| Domain registrar | DNS pointed to Cloudflare | Already purchased |
| Cloudflare SSL | HTTPS certificate, auto-renewed | Free |

### Phase 2 (not yet built)
| Tool | Purpose |
|---|---|
| Formspree | Contact / commission inquiry form |
| Stripe | Payment processing for painting sales |
| Snipcart | Shopping cart layer on top of Stripe |
| Calendly or custom | Lesson / workshop booking |

**Monthly cost at launch: $0**

---

## 3. Content Strategy

### Store in Sanity (editable content)
- Paintings / artworks
- Collections / series
- Artist biography and statement
- Process images and notes
- Journal / blog posts
- Exhibitions and shows
- Homepage featured content
- SEO metadata per page
- Site settings (social links, email, defaults)
- Navigation structure

### Keep in Git (static assets)
- Logo files (SVG)
- Icons
- Font files (WOFF2)
- Static illustrations
- Favicon and OG default image
- Configuration files
- Design tokens
- Component code

> **Rule:** If Rupjyoti needs to change it without a developer, it goes in Sanity.  
> **Rule:** Never use Sanity as a file manager. Large PDFs or videos live elsewhere.

---

## 4. Folder Structure

```
tartbyrj/
│
├── public/
│   ├── fonts/
│   │   ├── CormorantGaramond-Light.woff2
│   │   ├── CormorantGaramond-LightItalic.woff2
│   │   ├── CormorantGaramond-Regular.woff2
│   │   ├── CormorantGaramond-Italic.woff2
│   │   ├── Jost-Light.woff2
│   │   ├── Jost-Regular.woff2
│   │   └── Jost-Medium.woff2
│   ├── icons/
│   ├── logo/
│   │   ├── tartbyrj-logo.svg
│   │   └── tartbyrj-logo-white.svg
│   └── og-default.jpg
│
├── sanity/
│   ├── schemas/
│   │   ├── artwork.ts
│   │   ├── collection.ts
│   │   ├── exhibition.ts
│   │   ├── process.ts
│   │   ├── journal.ts
│   │   ├── aboutPage.ts        (singleton)
│   │   ├── homepage.ts         (singleton)
│   │   ├── siteSettings.ts     (singleton)
│   │   ├── navigation.ts       (singleton)
│   │   └── index.ts
│   └── lib/
│       └── queries.ts           (all GROQ queries)
│
├── src/
│   ├── components/
│   │   ├── ui/                  (Button, Badge, Divider, Tag)
│   │   ├── gallery/             (ArtworkGrid, ArtworkCard, Lightbox)
│   │   ├── hero/                (HeroCanvas, HeroContent, ScrollIndicator)
│   │   ├── navigation/          (Nav, MobileMenu, NavLink)
│   │   ├── footer/              (Footer, FooterLinks)
│   │   ├── artwork/             (ArtworkDetail, ArtworkMeta, ArtworkImage)
│   │   ├── journal/             (JournalCard, JournalGrid)
│   │   └── process/             (ProcessGallery, ProcessCard)
│   │
│   ├── layouts/
│   │   └── Layout.astro         (base shell: fonts, nav, footer, cursor, SEO)
│   │
│   ├── pages/
│   │   ├── index.astro          (homepage)
│   │   ├── works/
│   │   │   ├── index.astro      (all artworks grid)
│   │   │   └── [slug].astro     (individual artwork — SEO critical)
│   │   ├── collections/
│   │   │   ├── index.astro      (all series/collections)
│   │   │   └── [slug].astro     (individual series)
│   │   ├── exhibitions/
│   │   │   └── index.astro
│   │   ├── process/
│   │   │   └── index.astro
│   │   ├── journal/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── artist.astro         (the Artist page, at /artist)
│   │   ├── about.astro          (redirect stub → /artist, no markup)
│   │   ├── contact.astro        (v2 placeholder in v1)
│   │   └── studio/
│   │       └── [...index].astro (Sanity Studio at /studio)
│   │
│   ├── lib/
│   │   ├── sanity/
│   │   │   ├── client.ts        (Sanity client + urlFor helper)
│   │   │   └── queries.ts       (all GROQ query strings)
│   │   ├── seo/
│   │   │   ├── meta.ts          (generateMeta helper)
│   │   │   └── jsonld.ts        (JSON-LD schema generators)
│   │   └── utils/
│   │       ├── format.ts        (date, price, dimension formatters)
│   │       └── image.ts         (image URL helpers)
│   │
│   ├── styles/
│   │   ├── global.css           (Tailwind import, font-face, CSS vars)
│   │   └── tokens.css           (design tokens as CSS custom properties)
│   │
│   ├── types/
│   │   ├── artwork.ts           (Zod schema + inferred TS type)
│   │   ├── collection.ts
│   │   ├── exhibition.ts
│   │   ├── journal.ts
│   │   └── sanity.ts            (shared Sanity types)
│   │
│   └── content/
│       └── fallbacks.ts         (placeholder content for dev when Sanity empty)
│
├── .env                         (never committed to Git)
├── .env.example                 (committed — shows required vars, no values)
├── .gitignore
├── astro.config.mjs
├── sanity.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── ARCHITECTURE.md              (this file)
└── README.md
```

---

## 5. Sanity Schema Definitions

Define all schemas now even if unused initially. Avoids disruptive schema changes later.

### `artwork` (primary document)
```
title          string        required
slug           slug          auto from title
image          image         hotspot enabled
year           number
medium         string        e.g. "Acrylic on canvas"
dimensions     string        e.g. "36 × 48 inches"
available      boolean       for sale flag
price          number        USD, shown only if available
collection     reference     → collection
featured       boolean       appears on homepage
altText        string        accessibility + SEO
seo            object        { metaTitle, metaDescription, ogImage }
```

### `collection` (series grouping)
```
title          string        required
tagline        string        optional, max 80 — the line under the title
                              on the deck's cover page. Renders on the
                              collection intro. Leave blank if it would
                              only restate the title.
slug           slug
description    text          "Statement" in Studio — a short transcribed
                              pull quote, max 240 / min 60 (warning).
                              Renders as a blockquote if present; the
                              section is omitted entirely if null. Not a
                              prose paragraph — the decks contain no
                              descriptive paragraph and none is expected.
heroImage      image         hotspot enabled
year           number
artworkCount   (computed)    via GROQ
seo            object
```

### `exhibition`
```
title          string
venue          string
city           string
country        string
year           number
startDate      date
endDate        date
description    text
link           url           external show link
```

### `process`
```
title          string
description    text
images         image[]       sequence of process photos
relatedArtwork reference     → artwork
date           date
```

### `journal`
```
title          string
slug           slug
body           portableText  rich text
coverImage     image
date           date
excerpt        text          auto-truncated for listings
seo            object
```

### `aboutPage` (singleton)

> **Not implemented.** This is a spec, not a built schema — `aboutPage` is not
> registered in `src/sanity/schemas/index.ts` (only `artwork`, `collection`,
> `homepage` are), so no document of this type can be created in Studio.
> `ABOUT_QUERY` (`src/lib/sanity/queries.ts`) queries this type anyway and
> always resolves to `null`; the Artist page (`src/pages/artist.astro`) runs
> entirely on its own local fallback content instead — biography paragraphs,
> the statement, and the `availableFor` list are hardcoded there, not fetched.
> A real `portrait` upload does work today independent of this schema, via a
> local file drop — see `src/assets/artist/README.md`. Registering this
> schema is Phase 2 (§12).

```
biography      portableText
statement      text          displayed as pull quote
portrait       image         studio or in-action shot preferred
cvFile         file          optional PDF download
exhibitions    reference[]   → exhibition (ordered)
availableFor   string[]      ["commissions", "workshops", "studio visits"]
```

### `homepage` (singleton)
```
heroArtwork    reference     → artwork (full-bleed hero)
featuredWorks  reference[]   → artwork (selected works section)
featuredSeries reference     → collection
statement      text          short homepage tagline
```

### `siteSettings` (singleton)
```
siteTitle      string        "T.Art by RJ"
artistName     string        "Rupjyoti Baruah"
email          string
instagram      url
behance        url
defaultOGImage image
defaultMeta    object        { title, description }
```

### `navigation` (singleton)
```
items          array
  label        string
  href         string
  external     boolean
```

---

## 6. SEO Architecture

Every painting auto-generates a dedicated URL:
```
/works/worlds-within-walls-i
/works/material-memory-ii
/works/untitled-03
```

Every page includes:
- `<title>` — unique per page
- `<meta name="description">` — unique per page
- Open Graph tags — `og:title`, `og:description`, `og:image`, `og:type`
- Canonical URL — prevents duplicate content
- `<link rel="preload">` for hero image and fonts

### JSON-LD Schema Types
| Page | Schema type |
|---|---|
| Homepage | `WebSite` + `Person` (Rupjyoti Baruah) |
| Individual artwork | `VisualArtwork` |
| Works index | `CollectionPage` |
| Artist (`/artist`) | `Person` |
| Exhibition | `ExhibitionEvent` |
| Journal post | `BlogPosting` |

`VisualArtwork` schema enables Google rich results for paintings:
- Shows in Google Images with title, artist, medium
- Free organic discovery — relevant for collectors

---

## 7. Image Pipeline

Every painting image goes through:

```
Sanity upload (original file)
       ↓
Sanity CDN (stores original)
       ↓
URL params applied at request:
  ?w=1200&fm=webp&q=85    (desktop)
  ?w=600&fm=webp&q=80     (mobile)
       ↓
Astro <Image> component:
  srcset for responsive sizes
  loading="lazy" (below fold)
  loading="eager" (hero)
  explicit width + height (no layout shift)
  alt text from Sanity altText field
```

Never serve original unoptimised files to the browser.

---

## 8. Performance Targets

| Metric | Target |
|---|---|
| Performance | 98+ |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

### Rules to hit these scores
- Fonts self-hosted (no Google Fonts CDN)
- No render-blocking scripts
- All images: explicit dimensions, lazy loaded, WebP format
- Zero layout shift (CLS = 0)
- No cookie banners (Cloudflare Analytics is cookie-free)
- Astro ships ~0 JS by default — keep it that way
- Every image has alt text — non-negotiable

### Alt text nuance — decorative vs. standalone

"Every image has alt text" does not mean every image gets *descriptive* alt.

An image inside a link that already contains the collection title as visible
text takes `alt=""`. Adding descriptive alt there concatenates into the link's
accessible name, and screen readers announce the title twice.

Descriptive `altText` is still required wherever an image stands alone without an
adjacent text label — for example the cover hero on `/collections/[slug]`.

---

## 9. Animation Principles

**Rule: The website must never feel like an animation demo.**

Rupjyoti's paintings are the subject. Motion is infrastructure, not decoration.

| Allowed | Avoid |
|---|---|
| Fade-in on scroll (IntersectionObserver) | GSAP unless specific need |
| Subtle image scale on hover (CSS) | Scroll-jacking |
| Page transition fade | Lottie animations |
| Hero canvas aurora (background only) | Parallax unless story-driven |
| Gold underline on nav hover | Motion that delays content |

**Animation budget:** 0 additional JS libraries by default. Motion One added only when a specific interaction requires it and CSS cannot achieve it.

---

## 10. Deployment Pipeline

```
Rupjyoti edits content in Sanity Studio
         ↓ (publishes)
Sanity sends webhook to Cloudflare
         ↓
Cloudflare Pages triggers new build
         ↓
Astro fetches fresh content from Sanity
         ↓
Static site built (~30 seconds)
         ↓
Deployed to Cloudflare global CDN
         ↓
tartbyrj.com updated — no developer needed
```

### Environment Variables
```
# .env (never commit — add to .gitignore)
PUBLIC_SANITY_PROJECT_ID=tuvy3sp7
PUBLIC_SANITY_DATASET=production

# Add to Cloudflare Pages dashboard as well
```

### Git Workflow
```
main branch  → production (auto-deploys to tartbyrj.com)
dev branch   → staging (optional — safe to test changes)
```

---

## 11. Sanity Configuration

```
Project ID:   tuvy3sp7
Dataset:      production
Studio URL:   tartbyrj.com/studio  (production)
              localhost:4321/studio (development)
Plan:         Free
Users:        2 (you as developer + Rupjyoti as editor)
```

### Sanity CORS — add these origins in Sanity dashboard
```
http://localhost:4321
https://tartbyrj.com
https://*.pages.dev        (Cloudflare preview URLs)
```

---

## 12. Phase 2 Roadmap

| Feature | Tool | Effort |
|---|---|---|
| Contact / commission form | Formspree | Low |
| Painting purchase | Stripe + Snipcart | Medium |
| Lesson booking | Calendly embed or custom | Low |
| Print-on-demand | Printful + Stripe | Medium |
| Email newsletter | Buttondown or ConvertKit | Low |
| Workshop registration | Custom Stripe checkout | High |
| Upcoming Exhibitions — homepage section 5 (`id="exhibitions"`) + dedicated `/exhibitions` page | `exhibition` Sanity schema (spec'd in §5, not yet registered in Studio) | Medium |
| Register `aboutPage` Sanity schema so Artist page content (biography, statement, portrait, `availableFor`) is editable from Studio instead of hardcoded in `artist.astro` | Sanity Studio schema | Low |

Phase 2 does not require rebuilding the site. Astro components bolt on.  
Sanity `siteSettings` already has email field ready for Formspree routing.

---

## 13. Theming System

### Decision
- **Default theme: Light** (warm cream — gallery in daylight feel)
- **Dark theme: Available via toggle** — user preference persisted in `localStorage`
- **System fallback:** `prefers-color-scheme` used when no preference is saved

### How it works
Theme is set as `data-theme` attribute on `<html>`. All colors are CSS custom
properties — switching themes is one attribute change. Zero hardcoded hex values
in any component.

### Priority order (highest to lowest)
1. `localStorage.getItem('theme')` — user's explicit choice
2. `window.matchMedia('prefers-color-scheme: dark')` — OS preference
3. `light` — hardcoded default fallback

### ThemeToggle component
Lives in `src/components/ui/ThemeToggle.astro`.
A small sun/moon icon button in the nav — top right, next to nav links.
Clicking toggles between light/dark and saves to localStorage.
Uses Astro Icon for sun (`ri:sun-line`) and moon (`ri:moon-line`) icons.

### Init script (non-blocking, inline in Layout.astro `<head>`)
Must be inline — not deferred — to prevent flash of wrong theme:
```html
<script is:inline>
  const saved = localStorage.getItem('theme');
  const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', saved || system || 'light');
</script>
```

### Transition on switch
```css
html { transition: background-color 0.4s ease, color 0.4s ease; }
```
All other elements inherit via CSS vars — no per-element transitions needed.

---

## 14. Design Tokens

```css
/* src/styles/tokens.css */

/* ─── LIGHT THEME (default) ─── */
:root,
[data-theme="light"] {
  /* Backgrounds */
  --bg-primary:     #faf7f4;
  --bg-secondary:   #f2ede8;
  --bg-elevated:    #e8e0d8;

  /* Text */
  --text-primary:   #1a1412;
  --text-secondary: rgba(26, 20, 18, 0.72);  /* raised from 0.52 — failed AA */
  --text-muted:     rgba(26, 20, 18, 0.62);  /* raised from 0.28 — failed AA */

  /* Accent (warm sienna/bronze) */
  --accent:         #7a4f2a;
  --accent-dim:     rgba(122, 79, 42, 0.25);

  /* Borders */
  --border:         rgba(26, 20, 18, 0.09);
  --border-strong:  rgba(26, 20, 18, 0.18);

  /* Hero overlay */
  --hero-overlay: linear-gradient(
    to top,
    rgba(250, 247, 244, 0.92) 0%,
    rgba(250, 247, 244, 0.5) 40%,
    transparent 100%
  );
}

/* ─── DARK THEME ─── */
[data-theme="dark"] {
  /* Backgrounds */
  --bg-primary:     #080706;
  --bg-secondary:   #100e0d;
  --bg-elevated:    #181412;

  /* Text */
  --text-primary:   #f0ebe3;
  --text-secondary: rgba(240, 235, 227, 0.55);
  --text-muted:     rgba(240, 235, 227, 0.50);  /* raised from 0.28 — failed AA */

  /* Accent (warm gold) */
  --accent:         #c9a96e;
  --accent-dim:     rgba(201, 169, 110, 0.30);

  /* Borders */
  --border:         rgba(240, 235, 227, 0.08);
  --border-strong:  rgba(240, 235, 227, 0.15);

  /* Hero overlay */
  --hero-overlay: linear-gradient(
    to top,
    rgba(8, 7, 6, 0.92) 0%,
    rgba(8, 7, 6, 0.6) 40%,
    transparent 100%
  );
}

/* ─── THEME-INVARIANT TOKENS ─── */
:root {
  /* Typography */
  --font-serif:      'Cormorant Garamond', Georgia, serif;
  --font-sans:       'Jost', system-ui, sans-serif;

  /* Spacing */
  --space-section:   100px;
  --space-section-m: 56px;

  /* Motion */
  --ease-out:        cubic-bezier(0.16, 1, 0.3, 1);
  --dur-base:        0.35s;
  --dur-slow:        0.7s;
  --dur-theme:       0.4s;     /* theme switch transition */
}
```

### Rule: never use hex values in components
Every color in every component must reference a CSS variable.
If you find a hardcoded hex in a component, it's a bug.

### Footer-only texture tokens (added 2026-08-11 — see §18)

```css
/* Light theme */
--footer-texture: image-set(url('/images/footer-light.avif') type('image/avif'),
                             url('/images/footer-light.webp') type('image/webp'));
--footer-scrim:  rgba(250, 247, 244, 0.28);
--footer-text:   rgba(26, 20, 18, 0.94);
--footer-muted:  rgba(26, 20, 18, 0.88);

/* Dark theme */
--footer-texture: image-set(url('/images/footer-dark.avif') type('image/avif'),
                             url('/images/footer-dark.webp') type('image/webp'));
--footer-scrim:  rgba(8, 7, 6, 0.36);
--footer-text:   rgba(240, 235, 227, 0.94);
--footer-muted:  rgba(240, 235, 227, 0.90);
```

These are footer-local, not general-purpose. `--footer-text` / `--footer-muted`
are not lighter/darker variants of `--text-secondary` / `--text-muted` for
reuse elsewhere — they're calibrated against a photographic background where
the worst-case pixel (a gold paint patch) fails contrast at values that pass
comfortably on flat `--bg-primary`. Do not reference them outside `footer`.

---

## 15. Developer Notes

### Adding a new painting (Rupjyoti's workflow)
1. Open tartbyrj.com/studio
2. Click Artwork → New
3. Upload image, fill title/medium/dimensions/year
4. Toggle "Available for sale" if selling
5. Assign to a Collection
6. Toggle "Featured" if it should appear on homepage
7. Publish — site rebuilds in ~30 seconds

### Adding a new page (developer workflow)
1. Create `src/pages/new-page.astro`
2. Import `Layout.astro`
3. Add GROQ query to `src/lib/sanity/queries.ts` if needs Sanity data
4. Add Zod type to `src/types/`
5. Add nav link to Sanity `navigation` singleton or hardcode in Nav component
6. Push to GitHub — auto-deploys

### Renaming an existing route (developer workflow)

The site is live, so a renamed route has inbound links, bookmarks and index
entries pointing at the old path. **Leave a redirect stub behind — never just
rename the file.**

1. Rename `src/pages/old.astro` → `src/pages/new.astro`
2. Update the `navLinks` array in `Layout.astro` — one array feeds both the
   header and the footer's Explore column, so label and href change once
3. Update any cross-links in other pages (`grep -rn "/old" src/`)
4. Replace `src/pages/old.astro` with a redirect stub — frontmatter only, no
   `<Layout>` and no markup:

```astro
---
return Astro.redirect('/new', 301);
---
```

Same `Astro.redirect()` used by `works/[slug].astro` and
`collections/[slug].astro` when Sanity data fails to parse; the only
difference is that those are conditional and a rename stub is unconditional.

**On this static build there is no server to issue a real 3xx.** Astro emits an
HTML stub carrying `<meta http-equiv="refresh" content="0;url=/new">` plus a
`<link rel="canonical">`, and the browser follows that. The status argument is
what a future SSR/hybrid adapter would send and is inert until then. If a true
301 is ever needed on Cloudflare Pages, that is a `_redirects` file in
`public/`, not this.

**Done for `/about` → `/artist` on 2026-09-02.** `src/pages/about.astro` is now
that stub; the page itself lives at `src/pages/artist.astro`. Note that
`ABOUT_QUERY` kept its name — it is named for the `aboutPage` Sanity document
type it queries, not for the route that consumes it.

### Never do these
- Never use `cursor: default` override — custom cursor is brand
- Never add a cookie consent banner — use Cloudflare Analytics
- Never load Google Fonts from CDN — self-hosted only
- Never put API keys in Git — use `.env` and Cloudflare env vars
- Never skip `alt` text on artwork images — accessibility and SEO
- Never use `any` type in TypeScript — use Zod-inferred types
- Never hardcode hex colors in components — always use CSS variables
- Never defer the theme init script — it must be inline in `<head>` to prevent flash

---

## 16. Sanity Project IDs & Keys

```
Sanity Project ID:    tuvy3sp7
Sanity Dataset:       production
Cloudflare Account:   (add when set up)
GitHub Repo:          (add when created)
Domain:               (confirm registrar)
```

---

## 17. Homepage Composition

### Section order (locked)

> Sections 1–4 are live. Section 5 (Upcoming Exhibitions) is **Phase 2** — not
> yet built, on the homepage or as its own dedicated page (`/exhibitions`).
> See §12.

| # | Section | Anchor | Status |
|---|---|---|---|
| 1 | Hero | `hero-track` | Live |
| 2 | Collections index | `id="collections"` | Live |
| 3 | Recent Works | `id="works"` | Live |
| 4 | The Artist | `id="artist"` | Live |
| 5 | Upcoming Exhibitions | `id="exhibitions"` | Phase 2 |
| 6 | Footer | in `Layout.astro` | Live |

### Background rule (locked)

All artwork-bearing sections stay on `var(--bg-primary)`. **The Artist section is
the single tonal break on the page**, using `var(--bg-elevated)`, and carries no
`border-top` rule — its background change *is* the separator.

Rationale: simultaneous contrast. A painting reads differently against different
grounds, so artwork must be judged against one constant neutral.

Alternating backgrounds were explicitly rejected — they read as template, and
they double up with the existing hairline + eyebrow separator system.

### Section separator pattern

`border-top: 1px solid var(--border-strong)`, `padding-top: 22px`, uppercase
eyebrow label left, secondary item right. Applies to Collections, Works and
Exhibitions.

### Collections index (section 2) — the D1 "editorial index" pattern

Rejected alternatives, and why:

| Alternative | Why rejected |
|---|---|
| 3-card grid | Thumbnails at ~300px reduce paintings to swatches |
| Horizontal scroll rail | Same problem, plus most items sit offscreen |
| Auto-advancing slider | Motion competes with the Hero's scroll animation, WCAG 2.2.2 exposure, and it still shows one collection at a time |
| Caption-over-image cards | The gradient overlay covers the lower third of the artwork. Acceptable for a museum showing others' work; not for an artist whose site *is* the work |

Chosen structure at `>=1024px` — two columns, both top-aligned:

- **Left (52%)** — eyebrow, headline, lede, then the collections list
- **Right (1fr)** — sticky image well, `aspect-ratio: 3/2`, `max-height: 68vh`
- Hover or keyboard-focus on a row crossfades the well
- The well aligns to the headline's **cap height**, not its line box

Row caps: 4 rows on desktop and tablet, 2 rows on mobile, then
"View all collections".

The CTA target is always `/collections` — never a slug. It is the only route to
`/collections` from this section; there is no separate "Explore Collections"
button.

### Responsive rules

| Breakpoint | Behaviour |
|---|---|
| `>=1024px` | Two columns as above, hover-swap active |
| `640–1023px` | Single column, well removed from flow, each row's image inline at 33% width, hover-swap JS unbound |
| `<640px` | Single column, each row's image full-width above its title, 2 rows only |

### One-image rule (important)

Each collection renders **exactly one `<img>` in the DOM**, repositioned by CSS
per breakpoint — absolutely positioned into the well on desktop, static and
inline below it.

Never duplicate images and hide one set with `display: none`. Chrome still
downloads `display: none` images, which doubles image weight against the
Lighthouse 98+ target.

---

## 18. Header & Footer Chrome

### Decision: the footer carries a photographic texture, the nav does not

Both were candidates for a painted-plaster texture (RJ supplied light/dark
JPGs for both, ~1706×210–230px, ~8:1). Only the footer shipped it.

**Why the nav was rejected:** `#nav` is `position: fixed` and transparent
until scroll, then a blurred `--bg-primary` scrim (`#nav.scrolled`). It sits
over the hero and every artwork on the page for the entire scroll. A second
painted surface riding over the paintings fails the project's North Star
filter directly — it's a second artwork-like object competing with the real
one, permanently, on every page. The nav's `#nav.scrolled` blur treatment is
unchanged.

There was also a hard contrast problem, not just a taste call: measured
against `--text-secondary`, the *light* header strip failed AA everywhere
along its width (2.9–3.4:1, need 4.5:1), and the *dark* strip failed
specifically at 70–80% width (2.7:1) — which is exactly where the nav links
and theme toggle sit at desktop widths. Even a "nav only, tinted low-opacity"
compromise was rejected once the transparent/floating requirement was
weighed against it: a scrim strong enough to protect contrast defeats the
point of showing the texture at all.

**Why the footer works:** it's the last thing on the page — nothing competes
for attention — and it reads as "the wall the work is hung on" rather than a
second painted surface.

### Implementation

- Assets: `public/images/footer-{light,dark}.{avif,webp}` — AVIF primary,
  WebP fallback, no JPEG tier shipped (both formats are universal in every
  browser this stylesheet already depends on). 22–27KB each, one request per
  theme, below the fold.
- Tokens: `--footer-texture`, `--footer-scrim`, `--footer-text`,
  `--footer-muted` — see §14. Footer-local; not for reuse elsewhere.
- `footer` in `Layout.astro`: three background layers (top-edge bleed
  gradient, flat scrim wash, the texture), `background-position: ... right
  center` for the image layer — the strips are ~8:1 and the footer is far
  shorter, so `cover` crops hard, and the gold/marble detail in both source
  images sits in the right portion.
- The 1px `border-top: var(--border)` that used to separate the footer from
  the page was replaced with a 72px bleed (48px on mobile) — `--bg-primary`
  fading to transparent over the top edge. A hairline above a textured band
  reads as "pasted on"; the fade lets the surface rise out of the page
  instead.
- `.footer-links a` grew 14px → 16px, `.footer-copy` 10px → 12px. Contrast
  alone didn't explain what "hard to read" meant here — the fix needed
  larger type as well as darker/heavier color, not color changes in
  isolation.
- `.footer-links a:hover` no longer recolors text to `--accent`. Measured
  locally, `--accent` over the strip is 2.43:1 (light) and 2.82:1 (dark) —
  gold-on-gold in dark theme is close to the worst pairing available. Hover
  now keeps `--footer-text` and underlines in `--accent` instead, which
  moves the accent color to decoration (no contrast obligation) and drops
  the reliance on color alone for the affordance (WCAG 1.4.1) — the nav's
  hover state still recolors to `--accent` and does not have this fix.

### Contrast methodology note (read before touching footer colors again)

Slice-average contrast checks — splitting the strip into ~10 vertical bands
and measuring against the *average* color of each — are not sufficient on a
photographic background. Averaging smooths away the pixel-level variance
that actually makes text hard to read. The working method, and the one that
caught real failures the average method missed, is a sweep of 16×16px
windows across the band where text actually sits, at the image's *rendered*
scale (i.e. resize/crop exactly as CSS `background-size: cover` +
`background-position: right center` would, then measure). A link color that
passed on slice averages measured 3.39:1 locally over a single gold patch.
Re-derive locally, not by average, if the source images, scrim opacity, or
text alpha values change.

### Footer redesign — three-column layout (2026-08-19)

The single-row flex footer (logo · three links · copyright) became a
two-tier layout: `.footer-tier1` is a three-column grid (Brand · Explore ·
Connect), `.footer-tier2` is a thin bar (copyright left, back-to-top right)
below a hairline divider. Driven by a real product gap, not a redesign for
its own sake: every enquiry path on the site funneled to Instagram DMs, with
no address a gallery or collector's assistant could put in a calendar
invite. Connect column exists to fix that.

**What's in each column, and why:**
- **Brand** — the existing lockup, a one-line plain-language descriptor
  (what Rupjyoti makes), and a location line (Dubai, UAE · Assam, India —
  a real commercial fact for a muralist, and the only local-SEO signal on
  the site).
- **Explore** — the footer nav is now rendered by mapping the same
  `navLinks` array the header uses (`Layout.astro`), not a second hardcoded
  list. The footer previously held its own copy of Works/Collections/Artist,
  which is exactly the kind of drift the Contact page's Instagram link
  already suffered once (see `src/lib/site.ts` below). One array, two
  render sites.
- **Connect** — `mailto:` link, an availability line, and social icons
  driven by `SOCIALS: SocialLink[]` in `src/lib/site.ts`
  (`{label, href, icon}`; Instagram + Behance today). `icon` keys into a
  `socialIcons` SVG registry beside `.footer-social` in `Layout.astro`;
  `contact.astro`'s Instagram CTA looks up the same array by
  `icon === 'instagram'` rather than holding its own copy. Adding
  Facebook/WhatsApp later is one `SOCIALS` entry plus one registry entry —
  real icon path data is unavoidable, so not literally one line, but no
  footer markup edit either way.

**`src/lib/site.ts` — new single source for outward contact points.**
`email` (`siteContact`) and the `SOCIALS` array live in a typed module, not
a Sanity singleton. §5's `siteSettings` schema was never registered, and
registering one now to hold values that change roughly never would buy
nothing at the cost of a fetch, a Zod schema, and a new failure mode on
every page that renders the footer. The Contact page imports the same
`SOCIALS` array the footer does — no more separate hardcoded Instagram copy.

**`--footer-logo-h` revised down twice, and the old rationale revised with
it.** 180px → 132px → **72px desktop / 44px mobile** (final). The original
180px was chosen so the tagline baked into the lockup image's pixels stayed
legible — its cap height is ~3.8% of the file, so 180px put it near 7px,
"the point it stops being texture" (original §18 language). That floor no
longer binds, for two reasons:

1. The image is no longer the only carrier of that wording. The nav renders
   "WHERE TASTE & ART BLENDS" as live text, and the Brand column now sets a
   real descriptor line under the lockup. The image's internal tagline is
   decoration; the `<Image>` `alt` text carries the full wording for anyone
   who can't see it.
2. Footer height is also the texture's crop control, and this is the
   load-bearing reason. The plaster strip is ~8.6:1 under
   `background-size: cover`, right-anchored. A **taller** footer scales the
   strip **wider**, which crops **harder** — the gold/marble region that
   lives in the strip's right quarter expands leftward, directly under the
   Connect column. A shorter footer needs less horizontal scale to satisfy
   `cover`, so less of the strip is cropped away and more of its width
   becomes visible — the favorable direction. Measured: at 1440px the
   visible slice of the strip grew from 31.8%→42.8% (light) and
   34.6%→46.7% (dark) when the footer height was cut in the second pass.

   `--footer-logo-h` is the preferred lever over `--footer-scrim` for this
   reason — the scrim has a hard ceiling (tokens.css: past ~0.32 the
   texture stops being visible and the 22KB buys a flat color), the height
   lever doesn't. It does have a floor, though: see the plate-wide sweep
   note below.

**Total height, both viewports, both passes:** the first two-tier build
measured 529px desktop / 922px mobile — close to the full viewport on a
laptop screen. A second pass, using `--footer-logo-h`, `.footer-descriptor`
max-width (34ch → 48ch, wrapping the same copy to two lines instead of
three — a layout change, not a copy edit), and every vertical margin in the
tier as levers, cut this to **392px desktop (−25.9%) / 690px mobile
(−25.2%)**. No column, link, or line of copy was removed or hidden to hit
this — height came entirely out of sizing and spacing.

**Mobile texture dropped below 480px.** At 390px, `background-size: cover`
scales the 8.6:1 strip to several multiples of the viewport width — what
actually renders is a soft, largely flat gradient, not legible plaster.
Measured: 4.9%/5.4% of the strip visible (light/dark) at that width. Below
`479.98px`, the `--footer-texture` image layer is dropped from `footer`'s
background-image entirely; the bleed gradient and `--footer-scrim` wash
stay, so the plate still reads as a warm surface, without paying the 22KB
fetch for an effect too small to resolve. `scripts/footer-contrast.mjs`
carries a matching `TEXTURE_DROP_BELOW_VW = 480` constant so measurement
and implementation can't drift apart.

**Contrast — final sweep, all six viewport/theme configurations, worst
window per configuration:**

| Viewport | Theme | Tightest element | Ratio |
|---|---|---|---|
| 1440 | light | availability-12 | 6.48:1 |
| 1440 | dark | navlink-16 | 5.70:1 |
| 900 | light | availability-12 / copy-12 | 5.27:1 |
| 900 | dark | navlink-16 | 10.82:1 |
| 390 | light | place-12 / availability-12 / copy-12 | 12.30:1 |
| 390 | dark | place-12 / availability-12 / copy-12 | 13.67:1 |

390's numbers jumped after the texture-drop fix above — the script was
initially still measuring a background nobody sees below 480px. Fixed in
`scripts/footer-contrast.mjs` itself, not just the page.

**Plate-wide worst window — independent of what's on it.** Swept the whole
plate at both the old (332px) and new (392px, 1440 width) heights, both
text tiers, both themes — "if something were placed at the single worst
pixel on the plate, what would it get":

| Theme | Height | `--footer-text` | `--footer-muted` |
|---|---|---|---|
| light | 332px | 5.77:1 | 5.26:1 |
| light | 392px | 5.66:1 | 5.17:1 |
| dark | 332px | 4.82:1 | 4.57:1 |
| dark | 392px | 4.79:1 | 4.55:1 |

Dark `--footer-muted` at 392px is 4.55:1 — essentially flat versus the
332px baseline (a 0.02 drift), and still clears AA. **No content sits in
that worst window today** — it's the empty gutter between the Brand and
Explore columns. It's a latent trap, not a live failure: anyone adding text
there (a fourth column, a wider Brand block) must re-run
`scripts/footer-contrast.mjs` first. This is also the reason not to cut
`--footer-logo-h` further without re-measuring — the margin above 4.5:1 is
real but thin.

**Two fixes landed in the same pass:**
- `.footer-logo-text` (the `<Image>` fallback, dead path unless
  `tart-logo.*` goes missing) used `var(--text-primary)` — a page token —
  on the photographic surface. Now `var(--footer-text)`, matching every
  other piece of footer text.
- `#main-content:focus-visible` — the back-to-top control moves focus to
  `<main>` (`tabindex="-1"`, added specifically for this), which fell
  through to the browser's default blue outline rather than the site's gold
  ring, because `global.css`'s `a:focus-visible` / `button:focus-visible`
  rule can't reach a bare `<main>`. Added a scoped rule in `Layout.astro`
  matching the global ring exactly (`outline: 2px solid var(--accent);
  outline-offset: 3px`). Confirmed via `getComputedStyle` in both themes —
  `#7a4f2a` light, `#c9a96e` dark.

**Back-to-top is a real anchor** (`href="#main-content"`), not a
JS-only control — it works with zero JavaScript, confirmed by loading
`/contact#main-content` as a fresh navigation (bypasses the click handler
entirely) and checking `document.activeElement === main`. The inline script
upgrades this to a `prefers-reduced-motion`-aware smooth scroll and
suppresses the hash from the address bar/history, but neither is required
for the control to function.

**Follow-up resolved:** this section previously flagged the in-code comments
on `--footer-logo-h` (both the base rule and the `@media (max-width: 900px)`
block) as still citing 96px/76px→52px as the final desktop/mobile values
from an earlier tuning pass. Checked directly against `Layout.astro` — both
comments now cite the current 72px/44px values. No outstanding action.

### Rejected (footer content)
- **Newsletter signup** — no ESP, no list, no privacy policy, no send
  cadence. A box that goes nowhere is worse than no box.
- **Multi-column sitemap / "Quick Links"** — the site has five pages; a
  sitemap for five pages duplicates the Explore column next to it.
- **Phone number / street address** — a home-studio address on a public
  page is a safety and spam problem. City-level (Dubai, UAE · Assam, India)
  is enough.
- **Payment / trust badges** — no checkout exists yet.

### Deferred (footer content)
- **Privacy / Terms / Refund-Shipping policy** — not needed today: the site
  sets no cookies and collects no data. Legally required the moment Phase 5
  ships Stripe/Snipcart and Formspree. `.footer-tier2`'s bar layout has room
  reserved for these links when that trigger hits.

---

## 19. All Works Page

### Structure

`/works` shows every artwork grouped by year, newest first, with a sticky
year marker in a left rail. There is no pagination and no client-side
filtering — every state of this page, filtered or not, is a separate
pre-rendered static route.

### Filtering: two independent tag axes, not one

Artworks carry two controlled-vocabulary fields, both sourced from
`src/lib/taxonomy.ts` — the single source of truth for every option label
and value used anywhere on this page:

- `paintType` — array, multi-select (Acrylic, Oil, Watercolour, Mixed,
  Charcoal, Ink). A work can genuinely be more than one.
- `surface` — string, single-select (Canvas, Paper, Wall). A physical work
  has exactly one surface.

Both are separate from the existing `medium` free-text field, which remains
the human-readable display string under each tile ("Acrylic, Texture paste
and Mixed Media on Canvas") and is never generated from the tags. Tags are
for routing and filtering only; `medium` is for reading. Nothing validates
that the two stay consistent — the Studio field descriptions ask Rupjyoti
to keep them in sync by hand.

`.nullish()`, not `.enum()`, on both Zod fields — a taxonomy value renamed
later while old documents still carry the previous string must not cause
`safeParse` to drop the artwork, which is the exact failure mode that wiped
the homepage grid in the 2026-08-07 session. Unknown or unset tag values
are filtered out at the route layer, where failing is cheap, not at the
schema layer, where failing is catastrophic.

### Routes

/works
/works/medium/<value>
/works/surface/<value>
/works/medium/<value>/surface/<value>


All generated via `getStaticPaths()` in `src/pages/works/[...filter].astro`,
fetching once through the shared `getAllArtworks()` in
`src/lib/works/data.ts` and filtering in memory — never one Sanity query per
route. Any route whose filter (or filter combination) matches zero
artworks is not generated. There is no dead-chip state: every chip that
renders as a link points at a route that exists.

18 combo routes are mathematically possible (6 paint types × 3 surfaces);
only the combinations with at least one matching artwork are built. This
number will grow as real inventory is tagged and should not be expected to
stay near-empty — revisit whether combo filtering is pulling its weight
once the full catalogue is tagged.

### Chip bar: three states, not two

Every taxonomy value renders on every route, unconditionally, regardless of
what's on the current page. Chips carry one of three states, computed in
`chipStatus()` (`src/lib/works/filters.ts`):

- **active** — this route's own filter.
- **enabled** — a real `<a href>`. A same-axis chip (another paint type,
  while a paint type is already active) checks the full dataset, since
  selecting it replaces the current filter. A cross-axis chip (a surface,
  while a paint type is active) checks the intersection with the active
  filter, since selecting it combines rather than replaces.
- **disabled** — a `<span aria-disabled="true">` with no `href` at all —
  not an anchor with a missing href. Out of tab order, cannot be
  activated. Rendered when no artwork anywhere (or no artwork within the
  current active filter, for a cross-axis chip) matches the value.

Cross-axis chip hrefs point at the combined route
(`/works/medium/watercolour/surface/canvas`), not the bare single-axis
route — an early build had this wrong and silently dropped the active
filter on click. Clicking the currently-active chip de-selects just that
axis and falls back to the other axis's single-axis route, or to `/works`
if nothing else is active.

The chip list must always be computed from `taxonomy.ts` directly. It must
never be derived from the artworks present on the current filtered page —
that produces a chip bar that shrinks every time a filter is applied, which
looks like missing data and was shipped once by mistake before being
caught.

### Row layout: build-time justified rows, not masonry or a cropped grid

`src/lib/utils/justifyRows.ts` is a pure function, no Astro or DOM
dependency, called from each page's frontmatter. It packs artworks into
rows using each image's true aspect ratio — pulled from
`asset->metadata.dimensions` in `ALL_ARTWORKS_QUERY` — so that no painting
is ever cropped to fit a grid cell. This was a hard requirement, not a
preference: cropping the artwork to fit a layout fails the project's North
Star test directly.

Two guards matter more than the row-fill happy path:

- **`minHeight`/`maxHeight` clamp.** A row that would justify below the
  height floor donates its last item to the next row instead of stretching
  past the container width. One documented, accepted exception: a single
  item with an aspect ratio wide enough that it cannot reach the floor
  even alone at full container width (roughly ≥5:1) renders shorter than
  the floor rather than overflowing the page. This was verified by fuzz
  test, not assumed — see the commit history around the 2026-08-13 code
  review for the actual trial data.
- **Trailing partial row never stretches.** The last row of a group (most
  visibly, small filtered results with only one or two matches) renders at
  natural width, left-aligned, not stretched to fill the container.

### Crop-adjusted aspect ratio

`asset->metadata.dimensions.aspectRatio` is the *uncropped* source image's
ratio. If a hotspot/crop is set in Studio, `urlFor()` delivers a cropped
image whose actual ratio differs from that metadata value — packing rows
against the wrong ratio misaligns row heights the moment any artwork has a
crop applied. `src/lib/utils/cropAspectRatio.ts` corrects the metadata
ratio using the artwork's stored crop fractions before it reaches the
packer. Both `WorksGallery.astro` and `index.astro` call this one shared
function — it was briefly duplicated between the two files during
development and consolidated to prevent the two copies drifting apart.

### Mat treatment

Every tile — regardless of whether the source photograph is a bare, flat
scan of the artwork or an in-situ shot on an easel or in a physical frame
— renders inside a uniform thin mat (`.tile-frame`: 6px padding, 1px
`--border-strong` line, 6px radius, `--bg-secondary` fill). This is a
deliberate presentation-consistency decision, not a stylistic default:
Rupjyoti's photography style varies per artwork, and a uniform mat makes
that inconsistency disappear behind one consistent gallery-card treatment
rather than requiring every future upload to match a single shooting
style. It is applied only on `/works`; the artwork detail page
(`/works/[slug]`) remains unmatted, since that page's purpose is showing
the work itself, not a wall of tiles.

The mat is sized via `aspect-ratio: var(--frame-ratio)` combined with
`box-sizing: border-box` on `.tile-frame`, so the mat's padding is carved
out of the width `justifyRows()` already computed rather than added on top
of it — this preserves the row-packing guarantees above without needing a
second variable threading the row height separately. Image sizing inside
the mat uses `object-fit: contain`, not `cover`, since the mat's fixed
padding on a non-square box means the padded content area's ratio won't
exactly equal the image's true ratio.

### Known dev-only gotcha

`getAllArtworks()` memoizes its fetch at module scope for production
builds — correct and intentional, since each Cloudflare build is a fresh
process and this guarantees every route on a given build sees the same
document snapshot. In `npm run dev`, this same cache is skipped
(`import.meta.env.DEV`) because Vite's HMR has no way to know a Sanity
Studio edit happened — editing content doesn't touch any file Vite
watches, so an un-gated cache would silently serve stale tags until the
dev server is restarted by hand.

### Deferred, not forgotten

- `filterArtworks` runs twice per combo route in `getStaticPaths`, and
  `chipStatus` rescans the full artwork array per chip per route. Free at
  current catalogue size; revisit once the real ~25-work catalogue is
  live and build time is a measured number, not a guess.
- The meta description on `/works/index.astro` hand-duplicates the
  taxonomy list in prose rather than generating it — low priority, but
  will drift if the taxonomy changes.
- `filterDescription()`'s fallback string for a combo state with no
  matching heading text is currently unreachable given how routes are
  generated, but not guarded — worth a defensive fallback if the route
  generation logic ever changes.

---

## 20. Collection Detail Page

### Structure (locked)

`/collections/[slug]` renders five parts in order: page head (back link +
intro), statement, story-page plates, works in this collection, prev/next
collection.

### Page head

`.back-link` and `.intro` are siblings inside `.page-head`
(`max-width: 1152px`, centered, `padding: 0 24px`) — the single ancestor
carrying horizontal inset. Neither child sets its own left padding, so
their left edges are structurally identical rather than independently
tuned to match.

`.back-link` is normal document flow, not `position: absolute`. It was
originally absolute-positioned to float over a full-bleed cover photo;
that cover section no longer exists (see "Rejected: cover as storyPages[0]"
below), so nothing conflicts with normal flow. `--nav-h` clearance comes
from `.collection-detail`'s existing `padding-top`, not from a hand-tuned
`top` offset. The same pill treatment (scrim, blur, border, hover) is
reused verbatim on `/works/[slug]` as "Back to All Works" — one visual
component, two instances.

### Intro

Eyebrow (`ARCHIVE COLLECTION · {location}, {year}`, omitting either field
gracefully if null) → `h1` (`title`) → `tagline` if present
(`--font-serif` italic, `--text-secondary`, `max-width: 48ch`). Top
padding is `calc(var(--space-section) / 2)` — half the standard section
gap, since this is a page-open block sitting directly under a page head,
not a boundary between two major sections.

### Rejected: cover as storyPages[0]

The original spec treated `storyPages[0]` as a full-viewport splash —
title, tagline, artist name baked into the image, `object-fit: contain`,
`sr-only` HTML heading duplicated underneath for mobile. Dropped for two
reasons:

1. **RJ removed the splash page from this deck** (it duplicated the Artist
   page's bio) — `storyPages[0]` became an interior content page
   ("Observation," a numbered field-notes spread), rendered full-viewport
   as if it were an entrance. Wrong page doing the wrong job, at the
   largest size on the site.
2. Even where a splash page exists, depending on its *position in an
   externally-authored array* to drive page layout is fragile by
   construction — confirmed within one session, when the same deck also
   surfaced a name typo baked into pixels ("Rupiyoti" vs. "Rupjyoti") that
   the site had no way to catch.

Cover is now built from Sanity fields (`title`, `tagline`, `location`,
`year`) instead of an image. This is what `tagline` was added for — see
section 5. The `storyPages` array is presentation-neutral: RJ can
reorder, add, or remove deck pages without any layout consequence. Plates
render `storyPages[0]` onward, numbered `01 / N` through `N / N`.

### Statement

Renders only if `description` is non-empty — no wrapper, no placeholder
copy, if null. Set as a `blockquote`, centered, `--font-serif` italic,
`clamp(24px, 3.4vw, 34px)`, `max-width: 24ch`, vertical padding
`clamp(48px, 6vh, 96px)` (reduced from an initial `clamp(80px, 12vh,
160px)` — the larger value, combined with the intro's own padding and the
gap before the first plate, stacked into three large gaps in a row for
what is often two lines of type).

`description` (labelled "Statement" in Studio) is a short transcribed
pull quote, not a paragraph — see section 5. These decks contain no
descriptive-paragraph page and are not expected to gain one; where a good
line exists (handwritten marginalia, a fragment from a title page), it's
transcribed here rather than left to decorative-only use in the source
image.

### Plates

Each `storyPage` renders exactly one `<img>`. Container
`max-width: min(1100px, 92vw)`, `max-height: 82vh`, `object-fit: contain`,
centered on `--bg-primary`, vertical gap `clamp(72px, 10vh, 140px)`. The
constrained width is the core departure from the original full-bleed
stack: margin around a page reads as a plate in a monograph rather than a
slide in a deck. All images `loading="lazy"` — no plate is above the
fold on any viewport, so eager loading (attempted in an earlier pass) was
pure waste. `fit=max` on every `urlFor()` call in this file caps delivery
at the source image's native resolution instead of upscaling past it;
source decks are currently 1920×1080, so `w=2400`/`w=3200` requests were
transferring up to 84% more bytes for zero additional detail before this
was added.

Below 768px, plates are hidden via CSS but remain in the DOM; a single
button ("View collection — N pages") opens the lightbox at index 0. A
`noscript` rule reveals the plates for no-JS visitors.

### Lightbox

Native `<dialog>`, no library. Images at `w=3200&fit=max`, fetched only
on open, never preloaded. Arrow keys, Escape, backdrop click, touch
swipe. Focus trapped while open, returned to the trigger on close.
Transitions disabled under `prefers-reduced-motion`.

### Works in this collection

Section separator (`border-top`, eyebrow, per section 17's pattern) is
unconditional — it renders at any work count, including one, so the
transition out of the plate sequence is always visually marked rather
than depending on there being enough items to justify a heading. This
was a shipped bug, not a design choice: at one work, an earlier version
suppressed both the heading and the separator, and the lone work card
read as an unlabelled continuation of the deck rather than a new section
— indistinguishable from a 17th plate. A `/works` link ("View all works")
fills the section head's secondary slot unconditionally.

Work thumbnail links use `alt=""` — the link already carries the
artwork's title as visible text; descriptive alt would double it, per
section 8.

### Prev / next collection

Computed in `getStaticPaths()` via `COLLECTION_NEIGHBOURS_QUERY`
(title + slug, `year desc`), which also supplies the paths themselves —
replacing a separate slugs-only query so the generated routes and the
neighbour links can't disagree about which collections exist.

Three cases, not two — the count decides whether neighbours wrap:

| Collections | Behaviour |
|---|---|
| `n <= 1` | Both null; the section is skipped entirely rather than linking back to the page you're already on |
| `n === 2` | **No wrap.** Index 0 gets `next` only, index 1 gets `prev` only — exactly one link per page |
| `n >= 3` | Wraps: the last collection's `next` is the first |

The `n === 2` case is a real shipped bug, not a hypothetical: the
wrap-around arithmetic `(i-1+n)%n` and `(i+1)%n` both resolve to the
same index when `n` is 2, so both pages rendered a "Previous" and a
"Next" pointing at the identical collection with different labels. It
was live on the site (there are exactly 2 collections) until caught in
code review.

Because either link can now be absent, `.neighbours` must not use
`justify-content: space-between` — that only positions correctly with
exactly two children and collapses a lone "Next" to the left edge.
Direction is pinned structurally instead: `.neighbour-next` carries
`margin-left: auto`, so prev sits left and next sits right whether one
or both are present.

---

## 21. Collections Index Page

### Structure (locked)

`/collections` renders as a thin editorial index: a page head, then one
`<section>` per collection, alternating cover/text sides. It is
deliberately not a scaled-down version of homepage §17's D1 pattern —
that pattern was built for a card-density tradeoff (3 collections'
worth of thumbnails competing for attention on the homepage); this page
has one job, get a visitor into a collection, and reads more like a
contents page than a grid.

### Page head

Eyebrow reads `COLLECTIONS`, not `COLLECTIONS & WORKS`. The page indexes
collections only — no individual artwork is listed anywhere on it — so
the eyebrow must not claim coverage it doesn't deliver. This mirrors the
nav label exactly.

H1 is a single line: "Where each collection holds a moment lived" — the
first clause in `--text-primary`, "holds a moment lived" in
`--font-serif` italic accent color. This copy was chosen to cover the
full range of what a "collection" is on this site — not just painting
series, but community workshop documentation and mural project records —
so the language deliberately doesn't say "paintings" or "walls."

No secondary CTA in the head block. An earlier draft included a
"VIEW ALL WORKS →" link to `/works`; it was cut once the nav's own WORKS
item was judged sufficient — a second link doing the same job as
existing nav one row below it added noise without adding a real
shortcut. `ARTWORK_TOTAL_QUERY` (queries.ts), added to power that link,
was removed in the same pass once the link was cut and no other
consumer existed — check for a second consumer again before reviving it.

### Collection rows

One `<section>` per collection, `border-top: 1px solid var(--border-strong)`
separator per §17's pattern, ordered `year desc`. At `>=1024px`, two-column
grid, alternating: odd rows render cover left / text right, even rows
mirror via `:nth-child(even)` — one markup structure, not duplicated per
side.

Text column, top to bottom:
- Meta line: two-digit index, flex-grow hairline rule, then
  `${artworkCount} work` / `${artworkCount} works` (singular at exactly
  1 — deviates from an earlier literal `${n} WORKS` spec, kept because
  "1 works" reads as a typo, not a feature). If `artworkCount` is 0 or
  null, the works segment is omitted entirely; the index number and rule
  still render, so the row's meta line never collapses to nothing.
- `h2` (title), location/year line (omitted gracefully if either field
  is null)
- `tagline` if present, omitted entirely if null — no placeholder copy,
  same rule as the collection detail page's `description`/statement
  field (§20)
- `VIEW COLLECTION →` link

Cover column: exactly one `<img>`, `aspect-ratio: 3/2`, `object-fit: cover`,
hotspot-driven `object-position` when set. `coverImage: null` (no upload
yet) renders as a `--bg-secondary` panel with title/meta/link intact —
the collection stays fully navigable with no image, rather than being
dropped from the index. This guard lives in the GROQ projection —
`"coverImage":select(defined(coverImage.asset)=>coverImage{asset,hotspot,crop})`
— not in Zod — `CollectionSchema.coverImage` requires `asset`, so a half-populated
image object would fail `safeParse` and silently drop the whole
collection off the page if the null-check weren't done upstream in the
query.

### Rejected: work-thumbnail preview strip

An earlier draft (matching a Figma-style reference) showed 1–2 work
thumbnails per row alongside the cover. Rejected: individual works are
already shown in full on the collection detail page one click away, so
a preview strip duplicated content without adding information, and it
reintroduced exactly the kind of fixed-slot-with-variable-content
problem `storyPages[0]` already burned this project on once (§20) — a
layout built for "always 2 thumbnails" breaks the moment a collection
has 0 or 1. Cover-image-only avoids the problem outright rather than
solving it.

### Responsive

`768–1023px`: single column, cover above text, alternation disabled.
`<768px`: single column, cover full-width.

### `/works` head alignment

`.works-head` and `.filter-bar` (in `WorksGallery.astro`, shared by
`/works` and every `/works/[...filter]` route) each get `padding-left` at
`>=700px` equal to the gallery's year-rail column width — computed as
`calc(var(--rail-w) + var(--rail-gap))`, reusing the same custom
properties `.year-group`'s `grid-template-columns` already consumes, not a
new duplicate value. This aligns the eyebrow/h1 and the filter chips with
the image column rather than the sticky year marker. Below 700px, where
the rail splits into a single column, the padding drops to 0 in the same
media query — the rules must stay on one shared breakpoint so they can't
flip out of sync.

**Both selectors are load-bearing together.** The rule originally shipped
on `.works-head` alone, which left the filter chips directly beneath the
h1 at the old left edge — a ~124px jagged step, caught in code review.
Any *left-aligned* direct child of `.works-inner` added later needs to
join that selector list, or it reintroduces the same bug.

**`.works-empty` is deliberately excluded**, and must stay excluded. It
was briefly added to the list on the reasoning that "every direct child of
`.works-inner`" belongs there, which is the wrong test — the right one is
whether the child is a left-aligned row. `.works-empty` is centred text
(`text-align: center`), and it only renders when there are no
`.year-group` rows at all, so there is no rail on screen for it to align
to. Left-only padding there shifts the message ~62px off its own centre
and aligns it with nothing. Alignment to the rail applies to content that
sits beside the rail; the empty state replaces the grid rather than
sitting in it.

`.works-eyebrow` was also brought to the same `font-size`/`letter-spacing`
as `.ci-eyebrow` (11px, 0.22em) — this was unintentional drift between
two components doing the same visual job, not a deliberate difference,
and is now a shared value. `.works-title`'s font-size clamp was
deliberately left untouched — Works sits above a filter bar and dense
grid and needs a smaller, denser heading than the Collections index,
which has room for a larger editorial headline. Don't inflate one to
match the other; align only the eyebrow.

---

*This document is the single source of truth for architectural decisions.  
Update it when decisions change — do not let it go stale.*

*Last updated: 2026-08-14 — Collections index rebuilt as editorial page
head + alternating rows (§21); `/works` head alignment brought into
token parity with Collections eyebrow (§21).*
