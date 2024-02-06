'use server';

import { generateBlurPlaceholder } from "@/utils/generateBlurPlaceholder";
import { createClient } from "@/utils/supabase/actions";
import { cookies } from "next/headers";

interface Response {
  data?: PhotoWithBlur[] | null;
  error?: {
    message: string,
    details?: string,
    hint?: string,
    code?: string,
  } | null;
}

export async function getPhotos(): Promise<Response> {
  const cookieStore = cookies();

  const supabase = createClient(cookieStore);

  const userData = await supabase.auth.getUser();

  console.log('userData', userData);

  if (!userData.data?.user?.id || userData.error) {
    return {
      error: { message: "User not found" }
    }
  }

  const result = await supabase
    .from('photos')
    .select('id, url')
    .eq('user_id', userData.data.user.id)
    .order('created_at', { ascending: false });

  const photosWithBlur = await generateBlurImages(result.data);

  return { data: photosWithBlur, error: result.error };
}

async function generateBlurImages(photos: Photo[] | null | undefined): Promise<PhotoWithBlur[] | null> {
  if (photos) {
    const blurImagePromises = photos.map((photo: Photo) => {
      return generateBlurPlaceholder(photo);
    });
    const imagesWithBlurDataUrls = await Promise.all(blurImagePromises);

    return imagesWithBlurDataUrls;
  }

  return null;
}