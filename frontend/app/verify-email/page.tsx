"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { verifyEmail } from "@/services/userServices";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      toast.error("Link xác thực không hợp lệ 😢");
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const data = await verifyEmail(email, token);
        toast.success(data || "Xác thực email thành công 🎉");
        // Chuyển hướng sang login sau 2s
        setTimeout(() => router.push("/login"), 2000);
      } catch (err: any) {
        console.error(err);
        toast.error(err.response?.data?.message || "Xác thực thất bại 😢");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        {loading ? "Đang xác thực email..." : "Xác thực hoàn tất!"}
      </div>
    </div>
  );
}
