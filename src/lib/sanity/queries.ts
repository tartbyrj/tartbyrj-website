export const FEATURED_ARTWORKS_QUERY = `
*[_type=="artwork"&&featured==true]|order(_createdAt desc)[0...6]{
  title,slug,image,year,medium,dimensions,altText
}
`;

export const ALL_ARTWORKS_QUERY = `
*[_type=="artwork"]|order(year desc){
  title,slug,image,year,medium,dimensions,
  available,price,altText
}
`;

export const ARTWORK_BY_SLUG_QUERY = `
*[_type=="artwork"&&slug.current==$slug][0]{
  title,slug,image,year,medium,dimensions,
  available,price,altText,
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
export const COLLECTIONS_INDEX_QUERY = `
*[_type=="collection"&&defined(coverImage.asset)]|order(year desc)[0...4]{
  title,slug,year,location,coverImage,
  "artworkCount":count(artworks)
}
`;

// Homepage "Recent Works" section. featured desc puts the flagged works first
// (true sorts above false), then year desc fills the remaining slots with the
// most recent. [0..5] is inclusive on both ends — exactly 6 documents.
//
// defined(image.asset) mirrors COLLECTIONS_INDEX_QUERY: a tile in this grid is
// nothing but its image, so an artwork with no upload would render as an empty
// frame. Such artworks stay reachable via /works and /works/[slug], and rejoin
// this section on their own once an image is uploaded in Studio.
//
// defined(slug.current) guards the slice, which GROQ applies before Zod ever
// runs: a slug-less draft would claim one of the six slots and then fail
// validation, silently shrinking the grid to five.
export const HOMEPAGE_WORKS_QUERY = `
*[_type=="artwork"&&defined(image.asset)&&defined(slug.current)]|order(featured desc,year desc)[0..5]{
  title,slug,year,medium,featured,altText,
  image{asset,hotspot,crop}
}
`;

export const COLLECTION_BY_SLUG_QUERY = `
*[_type=="collection"&&slug.current==$slug][0]{
  title,slug,year,location,description,
  coverImage,storyPages,
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
