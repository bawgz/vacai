'use client'
import React, { useState } from "react";

export default function Home() {

  const [files, setFiles] = useState<FileList | null>(null);

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

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" multiple name="file" onChange={(e) => setFiles(e.target.files || null)} />
        <button type="submit">Submit</button>
      </form>
    </main>
  )
}
