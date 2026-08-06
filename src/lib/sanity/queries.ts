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

export const COLLECTION_BY_SLUG_QUERY = `
*[_type=="collection"&&slug.current==$slug][0]{
  title,slug,year,location,description,
  coverImage,storyPages,
  artworks[]->{title,slug,image,medium,year,altText}
}
`;

export const ABOUT_QUERY = `
*[_type=="aboutPage"][0]{
  biography,statement,portrait
}
`;
