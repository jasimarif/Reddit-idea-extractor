import axios from "axios";

const apiRequest = axios.create({
    baseURL: import.meta.env.VITE_API_URL + "/api" || "http://localhost:5000/api",
    timeout: 10000,
    withCredentials: true,
});

export default apiRequest;