import api from "./api";

// ===== Booking Promotion =====

// Tạo liên kết Booking - Promotion
export const addPromotionToBooking = async (bookingId: number, promoId: number) => {
  const res = await api.post(`/api/booking-promotions`, { bookingId, promoId });
  return res.data;
};

// Lấy tất cả promotion của booking
export const getPromotionsOfBooking = async (bookingId: number) => {
  const res = await api.get(`/api/booking-promotions/get-by-booking`, {
    params: { bookingId },
  });
  return res.data;
};

// Xoá promotion khỏi booking
export const removePromotionFromBooking = async (bookingPromotionId: number) => {
  const res = await api.delete(`/api/booking-promotions/${bookingPromotionId}`);
  return res.data;
};

// ===== Promotion =====

// Lấy tất cả promotion (admin hoặc người dùng muốn xem)
export const getAllPromotions = async () => {
  const res = await api.get(`/api/promotions/All`);
  return res.data;
};

// Lấy promotion theo mã code
export const getPromotionByCode = async (code: string) => {
  const res = await api.get(`/api/promotions/get-by-code`, { params: { code } });
  return res.data;
};

// Tạo promotion mới (admin)
export const createPromotion = async (data: any) => {
  const res = await api.post(`/api/promotions`, data);
  return res.data;
};

// Cập nhật promotion (admin)
export const updatePromotion = async (promoId: number, data: any) => {
  const res = await api.put(`/api/promotions/${promoId}`, data);
  return res.data;
};

// Xoá promotion (admin)
export const deletePromotion = async (promoId: number) => {
  const res = await api.delete(`/api/promotions/${promoId}`);
  return res.data;
};

// Lấy promo đã active cho user
export const getActivePromotions = async () => {
  const res = await api.get("/api/promotions/active");
  return res.data;
};