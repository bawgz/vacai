'use server'

import React from "react";
import PhotoForm from "@/components/photo-form";
import TrainingForm from "@/components/training-form";
import { getTrainings } from "@/actions/trainings";
import PhotoList from "@/components/photo-list";

export default async function Home() {

  const HOST = process.env.BASE_URL;

  const { data, error } = await getTrainings();

  if (error) {
    console.error(error);
  }

  return (
    <main className="flex flex-wrap min-h-screen gap-5 p-24">
      <div className="w-1/2">
        <TrainingForm />
      </div>
      <div className="w-1/2">
        <PhotoForm trainings={data || []} />
      </div>
      <PhotoList />
    </main>
  )
}
