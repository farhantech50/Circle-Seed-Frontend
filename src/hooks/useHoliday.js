import { useState } from "react";
import api from "../config/api";

const useHoliday = () => {
  const [loading, setLoading] = useState(false);
  const getHolidays = async (filters = {}) => {
    setLoading(true);

    try {
      const res = await api.get("/api/holiday", {
        params: {
          id: filters.id,
          startDate: filters.startDate,
          endDate: filters.endDate,
        },
      });

      setLoading(false);

      return {
        success: true,
        data: res.data || [],
      };
    } catch (error) {
      setLoading(false);
      console.error("GET holidays error:", error);

      return {
        success: false,
        message: error?.response?.data?.message || "Failed to fetch holidays",
        data: [],
      };
    }
  };

  const createHoliday = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post("/api/holiday", formData);
      setLoading(false);
      return {
        success: true,
        message: "Holiday created successfully",
        data: res.data,
      };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error?.response?.data?.error || "Failed to create holiday",
      };
    }
  };

  const updateHoliday = async (id, formData) => {
    setLoading(true);
    try {
      const res = await api.put(`/api/holiday/${id}`, formData);
      setLoading(false);
      return {
        success: true,
        message: "Holiday updated successfully",
        data: res.data,
      };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error?.response?.data?.error || "Failed to update holiday",
      };
    }
  };

  const deleteHoliday = async (id) => {
    setLoading(true);

    try {
      const res = await api.delete(`/api/holiday/${id}`);

      setLoading(false);

      return {
        success: true,
        message: res.data?.message || "Holiday deleted successfully",
      };
    } catch (error) {
      setLoading(false);
      console.error("DELETE holiday error:", error);

      return {
        success: false,
        message: error?.response?.data?.message || "Failed to delete holiday",
      };
    }
  };

  return {
    getHolidays,
    createHoliday,
    updateHoliday,
    deleteHoliday,
    loading,
  };
};

export default useHoliday;
