'use server'

import React from "react";
import PhotoForm from "./photo-form";
import TrainingForm from "./training-form";

export default async function Home() {

  const HOST = process.env.BASE_URL;

  const trainings = await getTrainings();

  async function getTrainings() {
    const trainings = await fetch(`${HOST}/api/trainings`, { cache: 'no-store' });
    return await trainings.json();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <TrainingForm />
      <PhotoForm trainings={trainings} />
    </main>
  )
}
