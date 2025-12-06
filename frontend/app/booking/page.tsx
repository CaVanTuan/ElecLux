"use client";

import { useEffect, useState } from "react";
import { getMyBooking } from "@/services/bookingServices";
import Link from "next/link";

export default function BookingPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await getMyBooking();
        // console.log("Booking data:", data);
        setBookings(data);
      } catch (error) {
        console.error("Lỗi khi lấy booking:", error);
        alert("Không thể tải danh sách booking 😢");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) return <div>Đang tải booking... ⏳</div>;
  if (bookings.length === 0) return <div>Bạn chưa có booking nào 😮</div>;

  const statusVN: any = {
    Pending: "Chờ thanh toán",
    Confirmed: "Đã xác nhận",
    Paid: "Đã thanh toán",
    Completed: "Hoàn tất",
    Cancelled: "Đã hủy"
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Đơn hàng của tôi</h1>

      <div className="space-y-4">
        {bookings.map((b, index) => {
          const finalPrice = b.payment?.amount ?? b.totalPrice ?? 0;
          const carName = b.car?.name ?? "Tên xe không có";
          const planName = b.plan?.durationType ?? "Không có";
          const startDate = b.startDate ? new Date(b.startDate).toLocaleDateString() : "Không xác định";
          const endDate = b.endDate ? new Date(b.endDate).toLocaleDateString() : "Không xác định";
          const promoCode = b.promo?.code ?? null;
          const promoDiscount = b.promo?.discountPercent ?? null;

          return (
            <Link key={b.bookingId ?? index} href={`/booking-detail/${b.bookingId}`}>
              <div className="border rounded-lg p-4 shadow bg-white cursor-pointer hover:shadow-md transition">
                <div className="font-semibold text-lg">🚗 {carName}</div>
                <div className="text-gray-700 mb-2">Gói thuê: <b>{planName}</b></div>
                <div className="text-gray-700">Ngày bắt đầu: {startDate}</div>
                <div className="text-gray-700 mb-2">Ngày kết thúc: {endDate}</div>
                <div className="mb-2">
                  {b.payment ? (
                    <>
                      <div className="text-gray-400 line-through">
                        {(b.totalPrice ?? 0).toLocaleString("vi-VN")} ₫
                      </div>
                      <div className="text-green-600 font-bold text-xl">
                        {finalPrice.toLocaleString("vi-VN")} ₫
                      </div>
                    </>
                  ) : (
                    <div className="text-green-600 font-bold text-xl">
                      {finalPrice.toLocaleString("vi-VN")} ₫
                    </div>
                  )}
                </div>
                {promoCode && (
                  <div className="text-sm text-gray-600 mb-2">
                    Mã giảm giá: <b>{promoCode}</b> (-{promoDiscount}%)
                  </div>
                )}
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">
                  {statusVN[b.status] ?? b.status}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
