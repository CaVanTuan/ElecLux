"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/authServices";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface LoginForm {
  name: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<LoginForm>({ name: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await login(form.name, form.password);

      if (!res || !res.token) {
        setError("Đăng nhập thất bại 😢");
        return;
      }

      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      window.dispatchEvent(new Event("userChanged"));

      toast.success(`Xin chào ${res.user.name} 💕`);
      router.push("/");
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Tên tài khoản hoặc mật khẩu không đúng 😢");
      } else {
        setError(err.response?.data || "Có lỗi xảy ra, thử lại sau 😢");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://product.hstatic.net/1000305032/product/vinfast-lux-a-doi-mau-xanh-cuc-dep__2__7fc32969f56d41518c5d9168d577619b_master.jpg')"
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white bg-opacity-80 backdrop-blur-lg shadow-xl rounded-3xl p-8 sm:w-96 w-full space-y-6"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Chào mừng trở lại!
        </h2>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-600">
            Tên đăng nhập
          </label>
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

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-600">
            Mật khẩu
          </label>
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

        {/* Box thông báo lỗi */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600 transition disabled:opacity-60 font-semibold"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        <div className="text-center text-sm text-gray-500">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="text-blue-500 font-medium hover:underline"
          >
            Đăng ký ngay
          </Link>
        </div>
      </form>
    </div>
  );
}
