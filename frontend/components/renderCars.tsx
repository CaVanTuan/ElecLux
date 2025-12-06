"use client";

import { useEffect, useState } from "react";
import { getAllCar, getCarByRentalPlan } from "@/services/carServices";
import Image from "next/image";
import Link from "next/link";

export default function Cars() {
    const [cars, setCars] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("");

    const fetchCars = async (filterType?: string) => {
        setLoading(true);
        try {
            let data;
            if (!filterType) {
                data = await getAllCar();
            } else {
                data = await getCarByRentalPlan(filterType);
            }
            setCars(data);
        } catch (error) {
            console.error("Lỗi tải danh sách xe:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterClick = (type?: string) => {
        setFilter(type || "");
        fetchCars(type);
    };
    useEffect(() => {
        fetchCars();
    }, []);


    if (loading)
        return (
            <div className="text-center py-10 text-lg">
                ⏳ Đang tải xe...
            </div>
        );

    return (
        <div className="px-6 py-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Danh sách xe</h1>

            <div className="flex gap-3 mb-6">
                {["Ngày", "Tháng", "Năm"].map((type) => (
                    <button
                        key={type}
                        onClick={() => handleFilterClick(type)}
                        className={`px-4 py-2 rounded border ${
                            filter === type
                                ? "bg-green-500 text-white"
                                : "bg-white text-gray-700"
                        }`}
                    >
                        {type}
                    </button>
                ))}

                <button
                    onClick={() => handleFilterClick()}
                    className={`px-4 py-2 rounded border ${
                        filter === "" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"
                    }`}
                >
                    Tất cả
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {cars.flatMap((car: any) => {
                    const plansToShow = filter
                        ? car.rentalPlans.filter((p: any) => p.durationType === filter)
                        : car.rentalPlans;

                    return plansToShow.map((plan: any) => (
                        <Link
                            key={`${car.carId}-${plan.durationType}`}
                            href={`/car/${car.carId}?plan=${plan.durationType}`}
                            className="car-item block rounded-lg shadow-md hover:shadow-xl transition overflow-hidden bg-white"
                        >
                            {/* IMAGE */}
                            <div className="relative car-image">
                                <div className="absolute top-2 left-2 z-10 w-full flex gap-1">
                                    <div
                                        className="text-xs font-semibold rounded"
                                        style={{
                                            backgroundColor: "rgb(232,238,252)",
                                            height: "28px",
                                            lineHeight: "28px",
                                            padding: "0 8px",
                                            borderRadius: "4px",
                                        }}
                                    >
                                        Miễn phí sạc
                                    </div>
                                </div>

                                <div className="w-full h-56 relative">
                                    <Image
                                        src={car.imageUrl}
                                        alt={car.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>

                            {/* INFO */}
                            <div className="relative car-info">
                                {/* PRICE FLOATING */}
                                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 border border-[#b4c3de] p-4 bg-white w-max shadow-sm rounded">
                                    <div className="flex items-center text-center">
                                        <div className="text-gray-700">Chỉ từ</div>
                                        <div className="font-black text-2xl mx-2 text-[#00D287]">
                                            {plan.price?.toLocaleString("vi-VN") || "Đang cập nhật"}
                                        </div>
                                        <div className="font-semibold text-md text-gray-700 translate-y-1/4">
                                            VNĐ/{plan.durationType}
                                        </div>
                                    </div>
                                </div>

                                {/* DETAIL BLOCK */}
                                <div className="flex flex-col border border-[#4b9c6b] px-4 gap-4 pt-11 pb-4">
                                    <div className="text-center font-extrabold text-2xl text-[#111827]">
                                        {car.name}
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-3">
                                        <div className="flex items-center gap-2">
                                            <img
                                                src="https://greenfuture.tech/_next/static/media/car-type.495bde21.svg"
                                                width={22}
                                                height={16}
                                                alt="type"
                                            />
                                            <div className="text-sm font-medium text-[#374151]">
                                                {car.type}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <img
                                                src="https://greenfuture.tech/_next/static/media/range_per_charge.05d0b2b9.svg"
                                                width={19}
                                                height={12}
                                                alt="range"
                                            />
                                            <div className="text-sm font-medium text-[#374151]">
                                                {car.rangeKm} km
                                            </div>
                                        </div>

                                        <hr className="col-span-2 border-[#d9e1e2]" />

                                        <div className="flex items-center gap-2">
                                            <img
                                                src="https://greenfuture.tech/_next/static/media/no_of_seat.b5c472ab.svg"
                                                width={18}
                                                height={18}
                                                alt="seats"
                                            />
                                            <div className="text-sm font-medium text-[#374151]">
                                                {car.seats} chỗ
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <img
                                                src="https://greenfuture.tech/_next/static/media/trunk_capacity.2eb533d8.svg"
                                                width={19}
                                                height={18}
                                                alt="trunk"
                                            />
                                            <div className="text-sm font-medium text-[#374151]">
                                                {car.trunkVolume} L
                                            </div>
                                        </div>

                                        <hr className="col-span-2 border-[#d9e1e2]" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ));
                })}
            </div>
        </div>
    );
}
