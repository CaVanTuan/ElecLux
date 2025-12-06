"use client";

import { useEffect, useState } from "react";
import {
  createFeedback,
  getFeedbackByCarId,
  updateFeedback,
  deleteFeedback
} from "@/services/feedBackServices";
import { Star, Trash2, Edit2, Check, X } from "lucide-react";

interface FeedbackProps {
  carId: number;
  currentUserId: number;
}

interface FeedbackItem {
  feedbackId: number;
  userId: number;
  user: { name: string };
  rating: number;
  comment: string;
  createdAt: string;
}

export default function Feedback({ carId, currentUserId }: FeedbackProps) {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState("");
  const [editingRating, setEditingRating] = useState(5);

  // Lấy danh sách feedback
  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const data = await getFeedbackByCarId(carId);
      setFeedbacks(data);
    } catch (error) {
      console.error("Lỗi lấy feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [carId]);

  // Tạo feedback mới
  const handleSubmit = async () => {
    if (!newComment.trim()) return alert("Vui lòng nhập comment nha 😅");
    setSubmitting(true);
    try {
      await createFeedback({ carId, rating: newRating, comment: newComment });
      setNewComment("");
      setNewRating(5);
      fetchFeedbacks();
    } catch (error) {
      console.error("Lỗi tạo feedback:", error);
      alert("Không thể gửi feedback 😢");
    } finally {
      setSubmitting(false);
    }
  };

  // Bắt đầu edit feedback
  const startEdit = (fb: FeedbackItem) => {
    setEditingId(fb.feedbackId);
    setEditingComment(fb.comment);
    setEditingRating(fb.rating);
  };

  // Hủy edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditingComment("");
    setEditingRating(5);
  };

  // Lưu feedback sau khi edit
  const saveEdit = async () => {
    if (!editingComment.trim()) return alert("Vui lòng nhập comment nha 😅");
    try {
      await updateFeedback(editingId!, { comment: editingComment, rating: editingRating });
      cancelEdit();
      fetchFeedbacks();
    } catch (error) {
      console.error("Lỗi cập nhật feedback:", error);
      alert("Không thể cập nhật feedback 😢");
    }
  };

  // Xóa feedback
  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa feedback này?")) return;
    try {
      await deleteFeedback(id);
      fetchFeedbacks();
    } catch (error) {
      console.error("Lỗi xóa feedback:", error);
      alert("Không thể xóa feedback 😢");
    }
  };

  if (loading) return <div className="text-center py-4">Đang tải feedback... ⏳</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Đánh giá & Nhận xét</h2>

      {/* Form tạo feedback */}
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <div className="mb-2 font-semibold">Viết đánh giá của bạn</div>
        <div className="flex items-center mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={24}
              className={`cursor-pointer ${i < newRating ? "text-yellow-400" : "text-gray-300"}`}
              onClick={() => setNewRating(i + 1)}
            />
          ))}
        </div>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-2"
          placeholder="Viết nhận xét của bạn..."
          rows={3}
        />
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition disabled:opacity-50"
        >
          Gửi đánh giá
        </button>
      </div>

      {/* Danh sách feedback */}
      {feedbacks.length === 0 ? (
        <div className="text-gray-500">Chưa có đánh giá nào 😮</div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((fb) => (
            <div key={fb.feedbackId} className="border rounded-lg p-4 shadow-sm bg-white relative">
              {editingId === fb.feedbackId ? (
                <>
                  {/* Form edit */}
                  <div className="flex items-center mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={`cursor-pointer ${i < editingRating ? "text-yellow-400" : "text-gray-300"}`}
                        onClick={() => setEditingRating(i + 1)}
                      />
                    ))}
                  </div>
                  <textarea
                    value={editingComment}
                    onChange={(e) => setEditingComment(e.target.value)}
                    className="w-full border rounded px-3 py-2 mb-2"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition flex items-center gap-1"
                    >
                      <Check size={16} /> Lưu
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 transition flex items-center gap-1"
                    >
                      <X size={16} /> Hủy
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold">{fb.user?.name ?? "Người dùng ẩn danh"}</div>
                    <div className="flex gap-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className={i < fb.rating ? "text-yellow-400" : "text-gray-300"}
                        />
                      ))}
                      {fb.userId === currentUserId && (
                        <>
                          <button onClick={() => startEdit(fb)} className="hover:text-blue-500">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(fb.feedbackId)} className="hover:text-red-500">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-gray-700">{fb.comment}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(fb.createdAt).toLocaleDateString()}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
