import axios from "axios";
import { logoutUser } from "../utils/logoutUser";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
});

const ACCESS_TOKEN_KEY = import.meta.env.VITE_ACCESS_TOKEN_KEY;

// Prevent multiple refresh requests at the same time
let refreshPromise = null;

// --------------------------------------------------
// Request Interceptor
// --------------------------------------------------

api.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};

    // Identify this as a web client
    config.headers["X-Client-Type"] = "web";

    // Get access token from localStorage
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// --------------------------------------------------
// Response Interceptor
// --------------------------------------------------

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // If there is no request config, reject
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Only handle 401 errors
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Don't retry the same request repeatedly
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh if the failed request itself is the refresh endpoint
    if (originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // ------------------------------------------------
      // Refresh access token
      // ------------------------------------------------

      if (!refreshPromise) {
        refreshPromise = api
          .post(
            "/api/auth/refresh",
            {},
            {
              withCredentials: true,
              headers: {
                "X-Client-Type": "web",
              },
            },
          )
          .finally(() => {
            refreshPromise = null;
          });
      }

      const refreshRes = await refreshPromise;

      const newAccessToken = refreshRes.data[ACCESS_TOKEN_KEY];

      if (!newAccessToken) {
        throw new Error("No access token returned from refresh endpoint");
      }

      // ------------------------------------------------
      // Store new access token
      // ------------------------------------------------

      localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);

      // Update default Authorization header
      api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

      // Update the failed request
      originalRequest.headers = originalRequest.headers || {};

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      // Retry original request
      return api(originalRequest);
    } catch (refreshError) {
      // ------------------------------------------------
      // Refresh failed
      // ------------------------------------------------

      localStorage.removeItem(ACCESS_TOKEN_KEY);

      try {
        await logoutUser();
      } catch (logoutError) {
        console.error("Logout failed:", logoutError);
      }

      return Promise.reject(refreshError);
    }
  },
);

export default api;
