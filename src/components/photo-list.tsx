'use client'

import React, { useEffect } from "react";
import Image from "next/image";
import PlaceholderLoading from "react-placeholder-loading";
import { useRouter } from "next/navigation";

interface Props {
  photos: Photo[];
}

export default function PhotoList({ photos }: Props) {
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (photos.some((photo) => !photo.url)) {
      interval = setInterval(async () => {
        router.refresh();
      }, 5000);
    }


    return () => clearInterval(interval);
  }, [router, photos]);

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
            placeholder={photo.placeholder_data ? "blur" : "empty"}
            blurDataURL={photo.placeholder_data || undefined}
          />
          :
          // TODO: fix the placeholder corners. They're not rounded
          <div key={photo.id} className="transform rounded-lg brightness-90 transition will-change-auto group-hover:brightness-110" style={{ transform: "translate3d(0, 0, 0)" }}>
            <PlaceholderLoading shape="rect" width={350} height={350} />
          </div>
      ))}
    </>
  );
}
