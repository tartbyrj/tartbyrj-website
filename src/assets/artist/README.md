# Artist portrait

Drop the portrait photo in this folder. Name it **`me`** — the extension can be
`.jpg`, `.jpeg`, `.png`, or `.webp`:

```
src/assets/artist/me.jpg
```

The About page picks it up automatically on the next `npm run dev` or
`npm run build`. Nothing to import, nothing to rename in code.

## Which photo works best

- **Portrait orientation, 4:5 crop.** The page renders it at `aspect-ratio: 4/5`
  and covers, so anything squarer or wider gets cropped top and bottom.
- **At least 1200px wide**, ideally 1800px. Drop the full-resolution file — it
  is resized at build time, and the original is never shipped.
- Leave some space around the head. The image sits in a sticky column, read at
  roughly 580px wide on desktop.

## Why this folder and not `public/`

Files in `public/` are copied to the built site untouched, so a 4MB phone photo
would be served to every visitor at 4MB. Files here run through Astro's image
pipeline instead: resized to the widths the page actually uses, converted to
WebP, and given a hashed filename for caching. That is also the project rule in
CLAUDE.md — never serve original unoptimised files.

## Where the portrait comes from

The About page checks two sources, in order:

1. **Sanity** — the `aboutPage` singleton's `portrait` field. Once published it
   wins, and the artist can change the photo without touching the repo. This is
   the one to use in production.
2. **This folder** — the local fallback, for working on the page before the CMS
   has content.

If neither exists, the page drops the portrait column and centres the statement
rather than showing an empty box. In `npm run dev` only, a labelled placeholder
frame marks where the photo will land; it never appears in a production build.
