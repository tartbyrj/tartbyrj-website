import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';

import { schemaTypes } from './src/sanity/schemas';

// Document types that exist exactly once. Each is pinned to a document id equal
// to its type name and listed by hand in the sidebar. Two separate guards keep
// it to one copy: newDocumentOptions removes it from the global compose menu,
// which is what would otherwise mint a second document under a random UUID, and
// the action filter removes duplicate and delete. Both are needed — actions
// alone do not cover creation, and a stray UUID document would win the site's
// *[_type=="homepage"][0] lookup, since every hex UUID sorts ahead of the
// literal id 'homepage'.
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
    newDocumentOptions: (prev) =>
      prev.filter((template) => !SINGLETONS.includes(template.templateId)),
  },
  schema: {
    types: schemaTypes,
  },
});
