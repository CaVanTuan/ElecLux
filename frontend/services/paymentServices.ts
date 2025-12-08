import api from "./api";

export const createPayment = async (data: {
  BookingId: number;
  PromoId?: number;
  Method: string;
}) => {
    const res = await api.post("/api/payments", data);
    return res.data;
};

export const getPaymentById = async (paymentId: number) => {
  try {
    const res = await api.get(`/api/payments/${paymentId}`);
    return res.data;
  } catch (error: any) {
    console.error("Lỗi khi lấy payment:", error.response || error.message);
    throw error;
  }
};
