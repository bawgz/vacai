'use server'

import { getPhotos } from "@/actions/photos";
import Image from "next/image";

const HOST = process.env.BASE_URL;

export default async function PhotoList() {

  const { error, data } = await getPhotos();

  if (error || !data) {
    console.error(error);
  }

  console.log("photos", data);

  return (
    <>
      <h1 className="w-full text-lg">Photo Library</h1>
      {(data || []).map((photo: any) => {
        return (
          <Image key={photo.id} src={photo.url} alt={""} width={350} height={350} />
        );
      })}
    </>
  );
}
