'use client'

import React, { useState, useRef, FormEvent } from "react";
import { type PutBlobResult } from '@vercel/blob';
import { upload } from '@vercel/blob/client';
import JSZip from "jszip";

export default function Home() {

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

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <form onSubmit={handleSubmit}>
        <input name="file" ref={inputFileRef} type="file" accept="image/*" multiple required />
        <button type="submit">Upload</button>
      </form>
      {blob && (
        <div>
          Training started for images: <a href={blob.url}>here</a>
        </div>
      )}
    </main>
  )
}
