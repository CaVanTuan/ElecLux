"use client";

import { useEffect, useState } from "react";
import {
  getAllBooking,
  getBookingByStatus,
  updateBookingStatus,
} from "@/services/bookingServices";

interface Payment {
  paymentId: number;
  amount: number;
  method: string;
  status: string;
  paymentDate: string;
}

interface Promo {
  promoId: number;
  code: string;
  discountPercent: number;
}

interface BookingDisplay {
  bookingId: number;
  carName: string;
  planType: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  lastPayment?: Payment | null;
  promo?: Promo | null;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingDisplay[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let data: any[] = [];
      if (filterStatus) {
        data = await getBookingByStatus(filterStatus);
      } else {
        data = await getAllBooking();
      }
      console.log("Raw booking data from API:", data);

      const mapped: BookingDisplay[] = data.map((b) => ({
        bookingId: b.bookingId,
        carName: b.car?.name ?? "-",
        planType: b.plan?.durationType ?? "-",
        startDate: b.startDate,
        endDate: b.endDate,
        totalPrice: b.totalPrice,
        status: b.status,
        lastPayment: b.payment
          ? {
              paymentId: b.payment.paymentId ?? b.payment.id,
              amount: b.payment.amount,
              method: b.payment.method,
              status: b.payment.status,
              paymentDate: b.payment.paymentDate,
            }
          : null,
        promo: b.promo
          ? {
              promoId: b.promo.promotionId ?? b.promo.id,
              code: b.promo.code,
              discountPercent: b.promo.discountPercent,
            }
          : null,
      }));

      setBookings(mapped);
    } catch (err) {
      console.error(err);
      alert("Lấy danh sách booking thất bại 😢");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filterStatus]);

  const handleComplete = async (bookingId: number) => {
    try {
      setLoading(true);
      await updateBookingStatus(bookingId);
      setBookings((prev) =>
        prev.map((b) =>
          b.bookingId === bookingId ? { ...b, status: "Completed" } : b
        )
      );
    } catch (err) {
      console.error(err);
      alert("Cập nhật trạng thái thất bại 😢");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold mb-4">Quản lý Booking</h1>

      {/* Filter */}
      <div className="mb-4 flex items-center gap-2">
        <label htmlFor="status" className="font-semibold">
          Lọc theo trạng thái:
        </label>
        <select
          id="status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="">Tất cả</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Tên xe</th>
            <th className="border px-2 py-1">Gói thuê</th>
            <th className="border px-2 py-1">Ngày bắt đầu</th>
            <th className="border px-2 py-1">Ngày kết thúc</th>
            <th className="border px-2 py-1">Giá</th>
            <th className="border px-2 py-1">Trạng thái</th>
            <th className="border px-2 py-1">Payment</th>
            <th className="border px-2 py-1">Promo</th>
            <th className="border px-2 py-1">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr
              key={b.bookingId}
              className={b.status === "Completed" ? "bg-gray-200" : ""}
            >
              <td className="border px-2 py-1">{b.carName}</td>
              <td className="border px-2 py-1">{b.planType}</td>
              <td className="border px-2 py-1">
                {new Date(b.startDate).toLocaleDateString()}
              </td>
              <td className="border px-2 py-1">
                {new Date(b.endDate).toLocaleDateString()}
              </td>
              <td className="border px-2 py-1">
                {b.totalPrice.toLocaleString("vi-VN")} ₫
              </td>
              <td className="border px-2 py-1">{b.status}</td>
              <td className="border px-2 py-1">
                {b.lastPayment
                  ? `${b.lastPayment.amount.toLocaleString(
                      "vi-VN"
                    )} - ${b.lastPayment.status}`
                  : "-"}
              </td>
              <td className="border px-2 py-1">{b.promo?.code || "-"}</td>
              <td className="border px-2 py-1 text-center">
                {b.status !== "Completed" && (
                  <button
                    disabled={loading}
                    onClick={() => handleComplete(b.bookingId)}
                    className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                  >
                    Hoàn thành
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {loading && <div>Đang tải... ⏳</div>}
    </div>
  );
}
