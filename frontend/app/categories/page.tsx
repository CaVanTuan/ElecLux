"use client";

import { useEffect, useState } from "react";
import { getAllCategory } from "@/services/categoryServices";
import Link from "next/link";
import Image from "next/image";

type CarImage = {
  url: string; // backend trả url ảnh
};

type Car = {
  carId: number;
  name: string;
  carImages?: CarImage[];
};

type Category = {
  categoryId: number;
  name: string;
  cars?: Car[] | null;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data: Category[] = await getAllCategory();
        setCategories(data);
        console.log("Categories loaded:", data); // debug
      } catch (error) {
        console.error("Lỗi khi lấy danh sách category:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Danh mục xe</h1>

      {loading ? (
        <p>Đang tải danh sách...</p>
      ) : categories.length === 0 ? (
        <p>Hiện chưa có danh mục nào.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((cat) => {
            // Lấy tất cả ảnh từ cars
            const images: string[] = cat.cars
              ?.flatMap(car =>
                car.carImages
                  ?.map(img => img.url)
                  .filter((u): u is string => !!u)
                  .map(u => u.startsWith("http") ? u : `/uploads/${u}`)
                || []
              )
              || [];

            return (
              <Link
                key={cat.categoryId}
                href={`/categories/${cat.categoryId}`}
                className="block border border-gray-300 rounded overflow-hidden hover:shadow-lg transition"
              >
                {/* Ảnh đại diện */}
                {images.length > 0 ? (
                  <div className="relative w-full h-48">
                    <Image
                      src={images[0]}
                      alt={cat.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Chưa có ảnh</span>
                  </div>
                )}

                <div className="p-4">
                  {/* Tên danh mục */}
                  <h2 className="text-lg font-semibold text-center">{cat.name}</h2>

                  {/* Nhóm ảnh phụ */}
                  {images.length > 1 && (
                    <div className="flex mt-2 gap-2 overflow-x-auto">
                      {images.slice(1).map((img, i) => (
                        <div key={i} className="w-16 h-16 flex-shrink-0 relative">
                          <Image
                            src={img}
                            alt={`${cat.name}-${i}`}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
