import { defineField, defineType } from 'sanity';

// Singleton: exactly one homepage document, pinned to the id 'homepage' by the
// structure resolver in sanity.config.ts, which also strips the create and
// delete actions. The site reads *[_type=="homepage"][0], so a second document
// of this type would make the hero depend on document order.
export default defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  fields: [
    defineField({
      name: 'heroArtwork',
      title: 'Hero Artwork',
      description:
        'The painting behind the artist name at the top of the homepage. Landscape images work best — the hero is full-bleed, so set a hotspot on the artwork if its subject sits off-centre. Leave this unset and the homepage falls back to the most recently featured artwork.',
      type: 'reference',
      to: [{ type: 'artwork' }],
      validation: (Rule) => Rule.required().error('Pick the artwork the homepage opens with'),
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Homepage' }),
  },
});
