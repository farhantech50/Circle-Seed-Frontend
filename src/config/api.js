import axios from "axios";
import { logoutUser } from "../utils/logoutUser";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});
const ACCESS_TOKEN_KEY = import.meta.env.VITE_ACCESS_TOKEN_KEY;
// Request Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
api.interceptors.request.use(
  (config) => {
    config.headers["X-Client-Type"] = "web";

    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);
// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshRes = await axios.post(
          "/path/api/auth/refresh",
          {},
          {
            withCredentials: true,
            headers: {
              "X-Client-Type": "web",
            },
          },
        );

        const newAccessToken =
          refreshRes.data[import.meta.env.VITE_ACCESS_TOKEN_KEY];

        if (newAccessToken) {
          localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);

          api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return api(originalRequest);
        }
      } catch (err) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        await logoutUser();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
