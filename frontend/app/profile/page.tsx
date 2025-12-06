"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { getMe, sendOtp, updateUser, verifyOtp } from "@/services/userServices";
import { toast } from "react-hot-toast";

type User = {
  userId?: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  role?: string;
  isVerified?: boolean;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<User>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpTimeLeft, setOtpTimeLeft] = useState(0);

  // Load user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await getMe();
        setUser(res);
        setFormData(res);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Lấy thông tin thất bại 😢");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // OTP countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpTimeLeft > 0) {
      timer = setTimeout(() => setOtpTimeLeft(otpTimeLeft - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpTimeLeft]);

  const handleEdit = () => setEditing(true);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    if (!formData.email) return toast.error("Chưa nhập email 😎");
    try {
      const res = await sendOtp(formData.email);
      setOtpSent(true);
      setOtpTimeLeft(60);
      toast.success(res.message || "Mã OTP đã được gửi tới email mới.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Gửi OTP thất bại 😢");
    }
  };

  const handleVerifyOtpAndUpdate = async () => {
    if (!otp) return toast.error("Vui lòng nhập OTP 😎");
    try {
      setVerifyingOtp(true);
      const res = await updateUser({ ...formData, otp });
      setUser(res.data);
      setFormData(res.data);
      setEditing(false);
      setOtp("");
      setOtpSent(false);
      setOtpTimeLeft(0);
      toast.success(res.message || "Email và thông tin đã cập nhật thành công ✅");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Xác thực OTP thất bại 😢");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const emailChanged = formData.email.trim().toLowerCase() !== user.email?.trim().toLowerCase();

    if (emailChanged && !otpSent) {
      // Bước 1: gửi OTP nếu email mới
      await handleSendOtp();
      return;
    }

    if (emailChanged && otpSent) {
      // Bước 2: đã gửi OTP → verify + update
      await handleVerifyOtpAndUpdate();
    } else {
      // Email không đổi → update bình thường
      try {
        const res = await updateUser(formData);
        setUser(res.data);
        setFormData(res.data);
        setEditing(false);
        toast.success(res.message || "Thông tin đã cập nhật thành công ✅");
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Cập nhật thất bại 😢");
      }
    }
  };

  const handleCancel = () => {
    setFormData(user!);
    setEditing(false);
    setOtpSent(false);
    setOtp("");
    setOtpTimeLeft(0);
  };

  if (loading) return <div className="p-6 text-center">⏳ Đang tải thông tin cá nhân...</div>;
  if (!user) return <div className="p-6 text-center text-red-500">Không tìm thấy thông tin user!</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Thông tin cá nhân</h1>

      <div className="bg-white border rounded-lg shadow-md p-6 space-y-4">
        {!editing ? (
          <>
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <span className="w-32 font-semibold">Họ và tên:</span>
              <span>{user.name}</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <span className="w-32 font-semibold">Email:</span>
              <span>{user.email}</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <span className="w-32 font-semibold">Số điện thoại:</span>
              <span>{user.phone}</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <span className="w-32 font-semibold">Địa chỉ:</span>
              <span>{user.address}</span>
            </div>

            <div className="pt-4">
              <button
                onClick={handleEdit}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Sửa thông tin
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <span className="w-32 font-semibold">Họ và tên:</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-full md:w-auto"
              />
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <span className="w-32 font-semibold">Email:</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-full md:w-auto"
              />
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <span className="w-32 font-semibold">Số điện thoại:</span>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-full md:w-auto"
              />
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <span className="w-32 font-semibold">Địa chỉ:</span>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-full md:w-auto"
              />
            </div>

            {otpSent && (
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <span className="w-32 font-semibold">Nhập OTP:</span>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="border rounded px-2 py-1 w-full md:w-auto"
                />
                <button
                  type="button"
                  onClick={handleVerifyOtpAndUpdate}
                  disabled={verifyingOtp}
                  className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 transition"
                >
                  Xác nhận OTP
                </button>
                {otpTimeLeft > 0 && (
                  <span className="ml-2 text-gray-600">
                    {Math.floor(otpTimeLeft / 60)}:{(otpTimeLeft % 60).toString().padStart(2, "0")}s
                  </span>
                )}
                {otpTimeLeft <= 0 && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="ml-2 bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition"
                  >
                    Gửi lại OTP
                  </button>
                )}
              </div>
            )}

            <div className="pt-4 flex gap-2">
              {!otpSent && (
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                >
                  Lưu
                </button>
              )}
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition"
              >
                Huỷ
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
