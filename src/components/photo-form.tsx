'use client'

import React, { useState, useRef, FormEvent } from "react";

interface Props {
  trainings: Training[];
}

interface Training {
  id: string;
  name: string;
}

export default function PhotoForm(props: Props) {

  const { trainings } = props;

  const trainingSelectRef = useRef<HTMLSelectElement>(null);

  async function handleTakePhoto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!trainingSelectRef?.current?.value) {
      console.error('No training selected');
      return;
    }

    const response = await fetch('/api/photos', {
      method: 'POST',
      body: JSON.stringify({ trainingId: trainingSelectRef.current.value }),
    });

    const jsonData = await response.json();
    console.log(jsonData);
  }

  return (
    <>
      <h1 className="text-lg">Capture new photos</h1>
      <form onSubmit={handleTakePhoto}>
        <select name="trainings" id="trainings" ref={trainingSelectRef} className="w-full p-2 border border-gray-300 rounded-md text-black my-2">
          <option value="">Select a model</option>
          {trainings.map((training) => (
            <option key={training.id} value={training.id}>
              {training.name}
            </option>
          ))}
        </select>
        <button type="submit" className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Capture</button>
      </form>
    </>
  );
}