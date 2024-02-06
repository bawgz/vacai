import { getPlaiceholder } from "plaiceholder";

const cache = new Map<string, string>();

export const generateBlurPlaceholder = async (photo: Photo): Promise<PhotoWithBlur> => {
  if (!photo.url) {
    return { ...photo, blurUrl: null };
  }

  if (cache.has(photo.id)) {
    return { ...photo, blurUrl: cache.get(photo.id) || null };
  }

  const buffer = await fetch(photo.url).then(async (res) =>
    Buffer.from(await res.arrayBuffer())
  );

  const { base64 } = await getPlaiceholder(buffer);

  cache.set(photo.id, base64);

  return { ...photo, blurUrl: base64 };
};
