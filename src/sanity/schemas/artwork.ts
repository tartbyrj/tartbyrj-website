import { defineField, defineType } from 'sanity';
import { PAINT_TYPES, SURFACES, toSanityOptions } from '../../lib/taxonomy';

export default defineType({
  name: 'artwork',
  title: 'Artwork',
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
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
    }),
    defineField({
      name: 'medium',
      title: 'Medium',
      type: 'string',
    }),
    // Filter tags. Grouped directly under Medium because that is the field they
    // have to agree with — and nothing enforces that agreement, so proximity in
    // Studio is the only nudge there is. Options come from src/lib/taxonomy.ts;
    // do not inline a second copy of either list here.
    defineField({
      name: 'paintType',
      title: 'Paint Type',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: toSanityOptions(PAINT_TYPES),
      },
      description:
        'Tick every paint you used — these tags decide which filter buttons ' +
        'show this work on the All Works page. Keep them matching what you ' +
        'typed in Medium above; nothing checks that for you.',
    }),
    defineField({
      name: 'surface',
      title: 'Surface',
      type: 'string',
      options: {
        list: toSanityOptions(SURFACES),
        layout: 'radio',
      },
      description:
        'Pick what you painted on — this decides which surface filter shows ' +
        'this work on the All Works page. Keep it matching what you typed in ' +
        'Medium above; nothing checks that for you.',
    }),
    defineField({
      name: 'dimensions',
      title: 'Dimensions',
      type: 'string',
    }),
    defineField({
      name: 'available',
      title: 'Available',
      type: 'boolean',
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
    }),
    defineField({
      name: 'collection',
      title: 'Collection',
      type: 'reference',
      to: [{ type: 'collection' }],
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
    }),
    defineField({
      name: 'altText',
      title: 'Alt Text',
      type: 'string',
      description:
        'Describe what is visible in the painting — subject, medium, and mood. ' +
        'Used by screen readers and Google Images. ' +
        'Example: "Watercolour owl portrait with amber eyes and detailed feather ' +
        'texture" or "Layered acrylic on canvas with fragments of handwritten ' +
        'text in earth and grey tones". One to two sentences. Describe what you ' +
        'see, not what it means.',
    }),
  ],
  orderings: [
    {
      title: 'Year, New to Old',
      name: 'yearDesc',
      by: [{ field: 'year', direction: 'desc' }],
    },
  ],
});
