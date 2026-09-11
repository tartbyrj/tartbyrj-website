import { test } from 'node:test';
import assert from 'node:assert/strict';
import { exhibitionEventJsonLd } from './jsonld.ts';

const full = {
  title: 'The River Remembers Its Names',
  startDate: '2026-11-14',
  endDate: '2026-11-28',
  venue: 'Tawa Art House',
  city: 'Dubai',
  country: 'UAE',
  address: 'Alserkal Avenue, Al Quoz 1',
};

test('a fully-populated exhibition produces a complete ExhibitionEvent', () => {
  const ld = exhibitionEventJsonLd(full, {
    url: 'https://tartbyrj.com/exhibitions/the-river',
    imageUrl: 'https://cdn.sanity.io/x.webp',
  });

  assert.equal(ld['@context'], 'https://schema.org');
  assert.equal(ld['@type'], 'ExhibitionEvent');
  assert.equal(ld.name, full.title);
  assert.equal(ld.startDate, '2026-11-14');
  assert.equal(ld.endDate, '2026-11-28');
  assert.equal(ld.url, 'https://tartbyrj.com/exhibitions/the-river');
  assert.equal(ld.image, 'https://cdn.sanity.io/x.webp');
  assert.equal(ld.location?.['@type'], 'Place');
  assert.equal(ld.location?.name, 'Tawa Art House');
  assert.equal(ld.location?.address, 'Alserkal Avenue, Al Quoz 1, Dubai, UAE');
});

// The PRD rule: omit a property whose source field is null, rather than
// emitting an empty string. `"endDate": ""` is worse than no endDate — it is
// a positive assertion of a value that does not exist.
test('a null endDate omits the key entirely rather than emitting an empty string', () => {
  const ld = exhibitionEventJsonLd({ ...full, endDate: null }, { url: 'u' });
  assert.ok(!('endDate' in ld), 'endDate key should be absent');
});

test('a missing image omits the key rather than emitting an empty string', () => {
  const ld = exhibitionEventJsonLd(full, { url: 'u' });
  assert.ok(!('image' in ld), 'image key should be absent');
});

// No address data of any kind — the venue name is still worth emitting on
// its own. (Distinct from the venue-less case below, which drops `location`
// altogether.)
test('with no address data at all, location keeps its name and carries no address key', () => {
  const ld = exhibitionEventJsonLd(
    { ...full, address: null, city: null, country: null },
    { url: 'u' }
  );
  assert.equal(ld.location?.name, 'Tawa Art House');
  assert.ok(!('address' in (ld.location ?? {})), 'address key should be absent');
});

// city and country are the address when no street address is authored —
// dropping them would throw away the only location detail the document has.
test('with no street address, city and country still form the address', () => {
  const ld = exhibitionEventJsonLd(
    { ...full, address: null, city: 'Dubai', country: 'UAE' },
    { url: 'u' }
  );
  assert.equal(ld.location?.address, 'Dubai, UAE');
});

test('a null country is dropped from the address, leaving no trailing separator', () => {
  const ld = exhibitionEventJsonLd({ ...full, address: null, country: null }, { url: 'u' });
  assert.equal(ld.location?.address, 'Dubai');
});

test('with no venue and no address at all, location is omitted entirely', () => {
  const ld = exhibitionEventJsonLd(
    { ...full, venue: null, city: null, country: null, address: null },
    { url: 'u' }
  );
  assert.ok(!('location' in ld), 'location key should be absent');
});

test('never emits an empty string for any property', () => {
  const sparse = {
    title: 'Untitled',
    startDate: null,
    endDate: null,
    venue: null,
    city: null,
    country: null,
    address: null,
  };
  const ld = exhibitionEventJsonLd(sparse, { url: 'u' });
  for (const [key, value] of Object.entries(ld)) {
    assert.notEqual(value, '', `${key} was an empty string`);
    assert.notEqual(value, null, `${key} was null`);
  }
});
