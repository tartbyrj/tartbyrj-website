/**
 * Structured-data generators.
 *
 * Pure functions returning plain objects — no Astro imports, no markup, no
 * JSON.stringify. Serialising and emitting is the page's job (via the
 * `jsonld` slot on Layout.astro), which keeps these independently
 * unit-testable (jsonld.test.ts).
 *
 * House rule, enforced by tests: a property whose source field is null is
 * OMITTED, never emitted as an empty string. `"endDate": ""` is a positive
 * assertion of a value that does not exist, and search engines read it as
 * one — strictly worse than saying nothing.
 */

interface ExhibitionEventSource {
  title: string;
  startDate?: string | null;
  endDate?: string | null;
  venue?: string | null;
  city?: string | null;
  country?: string | null;
  address?: string | null;
}

interface ExhibitionEventOptions {
  url: string;
  imageUrl?: string | null;
}

interface Place {
  '@type': 'Place';
  name?: string;
  address?: string;
}

export interface ExhibitionEvent {
  '@context': 'https://schema.org';
  '@type': 'ExhibitionEvent';
  name: string;
  url: string;
  startDate?: string;
  endDate?: string;
  image?: string;
  location?: Place;
}

export function exhibitionEventJsonLd(
  exhibition: ExhibitionEventSource,
  { url, imageUrl }: ExhibitionEventOptions
): ExhibitionEvent {
  const ld: ExhibitionEvent = {
    '@context': 'https://schema.org',
    '@type': 'ExhibitionEvent',
    name: exhibition.title,
    url,
  };

  if (exhibition.startDate) ld.startDate = exhibition.startDate;
  if (exhibition.endDate) ld.endDate = exhibition.endDate;
  if (imageUrl) ld.image = imageUrl;

  // The full postal string, composed rather than picked: a street address on
  // its own ("Alserkal Avenue, Al Quoz 1") is not locatable without the city,
  // and city/country alone are the only detail many documents carry. Each
  // part is optional, so filter(Boolean) is what keeps a null in the middle
  // from leaving a dangling ", " separator.
  const address = [exhibition.address, exhibition.city, exhibition.country]
    .filter(Boolean)
    .join(', ');

  const place: Place = { '@type': 'Place' };
  if (exhibition.venue) place.name = exhibition.venue;
  if (address) place.address = address;

  // A Place carrying nothing but its own @type says nothing — omit it.
  if (place.name || place.address) ld.location = place;

  return ld;
}
