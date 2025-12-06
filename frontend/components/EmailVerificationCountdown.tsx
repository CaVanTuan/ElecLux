"use client";

import { useEffect, useState, useRef } from "react";
import { getMe } from "@/services/userServices";

interface Props {
  onExpire?: () => void;
}

export default function EmailVerificationCountdown({ onExpire }: Props) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [email, setEmail] = useState<string>("");
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0, mouseX: 0, mouseY: 0 });
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoggedIn(true);

    const fetchUser = async () => {
      try {
        const user = await getMe();
        setEmail(user.email);
        setIsVerified(user.isVerified);
        if (user.isVerified) {
          setTimeLeft(0);
          return;
        }

        const created = new Date(user.createdAt).getTime();
        const now = Date.now();
        const diff = Math.max(0, Math.floor((created + 24 * 3600 * 1000 - now) / 1000));
        setTimeLeft(diff);
      } catch (err) {
        console.error("Lấy thông tin user thất bại:", err);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!loggedIn || timeLeft <= 0) return;

    const interval = setInterval(async () => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loggedIn, timeLeft, onExpire]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!boxRef.current) return;
    pos.current = {
      x: boxRef.current.offsetLeft,
      y: boxRef.current.offsetTop,
      mouseX: e.clientX,
      mouseY: e.clientY,
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!boxRef.current) return;
    const dx = e.clientX - pos.current.mouseX;
    const dy = e.clientY - pos.current.mouseY;
    boxRef.current.style.left = pos.current.x + dx + "px";
    boxRef.current.style.top = pos.current.y + dy + "px";
  };

  const handleMouseUp = () => {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  if (!loggedIn || !email || isVerified) return null;
  return (
    <div
      ref={boxRef}
      onMouseDown={handleMouseDown}
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        width: 300,
        minWidth: 300,
        maxWidth: 300,
        padding: "10px",
        borderRadius: 8,
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        cursor: "grab",
        zIndex: 1000,
        background: "white",
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        boxSizing: "border-box",
      }}
    >
      ⏳ Xác thực email: {hours}h {minutes}m {seconds}s
    </div>
  );
}
