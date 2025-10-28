import api from "./api";

export const login = async (name: any, password: any) => {
    const respone = await api.post("auth/login", {name, password});
    const {token, user} = {
        token: respone.data.Token,
        user: respone.data.User,
    };
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    return user;
}

export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};

export const getCurrentUser = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
};