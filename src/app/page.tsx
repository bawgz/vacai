'use client'
import React, { useState, useRef, FormEvent } from "react";
import { type PutBlobResult } from '@vercel/blob';
import { upload } from '@vercel/blob/client';
import JSZip from "jszip";

export default function Home() {

  const [files, setFiles] = useState<FileList | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);

  async function handleSubmit(e: any) {
    e.preventDefault();
    let formData = packFiles(files!);

    const response = await fetch("/api/training", {
      method: "POST",
      body: formData,
    });
    const responseWithBody = await response.json();

    console.log(responseWithBody);
  };

  function packFiles(files: FileList): FormData {
    const data = new FormData();

    [...files].forEach((file, i) => {
      data.append(`file-${i}`, file, file.name)
    })
    return data
  }

  async function uploadFiles(event: FormEvent<HTMLFormElement>) {
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
        <input type="file" accept="image/*" multiple name="file" onChange={(e) => setFiles(e.target.files || null)} />
        <button type="submit">Submit</button>
      </form>
      <form onSubmit={uploadFiles}>
        <input name="file" ref={inputFileRef} type="file" accept="image/*" multiple required />
        <button type="submit">Upload</button>
      </form>
      {blob && (
        <div>
          Blob url: <a href={blob.url}>{blob.url}</a>
        </div>
      )}
    </main>
  )
}
