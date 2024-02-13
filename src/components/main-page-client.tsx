'use client'

import React, { FormEvent, useEffect, useRef, useState } from "react";
import ModelForm from "@/components/model-form";
import { getModels } from "@/actions/models";
import PhotoList from "@/components/photo-list";
import { getPhotos } from "@/actions/photos";

type Props = {
  models: Model[];
  photos: Photo[];
};

export default function MainPage({ models, photos }: Props) {
  const [modelsState, setModelsState] = useState<Model[]>(models);
  const [photosState, setPhotosState] = useState<Photo[]>(photos);
  const [pollPhotos, setPollPhotos] = useState(false);
  const [isLoadingCapturePhoto, setIsLoadingCapturePhoto] = useState(false);

  const modelSelectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    console.log("poll photos", pollPhotos);

    if (pollPhotos) {
      (async () => {
        const photosResponse = await getPhotos();

        if (photosResponse.error) {
          console.error(photosResponse.error);
        }

        setPhotosState(photosResponse.data || []);


        interval = setInterval(async () => {
          console.log('polling photos');
          const photosResponse = await getPhotos();

          if (photosResponse.error) {
            console.error(photosResponse.error);
          }

          if (!photosResponse.data?.some(photo => !photo.url)) {
            setPollPhotos(false);
          }

          setPhotosState(photosResponse.data || []);
        }, 5000);
      })();
    }


    return () => clearInterval(interval);
  }, [pollPhotos]);

  async function handleTakePhoto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoadingCapturePhoto(true);

    if (!modelSelectRef?.current?.value) {
      console.error('No model selected');
      setIsLoadingCapturePhoto(false);
      return;
    }

    const response = await fetch('/api/photos', {
      method: 'POST',
      body: JSON.stringify({ modelId: modelSelectRef.current.value }),
    });

    const jsonData = await response.json();
    console.log(jsonData);

    setPollPhotos(true);
    setIsLoadingCapturePhoto(false);
  }

  return (
    <>
      <div className="md:w-1/2 sm:w-full">
        <ModelForm />
      </div>
      {
        modelsState.length > 0
        &&
        <>
          <div className="md:w-1/2 sm:w-full">
            <h1 className="text-lg">Capture new photos</h1>
            <form onSubmit={handleTakePhoto}>
              <select name="models" id="models" ref={modelSelectRef} className="w-full p-2 border border-gray-300 rounded-md text-black my-2">
                <option value="">Select a model</option>
                {modelsState.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
              <button type="submit" disabled={isLoadingCapturePhoto} className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-black">Capture</button>
            </form>
          </div>
          <PhotoList photos={photosState} />
        </>
      }
    </>
  )
}
