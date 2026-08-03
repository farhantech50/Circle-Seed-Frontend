import { useState } from "react";
import api from "../config/api";

const useLeaveQuota = () => {
  const [loading, setLoading] = useState(false);

  const getLeaveQuotas = async (filters = {}) => {
    setLoading(true);

    try {
      const res = await api.get("/api/leave-requests/leave-quota", {
        params: {
          userId: filters.userId,
          year: filters.year,
        },
      });

      setLoading(false);

      return {
        success: true,
        data: res.data || [],
      };
    } catch (error) {
      setLoading(false);
      console.error("GET leave quotas error:", error);

      return {
        success: false,
        message: error?.response?.data?.message || "Failed to fetch leave quotas",
        data: [],
      };
    }
  };

  const createLeaveQuota = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post("/api/leave-requests/leave-quota", formData);
      setLoading(false);
      return {
        success: true,
        message: "Leave quota created successfully",
        data: res.data,
      };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error?.response?.data?.error || "Failed to create leave quota",
      };
    }
  };

  const updateLeaveQuota = async (id, formData) => {
    setLoading(true);
    try {
      const res = await api.put(`/api/leave-requests/leave-quota/${id}`, formData);
      setLoading(false);
      return {
        success: true,
        message: "Leave quota updated successfully",
        data: res.data,
      };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error?.response?.data?.error || "Failed to update leave quota",
      };
    }
  };

  const deleteLeaveQuota = async (id) => {
    setLoading(true);

    try {
      const res = await api.delete(`/api/leave-requests/leave-quota/${id}`);

      setLoading(false);

      return {
        success: true,
        message: res.data?.message || "Leave quota deleted successfully",
      };
    } catch (error) {
      setLoading(false);
      console.error("DELETE leave quota error:", error);

      return {
        success: false,
        message: error?.response?.data?.message || "Failed to delete leave quota",
      };
    }
  };

  return {
    getLeaveQuotas,
    createLeaveQuota,
    updateLeaveQuota,
    deleteLeaveQuota,
    loading,
  };
};

export default useLeaveQuota;
