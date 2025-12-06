"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllCar, deleteCar } from "@/services/carServices";

interface Car {
  carId: number;
  name: string;
  type: string;
  seats: number;
  rangeKm: number;
  category: { name: string };
}

export default function AdminCarPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const data = await getAllCar();
      setCars(data);
    } catch (err) {
      console.error("Fetch cars failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleDelete = async (carId: number) => {
    if (!confirm("Bạn có chắc muốn xóa xe này không?")) return;
    try {
      await deleteCar(carId);
      setCars(cars.filter(c => c.carId !== carId));
      alert("Xóa xe thành công!");
    } catch (err) {
      console.error("Xóa xe thất bại", err);
      alert("Xóa xe thất bại!");
    }
  };

  if (loading) return <p>Đang tải danh sách xe...</p>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý Xe</h1>
        <Link
          href="/admin/cars/create"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Thêm Xe Mới
        </Link>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Tên Xe</th>
            <th className="border px-4 py-2">Loại</th>
            <th className="border px-4 py-2">Số Ghế</th>
            <th className="border px-4 py-2">Quãng Đường (km)</th>
            <th className="border px-4 py-2">Danh Mục</th>
            <th className="border px-4 py-2">Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {cars.map(car => (
            <tr key={car.carId}>
              <td className="border px-4 py-2">{car.name}</td>
              <td className="border px-4 py-2">{car.type}</td>
              <td className="border px-4 py-2">{car.seats}</td>
              <td className="border px-4 py-2">{car.rangeKm}</td>
              <td className="border px-4 py-2">{car.category?.name}</td>
              <td className="border px-4 py-2 space-x-2 text-center">
                <Link
                  href={`/admin/cars/edit/${car.carId}`}
                  className="text-blue-500 hover:underline"
                >
                  Sửa
                </Link>
                <button
                  onClick={() => handleDelete(car.carId)}
                  className="text-red-500 hover:underline"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
          {cars.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-4">
                Chưa có xe nào
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
