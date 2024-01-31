'use client'

import React, { useState, useRef, FormEvent } from "react";

interface Props {
  trainings: Training[];
}

interface Training {
  id: string;
}

export default function PredictionsForm(props: Props) {

  const { trainings } = props;

  const trainingSelectRef = useRef<HTMLSelectElement>(null);

  // const trainingSelectRef = useRef<HTMLSelectElement>(null);

  async function handlePredict(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!trainingSelectRef?.current?.value) {
      console.error('No training selected');
      return;
    }

    const response = await fetch('/api/predictions', {
      method: 'POST',
      body: JSON.stringify({ trainingId: trainingSelectRef.current.value }),
    });

    const jsonData = await response.json();
    console.log(jsonData);
  }

  return (
    <form onSubmit={handlePredict}>
      <div className="w-full">
        <label htmlFor="trainings">Choose a training:</label>
        <select name="trainings" id="trainings" ref={trainingSelectRef} className="w-full p-2 border border-gray-300 rounded-md text-black">
          <option value="">Select a training</option>
          {trainings.map((training) => (
            <option key={training.id} value={training.id}>
              {training.id}
            </option>
          ))}
        </select>
      </div>
      <button type="submit">Take photos</button>
    </form>
  );
}