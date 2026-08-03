import { useState } from "react";
import api from "../config/api";
import { useAuthStore } from "../store/authStore";
import { deviceTypeStore } from "../store/deviceTypeStore";

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const login = async ({ username, password }) => {
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/api/auth/login", {
        username,
        password,
      });
      const token = res.data[import.meta.env.VITE_ACCESS_TOKEN_KEY];
      if (!token) {
        throw new Error("Token not found");
      }
      setAccessToken(token);
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, data: err.response?.data };
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    loading,
    error,
  };
};

export default useLogin;