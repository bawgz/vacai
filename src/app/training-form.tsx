'use client'

import React, { useRef, FormEvent } from "react";
import JSZip from "jszip";
import { createTrainingV2 } from "@/actions/trainings";

export default function TrainingForm() {

  const inputFileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    console.log(inputFileRef.current!.files);

    if (!inputFileRef?.current?.files || !inputFileRef.current.files.length) {
      console.error('No files selected');
      return;
    }
    const zip = new JSZip();

    console.log("zipping files");
    for (const file of inputFileRef.current.files) {
      zip.file(file.name, Buffer.from(await file.arrayBuffer()))
    }

    const zipResult = await zip.generateAsync({ type: "arraybuffer" });

    console.log("zip result");
    console.log(zipResult);

    const trainingId = crypto.randomUUID();

    const response = await fetch('/api/upload-url', { method: 'POST', body: JSON.stringify({ fileName: `${trainingId}.zip` }) });
    const { url } = await response.json();

    console.log("upload url", url);

    const uploadResponse = await fetch(
      url,
      {
        method: 'PUT',
        body: zipResult,
        headers: {
          'Content-Type': 'application/octet-stream',
        }
      });


    if (!uploadResponse.ok) {
      console.error('Failed to upload');
      return;
    }

    await createTrainingV2(trainingId);

    inputFileRef.current.value = '';
  }

  return (
    <>
      <form onSubmit={handleUpload}>
        <input name="file" ref={inputFileRef} type="file" accept="image/*" multiple required />
        <button type="submit" className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Upload</button>
      </form>
    </>
  );
}