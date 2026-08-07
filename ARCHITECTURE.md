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
│   │   ├── about.astro
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
slug           slug
description    text
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
| About | `Person` |
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
  --text-secondary: rgba(26, 20, 18, 0.52);
  --text-muted:     rgba(26, 20, 18, 0.28);

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
  --text-muted:     rgba(240, 235, 227, 0.28);

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

> Sections 3–5 (Works, Artist, Exhibitions) are specified, not yet built.

| # | Section | Anchor |
|---|---|---|
| 1 | Hero | `hero-track` |
| 2 | Collections index | `id="collections"` |
| 3 | Recent Works | `id="works"` |
| 4 | The Artist | `id="artist"` |
| 5 | Upcoming Exhibitions | `id="exhibitions"` |
| 6 | Footer | in `Layout.astro` |

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

*This document is the single source of truth for architectural decisions.  
Update it when decisions change — do not let it go stale.*

*Last updated: August 2026 — homepage composition*
