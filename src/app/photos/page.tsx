import React from "react";
import PhotoList from "./photo-list";

export default function Photos() {

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Photos</h1>
      <PhotoList />
    </main>
  );
}
