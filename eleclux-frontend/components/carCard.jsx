"use client";

import Link from "next/link";

export default function CarCard({ car }) {
  return (
  <Link href={`/car/${car.CarId || car.id || car.ID}`}>
      <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        <img
          src={car.imageUrl || "/default-car.jpg"}
          alt={car.name}
          className="w-full h-48 object-cover rounded-lg mb-3"
        />

        <h2 className="text-lg font-bold mb-1">{car.name}</h2>
        <p className="text-gray-500 mb-2">
          Loại: {car.category?.name || "Không có danh mục"}
        </p>

        {car.rentalPlans?.length > 0 ? (
          <ul className="text-sm text-gray-700 mb-3">
            {car.rentalPlans.map((plan) => (
              <li key={plan.planId}>
                ⏱ {plan.durationType}: 💰 {plan.price.toLocaleString()} VNĐ
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 italic">Chưa có gói thuê</p>
        )}
      </div>
    </Link>
  );
}