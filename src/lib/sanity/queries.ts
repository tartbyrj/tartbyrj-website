export const FEATURED_ARTWORKS_QUERY = `
*[_type=="artwork"&&featured==true]|order(_createdAt desc)[0...6]{
  title,slug,image,year,medium,dimensions,altText
}
`;

// paintType and surface are the controlled filter tags (src/lib/taxonomy.ts);
// medium stays alongside them as the display string and is not derived from
// them.
//
// imageDimensions is aliased, not projected as `dimensions` — `dimensions` is
// already taken by the artwork's own typed size string. It dereferences the
// asset to read Sanity's stored metadata, which is what lets /works compute
// justified row heights during the build instead of measuring in the browser.
// An artwork with no image yields null here, which the schema accepts.
export const ALL_ARTWORKS_QUERY = `
*[_type=="artwork"]|order(year desc){
  title,slug,image,year,medium,dimensions,
  available,price,altText,
  paintType,surface,
  "imageDimensions":image.asset->metadata.dimensions{width,height,aspectRatio}
}
`;

// Same imageDimensions alias as above. Purely additive: it introduces a new key
// under a name no page reads yet and leaves every existing key untouched, so
// /works/[slug] parses exactly the shape it did before. Available for reserving
// the image's aspect ratio on the detail page when that layout wants it.
export const ARTWORK_BY_SLUG_QUERY = `
*[_type=="artwork"&&slug.current==$slug][0]{
  title,slug,image,year,medium,dimensions,
  available,price,altText,
  paintType,surface,
  "imageDimensions":image.asset->metadata.dimensions{width,height,aspectRatio},
  collection->{ title, slug }
}
`;

// Homepage "Collections index" section. Capped at 4 so the section can never
// grow past the layout it was designed for. /collections carries its own inline
// query — it projects slug as a string, so the two are not interchangeable.
//
// defined(coverImage.asset) is load-bearing: the image well is this section's
// primary UI, so a cover-less collection would hover-swap to an empty panel and
// read as a broken image rather than as graceful degradation. Such collections
// stay reachable via /collections and /collections/[slug], and rejoin this
// section on their own once a cover is uploaded in Studio.
// The counted filter, not a bare count(artworks): the raw array counts every
// reference, including ones pointing at a draft or deleted artwork. Those
// dereference to null in COLLECTION_BY_SLUG_QUERY and are filtered out before
// render on the detail page, so a bare count lets this label promise "3 works"
// while the collection's own page shows one.
//
// Both halves of the filter mirror what collections/[slug].astro actually
// renders — its filter is Boolean(artwork?.slug?.current), which drops a
// reference for either reason:
//   defined(@->_id)           — deleted/draft artwork, dereferences to null
//   defined(@->slug.current)  — artwork exists but was never given a slug in
//                               Studio, so the detail page has no URL to link
//                               and skips the card
// Counting only _id let the second case through: the index said "3 works", the
// collection page rendered 2. Keep this expression identical in both queries
// below and in step with that render filter — three copies of one definition
// is already one too many, and they only stay honest if they move together.
export const COLLECTIONS_INDEX_QUERY = `
*[_type=="collection"&&defined(coverImage.asset)]|order(year desc)[0...4]{
  title,tagline,slug,year,location,coverImage,
  "artworkCount":count(artworks[defined(@->_id) && defined(@->slug.current)])
}
`;

// The /collections index. Distinct from COLLECTIONS_INDEX_QUERY above in three
// ways, none of them cosmetic: no [0...4] cap (this page is the full index),
// no defined(coverImage.asset) filter, and slug is left as the {current} object
// so the result parses against CollectionSchema directly instead of needing a
// page-local shape.
//
// Dropping the cover filter is the point of the page: the homepage section is a
// hover-swapped image well, so a cover-less collection there reads as a broken
// image, but this page is a list of every body of work — a row whose cover well
// falls back to a flat --bg-secondary panel still carries its title, meta and
// link, which is the row's actual job. Omitting it here would mean a collection
// existed on the site with no page that lists it.
//
// select() with no fallback clause returns null, so coverImage is either null
// or an object with a real asset — never the half-populated shape that would
// fail CollectionSchema's required `asset` and cost the whole row. The guard
// belongs in the query, where failing is cheap, not in Zod, where a single
// malformed image would drop a collection off the index entirely (§19).
//
// defined(slug.current) matches COLLECTION_NEIGHBOURS_QUERY: every row here
// links to /collections/<slug>, and that route is only built for collections
// with a slug. Without this, a slug-less draft ships a link to a 404.
//
// artworkCount's filter is the same expression as COLLECTIONS_INDEX_QUERY's —
// see the note there for why both halves are required. The two must not drift.
export const COLLECTIONS_ALL_QUERY = `
*[_type=="collection"&&defined(slug.current)]|order(year desc){
  title,tagline,slug,year,location,
  "coverImage":select(defined(coverImage.asset)=>coverImage{asset,hotspot,crop}),
  "artworkCount":count(artworks[defined(@->_id) && defined(@->slug.current)])
}
`;

