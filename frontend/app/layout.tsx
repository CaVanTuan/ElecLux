import { ReactNode } from "react";
import SideBar from "@/components/sideBar";
import Navbar from "@/components/navBar";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 relative">

        {/* Navbar*/}
        <div className="fixed top-0 left-0 w-full z-50">
          <Navbar />
        </div>

        {/* Sidebar dưới navbar */}
        <div className="fixed top-[80px] left-0 w-60 h-[calc(100vh-80px)] z-40">
          <SideBar />
        </div>

        {/* Nội dung chính */}
        <main className="ml-60 pt-[100px] p-4 relative">
          {children}
        </main>

        {/* Toaster hiển thị toast */}
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}
