"use client";

import { useEffect, useState } from "react";
import {
  getAllRentalPlans,
  createRentalPlan,
  updateRentalPlan,
  deleteRentalPlan,
} from "@/services/rentalPlanServices";
import { Edit, X, Check, XCircle } from "lucide-react";

export default function AdminRentalPlanPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [carId, setCarId] = useState<number | "">("");
  const [durationTypeUnit, setDurationTypeUnit] = useState<string>("");
  const [durationTypeAmount, setDurationTypeAmount] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">("");
  const [editPlanId, setEditPlanId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editPrice, setEditPrice] = useState<number>(0);

  const fetchPlans = async () => {
    const data = await getAllRentalPlans();
    setPlans(data);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreate = async () => {
    if (!carId || !durationTypeUnit || !durationTypeAmount || !price) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    const durationType = `${durationTypeAmount} ${durationTypeUnit}`;
    await createRentalPlan(Number(carId), { DurationType: durationType, Price: Number(price) });
    setCarId("");
    setDurationTypeUnit("");
    setDurationTypeAmount("");
    setPrice("");
    fetchPlans();
  };

  const handleDelete = async (planId: number) => {
    if (!confirm("Bạn có chắc muốn xóa gói thuê này?")) return;
    await deleteRentalPlan(planId);
    fetchPlans();
  };

  const startEdit = (plan: any) => {
    setEditPlanId(plan.planId);
    const [amount, unit] = plan.durationType.split(" ");
    setEditAmount(parseInt(amount));
    setEditPrice(plan.price);
  };

  const cancelEdit = () => {
    setEditPlanId(null);
    setEditAmount(0);
    setEditPrice(0);
  };

  const saveEdit = async (plan: any) => {
    const [_, unit] = plan.durationType.split(" ");
    const updatedDurationType = `${editAmount} ${unit}`;
    await updateRentalPlan(plan.planId, { DurationType: updatedDurationType, Price: editPrice });
    setEditPlanId(null);
    fetchPlans();
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Quản lý gói thuê</h2>

      {/* Form thêm mới */}
      <div className="mb-6 p-4 border rounded flex flex-wrap gap-4 items-end">
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-sm">Mã xe</label>
          <input
            type="number"
            placeholder="Car ID"
            value={carId}
            onChange={(e) => setCarId(e.target.value === "" ? "" : parseInt(e.target.value))}
            className="border px-2 py-1 rounded w-24"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-sm">Loại thời gian</label>
          <select
            value={durationTypeUnit}
            onChange={(e) => setDurationTypeUnit(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">Chọn loại</option>
            <option value="Ngày">Ngày</option>
            <option value="Tháng">Tháng</option>
            <option value="Năm">Năm</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-sm">Số thời gian</label>
          <input
            type="number"
            placeholder="SL"
            value={durationTypeAmount}
            onChange={(e) => setDurationTypeAmount(e.target.value === "" ? "" : parseInt(e.target.value))}
            className="border px-2 py-1 rounded w-20"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-sm">Giá</label>
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value === "" ? "" : parseFloat(e.target.value))}
            className="border px-2 py-1 rounded w-28"
          />
        </div>

        <button
          onClick={handleCreate}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Thêm gói thuê
        </button>
      </div>

      {/* Bảng hiển thị */}
      <table className="min-w-full border border-collapse text-center">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Plan ID</th>
            <th className="border px-4 py-2">Car ID</th>
            <th className="border px-4 py-2">Số lượng</th>
            <th className="border px-4 py-2">Đơn vị</th>
            <th className="border px-4 py-2">Giá</th>
            <th className="border px-4 py-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan) => {
            const [amount, unit] = plan.durationType.split(" ");
            return (
              <tr key={plan.planId}>
                <td className="border px-4 py-2">{plan.planId}</td>
                <td className="border px-4 py-2">{plan.carId}</td>
                <td className="border px-4 py-2">
                  {editPlanId === plan.planId ? (
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(parseInt(e.target.value))}
                      className="border px-2 py-1 rounded w-20 text-center"
                    />
                  ) : (
                    amount
                  )}
                </td>
                <td className="border px-4 py-2">{editPlanId === plan.planId ? unit : unit}</td>
                <td className="border px-4 py-2">
                  {editPlanId === plan.planId ? (
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(parseFloat(e.target.value))}
                      className="border px-2 py-1 rounded w-24 text-center"
                    />
                  ) : (
                    plan.price
                  )}
                </td>
                <td className="border px-4 py-2 flex justify-center items-center gap-2">
                  {editPlanId === plan.planId ? (
                    <>
                      <button
                        onClick={() => saveEdit(plan)}
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
                        onClick={() => startEdit(plan)}
                        className="text-blue-500 flex items-center gap-1"
                      >
                        <Edit size={16} /> Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(plan.planId)}
                        className="text-red-500 flex items-center gap-1"
                      >
                        <X size={16} /> Xóa
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
