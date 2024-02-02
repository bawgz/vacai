'use client'

import React, { useState, useRef, FormEvent } from "react";
import { type PutBlobResult } from '@vercel/blob';
import { upload } from '@vercel/blob/client';
import JSZip from "jszip";

export default function TrainingForm() {

  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

    const newBlob = await upload(`${trainingId}.zip`, zipResult, {
      access: 'public',
      handleUploadUrl: '/api/files',
    });

    console.log("new blob", newBlob);

    setBlob(newBlob);
  }

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

    const response = await fetch('/api/files/upload-url', { method: 'POST', body: JSON.stringify({ fileName: `${trainingId}.zip` }) });
    const { url } = await response.json();

    console.log("upload url", url);

    const uploadResponse = await fetch("https://webhook.site/0832bdb6-e9b6-4ef4-898c-c6811acb232b", { method: 'PUT', body: zipResult });

    console.log("upload response", uploadResponse);
  }

  return (
    <>
      <form onSubmit={handleUpload}>
        <input name="file" ref={inputFileRef} type="file" accept="image/*" multiple required />
        <button type="submit" className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Upload</button>
      </form>
      {
        blob && (
          <div>
            Training started for images: <a href={blob.url}>here</a>
          </div>
        )
      }
    </>
  );
}