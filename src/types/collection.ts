import { z } from 'zod';

export const CollectionSchema = z.object({
  title: z.string(),
  tagline: z.string().nullish(),
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
  // Dereferenced via `artworks[]->{...}` (COLLECTION_BY_SLUG_QUERY). A
  // reference to a deleted or unpublished artwork dereferences to `null` in
  // that array slot rather than being omitted, hence `.nullable()` on the
  // item — see the filter in collections/[slug].astro that drops those
  // before render. Every field on the item itself is `.nullish()`, including
  // title and slug, even though the template treats a present item as having
  // both: this schema's job is only to keep safeParse from failing the whole
  // collection over one partial/unexpected artwork document, not to
  // guarantee shape for the template — that guarantee is the page's own
  // runtime filter, same division of labour as ArtworkSchema.image being
  // nullish while its inner hotspot/crop fields are required once present.
  artworks: z
    .array(
      z
        .object({
          title: z.string().nullish(),
          slug: z.object({ current: z.string() }).nullish(),
          image: z
            .object({
              asset: z.object({ _ref: z.string() }),
              hotspot: z
                .object({ x: z.number(), y: z.number(), width: z.number(), height: z.number() })
                .nullish(),
              crop: z
                .object({ top: z.number(), bottom: z.number(), left: z.number(), right: z.number() })
                .nullish(),
            })
            .nullish(),
          medium: z.string().nullish(),
          year: z.number().nullish(),
          altText: z.string().nullish(),
        })
        .nullable()
    )
    .nullish(),
  // Computed by GROQ (count(artworks)) — declared so Zod doesn't strip it.
  artworkCount: z.number().nullish(),
  seo: z.any().nullish(),
});

export type Collection = z.infer<typeof CollectionSchema>;

// COLLECTION_NEIGHBOURS_QUERY's shape — slug as a plain string, not the
// {current} object CollectionSchema.slug expects, since that query projects
// "slug":slug.current directly. Exported (not declared inline in
// collections/[slug].astro) because Astro extracts getStaticPaths into an
// isolated module at build time that can see imports but not sibling
// top-level `const`s from the rest of that file's frontmatter — a local
// declaration referenced from inside getStaticPaths fails at build with
// "NeighbourSchema is not defined" even though `astro check` doesn't catch
// it, since the type-checker doesn't model Astro's compiler-level scope
// splitting.
export const CollectionNeighbourSchema = z.object({ title: z.string(), slug: z.string() });
export type CollectionNeighbour = z.infer<typeof CollectionNeighbourSchema>;
