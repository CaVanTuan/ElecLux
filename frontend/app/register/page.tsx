"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { createUser, sendVerificationEmail } from "@/services/userServices";

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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createUser(form); // result = { code, data, message }

      // Luôn dùng result.message cho toast
      if (result.code === 201) {
        toast.success(result.message);

        // Gửi email xác thực luôn
        try {
          const emailRes = await sendVerificationEmail(form.email);
          toast.success(emailRes.message || "Email xác thực đã được gửi 🎉");
        } catch (err: any) {
          toast.error(
            "Gửi email xác thực thất bại 😢" + (err.response?.data?.message ? ` (${err.response.data.message})` : "")
          );
        }

        setTimeout(() => router.push("/login"), 1000);
      } else {
        toast.error(result.message || "Đăng ký thất bại 😢");
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Đăng ký thất bại 😢";
      toast.error(message);
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
        <h2 className="text-3xl font-bold text-center text-gray-800">Đăng ký tài khoản</h2>

        {["name", "email", "password", "phone", "address"].map((field) => (
          <div key={field} className="space-y-2">
            <label className="block text-sm font-medium text-gray-600">
              {field === "name" ? "Họ và tên" : field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              type={field === "password" ? "password" : "text"}
              name={field}
              value={(form as any)[field]}
              onChange={handleChange}
              required
              placeholder={
                field === "name"
                  ? "Nhập tên..."
                  : field === "email"
                  ? "example@gmail.com"
                  : field === "password"
                  ? "••••••••"
                  : "Nhập " + field + "..."
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition"
            />
          </div>
        ))}

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
