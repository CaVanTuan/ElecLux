"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
    Home, 
    Car, 
    List, 
    ShoppingCart, 
    User,
    Menu,
    Shield
} from "lucide-react";
import { useState, useEffect } from "react";

// kiểu cho menu con
type SidebarItem = {
    name: string;
    path?: string;
    icon?: React.ReactElement;
    requiresLogin?: boolean;
    subItems?: { name: string; path: string }[];
};

// kiểu section
type SidebarSection = {
    title: string;
    items: SidebarItem[];
};

export default function SideBar() {
    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState<{ name: string; role: string } | null>(null);

    // quản lý trạng thái submenu mở/đóng
    const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: boolean }>({});

    // kiểm tra trạng thái user và lắng nghe event 'userChanged'
    useEffect(() => {
        const checkUser = () => {
            const token = localStorage.getItem("token");
            const userData = localStorage.getItem("user");
            if (token && userData) {
                setUser(JSON.parse(userData));
            } else {
                setUser(null);
            }
        };

        checkUser();
        window.addEventListener("userChanged", checkUser);

        return () => window.removeEventListener("userChanged", checkUser);
    }, []);

    const handleToggleSub = (name: string) => {
        setOpenSubmenus((prev) => ({ ...prev, [name]: !prev[name] }));
    };

    // sections chung
    const sections: SidebarSection[] = [
        {
            title: "Trang chính",
            items: [{ name: "Trang chủ", path: "/", icon: <Home size={20} /> }],
        },
        {
            title: "Thuê xe",
            items: [
                { name: "Tất cả xe", path: "/", icon: <Car size={20} /> },
                { name: "Danh mục xe", path: "/categories", icon: <List size={20} /> },
            ],
        },
        {
            title: "Cá nhân",
            items: [
                { name: "Đơn hàng của tôi", path: "/booking", icon: <ShoppingCart size={20} />, requiresLogin: true },
                { name: "Tài khoản", path: "/profile", icon: <User size={20} />, requiresLogin: true },
            ],
        },
    ];

    // thêm section admin nếu là admin
    if (user?.role === "admin") {
        sections.push({
            title: "Admin",
            items: [
                {
                    name: "Dashboard",
                    icon: <Shield size={20} />,
                    subItems: [
                        { name: "Dashboard", path: "/admin"},
                        { name: "Quản lý danh mục xe", path: "/admin/categories" },
                        { name: "Quản lý xe", path: "/admin/cars" },
                        { name: "Quản lý người dùng", path: "/admin/users" },
                        { name: "Quản lý đơn đặt xe", path: "/admin/bookings" },
                        { name: "Quản lý feedback", path: "/admin/feedbacks" },
                        { name: "Quản lý gói thuê", path: "/admin/rentalplan" },
                        { name: "Quản lý mã giảm giá", path: "/admin/promotions" },
                    ],
                },
            ],
        });
    }

    return (
        <>
            {/* Toggle sidebar mobile */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-xl shadow-lg"
                onClick={() => setOpen(!open)}
            >
                <Menu size={22} />
            </button>

            <aside
                className={`
                    fixed left-0 w-60 bg-white shadow-xl border-r border-gray-200 
                    flex flex-col py-6 px-4 transition-transform duration-300 z-40
                    top-[80px] h-[calc(100vh-80px)]
                    overflow-y-auto   /* scroll được */
                    ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                `}
            >
                <nav className="flex flex-col gap-6">
                    {sections.map((section) => (
                        <div key={section.title}>
                            <p className="text-gray-500 text-sm px-3 mb-2 uppercase tracking-wide">
                                {section.title}
                            </p>

                            {section.items.map((item) => (
                                <div key={item.name} className="flex flex-col">
                                    <Link
                                        href={item.path || "#"}
                                        onClick={(e) => {
                                            if (item.requiresLogin && !user) {
                                                e.preventDefault();
                                                router.push("/login");
                                                setOpen(false);
                                            } else if (item.subItems) {
                                                e.preventDefault();
                                                handleToggleSub(item.name);
                                            } else {
                                                setOpen(false);
                                            }
                                        }}
                                        className={`
                                            flex items-center gap-3 px-3 py-2 rounded-xl transition
                                            hover:bg-blue-100
                                            ${pathname === item.path ? "bg-blue-600 text-white" : "text-gray-700"}
                                        `}
                                    >
                                        {item.icon}
                                        <span className="font-medium">{item.name}</span>
                                        {item.subItems && (
                                            <span className="ml-auto text-gray-400">
                                                {openSubmenus[item.name] ? "▾" : "▸"}
                                            </span>
                                        )}
                                    </Link>

                                    {/* render submenu */}
                                    {item.subItems && openSubmenus[item.name] && (
                                        <div className="ml-6 flex flex-col gap-1 mt-1">
                                            {item.subItems.map((sub) => (
                                                <Link
                                                    key={sub.path}
                                                    href={sub.path}
                                                    onClick={() => setOpen(false)}
                                                    className={`
                                                        px-3 py-2 rounded-lg transition hover:bg-blue-200
                                                        ${pathname === sub.path ? "bg-blue-500 text-white" : "text-gray-700"}
                                                    `}
                                                >
                                                    {sub.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    );
}
