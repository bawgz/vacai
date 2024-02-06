'use client'

import React, { FormEvent, useEffect, useRef, useState } from "react";
import ModelForm from "@/components/model-form";
import { getModels } from "@/actions/models";
import PhotoList from "@/components/photo-list";
import { getPhotos } from "@/actions/photos";

export default function Home() {
  const [models, setModels] = useState<Model[]>([]);
  const [photos, setPhotos] = useState<PhotoWithBlur[]>([]);
  const [pollPhotos, setPollPhotos] = useState(false);

  const modelSelectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    (async () => {
      const modelsResponse = await getModels();

      if (modelsResponse.error) {
        console.error(modelsResponse.error);
      }

      setModels(modelsResponse.data || []);

      const photosResponse = await getPhotos();

      if (photosResponse.error) {
        console.error(photosResponse.error);
      }

      setPhotos(photosResponse.data || []);


      if (pollPhotos) {
        interval = setInterval(async () => {
          console.log('polling photos');
          const photosResponse = await getPhotos();

          if (photosResponse.error) {
            console.error(photosResponse.error);
          }

          if (!photosResponse.data?.some(photo => !photo.url)) {
            setPollPhotos(false);
          }

          setPhotos(photosResponse.data || []);
        }, 5000);
      }
    })();

    return () => clearInterval(interval);
  }, [pollPhotos]);

  async function handleTakePhoto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!modelSelectRef?.current?.value) {
      console.error('No model selected');
      return;
    }

    const response = await fetch('/api/photos', {
      method: 'POST',
      body: JSON.stringify({ modelId: modelSelectRef.current.value }),
    });

    const jsonData = await response.json();
    console.log(jsonData);

    setPollPhotos(true);
  }

  return (
    <main className="flex flex-wrap min-h-screen gap-5 p-24">
      <div className="md:w-1/2 sm:w-full">
        <ModelForm />
      </div>
      <div className="md:w-1/2 sm:w-full">
        <h1 className="text-lg">Capture new photos</h1>
        <form onSubmit={handleTakePhoto}>
          <select name="models" id="models" ref={modelSelectRef} className="w-full p-2 border border-gray-300 rounded-md text-black my-2">
            <option value="">Select a model</option>
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
          <button type="submit" className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Capture</button>
        </form>
      </div>
      <PhotoList photos={photos} />
    </main>
  )
}
