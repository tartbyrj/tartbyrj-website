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
  // `.nullish().catch(null)` at the item level, same reasoning as
  // `artworks[].image` above: Studio inserts a bare `{_key, _type:'image'}`
  // the instant an editor clicks "Add item" before uploading, which fails
  // `asset`'s required check. Without the catch, that one incomplete deck
  // page fails the array, fails CollectionSchema, and redirects the whole
  // collection page away — same single-safeParse, no-damage-containment
  // situation as artworks[].image, since this document is also validated
  // outside parseList.
  storyPages: z
    .array(
      z
        .object({
          asset: z.object({ _ref: z.string() }),
        })
        .nullish()
        .catch(null)
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
  // runtime filter.
  //
  // `.catch(null)` is what actually makes that true, and it is not decoration.
  // Unlike ArtworkSchema, this field is validated by a single safeParse on ONE
  // document (collections/[slug].astro), not by parseList — so there is no
  // per-item damage containment above it. Without a catch, one bad item fails
  // the array, which fails CollectionSchema, which redirects the entire
  // collection page away.
  //
  // It appears at two levels, and both are load-bearing:
  //   · on `image` — an image object present but missing `asset` (an API/import
  //     write, or an asset removed out of band; Studio cannot author it)
  //     degrades to a missing thumbnail. `asset` stays required INSIDE the
  //     object so urlFor() never receives a source it cannot resolve; the catch
  //     converts that strictness into a local null.
  //   · on the item object — every field is `.nullish()`, so *absent* data is
  //     already contained, but a *wrong-typed* one is not: `year` arriving as
  //     the string "2023" from an import fails the item, and without this catch
  //     that single bad field would still cost the whole page. `.nullable()`
  //     alone does not do this — it accepts a null GROQ hands us, it does not
  //     convert a validation failure into null.
  // One broken artwork must cost that artwork, not the page.
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
            .nullish()
            .catch(null),
          medium: z.string().nullish(),
          year: z.number().nullish(),
          altText: z.string().nullish(),
        })
        .nullable()
        .catch(null)
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
