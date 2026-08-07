import { z } from 'zod';
import { ArtworkSchema } from './artwork';

export const HomepageSchema = z.object({
  // .nullish(), not .optional(): GROQ returns null for an unset reference, and
  // .optional() rejects null. The site must survive a homepage document that
  // exists but has not been pointed at an artwork yet.
  heroArtwork: ArtworkSchema.nullish(),
});

export type Homepage = z.infer<typeof HomepageSchema>;
