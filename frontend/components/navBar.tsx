"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Menu, LogOut, Route } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface UserType {
  name: string;
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  useEffect(() => {
    setIsClient(true);

    const getUserFromStorage = () => {
      const userData = localStorage.getItem("user");
      setUser(userData && userData !== "undefined" ? JSON.parse(userData) : null);
    };

    getUserFromStorage();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    const handleUserChanged = () => getUserFromStorage();
    window.addEventListener("userChanged", handleUserChanged);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("userChanged", handleUserChanged);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setShowDropdown(false);
    setIsMenuOpen(false);
    window.location.href = "/login";
  };

  return (
    <nav className="w-full bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-md transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/images/Gemini_Generated_Image_1332ll1332ll1332.png"
            alt="ElecLux logo"
            width={84}
            height={84}
            sizes="48px"
            style={{ width: 48, height: 48 }}
            className="rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300 object-cover"
          />
          <span className="font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:scale-110 transition-all duration-300">
            ElecLux
          </span>
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-8">
          {isClient &&
            (user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-all"
                >
                  {/* Avatar gradient */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="ml-1 text-gray-800 font-semibold">{user.name}</span>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-52 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden transform transition-transform transition-opacity duration-200 scale-100 opacity-100">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-red-500 hover:bg-gray-50 transition flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-6">
                <Link
                  href="/login"
                  className="text-blue-600 font-medium hover:underline hover:text-blue-700 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="text-blue-600 font-medium hover:underline hover:text-blue-700 transition-colors"
                >
                  Đăng ký
                </Link>
              </div>
            ))}
        </div>
      </div>
    </nav>
  );
}
