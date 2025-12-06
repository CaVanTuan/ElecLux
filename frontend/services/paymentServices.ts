import api from "./api";

// Tạo thanh toán mới cho booking (có thể kèm mã giảm giá)
export const createPayment = async (data: {
  BookingId: number;
  PromoId?: number;
  Method: string;
}) => {
  try {
    const res = await api.post("/api/payments", data);
    return res.data;
  } catch (error: any) {
    if (error.response) {
      console.error("Backend trả lỗi:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("Request đã gửi nhưng không nhận được phản hồi:", error.request);
    } else {
      console.error("Lỗi khi tạo payment:", error.message);
    }
    throw error;
  }
};

// Lấy thông tin thanh toán theo paymentId
export const getPaymentById = async (paymentId: number) => {
  try {
    const res = await api.get(`/api/payments/${paymentId}`);
    return res.data;
  } catch (error: any) {
    console.error("Lỗi khi lấy payment:", error.response || error.message);
    throw error;
  }
};
