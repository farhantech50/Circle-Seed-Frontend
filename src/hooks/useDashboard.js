import { useState, useCallback } from "react";
import api from "../config/api";

const useDashboard = () => {
  const [loading, setLoading] = useState(false);

  const getAdminDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/dashboard/admin");
      setLoading(false);
      return {
        success: true,
        data: res.data?.data || res.data || {},
      };
    } catch (error) {
      setLoading(false);
      console.error("GET admin dashboard error:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Failed to fetch admin dashboard data",
        data: null,
      };
    }
  }, []);

  const getEmployeeDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/dashboard/employee");
      setLoading(false);
      return {
        success: true,
        data: res.data?.data || res.data || {},
      };
    } catch (error) {
      setLoading(false);
      console.error("GET employee dashboard error:", error);
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          "Failed to fetch employee dashboard data",
        data: null,
      };
    }
  }, []);

  return {
    loading,
    getAdminDashboard,
    getEmployeeDashboard,
  };
};

export default useDashboard;
