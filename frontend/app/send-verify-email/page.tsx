"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { sendVerificationEmail } from "@/services/userServices";
import { toast } from "react-hot-toast";

export default function SendVerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await sendVerificationEmail(email);
      toast.success(res || "Email xác thực đã được gửi 🎉");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data || "Gửi email thất bại 😢");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Gửi email xác thực
        </h2>

        <div className="flex flex-col space-y-2">
          <label className="text-gray-700 font-medium">Email của bạn</label>
          <input
            type="email"
            value={email}
            onChange={handleChange}
            required
            placeholder="Nhập email..."
            className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-60"
        >
          {loading ? "Đang gửi..." : "Gửi email xác thực"}
        </button>

        <p className="text-sm text-gray-500 text-center">
          Sau khi nhận email, click vào link để xác thực tài khoản.
        </p>
      </form>
    </div>
  );
}
