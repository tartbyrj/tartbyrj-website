import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';

import { schemaTypes } from './src/sanity/schemas';

export default defineConfig({
  name: 'tartbyrj',
  title: 'T.ArtbyRJ',
  projectId: 'tuvy3sp7',
  dataset: 'production',
  plugins: [structureTool()],
  schema: {
    types: schemaTypes,
  },
});
