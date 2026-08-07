import { defineField, defineType } from 'sanity';

// Singleton: exactly one homepage document, pinned to the id 'homepage' by the
// structure resolver in sanity.config.ts, which also keeps the type out of the
// global compose menu and strips duplicate and delete. The site reads
// *[_type=="homepage"][0], so a second document of this type would make the
// hero depend on document order.
export default defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  fields: [
    defineField({
      name: 'heroArtwork',
      title: 'Hero Artwork',
      description:
        'The painting behind the artist name at the top of the homepage. Landscape images work best — the hero is full-bleed, so set a hotspot on the artwork if its subject sits off-centre. Required: this document cannot be published without it. Until it is published the homepage shows the most recently featured artwork instead.',
      type: 'reference',
      to: [{ type: 'artwork' }],
      validation: (Rule) => Rule.required().error('Pick the artwork the homepage opens with'),
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Homepage' }),
  },
});
