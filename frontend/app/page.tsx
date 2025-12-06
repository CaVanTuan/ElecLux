"use client";

import RenderCars from "@/components/renderCars";
import EmailVerificationCountdown from "@/components/EmailVerificationCountdown";

export default function HomePage() {
  const handleExpire = () => {
    alert("⏰ Thời gian xác thực email đã hết! Vui lòng gửi lại email.");
  };

  return (
    <div>
      {/* Countdown xác thực email */}
      <EmailVerificationCountdown onExpire={handleExpire} />

      {/* Render danh sách xe */}
      <RenderCars />
    </div>
  );
}
