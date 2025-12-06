import api from "./api";

export const sendOtp = async (email: string) => {
  const res = await api.post("/api/users/send-otp", {
    EmailOrPhone: email,
    IsEmail: true
  });
  return res.data;
};

export const verifyOtp = async (email: string, otp: string) => {
  const res = await api.post("/api/users/verify-otp", {
    EmailOrPhone: email,
    Otp: otp,
  });
  return res.data;
}

export const resetPassword = async (email: string, otp: string, newPassword: string) => {
  const res = await api.put("/api/users/reset-password", {
    EmailOrPhone: email,
    Otp: otp,
    NewPassword: newPassword
  });
  return res.data;
};

export const createUser = async (data: any) => {
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

export const sendVerificationEmail = async (email: string) => {
    const res = await api.post("/api/users/send-verification-email", { Email: email });
    return res.data;
};


export const verifyEmail = async (email: string, token: string) => {
    const res = await api.post("/api/users/verify-email", { Email: email, Token: token });
    return res.data;
};

export const toggleDeleteUser = async (userId: number) => {
  const res = await api.put(`/api/users/${userId}/toggle-delete`);
  return res.data;
};

export const updateUser = async (data: {
  Name: string;
  Phone: string;
  Address: string;
  Email: string;
  Otp?: string;
}) => {
  const res = await api.put("/api/users/update-user", data);
  return res.data;
};
