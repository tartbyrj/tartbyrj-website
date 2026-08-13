/**
 * One Sanity fetch, shared by every page that needs the full artwork set.
 *
 * /works and /works/[...filter] used to each run their own
 * `client.fetch(ALL_ARTWORKS_QUERY)`. `client.ts` sets `useCdn: false` on
 * purpose, so both calls hit Sanity live rather than a cache — nothing
 * guarantees two independent calls see the same document set if content is
 * published in between, which during `astro dev` (a fetch per navigation, not
 * per build) is a real window, not a hypothetical one. A taxonomy value that
 * exists on one page's snapshot and not the other's looks exactly like a
 * broken filter, with no code bug to find, because there isn't one — the data
 * just disagreed with itself.
 *
 * Memoizing the promise means every caller in the same process gets the
 * identical result, computed once — but only in production. `astro build`
 * runs in a fresh Node process every time, so one module-level cache there
 * means exactly one fetch per build, which is the whole point. `astro dev`
 * is a long-lived process instead, and Vite's HMR has no reason to reset this
 * module: Sanity Studio edits don't touch any file Vite watches, so a cached
 * promise here would keep serving whichever tags existed on the dev server's
 * first request until it was manually restarted — trading the old two-fetch
 * race for a new "never refetches" staleness bug. DEV skips the cache so
 * every dev request sees current Studio content; PROD keeps the memoized
 * single fetch this function exists for.
 */
import { client } from '../sanity/client';
import { parseList } from '../sanity/parse';
import { ALL_ARTWORKS_QUERY } from '../sanity/queries';
import { ArtworkSchema, type Artwork } from '../../types/artwork';

let cached: Promise<Artwork[]> | null = null;

async function fetchAllArtworks(): Promise<Artwork[]> {
  // console.error, not parseList's console.warn: a fetch failure is a
  // different class of problem than a document that fails validation, and it
  // has a sharper consequence here specifically — every route in
  // [...filter].astro's getStaticPaths and every path [slug].astro generates
  // is derived from this result, so a swallowed failure doesn't just skip one
  // bad document, it silently deletes every /works filter and detail route
  // for the build with nothing in the log to explain why.
  const raw = await client.fetch(ALL_ARTWORKS_QUERY).catch((error: unknown) => {
    console.error(
      `[sanity] ALL_ARTWORKS_QUERY: fetch failed — ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  });
  return parseList(ArtworkSchema, raw, 'ALL_ARTWORKS_QUERY');
}

export function getAllArtworks(): Promise<Artwork[]> {
  if (import.meta.env.DEV) return fetchAllArtworks();

  if (!cached) cached = fetchAllArtworks();
  return cached;
}
