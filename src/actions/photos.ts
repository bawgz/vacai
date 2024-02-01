import { createClient } from "@/utils/supabase/actions";
import { cookies } from "next/headers";

interface Response {
  data?: { id: any }[] | null;
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

  if (!userData.data?.user?.id || userData.error) {
    return {
      error: { message: "User not found" }
    }
  }

  const result = await supabase
    .from('photos')
    .select('id, url')
    .eq('status', 'succeeded')
    .order('created_at', { ascending: false });

  return result;
}