"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAllCategory } from "@/services/categoryServices";
import Link from "next/link";
import Image from "next/image";

type CarImage = {
  imageId: number;
  url: string;
};

type Car = {
  carId: number;
  name: string;
  type: string;
  seats: number;
  rangeKm: number;
  imageUrl: string;
  carImages?: CarImage[];
};

type Category = {
  categoryId: number;
  name: string;
  cars?: Car[];
};

export default function CategoryDetailPage() {
  const { id } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const data: Category[] = await getAllCategory();
        const found = data.find(cat => cat.categoryId === Number(id)) || null;
        setCategory(found);
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCategory();
  }, [id]);

  if (loading) return <div className="text-center py-10 text-lg">⏳ Đang tải danh mục...</div>;
  if (!category) return <div className="text-center py-10 text-red-500">Không tìm thấy danh mục này!</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{category.name}</h1>

      {category.cars && category.cars.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {category.cars.map((car) => {
            const images = car.carImages?.map(img => img.url).filter(Boolean) || [];

            return (
              <Link
                key={car.carId}
                href={`/car/${car.carId}`}
                className="block border rounded overflow-hidden hover:shadow-lg transition"
              >
                {/* Ảnh chính */}
                {images[0] ? (
                  <div className="relative w-full h-48">
                    <Image src={images[0]} alt={car.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="relative w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Chưa có ảnh</span>
                  </div>
                )}

                {/* Thông tin xe */}
                <div className="p-4">
                  <h2 className="text-lg font-semibold">{car.name}</h2>
                  <div className="flex gap-3 mt-2 text-sm text-gray-600">
                    <div>{car.type}</div>
                    <div>{car.seats} chỗ</div>
                    <div>{car.rangeKm} km</div>
                  </div>

                  {/* Nhóm ảnh phụ */}
                  {images.length > 1 && (
                    <div className="flex mt-2 gap-2 overflow-x-auto">
                      {images.slice(1).map((img, i) => (
                        <div key={i} className="w-16 h-16 flex-shrink-0 relative">
                          <Image src={img} alt={`${car.name}-${i}`} fill className="object-cover rounded" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p>Hiện chưa có xe trong danh mục này.</p>
      )}
    </div>
  );
}
