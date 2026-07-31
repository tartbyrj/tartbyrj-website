import { z } from 'zod';

export const CollectionSchema = z.object({
  title: z.string(),
  slug: z.object({ current: z.string() }),
  year: z.number().nullish(),
  location: z.string().nullish(),
  description: z.string().nullish(),
  coverImage: z
    .object({
      asset: z.object({ _ref: z.string() }),
    })
    .nullish(),
  storyPages: z
    .array(
      z.object({
        asset: z.object({ _ref: z.string() }),
      })
    )
    .nullish(),
  artworks: z.array(z.any()).nullish(),
  // Computed by GROQ (count(artworks)) — declared so Zod doesn't strip it.
  artworkCount: z.number().nullish(),
  seo: z.any().nullish(),
});

export type Collection = z.infer<typeof CollectionSchema>;
