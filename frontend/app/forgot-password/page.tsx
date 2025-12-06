"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { toast } from "react-hot-toast";
import { sendOtp as sendOtpService, resetPassword as resetPasswordService } from "@/services/userServices";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handleOtpChange = (e: ChangeEvent<HTMLInputElement>) => setOtp(e.target.value);
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value);

  // Countdown OTP
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const sendOtp = async () => {
    if (!email) return toast.error("Chưa nhập email 😎");
    setLoading(true);
    try {
      const res = await sendOtpService(email);
      // fix lỗi toast: chỉ dùng string
      toast.success(res.message || "OTP đã gửi thành công 😎");
      setOtpSent(true);
      setTimeLeft(60); // 1 phút
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Gửi OTP thất bại 😢");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !otp || !newPassword) return toast.error("Điền đủ thông tin nha 😎");
    if (timeLeft <= 0) return toast.error("OTP đã hết hạn 😢");

    setLoading(true);
    try {
      const res = await resetPasswordService(email, otp, newPassword);
      toast.success(res.message || "Đặt lại mật khẩu thành công 😎");
      // Reset form
      setEmail("");
      setOtp("");
      setNewPassword("");
      setOtpSent(false);
      setTimeLeft(0);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Đặt lại mật khẩu thất bại 😢");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={resetPassword}
        className="bg-white shadow-xl rounded-3xl p-8 sm:w-96 w-full space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">Đặt lại mật khẩu</h2>

        {/* Email + Gửi OTP */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-600">Email</label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              required
              placeholder="Nhập email..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition"
              disabled={otpSent}
            />
            <button
              type="button"
              onClick={sendOtp}
              disabled={loading || (otpSent && timeLeft > 0)}
              className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition disabled:opacity-60"
            >
              {loading ? "Đang gửi..." : otpSent && timeLeft > 0 ? `OTP đã gửi (${timeLeft}s)` : "Gửi OTP"}
            </button>
          </div>
        </div>

        {/* OTP */}
        {otpSent && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-600">OTP</label>
            <input
              type="text"
              value={otp}
              onChange={handleOtpChange}
              required
              placeholder="Nhập OTP..."
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition"
              disabled={timeLeft <= 0}
            />
            {timeLeft <= 0 && (
              <button
                type="button"
                onClick={sendOtp}
                className="px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition"
              >
                Gửi lại OTP
              </button>
            )}
          </div>
        )}

        {/* New Password */}
        {otpSent && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-600">Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={handlePasswordChange}
              required
              placeholder="Nhập mật khẩu mới..."
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition"
              disabled={timeLeft <= 0}
            />
          </div>
        )}

        {/* Submit */}
        {otpSent && (
          <button
            type="submit"
            disabled={loading || timeLeft <= 0}
            className="w-full bg-green-500 text-white py-2 rounded-xl hover:bg-green-600 transition disabled:opacity-60 font-semibold"
          >
            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </button>
        )}
      </form>
    </div>
  );
}
