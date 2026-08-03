import { useState } from "react";
import api from "../config/api";

const usePasswordReset = () => {
  const [loading, setLoading] = useState(false);

  const forgotPassword = async (email) => {
    setLoading(true);
    try {
      const res = await api.post("/api/auth/forgot-password", { email });
      return {
        success: true,
        message: res.data?.message || "Password reset link sent to your email",
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to send reset link",
      };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    setLoading(true);
    try {
      const res = await api.post("/api/auth/reset-password", {
        token,
        newPassword,
      });
      return {
        success: true,
        message: res.data?.message || "Password has been reset successfully",
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to reset password",
      };
    } finally {
      setLoading(false);
    }
  };
  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    try {
      const res = await api.patch("/api/auth/change-password", {
        currentPassword,
        newPassword,
      });
      return {
        success: true,
        message: res.data?.message || "Password has been changed successfully",
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to change password",
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    forgotPassword,
    resetPassword,
    changePassword,
    loading,
  };
};

export default usePasswordReset;
