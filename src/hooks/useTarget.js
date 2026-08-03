import { useState } from "react";
import api from "../config/api";

const useTarget = () => {
  const [loading, setLoading] = useState(false);

  // Helper to safely extract list from API response
  const extractData = (res) => {
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data?.data)) return res.data.data;
    return [];
  };

  // --- Sales Targets ---
  const getSalesTargets = async (filters = {}) => {
    setLoading(true);
    try {
      const res = await api.get("/api/targets/sales", {
        params: {
          userId: filters.userId || undefined,
          month: filters.month || undefined,
          year: filters.year || undefined,
        },
      });
      setLoading(false);
      return {
        success: true,
        data: extractData(res),
      };
    } catch (error) {
      setLoading(false);
      console.error("GET sales targets error:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Failed to fetch sales targets",
        data: [],
      };
    }
  };

  const createSalesTarget = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post("/api/targets/sales", formData);
      setLoading(false);
      return {
        success: true,
        message: res.data?.message || "Sales target created successfully",
        data: res.data,
      };
    } catch (error) {
      setLoading(false);
      console.error("POST sales target error:", error);
      return {
        success: false,
        message: error?.response?.data?.message || error?.response?.data?.error || "Failed to create sales target",
      };
    }
  };

  const updateSalesTarget = async (id, formData) => {
    setLoading(true);
    try {
      const res = await api.put(`/api/targets/sales/${id}`, formData);
      setLoading(false);
      return {
        success: true,
        message: res.data?.message || "Sales target updated successfully",
        data: res.data,
      };
    } catch (error) {
      setLoading(false);
      console.error("PUT sales target error:", error);
      return {
        success: false,
        message: error?.response?.data?.message || error?.response?.data?.error || "Failed to update sales target",
      };
    }
  };

  const deleteSalesTarget = async (id) => {
    setLoading(true);
    try {
      const res = await api.delete(`/api/targets/sales/${id}`);
      setLoading(false);
      return {
        success: true,
        message: res.data?.message || "Sales target deleted successfully",
      };
    } catch (error) {
      setLoading(false);
      console.error("DELETE sales target error:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Failed to delete sales target",
      };
    }
  };

  // --- Marketing Targets ---
  const getMarketingTargets = async (filters = {}) => {
    setLoading(true);
    try {
      const res = await api.get("/api/targets/marketing", {
        params: {
          userId: filters.userId || undefined,
          month: filters.month || undefined,
          year: filters.year || undefined,
        },
      });
      setLoading(false);
      return {
        success: true,
        data: extractData(res),
      };
    } catch (error) {
      setLoading(false);
      console.error("GET marketing targets error:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Failed to fetch marketing targets",
        data: [],
      };
    }
  };

  const createMarketingTarget = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post("/api/targets/marketing", formData);
      setLoading(false);
      return {
        success: true,
        message: res.data?.message || "Marketing target created successfully",
        data: res.data,
      };
    } catch (error) {
      setLoading(false);
      console.error("POST marketing target error:", error);
      return {
        success: false,
        message: error?.response?.data?.message || error?.response?.data?.error || "Failed to create marketing target",
      };
    }
  };

  const updateMarketingTarget = async (id, formData) => {
    setLoading(true);
    try {
      const res = await api.put(`/api/targets/marketing/${id}`, formData);
      setLoading(false);
      return {
        success: true,
        message: res.data?.message || "Marketing target updated successfully",
        data: res.data,
      };
    } catch (error) {
      setLoading(false);
      console.error("PUT marketing target error:", error);
      return {
        success: false,
        message: error?.response?.data?.message || error?.response?.data?.error || "Failed to update marketing target",
      };
    }
  };

  const deleteMarketingTarget = async (id) => {
    setLoading(true);
    try {
      const res = await api.delete(`/api/targets/marketing/${id}`);
      setLoading(false);
      return {
        success: true,
        message: res.data?.message || "Marketing target deleted successfully",
      };
    } catch (error) {
      setLoading(false);
      console.error("DELETE marketing target error:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Failed to delete marketing target",
      };
    }
  };

  return {
    loading,
    getSalesTargets,
    createSalesTarget,
    updateSalesTarget,
    deleteSalesTarget,
    getMarketingTargets,
    createMarketingTarget,
    updateMarketingTarget,
    deleteMarketingTarget,
  };
};

export default useTarget;
