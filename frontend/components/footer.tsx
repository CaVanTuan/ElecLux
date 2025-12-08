import React from "react";
import {
    FaFacebook,
    FaInstagram,
    FaTwitter,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt
} from "react-icons/fa";

export interface AdminInfo {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
}

interface FooterProps {
    admin?: AdminInfo | null;
}

const Footer: React.FC<FooterProps> = ({ admin }) => {
    return (
        <footer className="bg-gray-900 text-gray-300 py-10 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">

                {/* LOGO + DESCRIPTION */}
                <div className="bg-gray-800 p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700">
                    <div className="flex items-center gap-4 mb-4">
                        <img
                            src="/images/Gemini_Generated_Image_1332ll1332ll1332.png"
                            alt="Logo"
                            className="w-24 h-24 object-cover rounded-xl transition-transform duration-300 hover:scale-105"
                        // tăng size từ w-16 h-16 → w-24 h-24
                        />

                        <h2 className="text-white text-2xl font-semibold tracking-wide">
                            ElecLux
                        </h2>
                    </div>

                    <p className="text-sm leading-6 text-gray-300 border-t border-gray-700 pt-3">
                        ElecLux – Hệ thống cung cấp dịch vụ nhanh chóng, uy tín và chất lượng.
                        <br />
                        Chúng tôi luôn nỗ lực mang lại trải nghiệm tốt nhất cho khách hàng 💛✨
                    </p>
                </div>

                {/* INFORMATION (ADMIN) */}
                <div>
                    <h3 className="text-white text-lg font-semibold mb-3">Thông tin liên hệ</h3>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                            <FaEnvelope className="text-blue-400" />
                            {admin?.email ?? "sniper021003@gmail.com"}
                        </li>

                        <li className="flex items-center gap-2">
                            <FaPhone className="text-green-400" />
                            {admin?.phone ?? "0787052246"}
                        </li>

                        <li className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-red-400" />
                            {admin?.address ?? "Hà Nội, Việt Nam"}
                        </li>

                        <li className="flex items-center gap-2">
                            👤 {admin?.name ?? "Admin"}
                        </li>
                    </ul>
                </div>

                {/* QUICK LINKS */}
                <div>
                    <h3 className="text-white text-lg font-semibold mb-3">Liên kết nhanh</h3>
                    <ul className="space-y-2 text-sm">

                        <li>
                            <a href="/" className="hover:text-white cursor-pointer">
                                Trang chủ
                            </a>
                        </li>

                        <li>
                            <a href="/categories" className="hover:text-white cursor-pointer">
                                Danh mục sản phẩm
                            </a>
                        </li>

                    </ul>
                </div>

                {/* SOCIAL */}
                <div>
                    <h3 className="text-white text-lg font-semibold mb-3">Theo dõi chúng tôi</h3>

                    <div className="flex gap-3 mt-2">

                        <a
                            href="https://www.facebook.com/profile.php?id=61584929484267"
                            target="_blank"
                            className="p-2 bg-gray-800 rounded-full hover:bg-gray-700"
                        >
                            <FaFacebook />
                        </a>

                        <a className="p-2 bg-gray-800 rounded-full hover:bg-gray-700">
                            <FaInstagram />
                        </a>

                        <a className="p-2 bg-gray-800 rounded-full hover:bg-gray-700">
                            <FaTwitter />
                        </a>

                    </div>
                </div>
            </div>

            <div className="text-center text-sm text-gray-500 mt-10 border-t border-gray-700 pt-5">
                © {new Date().getFullYear()} ElecLux — All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
