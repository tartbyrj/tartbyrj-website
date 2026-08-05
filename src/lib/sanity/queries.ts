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

export const ALL_COLLECTIONS_QUERY = `
*[_type=="collection"]|order(year desc){
  title,slug,year,location,description,
  coverImage,"artworkCount":count(artworks)
}
`;

// Homepage "Collections index" section. Deliberately narrower than
// ALL_COLLECTIONS_QUERY: no description, and capped at 4 so the section can
// never grow past the layout it was designed for.
export const COLLECTIONS_INDEX_QUERY = `
*[_type=="collection"]|order(year desc)[0...4]{
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
