import { type EmailOtpType } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/actions";

const HOST = process.env.BASE_URL;

export async function GET(request: NextRequest) {
  const cookieStore = cookies();

  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (token_hash && type) {
    const supabase = createClient(cookieStore);

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      return NextResponse.redirect(`${HOST}/`);
    }

    console.log("Error", error);
  }

  // return the user to an error page with some instructions

  return NextResponse.redirect(`${HOST}/error`);
}
