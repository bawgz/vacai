'use server'

import React from "react";
import PhotoForm from "@/components/photo-form";
import ModelForm from "@/components/model-form";
import { getModels } from "@/actions/models";
import PhotoList from "@/components/photo-list";

export default async function Home() {

  const HOST = process.env.BASE_URL;

  const { data, error } = await getModels();

  if (error) {
    console.error(error);
  }

  return (
    <main className="flex flex-wrap min-h-screen gap-5 p-24">
      <div className="md:w-1/2 sm:w-full">
        <ModelForm />
      </div>
      <div className="md:w-1/2">
        <PhotoForm models={data || []} />
      </div>
      <PhotoList />
    </main>
  )
}
