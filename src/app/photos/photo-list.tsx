'use server'

import Image from "next/image";

export default async function PhotoList() {

  async function getPhotos() {
    const photos = await fetch('http://localhost:3000/api/predictions', { cache: 'no-store' });
    return await photos.json();
  }

  const photos = await getPhotos();

  console.log("photos", photos);

  return (
    <div className="flex justify-center mb-4">
      {photos.filter((x: any) => x.result).map((photo: any) => {
        return (
          <div key={photo.id} className='w-1/4'>
            <Image src={photo.result} alt={""} fill className='w-1/4' />
          </div>
        );
      })}
    </div>
  );
}
