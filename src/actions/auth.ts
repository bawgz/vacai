"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/actions";

export async function login(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      emailRedirectTo: process.env.BASE_URL,
    },
  };

  console.log("data", data);

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    console.log("error", error);
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/login/confirm");
}

export async function logout() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.signOut();

  console.log("error", error);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/login");
}

export async function isUserSignedIn(): Promise<boolean> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { error, data } = await supabase.auth.getUser();

  return !error && !!data.user;
}
