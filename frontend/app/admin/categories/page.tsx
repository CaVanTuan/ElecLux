"use client";

import { useEffect, useState } from "react";
import {
  getAllCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/services/categoryServices";

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form thêm mới
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
  });

  // Form sửa
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState({ name: "", description: "" });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    const res = await getAllCategory();
    setCategories(res);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newCategory.name.trim()) return alert("Tên danh mục không được để trống!");

    await createCategory(newCategory);
    setNewCategory({ name: "", description: "" });
    await loadCategories();
  };

  const handleEdit = (cat: any) => {
    setEditId(cat.categoryId);
    setEditData({
      name: cat.name,
      description: cat.description,
    });
  };

  const handleUpdate = async () => {
    if (!editId) return;
    await updateCategory(editId, editData);
    setEditId(null);
    await loadCategories();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Xoá danh mục?")) return;
    await deleteCategory(id);
    await loadCategories();
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Quản lý danh mục xe</h2>

      {/* FORM THÊM MỚI */}
      <div className="bg-white p-5 rounded-xl shadow border mb-10">
        <h3 className="text-xl font-semibold mb-4">Thêm danh mục mới</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Tên danh mục"
            value={newCategory.name}
            onChange={(e) =>
              setNewCategory({ ...newCategory, name: e.target.value })
            }
            className="border p-3 rounded-lg"
          />

          <input
            type="text"
            placeholder="Mô tả"
            value={newCategory.description}
            onChange={(e) =>
              setNewCategory({
                ...newCategory,
                description: e.target.value,
              })
            }
            className="border p-3 rounded-lg"
          />
        </div>

        <button
          onClick={handleCreate}
          className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Thêm danh mục
        </button>
      </div>

      {/* DANH SÁCH CATEGORY */}
      <div className="bg-white p-5 rounded-xl shadow border">
        <h3 className="text-xl font-semibold mb-4">Danh sách danh mục</h3>

        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border">ID</th>
                <th className="p-3 border">Tên</th>
                <th className="p-3 border">Mô tả</th>
                <th className="p-3 border">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((cat: any) => (
                <tr key={cat.categoryId} className="text-center border-b">
                  <td className="p-3 border">{cat.categoryId}</td>

                  {/* Nếu đang sửa */}
                  {editId === cat.categoryId ? (
                    <>
                      <td className="p-3 border">
                        <input
                          value={editData.name}
                          onChange={(e) =>
                            setEditData({ ...editData, name: e.target.value })
                          }
                          className="border p-2 rounded-lg w-full"
                        />
                      </td>

                      <td className="p-3 border">
                        <input
                          value={editData.description}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              description: e.target.value,
                            })
                          }
                          className="border p-2 rounded-lg w-full"
                        />
                      </td>

                      <td className="p-3 border">
                        <button
                          onClick={handleUpdate}
                          className="px-3 py-1 bg-green-600 text-white rounded mr-2"
                        >
                          Lưu
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="px-3 py-1 bg-gray-500 text-white rounded"
                        >
                          Hủy
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      {/* NORMAL VIEW */}
                      <td className="p-3 border">{cat.name}</td>
                      <td className="p-3 border">{cat.description}</td>

                      <td className="p-3 border">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded mr-2"
                        >
                          Sửa
                        </button>

                        <button
                          onClick={() => handleDelete(cat.categoryId)}
                          className="px-3 py-1 bg-red-600 text-white rounded"
                        >
                          Xoá
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
