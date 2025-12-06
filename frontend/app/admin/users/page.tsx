"use client";

import { useEffect, useState } from "react";
import { getAllUser, toggleDeleteUser, getMe } from "@/services/userServices";

interface User {
    userId: number;
    name: string;
    email: string;
    role: string;
    isDeleted: boolean;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [me, setMe] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const meData = await getMe();
                setMe(meData);
                const usersData = await getAllUser();
                setUsers(usersData);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    const handlePause = async (userId: number) => {
        try {
            setLoading(true);
            console.log("Pausing userId:", userId); // check ID
            await toggleDeleteUser(userId);
            setUsers(prev => prev.map(u => u.userId === userId ? { ...u, isDeleted: !u.isDeleted } : u));
        } catch (err) {
            console.error(err);
            alert("Tạm ngừng thất bại");
        } finally {
            setLoading(false);
        }
    };

    // Phân bảng
    const normalUsers = users.filter(u => u.role.toLowerCase() !== "admin");
    const admins = users.filter(u => u.role.toLowerCase() === "admin");

    return (
        <div className="p-4 max-w-5xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold mb-4">Quản lý người dùng</h1>

            {/* Admin */}
            <div>
                <h2 className="text-xl font-semibold mb-2">Admin</h2>
                <table className="w-full border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border px-2 py-1">Tên</th>
                            <th className="border px-2 py-1">Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.map(u => (
                            <tr key={`admin-${u.userId}`} className={u.isDeleted ? "bg-gray-200" : ""}>
                                <td className="border px-2 py-1">{me?.userId === u.userId ? "Tôi" : u.name}</td>
                                <td className="border px-2 py-1">{u.email}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* User */}
            <div>
                <h2 className="text-xl font-semibold mb-2">Người dùng</h2>
                <table className="w-full border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border px-2 py-1">Tên</th>
                            <th className="border px-2 py-1">Email</th>
                            <th className="border px-2 py-1">Trạng thái</th>
                            <th className="border px-2 py-1">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {normalUsers.map(u => (
                            <tr key={`user-${u.userId}`} className={u.isDeleted ? "bg-gray-200" : ""}>
                                <td className="border px-2 py-1">{me?.userId === u.userId ? "Tôi" : u.name}</td>
                                <td className="border px-2 py-1">{u.email}</td>
                                <td className="border px-2 py-1">{u.isDeleted ? "Đã tạm ngừng" : "Hoạt động"}</td>
                                <td className="border px-2 py-1 text-center">
                                    <button
                                        disabled={loading}
                                        onClick={() => handlePause(u.userId)}
                                        className={`px-2 py-1 rounded text-white ${u.isDeleted ? "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600"}`}
                                    >
                                        {u.isDeleted ? "Khôi phục" : "Tạm ngừng"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
