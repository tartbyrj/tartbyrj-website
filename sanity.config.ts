import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';

import { schemaTypes } from './src/sanity/schemas';

// Document types that exist exactly once. Each is pinned to a document id equal
// to its type name, listed by hand in the sidebar, and stripped of the actions
// that would let a second copy appear or the only copy vanish.
const SINGLETONS = ['homepage'];

export default defineConfig({
  name: 'tartbyrj',
  title: 'T.ArtbyRJ',
  projectId: 'tuvy3sp7',
  dataset: 'production',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Homepage')
              .id('homepage')
              .child(S.document().schemaType('homepage').documentId('homepage').title('Homepage')),
            S.divider(),
            // Everything else keeps the default list, so a new schema type still
            // shows up in the sidebar without touching this file.
            ...S.documentTypeListItems().filter(
              (item) => !SINGLETONS.includes(item.getId() ?? '')
            ),
          ]),
    }),
  ],
  document: {
    actions: (prev, { schemaType }) =>
      SINGLETONS.includes(schemaType)
        ? prev.filter(({ action }) => action !== 'duplicate' && action !== 'delete')
        : prev,
  },
  schema: {
    types: schemaTypes,
  },
});
