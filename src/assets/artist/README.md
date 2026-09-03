# Artist portrait

## What ships

`rupjyoti-portrait.jpeg` — the studio photograph the Artist page renders by
default. A whole photograph with its own background (1023 × 1537), shown in a
framed box: a thin `--border-strong` rule, `object-fit: contain`, and an
`aspect-ratio` locked to the file's own 1023 / 1537 so the full frame is always
visible and nothing is ever cropped.

**If you replace this file, update the `aspect-ratio` pair in `artist.astro`'s
`.portrait :global(img)` rule to match the new file's dimensions.** `contain`
means a mismatch shows as letterbox bars rather than a silent crop — visible,
but still wrong.

## Optional override

You do not need to add anything here. This folder also accepts a file named
**`me`** — extension `.jpg`, `.jpeg`, `.png`, or `.webp`:

```
src/assets/artist/me.jpg
```

The Artist page picks it up on the next `npm run dev` or `npm run build`.
Nothing to import, nothing to rename in code. Delete it and the page goes back
to `rupjyoti-portrait.jpeg`.

## Which photo works best

All portrait sources now get the same framed treatment, so:

- **A tall portrait crop**, roughly 2:3. The box is locked to
  `rupjyoti-portrait.jpeg`'s ratio, and `contain` letterboxes anything that
  doesn't match rather than cropping it — so either match the ratio or update
  the CSS as noted above.
- **At least 1200px wide**, ideally 1800px. Drop the full-resolution file — it
  is resized at build time and the original is never shipped.
- Nothing is cropped, so frame the shot the way you want it seen.

## Where the portrait comes from

The Artist page checks three sources, in order:

1. **Sanity** — the `aboutPage` singleton's `portrait` field. Once published it
   wins, and the artist can change the photo without touching the repo. This is
   the one to use in production.
2. **This folder** — `me.<ext>`, the local override.
3. **`rupjyoti-portrait.jpeg`** — the shipped default.

All three render identically. The earlier cutout/framed split is gone: it
existed only because the previous default (`src/assets/about/artist-cutout.png`)
was keyed to transparency and stood free on the background art, which an
ordinary photograph with its own background cannot do without reading as a
mistake. That asset and `scripts/key-artist-cutout.mjs` still exist but are no
longer wired to anything — see `src/assets/about/README.md`.

## Why this folder and not `public/`

Files in `public/` are copied to the built site untouched, so a 4MB phone photo
would be served to every visitor at 4MB. Files here run through Astro's image
pipeline instead: resized to the widths the page actually uses, converted to
WebP, and given a hashed filename for caching. That is also the project rule in
CLAUDE.md — never serve original unoptimised files.
