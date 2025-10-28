"use client";

import { useEffect, useState } from "react";
import { getAllCar } from "@/services/carServices";
import CarCard from "@/components/carCard";
import { toast } from "react-hot-toast";

// định nghĩa kiểu dữ liệu xe
interface Car {
  carId: number;
  name: string;
  description: string;
  imageUrl: string;
  type?: string;
  seats?: number;
  rangeKm?: number;
}

export default function HomePage() {
  const [cars, setCars] = useState<Car[]>([]); // 💎 khai báo kiểu mảng Car
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await getAllCar();
        setCars(res);
      } catch (err) {
        toast.error("Không thể tải danh sách xe 😢");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Đang tải danh sách xe...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-5">
      <div className="w-full h-64 flex items-center justify-center text-white text-3xl font-bold 
                      bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1470&q=80')]">
        Danh sách xe cho thuê
      </div>

      {cars.length === 0 ? (
        <p className="text-center text-gray-500">Hiện chưa có xe nào 😭</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* 💡 backend dùng carId chứ không phải id */}
          {cars.map((car) => (
            <CarCard key={car.carId} car={car} />
          ))}
        </div>
      )}
    </main>
  );
}
