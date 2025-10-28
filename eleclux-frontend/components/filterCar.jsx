"use client";
import { useState, useEffect } from "react";
import CarCard from "./CarCard";
import carService from "@/services/carServices";

export default function FilterRentalPlans() {
  const [cars, setCars] = useState([]);
  const [filter, setFilter] = useState("Ngày");

  useEffect(() => {
    const fetchCars = async () => {
      const allCars = await carService.getAllCar(); // hoặc API lọc trực tiếp
      setCars(allCars);
    };
    fetchCars();
  }, []);

  const filteredCars = cars.filter(car =>
    car.rentalPlans?.some(plan => plan.durationType === filter)
  );

  return (
    <div className="mt-16"> {/* cách navbar 16px */}
      <div className="flex justify-center gap-4 mb-4">
        {["Ngày", "Tháng", "Năm"].map(type => (
          <button
            key={type}
            className={`px-4 py-2 rounded ${
              filter === type ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setFilter(type)}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredCars.length > 0 ? (
          filteredCars.map(car => <CarCard key={car.id} car={car} />)
        ) : (
          <p className="text-center text-gray-500">Không có xe nào phù hợp</p>
        )}
      </div>
    </div>
  );
}