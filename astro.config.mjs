// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sanity from '@sanity/astro';

// https://astro.build/config
export default defineConfig({
  // The canonical home of the site, which every <link rel="canonical"> and
  // absolute URL in structured data resolves against (see Layout.astro).
  // Deliberately the custom domain rather than the current tartbyrj.pages.dev:
  // this is the address the site is meant to be indexed under, and pointing
  // canonicals at the Pages subdomain in the meantime would make *that* the
  // indexed home and require un-teaching it after the Phase 4 DNS cutover.
  site: 'https://tartbyrj.com',
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [
    react(),
    sanity({
      projectId: 'tuvy3sp7',
      dataset: 'production',
      useCdn: true,
      studioBasePath: '/studio',
    }),
  ],
});