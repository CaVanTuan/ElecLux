import api from "./api";

export const login = async (name: string, password: string) => {
    const response = await api.post("/api/auth/login", { name, password });

    // Lấy token và user từ response, check cả chữ hoa và chữ thường
    const token = response.data.token || response.data.Token;
    const user = response.data.user || response.data.User;

    if (!token || !user) {
        throw new Error("Đăng nhập thất bại 😢");
    }

    // Lưu localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    window.dispatchEvent(new Event("userChanged"));

    // Trả về cả token và user để handleSubmit dùng
    return { token, user };
};

export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("userChanged"));
};

export const getCurrentUser = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
};