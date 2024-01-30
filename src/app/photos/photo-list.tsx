'use server'

import Image from "next/image";

const HOST = process.env.BASE_URL;

export default async function PhotoList() {

  async function getPhotos() {
    const photos = await fetch(`${HOST}/api/predictions`, { cache: 'no-store' });
    return await photos.json();
  }

  const photos = await getPhotos();

  console.log("photos", photos);

  return (
    <>
      {photos.filter((x: any) => x.result).map((photo: any) => {
        return (
          <div key={photo.id} className='relative w-[200px] h-[200px]'>
            <Image src={photo.result} alt={""} fill />
          </div>
        );
      })}
    </>
  );
}
