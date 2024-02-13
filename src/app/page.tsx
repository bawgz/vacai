'use server';

import React from "react";
import { getModels } from "@/actions/models";
import { getPhotos } from "@/actions/photos";
import MainPage from "@/components/main-page-client";

export default async function Home() {

  const modelsResponse = await getModels();

  if (modelsResponse.error) {
    console.error(modelsResponse.error);
  }

  const models = modelsResponse.data || [];

  const photosResponse = await getPhotos();

  if (photosResponse.error) {
    console.error(photosResponse.error);
  }

  const photos = photosResponse.data || [];

  return (
    <main className="flex flex-wrap gap-5 p-24">
      <MainPage models={models} photos={photos} />
    </main>
  )
}
