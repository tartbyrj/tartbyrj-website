import { z } from 'zod';
import { ArtworkSchema } from './artwork';

export const HomepageSchema = z.object({
  // .nullish(), not .optional(): GROQ returns null for an unset reference, and
  // .optional() rejects null. Studio marks the field required, so a published
  // document always carries one — but a draft, or a document written straight
  // through the API, does not, and neither may take the hero down.
  heroArtwork: ArtworkSchema.nullish(),
});

export type Homepage = z.infer<typeof HomepageSchema>;
