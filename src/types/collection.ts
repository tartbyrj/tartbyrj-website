import { z } from 'zod';

export const CollectionSchema = z.object({
  title: z.string(),
  slug: z.object({ current: z.string() }),
  year: z.number().nullish(),
  location: z.string().nullish(),
  description: z.string().nullish(),
  // Same reason as ArtworkSchema.image: the cover is cropped to 3/2 by the
  // homepage well, and the hotspot set in Studio is the only thing that decides
  // which part of a tall cover survives that crop. Undeclared, Zod strips it
  // and urlFor() falls back to a centre crop.
  coverImage: z
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
