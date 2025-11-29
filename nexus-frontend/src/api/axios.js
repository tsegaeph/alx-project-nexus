// src/api/axios.js

import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
const API_URL = `${BASE_URL}/api/`;

const api = axios.create({
    baseURL: API_URL,
    withCredentials: false,
});

// Refresh handling state
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

// ------------------------------------------------------
// 1. Add token to every request
// ------------------------------------------------------
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ------------------------------------------------------
// 2. Handle 401 responses (token expired)
// ------------------------------------------------------
api.interceptors.response.use(
    res => res,
    async (error) => {

        const originalRequest = error.config;
        const refreshToken = localStorage.getItem("refresh_token");

        // If unauthorized AND we have a refresh token
        if (error.response?.status === 401 && refreshToken) {

            // Avoid infinite retry loops
            if (originalRequest._retry) {
                return Promise.reject(error);
            }
            originalRequest._retry = true;

            // If already refreshing token → join the queue
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                .then((newToken) => {
                    originalRequest.headers.Authorization = "Bearer " + newToken;
                    return api(originalRequest);
                })
                .catch((err) => Promise.reject(err));
            }

            // Start refresh
            isRefreshing = true;

            try {
                // 🔑 Use the BASE_URL (without /api/) for the refresh endpoint,
                // as this post request is being made by the base axios instance.
                const response = await axios.post(`${BASE_URL}/api/token/refresh/`, {
                    refresh: refreshToken,
                });

                const newToken = response.data.access;

                // Save new access token
                localStorage.setItem("token", newToken);

                // Update headers for queued requests
                processQueue(null, newToken);

                // Retry original request
                originalRequest.headers.Authorization = "Bearer " + newToken;
                return api(originalRequest);

            } catch (refreshError) {
                processQueue(refreshError, null);

                // Refresh token is expired → logout smoothly
                localStorage.removeItem("token");
                localStorage.removeItem("refresh_token");

                // Let frontend decide UX (no alerts)
                window.dispatchEvent(new Event("token-expired"));

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;