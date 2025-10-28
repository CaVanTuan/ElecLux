// app/car/[id]/CarDetailClient.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import EmblaCarousel from "embla-carousel";

type EmblaType = ReturnType<typeof EmblaCarousel>;

interface RentalPlan {
  planId: string | number;
  durationType: string;
  price: number;
}

interface Specification {
  id: string | number;
  key: string;
  value: string;
}

interface CarImage {
  id: string | number;
  url: string;
}

interface Car {
  name: string;
  category?: { name: string };
  imageUrl?: string;
  rentalPlans?: RentalPlan[];
  specifications?: Specification[];
  carImages?: CarImage[];
}

interface Props {
  car: Car;
}

export default function CarDetailClient({ car }: Props) {
  const rentalPlans = car.rentalPlans ?? [];
  const specifications = car.specifications ?? [];
  const carImages = car.carImages ?? [];
  const [durationUnit, setDurationUnit] = useState<"ngày" | "tháng" | "năm">("ngày");
  const [selectedPlan, setSelectedPlan] = useState<RentalPlan | null>(null);
  const formatDuration = (duration: string) => {
    const clean = duration.trim().toLowerCase();

    if (clean.includes("ngày") || clean.includes("tháng") || clean.includes("năm")) {
      return clean;
    }

    const num = parseInt(clean);
    if (isNaN(num)) return duration;

    if (num < 30) return `${num} ngày`;
    if (num < 365) return `${Math.floor(num / 30)} tháng`;
    return `${Math.floor(num / 365)} năm`;
  };
  const handleSelectPlan = (plan: RentalPlan) => {
    setSelectedPlan(plan);
    console.log("Đã chọn gói:", plan);
  };

  const emblaRef = useRef<HTMLDivElement | null>(null);
  const [embla, setEmbla] = useState<EmblaType | null>(null);

  useEffect(() => {
    if (emblaRef.current) {
      const emblaInstance = EmblaCarousel(emblaRef.current, { loop: true });
      setEmbla(emblaInstance);
      return () => emblaInstance.destroy();
    }
  }, []);

  const scrollPrev = () => embla?.scrollPrev();
  const scrollNext = () => embla?.scrollNext();

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-4xl font-bold text-gray-800">{car.name}</h1>

      {/* Carousel */}
      <div className="relative">
        {carImages.length > 0 ? (
          <div className="overflow-hidden rounded-xl shadow-lg" ref={emblaRef}>
            <div className="flex">
              {carImages.map((img, idx) => (
                <div key={img.id ?? idx} className="min-w-full relative h-80 sm:h-96">
                  <Image
                    src={img.url}
                    alt={`${car.name} - ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            {/* Carousel Buttons */}
            <button
              onClick={scrollPrev}
              className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white"
            >
              ◀
            </button>
            <button
              onClick={scrollNext}
              className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white"
            >
              ▶
            </button>
          </div>
        ) : (
          <div className="relative h-80 sm:h-96 w-full rounded-xl overflow-hidden shadow-lg">
            <Image
              src={car.imageUrl || "/default-car.jpg"}
              alt={car.name}
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>

      <p className="text-gray-500">Loại: <span className="font-medium">{car.category?.name || "Không có danh mục"}</span></p>

      {/* Rental Plans */}
      <div>
        <h2 className="text-2xl font-semibold mb-3">Gói thuê</h2>

        {/* Nút chọn ngày/tháng/năm */}
        <div className="flex gap-3 mb-4">
          {["ngày", "tháng", "năm"].map((unit) => (
            <button
              key={unit}
              onClick={() => setDurationUnit(unit as "ngày" | "tháng" | "năm")}
              className={`px-4 py-1 rounded ${
                durationUnit === unit ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {unit}
            </button>
          ))}
        </div>

        {rentalPlans.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rentalPlans
              .filter(plan => plan.durationType.toLowerCase() === durationUnit)
              .map((plan, idx) => (
                <div
                  key={plan.planId ?? idx}
                  className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col justify-between"
                >
                  <div>
                    <p className="text-gray-700 font-medium">⏱ {plan.durationType}</p>
                    <p className="text-green-600 font-semibold">💰 {plan.price.toLocaleString()} VNĐ</p>
                  </div>
                  <button
                    className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                    onClick={() => handleSelectPlan(plan)}
                  >
                    Đặt xe
                  </button>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-gray-400 italic">Chưa có gói thuê</p>
        )}
      </div>

      {/* Specifications */}
      {specifications.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-3">Thông số kỹ thuật</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {specifications.map((spec, idx) => (
              <div
                key={spec.id ?? idx}
                className="p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition"
              >
                <p className="text-gray-600 font-medium">{spec.key}</p>
                <p className="text-gray-800">{spec.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
