import type { z } from 'zod';

/**
 * Validate a GROQ list result one document at a time.
 *
 * `z.array(Schema).safeParse()` is all-or-nothing: a single malformed document
 * fails the whole parse, so the usual `result.success ? result.data : []`
 * fallback silently empties an entire grid — or, inside getStaticPaths, drops
 * every static path and 404s the whole section.
 *
 * Validating per item contains the damage to the offending document. The
 * warning runs at build time only (static output), so a broken document is
 * visible in the build log rather than failing silently.
 */
export function parseList<T extends z.ZodTypeAny>(
  schema: T,
  raw: unknown,
  label: string
): z.infer<T>[] {
  if (!Array.isArray(raw)) {
    if (raw != null) {
      console.warn(`[sanity] ${label}: expected an array, got ${typeof raw} — skipping`);
    }
    return [];
  }

  return raw.flatMap((item, i) => {
    const result = schema.safeParse(item);
    if (result.success) return [result.data];

    console.warn(
      `[sanity] ${label}: skipped document at index ${i} — ${result.error.issues
        .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
        .join('; ')}`
    );
    return [];
  });
}
