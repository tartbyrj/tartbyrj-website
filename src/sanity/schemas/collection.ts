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
