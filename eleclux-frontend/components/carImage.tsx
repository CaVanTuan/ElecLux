"use client";

interface CarImagesGalleryProps {
  images: { Id?: number; Url: string }[];
  name: string;
}

export default function CarImagesGallery({ images, name }: CarImagesGalleryProps) {
  if (!images.length) return null;

  return (
    <div className="grid grid-cols-2 gap-2">
      {images.map((img, idx) => (
        <img
          key={img.Id ?? idx}
          src={img.Url}
          alt={name}
          className="w-full h-32 object-cover rounded"
        />
      ))}
    </div>
  );
}