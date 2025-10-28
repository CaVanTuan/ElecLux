"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { createUser } from "@/services/userServices";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/users/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const error = await res.text();
        toast.error(error);
        return;
      }

      toast.success("Đăng ký thành công! 💕");

      setTimeout(() => {
        router.push("/login");
      }, 1000);

    } catch (err) {
      console.error(err);
      toast.error("Đăng ký thất bại 😢");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://tse2.mm.bing.net/th/id/OIP.2byoznuegQrrSL9YxQ-X2QHaE7?pid=ImgDet&w=474&h=315&rs=1&o=7&rm=3')",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white bg-opacity-80 backdrop-blur-lg shadow-xl rounded-3xl p-8 sm:w-96 w-full space-y-5"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Đăng ký tài khoản
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-center">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">Tên đăng nhập</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Nhập tên..."
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="example@gmail.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">Mật khẩu</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">Số điện thoại</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            placeholder="0123456789"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">Địa chỉ</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            placeholder="Nhập địa chỉ..."
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 text-white py-2 rounded-xl hover:bg-green-600 transition disabled:opacity-60 font-semibold"
        >
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>

        <div className="text-center text-sm text-gray-500">
          Đã có tài khoản?{" "}
          <Link href="/login" className="text-blue-500 font-medium hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </form>
    </div>
  );
}
