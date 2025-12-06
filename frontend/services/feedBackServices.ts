import api from "./api";

// Lấy tất cả feedback của 1 xe
export const getFeedbackByCarId = async (carId: number) => {
    const res = await api.get(`/api/feedbacks/${carId}`);
    return res.data;
};

export const getAllFeedback = async () => {
    const res = await api.get("/api/feedbacks/All");
    return res.data;
};

// Tạo feedback mới
export const createFeedback = async (data: {
    carId: number;
    rating: number;
    comment: string;
}) => {
    const res = await api.post("/api/feedbacks", data);
    return res.data;
};

// Cập nhật feedback (chỉ user đó mới update được)
export const updateFeedback = async (feedbackId: number, data: {
    rating: number;
    comment: string;
}) => {
    const res = await api.put(`/api/feedbacks/${feedbackId}`, data);
    return res.data;
};

// Xóa feedback (chỉ user đó mới xóa được)
export const deleteFeedback = async (feedbackId: number) => {
    const res = await api.delete(`/api/feedbacks/${feedbackId}`);
    return res.data;
};
