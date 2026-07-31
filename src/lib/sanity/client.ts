import { createClient, type SanityClient } from '@sanity/client';
import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url';

export const client: SanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  // false — this client only runs at build time. The CDN can serve stale data
  // to a webhook-triggered rebuild, shipping a site without the just-published
  // document. Fresh reads cost nothing here since there are no runtime queries.
  useCdn: false,
});

const builder = createImageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
