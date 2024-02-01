'use server'

import React from "react";
import PhotoForm from "./photo-form";
import TrainingForm from "./training-form";
import { getTrainings } from "@/actions/trainings";

export default async function Home() {

  const HOST = process.env.BASE_URL;

  const { data, error } = await getTrainings();

  if (error) {
    console.error(error);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <TrainingForm />
      <PhotoForm trainings={data || []} />
    </main>
  )
}
