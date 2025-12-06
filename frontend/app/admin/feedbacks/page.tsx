"use client";

import { useEffect, useState } from "react";
import { getAllFeedback, deleteFeedback } from "@/services/feedBackServices";

interface FeedbackItem {
  feedbackId: number;
  userName: string;
  carName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const data = await getAllFeedback();
      setFeedbacks(data);
    } catch (error) {
      console.error("Lỗi tải feedback:", error);
      alert("Không thể tải feedback 😢");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa feedback này không?")) return;
    setDeletingId(id);
    try {
      await deleteFeedback(id);
      setFeedbacks(feedbacks.filter(f => f.feedbackId !== id));
    } catch (error) {
      console.error(error);
      alert("Xóa thất bại 😢");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  if (loading) return <div className="p-4 text-center text-gray-500">Đang tải feedback...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Quản lý Feedback</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border-b">ID</th>
              <th className="px-4 py-2 border-b">User</th>
              <th className="px-4 py-2 border-b">Xe</th>
              <th className="px-4 py-2 border-b">Rating</th>
              <th className="px-4 py-2 border-b">Comment</th>
              <th className="px-4 py-2 border-b">Ngày tạo</th>
              <th className="px-4 py-2 border-b">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map(fb => (
              <tr key={fb.feedbackId} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b text-center">{fb.feedbackId}</td>
                <td className="px-4 py-2 border-b">{fb.userName}</td>
                <td className="px-4 py-2 border-b">{fb.carName}</td>
                <td className="px-4 py-2 border-b text-center">{fb.rating}</td>
                <td className="px-4 py-2 border-b">{fb.comment}</td>
                <td className="px-4 py-2 border-b">{new Date(fb.createdAt).toLocaleString()}</td>
                <td className="px-4 py-2 border-b text-center">
                  <button
                    onClick={() => handleDelete(fb.feedbackId)}
                    disabled={deletingId === fb.feedbackId}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    {deletingId === fb.feedbackId ? "Đang xóa..." : "Xóa"}
                  </button>
                </td>
              </tr>
            ))}
            {feedbacks.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  Chưa có feedback nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
