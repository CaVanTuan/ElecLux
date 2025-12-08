"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getCarById } from "@/services/carServices";
import { createBooking } from "@/services/bookingServices";
import { createPayment } from "@/services/paymentServices";
import { getActivePromotions, getPromotionByCode } from "@/services/promotionServices";

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const carIdParam = searchParams.get("carId");
    const planParam = searchParams.get("plan");

    const [car, setCar] = useState<any>(null);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [promoCode, setPromoCode] = useState<string>("");
    const [promoList, setPromoList] = useState<any[]>([]);
    const [promo, setPromo] = useState<any>(null);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);

    // Lấy dữ liệu xe và gói thuê
    useEffect(() => {
        const fetchCar = async () => {
            if (!carIdParam) return;
            setLoading(true);
            try {
                const data = await getCarById(Number(carIdParam));
                setCar(data);

                const plan = planParam
                    ? data.rentalPlans.find((p: any) => p.durationType === planParam)
                    : data.rentalPlans[0];
                setSelectedPlan(plan || data.rentalPlans[0]);
                setTotalPrice(plan?.price || 0);
            } catch (error) {
                console.error("Lỗi tải thông tin xe:", error);
                alert("Không thể tải thông tin xe 😢");
            } finally {
                setLoading(false);
            }
        };
        fetchCar();
    }, [carIdParam, planParam]);

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const activePromos = await getActivePromotions();
                setPromoList(activePromos);
            } catch (error) {
                console.error("Lỗi tải danh sách mã giảm giá:", error);
            }
        };
        fetchPromotions();
    }, []);

    const calculateEndDate = () => {
        if (!selectedPlan) return startDate;
        const start = new Date(startDate);
        switch (selectedPlan.durationType) {
            case "Ngày":
                start.setDate(start.getDate() + 1);
                break;
            case "Tháng":
                start.setMonth(start.getMonth() + 1);
                break;
            case "Năm":
                start.setFullYear(start.getFullYear() + 1);
                break;
        }
        return start.toISOString().split("T")[0];
    };

    const handleApplyPromo = async (code: string) => {
        if (!code) {
            setPromo(null);
            setTotalPrice(selectedPlan?.price || 0);
            setPromoCode("");
            return;
        }
        try {
            const data = await getPromotionByCode(code);
            setPromo(data);
            const discounted = selectedPlan.price - (selectedPlan.price * data.discountPercent) / 100;
            setTotalPrice(discounted);
            setPromoCode(code);
        } catch (error) {
            console.error(error);
            setPromo(null);
            setTotalPrice(selectedPlan.price);
            setTotalPrice(selectedPlan?.price || 0);
            setPromoCode("");
            alert("Mã giảm giá không hợp lệ 😢");
        }
    };

    const handleCheckout = async () => {
        if (!car || !selectedPlan) return;
        setSubmitting(true);
        try {
            const booking = await createBooking({
                carId: car.carId,
                durationType: selectedPlan.durationType,
                startDate,
                promoId: promo ? promo.promoId : undefined,
            });

            const paymentData = {
                BookingId: booking.booking.bookingId,
                PromoId: promo ? promo.promoId : null,
                Method: "COD"
            };

            await createPayment(paymentData);

            alert("Đặt xe và thanh toán COD thành công 😎");
            router.push("/booking");
        } catch (error) {
            console.error(error);
            alert("Đặt xe thất bại 😢");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading)
        return <div className="p-4 text-center text-gray-500">Đang tải thông tin xe...</div>;
    if (!car) return <div className="p-4 text-center text-red-500">Không tìm thấy xe!</div>;

    return (
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-4 text-gray-800">Checkout - {car.name}</h1>

            {/* Thông tin xe */}
            <div className="mb-4 border rounded-lg p-4 shadow-sm bg-white">
                <div className="font-semibold mb-2">Thông số kỹ thuật:</div>
                {car.specifications.map((spec: any) => (
                    <div key={spec.specId} className="flex justify-between mb-1">
                        <span className="font-medium">{spec.key}:</span>
                        <span>{spec.value}</span>
                    </div>
                ))}
            </div>

            {/* Thông tin gói thuê */}
            {selectedPlan && (
                <div className="mb-4 border rounded-lg p-4 shadow-sm bg-white">
                    <div className="mb-2 font-semibold">Gói thuê: {selectedPlan.durationType}</div>
                    <div className="mb-2 text-green-600 font-bold text-xl">
                        {totalPrice?.toLocaleString("vi-VN")} VNĐ
                    </div>
                    <label className="block font-semibold mb-1">Ngày bắt đầu:</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border rounded px-3 py-2 w-full mb-2"
                    />
                    <div className="text-gray-700">Ngày trả dự kiến: {calculateEndDate()}</div>
                </div>
            )}

            {/* Chọn mã giảm giá */}
            <div className="mb-4 border rounded-lg p-4 shadow-sm bg-white">
                <label className="block font-semibold mb-1">Chọn mã giảm giá (nếu có):</label>
                <select
                    className="border rounded px-3 py-2 w-full"
                    value={promoCode}
                    onChange={(e) => handleApplyPromo(e.target.value)}
                >
                    <option value="">Không dùng mã giảm giá</option>
                    {promoList.map((p) => (
                        <option key={p.promoId} value={p.code}>
                            {p.code} - {p.discountPercent}%
                        </option>
                    ))}
                </select>
                {promo && (
                    <div className="text-green-600 mt-1 font-semibold">
                        Áp dụng: -{promo.discountPercent}%
                    </div>
                )}
            </div>

            {/* Thông tin thanh toán */}
            <div className="mb-4 border rounded-lg p-4 shadow-sm bg-white">
                <div className="flex justify-between font-semibold mb-2">
                    <span>Tổng tiền:</span>
                    <span className="text-green-600 font-bold">{totalPrice?.toLocaleString("vi-VN")} VNĐ</span>
                </div>
                <div className="font-semibold">Phương thức thanh toán: COD</div>
            </div>

            <button
                onClick={handleCheckout}
                disabled={submitting}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition"
            >
                {submitting ? "Đang đặt xe..." : "Xác nhận đặt xe (COD)"}
            </button>
        </div>
    );
}
