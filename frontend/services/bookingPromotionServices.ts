import api from "./api";

// Lấy tất cả booking-promotion (admin)
export const getAllBookingPromotions = async () => {
  const res = await api.get("/api/bookingPromotions/All");
  return res.data;
};

// Lấy booking-promotion của user hiện tại
export const getMyBookingPromotions = async () => {
  const res = await api.get("/api/bookingPromotions/my-bookingPromo");
  return res.data;
};
