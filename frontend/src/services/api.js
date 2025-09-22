import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8001/api/",
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem("refresh");
                if (refreshToken) {
                    const response = await axios.post(
                        "http://127.0.0.1:8001/api/token/refresh/",
                        { refresh: refreshToken }
                    );
                    const { access } = response.data;
                    localStorage.setItem("access", access);
                    api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                localStorage.removeItem("user");
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default api;
