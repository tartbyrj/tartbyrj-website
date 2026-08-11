# Artist portrait — optional override

The About page already ships with a portrait: `src/assets/about/artist-cutout.png`,
the artist standing free on the background art. **You do not need to add
anything here.** This folder is only for swapping that photo for a different
one without going through Sanity.

To do that, drop a file here named **`me`** — the extension can be `.jpg`,
`.jpeg`, `.png`, or `.webp`:

```
src/assets/artist/me.jpg
```

The About page picks it up on the next `npm run dev` or `npm run build`.
Nothing to import, nothing to rename in code. Delete it and the page goes back
to the shipped cutout.

## Which photo works best

A photo dropped here is shown **framed** — a 4:5 portrait crop with a thin
border, sitting on the background art. It is not stood free on the collage the
way the shipped cutout is, because an ordinary photo brings its own background
with it, and a bare rectangle of someone's living room floating on the artwork
reads as a mistake rather than a choice.

So:

- **A 4:5-ish portrait crop.** Head-and-shoulders or waist-up both work.
- **At least 1200px wide**, ideally 1800px. Drop the full-resolution file — it
  is resized at build time and the original is never shipped.
- `object-fit: cover` crops to fill, so leave a little margin on every edge
  rather than framing tight.

If you want the free-standing, no-frame treatment instead, the photo has to be
a real cutout — see "Replacing the cutout" below.

## Where the portrait comes from

The About page checks three sources, in order:

1. **Sanity** — the `aboutPage` singleton's `portrait` field. Once published it
   wins, and the artist can change the photo without touching the repo. This is
   the one to use in production. Framed, same as (2).
2. **This folder** — `me.<ext>`, the local override. Framed.
3. **`src/assets/about/artist-cutout.png`** — the shipped default, and the only
   one shown free-standing.

## Replacing the cutout

`artist-cutout.png` is generated, not hand-made. The source the artist supplied,
`src/assets/about/artist.png`, looks like a cutout but isn't — it was exported
with the editor's transparency checkerboard flattened into the pixels, so it is
fully opaque and the "empty" area is grey squares. `scripts/key-artist-cutout.mjs`
keys those out and crops to the subject:

```bash
node scripts/key-artist-cutout.mjs
```

Re-run it after replacing `artist.png`. If you can export a **genuinely**
transparent PNG from the original editor, that will always beat the keyed
version at the edges — replace `artist-cutout.png` with it directly and skip the
script.

## Why this folder and not `public/`

Files in `public/` are copied to the built site untouched, so a 4MB phone photo
would be served to every visitor at 4MB. Files here run through Astro's image
pipeline instead: resized to the widths the page actually uses, converted to
WebP, and given a hashed filename for caching. That is also the project rule in
CLAUDE.md — never serve original unoptimised files.
