# Brand logo

Drop the T.Art by RJ lockup in this folder. Name it **`tart-logo`** — the
extension can be `.png`, `.jpg`, `.jpeg`, or `.webp`:

```
src/assets/tart-logo.png
```

The nav picks it up automatically on the next `npm run dev` or `npm run build`.
Nothing to import, nothing to rename in code.

## Which file works best

- **Transparent PNG**, trimmed tight to the artwork. Any baked-in white padding
  becomes dead space in the nav, and the nav is only 40px tall.
- **At least 600px wide.** The logo renders at 40px tall on desktop (32px on
  mobile), so ~440px covers a 2x display with room to spare. Drop the
  full-resolution file — it is resized at build time and the original is never
  shipped.
- Keep the source aspect ratio. The CSS sets height and lets width follow, so a
  differently-proportioned file changes how much horizontal room the nav needs,
  not how tall it is.

## Why this folder and not `public/`

Files in `public/` are copied to the built site untouched. Files here run
through Astro's image pipeline instead: resized to the widths the nav actually
uses, and given a hashed filename for caching. That is also the project rule in
CLAUDE.md — never serve original unoptimised files.

## Fallback

If no file is present, the nav renders the type wordmark "T.Art by RJ" in
Cormorant Garamond — the previous behaviour. The build never breaks on a
missing logo.
