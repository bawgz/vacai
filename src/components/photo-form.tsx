'use client'

import React, { useState, useRef, FormEvent } from "react";

interface Props {
  models: Model[];
}

interface Model {
  id: string;
  name: string;
}

export default function PhotoForm({ models }: Props) {
  const modelSelectRef = useRef<HTMLSelectElement>(null);

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
  }

  return (
    <>
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
    </>
  );
}