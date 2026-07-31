import { z } from 'zod';

export const ArtworkSchema = z.object({
  title: z.string(),
  slug: z.object({ current: z.string() }),
  image: z
    .object({
      asset: z.object({ _ref: z.string() }),
      hotspot: z.any().optional(),
    })
    .optional(),
  year: z.number().optional(),
  medium: z.string().optional(),
  dimensions: z.string().optional(),
  available: z.boolean().optional(),
  price: z.number().optional(),
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
  featured: z.boolean().optional(),
  altText: z.string().nullish(),
});

export type Artwork = z.infer<typeof ArtworkSchema>;
