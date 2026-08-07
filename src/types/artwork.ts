import { z } from 'zod';

export const ArtworkSchema = z.object({
  title: z.string(),
  slug: z.object({ current: z.string() }),
  // hotspot and crop are declared, not z.any(), because Zod strips what it does
  // not know about: undeclared crop data never reaches urlFor(), so a cropped
  // artwork renders full-frame and gets framed differently on every page.
  image: z
    .object({
      asset: z.object({ _ref: z.string() }),
      // .nullish(), not .optional(): GROQ returns null for an image that was
      // never given a hotspot or crop in Studio, and .optional() rejects null —
      // which drops the whole document in parseList. Same trap as
      // artwork.collection.
      hotspot: z
        .object({ x: z.number(), y: z.number(), width: z.number(), height: z.number() })
        .nullish(),
      crop: z
        .object({ top: z.number(), bottom: z.number(), left: z.number(), right: z.number() })
        .nullish(),
    })
    .nullish(),
  year: z.number().nullish(),
  medium: z.string().nullish(),
  dimensions: z.string().nullish(),
  available: z.boolean().nullish(),
  price: z.number().nullish(),
  // Accepts both shapes this field arrives in: a raw reference ({_ref}) from
  // queries that select `collection` directly, and the dereferenced projection
  // ({title, slug}) from ARTWORK_BY_SLUG_QUERY's `collection->{...}`. GROQ
  // returns null when the artwork has no collection, hence nullish.
  collection: z
    .object({
      _ref: z.string().optional(),
      title: z.string().optional(),
      slug: z.object({ current: z.string() }).optional(),
    })
    .nullish(),
  featured: z.boolean().nullish(),
  altText: z.string().nullish(),
});

export type Artwork = z.infer<typeof ArtworkSchema>;
