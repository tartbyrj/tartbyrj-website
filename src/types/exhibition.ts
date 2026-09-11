import { z } from 'zod';

// Shared shape for coverImage and each gallery[] item — same hotspot/crop
// declaration as ArtworkSchema.image / CollectionSchema.coverImage. Zod
// strips anything undeclared, so leaving these out would silently drop the
// editor-set focus point the moment either image needs to be cropped.
const ExhibitionImageSchema = z.object({
  asset: z.object({ _ref: z.string() }),
  hotspot: z
    .object({ x: z.number(), y: z.number(), width: z.number(), height: z.number() })
    .nullish(),
  crop: z
    .object({ top: z.number(), bottom: z.number(), left: z.number(), right: z.number() })
    .nullish(),
});

// gallery[] only — coverImage and artworks[].image don't carry a per-image
// `alt` field in Studio (coverImage uses the exhibition-level `altText`
// instead). Optional: RJ hasn't authored any gallery content yet, and a
// required field would fail every existing and future document that skips
// it. The detail page falls back to the ordinal "Installation view N of M"
// text when this is unset.
const GalleryImageSchema = ExhibitionImageSchema.extend({
  alt: z.string().nullish(),
});

export const ExhibitionSchema = z.object({
  title: z.string(),
  slug: z.object({ current: z.string() }),
  // Loose string, not z.enum(EXHIBITION_TYPES) — renaming a type label later
  // while old documents still carry the previous string would otherwise make
  // safeParse drop the exhibition entirely (§19 precedent, ArtworkSchema.paintType).
  // Unknown values are filtered at the presentation layer instead, where
  // failing is cheap.
  type: z.string().nullish(),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
  venue: z.string(),
  city: z.string(),
  country: z.string().nullish(),
  tagline: z.string().nullish(),
  excerpt: z.string().nullish(),
  // .nullish(), not .optional(): the EXHIBITIONS_ALL_QUERY projection guards
  // this with select(defined(coverImage.asset)=>...) and returns null rather
  // than a half-populated object — see queries.ts.
  coverImage: ExhibitionImageSchema.nullish(),
  altText: z.string().nullish(),
  address: z.string().nullish(),
  // Free display text ("Friday 13 November, 6:00 – 9:00 pm"), not an ISO
  // instant — the Studio field is a `string`, not a `datetime`, because the
  // datetime widget resolves input against the editor's own timezone and RJ
  // authors from two of them. Renders verbatim; nothing parses it. Same
  // shape and same reasoning as `hours` below. See the comment on this field
  // in src/sanity/schemas/exhibition.ts before changing either.
  openingReception: z.string().nullish(),
  hours: z.string().nullish(),
  admission: z.string().nullish(),
  statement: z.string().nullish(),
  pullQuote: z.string().nullish(),
  // Dereferenced only by EXHIBITION_BY_SLUG_QUERY (artworks[]->{...}); absent
  // entirely from EXHIBITIONS_ALL_QUERY's projection, which .nullish() also
  // covers since a key GROQ never selected comes back undefined, not null.
  //
  // `.catch(null)` on the item, same reasoning as CollectionSchema.artworks:
  // the detail page validates this document with one safeParse, not
  // parseList, so there is no per-item damage containment above it — one
  // artwork with a wrong-typed field would otherwise fail the item, the
  // array, and the whole exhibition.
  artworks: z
    .array(
      z
        .object({
          _id: z.string().nullish(),
          title: z.string().nullish(),
          slug: z.object({ current: z.string() }).nullish(),
          image: ExhibitionImageSchema.nullish().catch(null),
          year: z.number().nullish(),
          medium: z.string().nullish(),
        })
        .nullable()
        .catch(null)
    )
    .nullish(),
  // Same per-item `.catch(null)` reasoning as storyPages on CollectionSchema:
  // Studio inserts a bare `{_key,_type:'image'}` the instant an editor clicks
  // "Add item" before uploading, which fails `asset`'s required check.
  gallery: z.array(GalleryImageSchema.nullish().catch(null)).nullish(),
  link: z.string().nullish(),
  // Matches src/sanity/schemas/exhibition.ts's `seo` object field exactly:
  // metaTitle (string), metaDescription (text — still a string over the
  // wire), ogImage (image, same asset/hotspot/crop shape as every other
  // image on this schema, though Studio doesn't enable hotspot for it).
  seo: z
    .object({
      metaTitle: z.string().nullish(),
      metaDescription: z.string().nullish(),
      ogImage: ExhibitionImageSchema.nullish(),
    })
    .nullish(),
});

export type Exhibition = z.infer<typeof ExhibitionSchema>;
