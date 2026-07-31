import { z } from 'zod';

export const CollectionSchema = z.object({
  title: z.string(),
  slug: z.object({ current: z.string() }),
  year: z.number().optional(),
  location: z.string().nullish(),
  description: z.string().nullish(),
  coverImage: z
    .object({
      asset: z.object({ _ref: z.string() }),
    })
    .optional(),
  storyPages: z
    .array(
      z.object({
        asset: z.object({ _ref: z.string() }),
      })
    )
    .optional(),
  artworks: z.array(z.any()).optional(),
  // Computed by GROQ (count(artworks)) — declared so Zod doesn't strip it.
  artworkCount: z.number().optional(),
  seo: z.any().optional(),
});

export type Collection = z.infer<typeof CollectionSchema>;
