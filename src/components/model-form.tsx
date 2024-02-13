'use client'

import React, { useState, useRef, FormEvent } from "react";
import JSZip from "jszip";
import { createModel } from "@/actions/models";

export default function ModelForm() {

  const inputFileRef = useRef<HTMLInputElement>(null);
  const inputNameRef = useRef<HTMLInputElement>(null);
  const selectClassRef = useRef<HTMLSelectElement>(null);

  const [isLoading, setIsLoading] = useState(false);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    console.log("button should be disabled", isLoading)

    // TODO: mega enhance the error handling

    console.log(inputFileRef.current!.files);

    if (!inputFileRef?.current?.files || !inputFileRef.current.files.length) {
      console.error('No files selected');
      setIsLoading(false);
      return;
    }

    if (!inputNameRef?.current?.value) {
      console.error('No name entered');
      setIsLoading(false);
      return;
    }

    if (!selectClassRef?.current?.value) {
      console.error('No class selected');
      setIsLoading(false);
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

    const modelId = crypto.randomUUID();

    const response = await fetch('/api/upload-url', { method: 'POST', body: JSON.stringify({ fileName: `${modelId}.zip` }) });
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
      setIsLoading(false);
      return;
    }

    const isSuccessfulyCreated = await createModel(modelId, inputNameRef.current.value, selectClassRef.current.value);

    if (!isSuccessfulyCreated) {
      console.error('Failed to create model');
      setIsLoading(false);
      return;
    }

    inputFileRef.current.value = '';
    inputNameRef.current.value = '';
    selectClassRef.current.value = '';

    setIsLoading(false);
  }

  return (
    <>
      <h1 className="w-full text-lg">Create a new model</h1>
      <form onSubmit={handleUpload}>
        <input name="name" type="text" ref={inputNameRef} placeholder="Model Name" required className="block w-full p-2 border border-gray-300 rounded-md text-black my-2" />
        <select name="class" id="class" ref={selectClassRef} className="block w-full p-2 border border-gray-300 rounded-md text-black my-2">
          <option value="">Select a subject</option>
          <option value="man">Man</option>
          <option value="man">Woman</option>
        </select>
        <input name="file" ref={inputFileRef} type="file" accept="image/*" multiple required className="block w-full p-2 border border-gray-300 rounded-md cursor-pointer focus:outline-none my-2 text-black bg-white" />
        <button type="submit" disabled={isLoading} className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-black">Create</button>
      </form>
    </>
  );
}
