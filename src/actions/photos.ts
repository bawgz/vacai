'use server';

import { createClient } from "@/utils/supabase/actions";
import { cookies } from "next/headers";

interface Response {
  data?: { id: any, url: any }[] | null;
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

  return result;
}