import React from "react";
import PhotoList from "@/components/photo-list";

export default function Photos() {

  return (
    <main className="flex flex-wrap min-h-screen gap-5 p-24">
      <h1 className="w-full text-center">Photos</h1>
      <PhotoList />
    </main>
  );
}
