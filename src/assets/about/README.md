# Artist page art

> Folder name is historical — these assets belong to the page now at
> `/artist` (`src/pages/artist.astro`), renamed from `/about` on 2026-09-02.
> The folder was left as `src/assets/about/` rather than churn the import
> paths; only the route moved.

| File | Used by | What it is |
|---|---|---|
| `about page background.png` | `src/pages/artist.astro` | The full-page background. Clean plate — paper, ink washes, skyline sketch, taped T.ART card, notebook and brushes. **No text and no figure baked in**, which is what lets every word on the page be real HTML over it. |
| `artist.png` | *(source only)* | The artist photo as supplied. Not used by the site directly — see below. |
| `artist-cutout.png` | *(unused)* | Generated from `artist.png`. **No longer rendered** — the Artist page's portrait is now `src/assets/artist/rupjyoti-portrait.jpeg`, a whole studio photograph shown framed rather than a cutout stood free on the background. Kept, along with the keying script below, only in case the free-standing treatment is wanted again; safe to delete otherwise. |
| `about-hero.png` | *(unused)* | The old flattened archive plate, from the previous build of this page — background, artist and all the body copy merged into one image. Kept only in case it's wanted again; safe to delete. |

## Why `artist.png` isn't used directly

It looks like a cutout but isn't. It was exported with the editor's
transparency checkerboard flattened into the pixels — alpha is 255 everywhere
and the "empty" area is opaque grey squares. Dropped onto the background, the
checkerboard would simply be visible.

`scripts/key-artist-cutout.mjs` keys those greys out, fills the holes the key
punches in the subject, drops the stray cells, feathers the edge and crops to
him:

```bash
node scripts/key-artist-cutout.mjs
```

Re-run it whenever `artist.png` is replaced.

**A genuinely transparent export beats this.** Keying a flattened checkerboard
is recovery work, and it can't invent the partial transparency that was thrown
away where his outline was anti-aliased against the grey. If the original
editor can export a real transparent PNG, replace `artist-cutout.png` with it
and the script stops being needed.

## Sizes

Both PNGs are large (6MB) and that is fine — they never ship. Astro's image
pipeline resizes and converts them to WebP at build time; the background lands
around 118kB. Never move these to `public/`, which would serve the originals
untouched. (`artist-cutout.png` is no longer imported, so it is not converted
at all — nothing about it reaches the built site.)
