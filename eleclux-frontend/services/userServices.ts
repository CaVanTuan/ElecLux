import api from "./api";

export const createUser = async(data: any) => {
    const res = await api.post("/api/users/user", data);
    return res.data;
};

export const createAdmin = async(data: any) => {
    const res = await api.post("/api/users/admin", data);
    return res.data;
};

export const getUserById = async(userId: number) => {
    const res = await api.get(`/api/users/${userId}`);
    return res.data;
};

export const getMe = async() => {
    const res = await api.get("/api/users/get-me");
    return res.data;
};

export const getAllUser = async() => {
    const res = await api.get("/api/users/getAllUser");
    return res.data;
};

export const deleteUser = async(userId: number) => {
    const res = await api.delete(`/api/users/${userId}`);
    return res.data;
};

export const changePassword = async(userId: number, oldPassword: any, newPassword: any) => {
    const res = await api.put(`/api/users/${userId}/change-password`, {
        oldPasswordRequest: oldPassword,
        newPasswordRequest: newPassword,
    });
    return res.data;
};