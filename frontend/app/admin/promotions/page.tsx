"use client";

import { useEffect, useState } from "react";
import { Edit, X, Check, XCircle } from "lucide-react";
import {
  getAllPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from "@/services/promotionServices";

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [description, setDescription] = useState("");
  const [discount, setDiscount] = useState<number>(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editPromoId, setEditPromoId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});

  const fetchPromotions = async () => {
    const data = await getAllPromotions();
    setPromotions(data);
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleCreate = async () => {
    if (!description || !discount || !startDate || !endDate) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    await createPromotion({
      Description: description,
      DiscountPercent: discount,
      StartDate: startDate,
      EndDate: endDate,
    });
    setDescription("");
    setDiscount(0);
    setStartDate("");
    setEndDate("");
    fetchPromotions();
  };

  const startEdit = (promo: any) => {
    setEditPromoId(promo.promoId);
    setEditData({
      Description: promo.description,
      DiscountPercent: promo.discountPercent,
      StartDate: promo.startDate.slice(0, 10),
      EndDate: promo.endDate.slice(0, 10),
      Status: promo.status,
    });
  };

  const cancelEdit = () => {
    setEditPromoId(null);
    setEditData({});
  };

  const saveEdit = async (promoId: number) => {
    await updatePromotion(promoId, editData);
    setEditPromoId(null);
    fetchPromotions();
  };

  const handleDelete = async (promoId: number) => {
    if (!confirm("Bạn có chắc muốn xóa mã giảm giá này?")) return;
    await deletePromotion(promoId);
    fetchPromotions();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Quản lý Promotions</h2>

      {/* Form thêm mới */}
      <div className="mb-6 p-4 border rounded flex flex-col md:flex-row gap-4 items-end">
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-sm">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-sm">Discount %</label>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(parseFloat(e.target.value))}
            className="border px-2 py-1 rounded w-28"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-sm">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-sm">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-500 text-white px-3 py-2 rounded"
        >
          Thêm Promotion
        </button>
      </div>

      {/* Bảng hiển thị */}
      <table className="min-w-full border border-collapse text-center">
        <thead>
          <tr>
            <th className="border px-4 py-2">PromoId</th>
            <th className="border px-4 py-2">Code</th>
            <th className="border px-4 py-2">Description</th>
            <th className="border px-4 py-2">Discount %</th>
            <th className="border px-4 py-2">Start Date</th>
            <th className="border px-4 py-2">End Date</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {promotions.map((promo) => (
            <tr key={promo.promoId}>
              <td className="border px-4 py-2">{promo.promoId}</td>
              <td className="border px-4 py-2">{promo.code}</td>
              <td className="border px-4 py-2">
                {editPromoId === promo.promoId ? (
                  <input
                    type="text"
                    value={editData.Description}
                    onChange={(e) =>
                      setEditData({ ...editData, Description: e.target.value })
                    }
                    className="border px-2 py-1 rounded w-44"
                  />
                ) : (
                  promo.description
                )}
              </td>
              <td className="border px-4 py-2">
                {editPromoId === promo.promoId ? (
                  <input
                    type="number"
                    value={editData.DiscountPercent}
                    onChange={(e) =>
                      setEditData({ ...editData, DiscountPercent: parseFloat(e.target.value) })
                    }
                    className="border px-2 py-1 rounded w-20 text-center"
                  />
                ) : (
                  promo.discountPercent
                )}
              </td>
              <td className="border px-4 py-2">
                {editPromoId === promo.promoId ? (
                  <input
                    type="date"
                    value={editData.StartDate}
                    onChange={(e) =>
                      setEditData({ ...editData, StartDate: e.target.value })
                    }
                    className="border px-2 py-1 rounded"
                  />
                ) : (
                  new Date(promo.startDate).toLocaleDateString()
                )}
              </td>
              <td className="border px-4 py-2">
                {editPromoId === promo.promoId ? (
                  <input
                    type="date"
                    value={editData.EndDate}
                    onChange={(e) =>
                      setEditData({ ...editData, EndDate: e.target.value })
                    }
                    className="border px-2 py-1 rounded"
                  />
                ) : (
                  new Date(promo.endDate).toLocaleDateString()
                )}
              </td>
              <td className="border px-4 py-2">{promo.status}</td>
              <td className="border px-4 py-2 flex justify-center items-center gap-2">
                {editPromoId === promo.promoId ? (
                  <>
                    <button
                      onClick={() => saveEdit(promo.promoId)}
                      className="text-green-500 flex items-center gap-1"
                    >
                      <Check size={16} /> Lưu
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="text-red-500 flex items-center gap-1"
                    >
                      <XCircle size={16} /> Hủy
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(promo)}
                      className="text-blue-500 flex items-center gap-1"
                    >
                      <Edit size={16} /> Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(promo.promoId)}
                      className="text-red-500 flex items-center gap-1"
                    >
                      <X size={16} /> Xóa
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
