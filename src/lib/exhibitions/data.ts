/**
 * One Sanity fetch, shared by every route that needs the full exhibition set
 * (the homepage section, /exhibitions, and /exhibitions/[slug]'s prev/next).
 * Same memoization pattern as src/lib/works/data.ts's getAllArtworks() —
 * copy that reasoning, don't invent a second caching approach: PROD memoizes
 * once per build process, DEV skips the cache because Vite's HMR has no way
 * to know a Studio edit happened.
 */
import { client } from '../sanity/client';
import { parseList } from '../sanity/parse';
import { EXHIBITIONS_ALL_QUERY } from '../sanity/queries';
import { ExhibitionSchema, type Exhibition } from '../../types/exhibition';

let cached: Promise<Exhibition[]> | null = null;

async function fetchAllExhibitions(): Promise<Exhibition[]> {
  const raw = await client.fetch(EXHIBITIONS_ALL_QUERY).catch((error: unknown) => {
    console.error(
      `[sanity] EXHIBITIONS_ALL_QUERY: fetch failed — ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  });
  return parseList(ExhibitionSchema, raw, 'EXHIBITIONS_ALL_QUERY');
}

export function getAllExhibitions(): Promise<Exhibition[]> {
  if (import.meta.env.DEV) return fetchAllExhibitions();

  if (!cached) cached = fetchAllExhibitions();
  return cached;
}
