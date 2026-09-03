import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'collection',
  title: 'Collection',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      description:
        "The line under the title on the deck's cover page. One line that makes someone want to see the collection. Leave blank if it would only restate the title.",
      type: 'string',
      validation: (Rule) => Rule.max(80),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      description: 'City where the collection was shown',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Statement',
      description:
        'A short pull quote, transcribed from the deck. This is the only indexable prose on the collection page. One or two sentences, not a paragraph.',
      type: 'text',
      rows: 3,
      validation: (Rule) => [
        Rule.max(240).error('Keep this to one or two sentences — the deck has no room for a paragraph.'),
        Rule.min(60).warning('Short for a pull quote — double-check this is transcribed from the deck, not a fragment.'),
      ],
    }),
    // Required because the homepage collections index filters on
    // defined(coverImage.asset) — a cover-less collection silently drops out of
    // that section. Failing in Studio before publish beats disappearing after.
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required().error('A cover image is required before publishing'),
    }),
    defineField({
      name: 'storyPages',
      title: 'Story Pages',
      description: 'Exported Canva spread pages, in display order',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            // Deck pages are Canva spreads with their text baked into the
            // pixels, so the image IS the text — WCAG 1.1.1 and 1.4.5 both
            // apply and neither the page number nor the collection title is a
            // substitute for what the spread actually says. Nothing but the
            // author can supply this: it cannot be derived from the asset.
            //
            // Not required(): making it mandatory would block publishing on
            // every existing collection until all pages are back-filled, and
            // the render degrades safely without it (see the alt handling in
            // collections/[slug].astro).
            // `text`, not `string`: these spreads carry a title, a standfirst,
            // several body paragraphs, an artwork caption with medium and
            // dimensions, and a pull quote. An equivalent alternative runs to
            // a paragraph or more, and Studio renders `string` as a
            // single-line input that makes writing (and re-reading) one
            // impractical. `rows` only sets the initial height of the
            // textarea; it does not cap length.
            //
            // Type change only — both are plain strings in the dataset, so the
            // two alts already authored carry over untouched and the Zod type
            // (z.string().nullish()) is unaffected.
            //
            // Named `alt`, not `altText` like the equivalent field on
            // artwork.ts — a real inconsistency, left as-is deliberately.
            // Renaming it is a Sanity field-name change, not just a code
            // edit: two collection documents already have real alt text
            // authored under the key `alt` in the live production dataset
            // (see SESSIONS.md 2026-09-02). Renaming the schema field without
            // a dataset migration to move those values to the new key would
            // make Studio show them as empty — the content isn't gone, but it
            // would read as if it were, to whoever opens Studio next. Fix
            // this by running a proper migration (`sanity documents query` +
            // patch, or the Sanity migration CLI) that copies `storyPages[].alt`
            // to `storyPages[].altText` across the dataset, then rename here —
            // don't just rename the field name below.
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'text',
              rows: 4,
              description:
                'What this page says and shows, for someone who cannot see it. Transcribe the spread’s own words — title, standfirst, body, artwork title, medium, size, year, pull quote — then describe the artwork itself. Not "page 3", and not one word.',
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'artworks',
      title: 'Artworks',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'artwork' }] }],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        defineField({
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
        }),
        defineField({
          name: 'ogImage',
          title: 'OG Image',
          type: 'image',
        }),
      ],
    }),
  ],
});
