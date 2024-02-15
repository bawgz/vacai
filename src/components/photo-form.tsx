"use client";

import { createPhotos } from "@/actions/photos";
import { useRouter } from "next/navigation";
import React, { FormEvent, useRef, useState } from "react";

type Props = {
  models: Model[];
};

export default function PhotoForm({ models }: Props) {
  const [isLoadingCapturePhoto, setIsLoadingCapturePhoto] = useState(false);
  const router = useRouter();

  const modelSelectRef = useRef<HTMLSelectElement>(null);

  async function handleTakePhoto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoadingCapturePhoto(true);

    if (!modelSelectRef?.current?.value) {
      console.error("No model selected");
      setIsLoadingCapturePhoto(false);
      return;
    }

    const { error } = await createPhotos(modelSelectRef.current.value);

    if (error) {
      console.error("error", error);
      setIsLoadingCapturePhoto(false);
      return;
    }

    setIsLoadingCapturePhoto(false);
    router.refresh();
  }

  return (
    <>
      <h1 className="text-lg">Capture new photos</h1>
      <form onSubmit={handleTakePhoto}>
        <select
          name="models"
          id="models"
          ref={modelSelectRef}
          className="w-full p-2 border border-gray-300 rounded-md text-black my-2"
        >
          <option value="">Select a model</option>
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isLoadingCapturePhoto}
          className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-black"
        >
          Capture
        </button>
      </form>
    </>
  );
}
