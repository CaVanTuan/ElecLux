"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMyBooking } from "@/services/bookingServices";

export default function BookingDetailPage() {
  const { bookingId } = useParams();
  const router = useRouter();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBookingDetail = async () => {
      if (!bookingId) return;
      setLoading(true);
      try {
        const allBooking = await getMyBooking();
        const b = allBooking.find((item: any) => item.bookingId === Number(bookingId));
        if (!b) {
          alert("Không tìm thấy booking này 😢");
          router.push("/booking");
          return;
        }
        setBooking(b);
      } catch (error) {
        console.error(error);
        alert("Lỗi khi tải chi tiết booking 😢");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetail();
  }, [bookingId, router]);

  if (loading) return <div className="p-6 text-center text-lg">Đang tải chi tiết booking... ⏳</div>;
  if (!booking) return null;

  const car = booking.car;
  const plan = booking.plan;
  const payment = booking.payment;
  const promo = booking.promo;

  const originalPrice = booking.totalPrice ?? 0;
  const discountedPrice = payment?.amount ?? originalPrice;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center mb-4">Chi tiết Booking #{booking.bookingId}</h1>

      {/* Thông tin xe & gói thuê */}
      {car && (
        <div className="border rounded-xl p-6 shadow-lg bg-white">
          <div className="flex flex-col md:flex-row gap-6">
            {car.imageUrl && (
              <img
                src={car.imageUrl}
                alt={car.name}
                className="w-full md:w-64 h-44 object-cover rounded-lg shadow-md"
              />
            )}
            <div className="flex-1 space-y-2">
              <h2 className="text-2xl font-semibold">{car.name}</h2>
              <div>Gói thuê: <b>{plan?.durationType ?? booking.planId}</b></div>
              <div>Ngày nhận xe: {new Date(booking.startDate).toLocaleDateString()}</div>
              <div>Ngày trả xe: {new Date(booking.endDate).toLocaleDateString()}</div>

              <div className="mt-4">
                <div className="text-gray-400 line-through text-lg">
                  {originalPrice.toLocaleString("vi-VN")} ₫
                </div>
                <div className="text-green-600 font-bold text-2xl">
                  {discountedPrice.toLocaleString("vi-VN")} ₫
                </div>
              </div>

              {promo && (
                <div className="text-sm text-gray-600 mt-2">
                  Mã giảm giá: <b>{promo.code}</b> (-{promo.discountPercent}%)
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Trạng thái booking */}
      <div className="border rounded-xl p-6 shadow bg-white">
        <div className="mb-4">
          <span className="font-semibold">Trạng thái booking: </span>
          <span className={booking.status === "Confirmed" ? "text-green-600" : "text-gray-600"}>
            {booking.status}
          </span>
        </div>

        {/* Thông tin Payment */}
        {payment && (
          <div className="border-t pt-4 space-y-2">
            <div className="font-semibold text-lg mb-2">Thông tin thanh toán</div>
            <div>Phương thức: {payment.method}</div>
            <div>Trạng thái: {payment.status}</div>
            <div>Ngày thanh toán: {new Date(payment.paymentDate).toLocaleDateString()}</div>
            <div>Số tiền: {payment.amount.toLocaleString()} ₫</div>
          </div>
        )}
      </div>

      {/* Quay lại danh sách */}
      <div className="text-center">
        <button
          onClick={() => router.push("/booking")}
          className="bg-gray-300 hover:bg-gray-400 px-6 py-2 rounded-full font-semibold transition"
        >
          ⬅ Quay lại danh sách
        </button>
      </div>
    </div>
  );
}
