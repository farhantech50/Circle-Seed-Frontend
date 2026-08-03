import { useState } from "react";
import api from "../config/api";

const useInventoryAdjustment = () => {
  const [loading, setLoading] = useState(false);

  const getAdjustments = async (params = {}) => {
    setLoading(true);
    try {
      const response = await api.get("/api/inventory/adjustments", { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.error("GET adjustments error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch adjustments",
      };
    } finally {
      setLoading(false);
    }
  };

  const createAdjustment = async (payload) => {
    setLoading(true);
    try {
      const response = await api.post("/api/inventory/adjustments", payload);
      return { success: true, message: response.data?.message || "Adjustment created successfully" };
    } catch (error) {
      console.error("POST adjustment error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create adjustment",
      };
    } finally {
      setLoading(false);
    }
  };

  const updateAdjustment = async (id, payload) => {
    setLoading(true);
    try {
      const response = await api.patch(`/api/inventory/adjustments/${id}`, payload);
      return { success: true, message: response.data?.message || "Adjustment updated successfully" };
    } catch (error) {
      console.error("PATCH adjustment error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update adjustment",
      };
    } finally {
      setLoading(false);
    }
  };

  const deleteAdjustment = async (id) => {
    setLoading(true);
    try {
      const response = await api.delete(`/api/inventory/adjustments/${id}`);
      return { success: true, message: response.data?.message || "Adjustment deleted successfully" };
    } catch (error) {
      console.error("DELETE adjustment error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete adjustment",
      };
    } finally {
      setLoading(false);
    }
  };

  const getBatchIds = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/inventory/batchIds");
      return { success: true, data: response.data };
    } catch (error) {
      console.error("GET batch ids error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch batch ids",
      };
    } finally {
      setLoading(false);
    }
  };

  const getPackagedIds = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/inventory/packaged");
      return { success: true, data: response.data };
    } catch (error) {
      console.error("GET packaged ids error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch packaged ids",
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getAdjustments,
    createAdjustment,
    updateAdjustment,
    deleteAdjustment,
    getBatchIds,
    getPackagedIds,
  };
};

export default useInventoryAdjustment;
