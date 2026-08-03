import { useState } from "react";
import api from "../config/api";

const useOfficeLocation = () => {
  const [loading, setLoading] = useState(false);

  const getOfficeLocations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/office-locations");
      setLoading(false);
      return { success: true, data: res.data || [] };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message:
          error?.response?.data?.error || "Failed to fetch office locations",
        data: [],
      };
    }
  };

  const createOfficeLocation = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post("/api/office-locations", formData);
      setLoading(false);
      return {
        success: true,
        message: "Office location created successfully",
        data: res.data,
      };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message:
          error?.response?.data?.error || "Failed to create office location",
      };
    }
  };

  const updateOfficeLocation = async (id, formData) => {
    setLoading(true);
    try {
      const res = await api.put(`/api/office-locations/${id}`, formData);
      setLoading(false);
      return {
        success: true,
        message: "Office location updated successfully",
        data: res.data,
      };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message:
          error?.response?.data?.error || "Failed to update office location",
      };
    }
  };

  const deleteOfficeLocation = async (id) => {
    setLoading(true);
    try {
      const res = await api.delete(`/api/office-locations/${id}`);
      setLoading(false);
      return {
        success: true,
        message: res.data?.message || "Office location deleted successfully",
      };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message:
          error?.response?.data?.error || "Failed to delete office location",
      };
    }
  };

  return {
    getOfficeLocations,
    createOfficeLocation,
    updateOfficeLocation,
    deleteOfficeLocation,
    loading,
  };
};

export default useOfficeLocation;
