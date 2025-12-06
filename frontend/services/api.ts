import axios from "axios";
import { logout, isTokenExpired } from "./authServices";


const api = axios.create({
    baseURL: "http://localhost:5001"
});

api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
            if (isTokenExpired(token)){
                logout();
                window.location.href = "/login";
                return Promise.reject("Token hết hạn");
            }
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default api;