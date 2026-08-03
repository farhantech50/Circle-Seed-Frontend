import { useState } from "react";
import api from "../config/api";

const useWeekend = () => {
  const [loading, setLoading] = useState(false);
  
  const getWeekends = async (filters = {}) => {
    setLoading(true);

    try {
      const res = await api.get("/api/weekend", {
        params: {
          id: filters.id,
        },
      });

      setLoading(false);

      return {
        success: true,
        data: res.data || [],
      };
    } catch (error) {
      setLoading(false);
      console.error("GET weekends error:", error);

      return {
        success: false,
        message: error?.response?.data?.message || "Failed to fetch weekends",
        data: [],
      };
    }
  };

  const createWeekend = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post("/api/weekend", formData);
      setLoading(false);
      return {
        success: true,
        message: "Weekend created successfully",
        data: res.data,
      };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error?.response?.data?.error || "Failed to create weekend",
      };
    }
  };

  const updateWeekend = async (id, formData) => {
    setLoading(true);
    try {
      const res = await api.put(`/api/weekend/${id}`, formData);
      setLoading(false);
      return {
        success: true,
        message: "Weekend updated successfully",
        data: res.data,
      };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error?.response?.data?.error || "Failed to update weekend",
      };
    }
  };

  const deleteWeekend = async (id) => {
    setLoading(true);

    try {
      const res = await api.delete(`/api/weekend/${id}`);

      setLoading(false);

      return {
        success: true,
        message: res.data?.message || "Weekend deleted successfully",
      };
    } catch (error) {
      setLoading(false);
      console.error("DELETE weekend error:", error);

      return {
        success: false,
        message: error?.response?.data?.message || "Failed to delete weekend",
      };
    }
  };

  return {
    getWeekends,
    createWeekend,
    updateWeekend,
    deleteWeekend,
    loading,
  };
};

export default useWeekend;
