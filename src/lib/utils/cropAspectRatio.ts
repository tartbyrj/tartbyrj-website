/**
 * Applies a Sanity image crop (fractions trimmed off each edge) to an
 * original aspect ratio, returning the ratio the image is actually delivered
 * at once urlFor() bakes the crop into the URL.
 *
 * Deliberately takes a ratio, not pixel dimensions — the correction is
 * scale-invariant (`original * (keptWidth / keptHeight)`), so it works
 * whether the caller derived `originalRatio` from Sanity's stored width and
 * height or from an aspectRatio field alone.
 *
 * Falls back to the uncropped ratio if the crop keeps zero or negative area
 * on either axis — not something Studio can author, but the field is
 * free-form JSON to anything writing over the API, and this runs at build
 * time where a NaN would ship silently.
 *
 * The crop's four fields are required together by ArtworkSchema/CollectionSchema
 * (the object is nullish, its fields are not), so a present `crop` needs no
 * per-field fallback — only the object itself needs a null check.
 */
export interface CropFractions {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export function cropAdjustedAspectRatio(
  originalRatio: number,
  crop: CropFractions | null | undefined
): number {
  if (!crop) return originalRatio;

  const keptWidth = 1 - crop.left - crop.right;
  const keptHeight = 1 - crop.top - crop.bottom;

  return keptWidth > 0 && keptHeight > 0 ? originalRatio * (keptWidth / keptHeight) : originalRatio;
}
