import { defineField, defineType } from 'sanity';

const EXHIBITION_TYPES = ['Solo exhibition', 'Group exhibition', 'Mural commission', 'Art fair', 'Workshop'];

export default defineType({
  name: 'exhibition',
  title: 'Exhibition',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    // Stored as the display string itself, not a value/label pair or a
    // lowercase slug — the Zod side reads this as a loose string, never an
    // enum (see types/exhibition.ts), so the string IS the value everywhere.
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: EXHIBITION_TYPES,
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'date',
      validation: (Rule) =>
        Rule.required().custom((endDate, context) => {
          const startDate = (context.parent as { startDate?: string } | undefined)?.startDate;
          if (!endDate || !startDate) return true;
          return endDate >= startDate ? true : 'End date must be on or after the start date';
        }),
    }),
    defineField({
      name: 'venue',
      title: 'Venue',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      description:
        'The short italic line under the title, e.g. "New works by Rupjyoti Baruah". Leave blank if it only restates the title.',
      type: 'string',
      validation: (Rule) => Rule.max(80),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      description: '1–2 lines shown on the exhibitions list card only — not the full statement.',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      description: 'Optional — the layout degrades gracefully without it.',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'altText',
      title: 'Alt Text',
      description: 'Alt text for the cover image. Only used where the image stands alone.',
      type: 'string',
    }),
    defineField({
      name: 'address',
      title: 'Address',
      description: 'Full street address, for the detail page and directions link.',
      type: 'text',
      rows: 3,
    }),
    // string, NOT datetime — deliberate, and not an oversight to "correct".
    // Sanity's datetime widget interprets what the editor types in the
    // EDITOR'S OWN browser timezone. RJ works from both Dubai and Assam, so
    // a Dubai show entered from Assam stores an instant 1.5 hours off, and
    // no amount of output formatting recovers the intended wall-clock time.
    // Adding a timezone field would only produce a correctly-formatted wrong
    // answer, which is worse than plain text because it looks trustworthy.
    // This value is display-only: it is not in the ExhibitionEvent JSON-LD
    // (that uses the exhibition's own startDate/endDate) and does not need
    // to be machine-readable. Mirrors `hours` below, which is a plain string
    // for exactly the same reason — keep the two consistent.
    defineField({
      name: 'openingReception',
      title: 'Opening Reception',
      description:
        "Opening night, exactly as it should appear on the page — e.g. 'Friday 13 November, 6:00 – 9:00 pm'. Include the city's local time; this text renders verbatim.",
      type: 'string',
    }),
    defineField({
      name: 'hours',
      title: 'Hours',
      description: 'e.g. "Tuesday — Sunday, 10 am — 7 pm"',
      type: 'string',
    }),
    defineField({
      name: 'admission',
      title: 'Admission',
      type: 'string',
      initialValue: 'Free entry',
    }),
    defineField({
      name: 'statement',
      title: 'Statement',
      description: 'Detail-page body copy.',
      type: 'text',
      rows: 8,
    }),
    defineField({
      name: 'pullQuote',
      title: 'Pull Quote',
      description: 'Doubles as the no-image fallback panel on the list page.',
      type: 'string',
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: 'artworks',
      title: 'Artworks',
      description: '"Works on view" on the detail page.',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'artwork' }] }],
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      description: 'Installation shots.',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt Text',
              description:
                'Optional — describe what the shot shows. Falls back to "Installation view N of M — <title>" when left blank, which names the shot but not its content.',
              type: 'string',
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'link',
      title: 'Link',
      description: 'External venue website.',
      type: 'url',
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
  orderings: [
    {
      title: 'Start Date, New to Old',
      name: 'startDateDesc',
      by: [{ field: 'startDate', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      type: 'type',
      startDate: 'startDate',
      media: 'coverImage',
    },
    prepare({ title, type, startDate, media }) {
      const year = startDate ? new Date(startDate).getFullYear() : undefined;
      return {
        title,
        subtitle: [type, year].filter(Boolean).join(' · '),
        media,
      };
    },
  },
});