// Homepage "Recent Works" section. (featured==true) desc puts the flagged works
// first, then year desc fills the remaining slots with the most recent.
//
// The comparison is not redundant: featured is optional in the schema, so an
// artwork whose toggle was never touched in Studio comes back null, and GROQ
// orders null *above* true on a descending sort. Sorting on the raw field
// therefore handed the lead slot — the wide 1.65fr column — to whichever work
// had never been considered for featuring. (featured==true) evaluates to a real
// boolean for every document, null included, so false sorts below true.
// The parentheses are required — `featured==true desc` is a parse error, and a
// parse error here returns nothing at all, which the page renders as its empty
// state rather than as a failure.
//
// [0..2] is inclusive on both ends — exactly 3 documents, which is
// the whole inventory in Sanity today. The section is a single row of three;
// raise this to [0..5] when there is enough work to earn a second row back.
//
// defined(image.asset) mirrors COLLECTIONS_INDEX_QUERY: a tile in this grid is
// nothing but its image, so an artwork with no upload would render as an empty
// frame. Such artworks stay reachable via /works and /works/[slug], and rejoin
// this section on their own once an image is uploaded in Studio.
//
// defined(slug.current) guards the slice, which GROQ applies before Zod ever
// runs: a slug-less draft would claim one of the three slots and then fail
// validation, silently shrinking the grid to two.
export const HOMEPAGE_WORKS_QUERY = `
*[_type=="artwork"&&defined(image.asset)&&defined(slug.current)]|order((featured==true) desc,year desc)[0..2]{
  title,slug,year,medium,featured,altText,
  image{asset,hotspot,crop}
}
`;

// Every collection, title and slug only, in the same year-desc order the
// /collections index uses. Two jobs on /collections/[slug]: it generates the
// static paths, and the same array position that produced a path also yields
// that page's prev/next neighbours. One fetch, one ordering — a separate
// slugs-only query would be free to disagree with this one about which
// collections exist, and the prev/next links would point at pages that were
// never built.
export const COLLECTION_NEIGHBOURS_QUERY = `
*[_type=="collection"&&defined(slug.current)]|order(year desc){
  title,"slug":slug.current
}
`;

// coverImage carries the same select(defined(...)) guard as
// COLLECTIONS_ALL_QUERY, and for a sharper reason: this document is validated
// by a single safeParse in collections/[slug].astro, and a failure there is a
// redirect to /collections — the collection becomes unreachable, not just
// absent from an index. CollectionSchema.coverImage requires `asset` and has no
// .catch(null), so a half-populated image object (an API/import write, or an
// asset removed out of band — Studio cannot author one) would take the whole
// page down. select() with no fallback clause returns null instead, which the
// page's empty floor already handles as "no cover". The guard lives here rather
// than in Zod for the same reason it does on COLLECTIONS_ALL_QUERY (§19):
// failing in the projection is cheap and local.
export const COLLECTION_BY_SLUG_QUERY = `
*[_type=="collection"&&slug.current==$slug][0]{
  title,tagline,slug,year,location,description,
  "coverImage":select(defined(coverImage.asset)=>coverImage{asset,hotspot,crop}),
  storyPages,
  artworks[]->{title,slug,image,medium,year,altText}
}
`;

// Homepage singleton. [0] on a type that should only ever hold one document —
// see the structure resolver in sanity.config.ts, which pins it to a fixed id.
// heroArtwork is dereferenced inline so the hero needs a single round trip;
// image carries hotspot and crop, which urlFor() applies to the full-bleed crop.
export const HOMEPAGE_QUERY = `
*[_type=="homepage"][0]{
  heroArtwork->{
    title,slug,medium,year,altText,
    image{asset,hotspot,crop}
  }
}
`;

export const ABOUT_QUERY = `
*[_type=="aboutPage"][0]{
  biography,statement,portrait
}
`;
