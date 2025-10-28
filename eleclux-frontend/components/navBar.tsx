"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Menu, User, LogOut, Car, Home } from "lucide-react";

interface UserType {
  name: string;
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 left-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Car className="text-blue-600" />
          <Link href="/" className="font-bold text-lg text-blue-600">
            ElecLux
          </Link>
        </div>

        {/* Menu chính */}
        <div className="hidden md:flex gap-6 items-center">
          <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
            <Home size={18} /> Trang chủ
          </Link>

          {/* Tài khoản người dùng */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
              >
                <User size={20} />
                <span>{user.name}</span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                    onClick={() => setShowDropdown(false)}
                  >
                    👤 Thông tin cá nhân
                  </Link>
                  <Link
                    href="/orders"
                    className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                    onClick={() => setShowDropdown(false)}
                  >
                    📦 Đơn hàng của tôi
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                  >
                    <LogOut size={16} className="inline mr-1" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-4">
              <Link href="/login" className="text-blue-600 hover:underline">
                Đăng nhập
              </Link>
              <Link href="/register" className="text-blue-600 hover:underline">
                Đăng ký
              </Link>
            </div>
          )}
        </div>

        {/* Nút menu di động */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Mở menu"
          title="Mở menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Menu di động */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 p-3 space-y-2">
          <Link href="/" className="block">
            Trang chủ
          </Link>
          <Link href="/cars" className="block">
            Xe điện
          </Link>

          {user ? (
            <>
              <p className="text-gray-700">Xin chào, {user.name}</p>
              <Link href="/profile" className="block">
                Thông tin cá nhân
              </Link>
              <Link href="/orders" className="block">
                Đơn hàng của tôi
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-500 hover:underline"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block">
                Đăng nhập
              </Link>
              <Link href="/register" className="block">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}