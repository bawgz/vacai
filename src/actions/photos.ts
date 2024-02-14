"use server";

import { createClient } from "@/utils/supabase/actions";
import { cookies } from "next/headers";

interface Response {
  data?: Photo[] | null;
  error?: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  } | null;
}

export async function getPhotos(): Promise<Response> {
  const cookieStore = cookies();

  const supabase = createClient(cookieStore);

  const userData = await supabase.auth.getUser();

  console.log("userData", userData);

  if (!userData.data?.user?.id || userData.error) {
    return {
      error: { message: "User not found" },
    };
  }

  const { data, error } = await supabase
    .from("photos")
    .select("id, url, placeholder_data, predictions!inner(user_id)")
    .eq("predictions.user_id", userData.data.user.id)
    .order("created_at", { ascending: false });

  return {
    data: data?.map((photo: Photo) => ({
      id: photo.id,
      url: photo.url,
      placeholder_data: photo.placeholder_data,
    })),
    error,
  };
}
