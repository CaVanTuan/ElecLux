"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Menu, User, LogOut, Car } from "lucide-react";

interface UserType {
  name: string;
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isClient, setIsClient] = useState(false); // check client render
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);

    const getUserFromStorage = () => {
      const userData = localStorage.getItem("user");
      setUser(userData && userData !== "undefined" ? JSON.parse(userData) : null);
    };

    // lấy user khi mount
    getUserFromStorage();

    // đóng dropdown khi click ngoài
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    // lắng nghe event userChanged
    const handleUserChanged = () => {
      getUserFromStorage();
    };
    window.addEventListener("userChanged", handleUserChanged);

    // cleanup khi unmount
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
  };

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 left-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer">
          <Car className="text-blue-600" size={28} />
          <Link href="/" className="font-extrabold text-xl text-blue-600 hover:scale-105 transition-transform">
            ElecLux
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center">
          {isClient && (
            user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-all cursor-pointer"
                >
                  <User size={20} />
                  <span className="font-medium">{user.name}</span>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-fade-in">
                    <Link
                      href="/profile"
                      className="block px-4 py-3 hover:bg-gray-100 text-gray-700 transition"
                      onClick={() => setShowDropdown(false)}
                    >
                      👤 Thông tin cá nhân
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-3 hover:bg-gray-100 text-gray-700 transition"
                      onClick={() => setShowDropdown(false)}
                    >
                      📦 Đơn hàng của tôi
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-red-500 hover:bg-gray-100 transition"
                    >
                      <LogOut size={16} className="inline mr-1" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-6">
                <Link href="/login" className="text-blue-600 font-medium hover:underline transition">
                  Đăng nhập
                </Link>
                <Link href="/register" className="text-blue-600 font-medium hover:underline transition">
                  Đăng ký
                </Link>
              </div>
            )
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-gray-100 transition"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Mở menu"
          title="Mở menu"
        >
          <Menu size={28} />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-white border-t border-gray-200 shadow-lg overflow-hidden transition-all duration-300 ${
          isMenuOpen ? "max-h-screen py-4" : "max-h-0 py-0"
        }`}
      >
        <div className="flex flex-col gap-4 px-6">
          {isClient && (
            user ? (
              <div className="space-y-2">
                <p className="text-gray-700 font-medium">Xin chào, {user.name}</p>
                <Link href="/profile" className="block hover:text-blue-600 transition-all">
                  Thông tin cá nhân
                </Link>
                <Link href="/orders" className="block hover:text-blue-600 transition-all">
                  Đơn hàng của tôi
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-red-500 hover:underline transition-all"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link href="/login" className="hover:text-blue-600 transition-all">
                  Đăng nhập
                </Link>
                <Link href="/register" className="hover:text-blue-600 transition-all">
                  Đăng ký
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
