"use server";

import React from "react";
import { getModels } from "@/actions/models";
import { getPhotos } from "@/actions/photos";
import ModelForm from "@/components/model-form";
import PhotoForm from "@/components/photo-form";
import PhotoList from "@/components/photo-list";

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

  let photos = photosResponse.data || [];

  return (
    <main className="flex flex-wrap gap-5 p-24">
      <div className="md:w-1/2 sm:w-full">
        <ModelForm />
      </div>
      {models.length > 0 && (
        <>
          <div className="md:w-1/2 sm:w-full">
            <PhotoForm models={models} />
          </div>
          <PhotoList photos={photos} />
        </>
      )}
    </main>
  );
}
