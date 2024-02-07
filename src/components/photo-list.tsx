'use client'

import React from "react";
import Image from "next/image";
import PlaceholderLoading from "react-placeholder-loading";

interface Props {
  photos: Photo[];
}

export default function PhotoList({ photos }: Props) {
  return (
    <>
      <h1 className="w-full text-lg">Photo Library</h1>
      {(photos).map((photo: any) => (
        photo.url
          ?
          <Image
            key={photo.id}
            alt="Generated photo"
            className="transform rounded-lg brightness-90 transition will-change-auto group-hover:brightness-110"
            style={{ transform: "translate3d(0, 0, 0)" }}
            src={photo.url}
            width={350}
            height={350}
          />
          : <PlaceholderLoading key={photo.id} shape="rect" width={350} height={350} />
      ))}
    </>
  );
}
