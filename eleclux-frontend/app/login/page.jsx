"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/authServices";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form); // gọi API
      localStorage.setItem("token", res.token); // lưu token
      localStorage.setItem("user", JSON.stringify(res.user)); // lưu thông tin user
      toast.success(`Xin chào ${res.user.name} 💕`);
      router.push("/"); // chuyển về trang chủ
    } catch (err) {
      toast.error("Sai tên hoặc mật khẩu 😢");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 w-80 space-y-5"
      >
        <h2 className="text-2xl font-bold text-center mb-4">Đăng nhập 🚪</h2>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Tên đăng nhập
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300 outline-none"
            placeholder="Nhập tên..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Mật khẩu
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300 outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-60"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}
