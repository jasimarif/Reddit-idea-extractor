import axios from "axios";

const apiRequest = axios.create({
    baseURL: import.meta.env.VITE_API_URL + "/api" || "http://localhost:5000/api",
    timeout: 30000,
    withCredentials: true,
});

// Add interceptor to include JWT in Authorization header
apiRequest.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});

export default apiRequest;