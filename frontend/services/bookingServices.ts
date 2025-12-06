import api from "./api";

// Lấy tất cả booking (admin)
export const getAllBooking = async () => {
    const res = await api.get("/api/bookings/All");
    return res.data;
};

// Lấy booking theo trạng thái (admin)
export const getBookingByStatus = async (bookingStatus: string) => {
    const res = await api.get("/api/bookings/get-by-status", {
        params: { bookingStatus }
    });
    return res.data;
};

// Lấy booking của user hiện tại
export const getMyBooking = async () => {
    const res = await api.get("/api/bookings/me");
    return res.data;
};

// Tạo booking mới
export const createBooking = async (data: {
    carId: number;
    durationType: string;
    startDate: string;
    promoId?: number;
}) => {
    const res = await api.post("/api/bookings", data);
    return res.data;
};

// Cập nhật trạng thái booking (admin)
export const updateBookingStatus = async (bookingId: number) => {
    const res = await api.put(`/api/bookings/update-status/${bookingId}`);
    return res.data;
};
