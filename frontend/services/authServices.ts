import api from "./api";

export const login = async (email: string, password: string) => {
    try {
        const response = await api.post("/api/auth/login", { email, password });

        if (response.data.userNotFound) {
            return { userNotFound: true };
        }

        // Lấy token và user
        const token = response.data.token || response.data.Token;
        const user = response.data.user || response.data.User;

        if (!token || !user) {
            throw new Error("Đăng nhập thất bại 😢");
        }

        // Lưu localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        window.dispatchEvent(new Event("userChanged"));

        return { token, user };

    } catch (err: any) {
        // Nếu backend trả 400 do chưa verify email
        if (err.response?.status === 400 && err.response.data?.includes("chưa xác thực")) {
            return { emailNotVerified: true, message: err.response.data };
        }
        throw err;
    }
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

export const isTokenExpired = (token: string) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return Date.now() >= payload.exp * 1000;
    } catch {
        return true;
    }
};