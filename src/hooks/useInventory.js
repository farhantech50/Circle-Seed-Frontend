import { useState } from "react";
import api from "../config/api";

const useInventory = () => {
  const [loading, setLoading] = useState(false);

  const getOverallInventory = async (filters = {}) => {
    setLoading(true);
    try {
      const response = await api.get("/api/inventory/overall", { params: filters });
      return { success: true, data: response.data };
    } catch (error) {
      console.error("GET overall inventory error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch overall inventory",
      };
    } finally {
      setLoading(false);
    }
  };

  const getBulkInventory = async (seedTypeId) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/inventory/bulk?seedTypeId=${seedTypeId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("GET bulk inventory error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch bulk inventory",
      };
    } finally {
      setLoading(false);
    }
  };

  const getPackagedInventory = async (seedTypeId) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/inventory/packaged?seedTypeId=${seedTypeId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("GET packaged inventory error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch packaged inventory",
      };
    } finally {
      setLoading(false);
    }
  };

  const createPackage = async (payload) => {
    setLoading(true);
    try {
      const response = await api.post("/api/inventory/packaged", payload);
      return { success: true, message: "Package created successfully", data: response.data };
    } catch (error) {
      console.error("POST create package error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create package",
      };
    } finally {
      setLoading(false);
    }
  };

  const getBatchIds = async (seedTypeId) => {
    setLoading(true);
    try {
      const url = seedTypeId ? `/api/inventory/batchIds?seedTypeId=${seedTypeId}` : "/api/inventory/batchIds";
      const response = await api.get(url);
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

  const updateBulkInventory = async (id, payload) => {
    setLoading(true);
    try {
      const response = await api.patch(`/api/inventory/update/bulk/${id}`, payload);
      return { success: true, message: response.data.message || "Bulk inventory updated successfully" };
    } catch (error) {
      console.error("PATCH update bulk error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update bulk inventory",
      };
    } finally {
      setLoading(false);
    }
  };

  const updatePackagedInventory = async (id, payload) => {
    setLoading(true);
    try {
      const response = await api.patch(`/api/inventory/update/packaged/${id}`, payload);
      return { success: true, message: response.data.message || "Packaged inventory updated successfully" };
    } catch (error) {
      console.error("PATCH update packaged error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update packaged inventory",
      };
    } finally {
      setLoading(false);
    }
  };

  const toggleReadyToSell = async (id) => {
    setLoading(true);
    try {
      let response;
      try {
        response = await api.patch(`/api/inventory/bulk/${id}/toggle-ready`);
      } catch (err) {
        if (err.response?.status === 405 || err.response?.status === 404) {
          response = await api.put(`/api/inventory/bulk/${id}/toggle-ready`);
        } else {
          throw err;
        }
      }
      setLoading(false);
      return {
        success: true,
        message: response.data?.message || "Status updated successfully",
        data: response.data,
      };
    } catch (error) {
      setLoading(false);
      console.error("Toggle ready to sell error:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.response?.data?.error || "Failed to update status",
      };
    }
  };

  const togglePackagedReadyToSell = async (id) => {
    setLoading(true);
    try {
      let response;
      try {
        response = await api.patch(`/api/inventory/packaged/${id}/toggle-ready`);
      } catch (err) {
        if (err.response?.status === 405 || err.response?.status === 404) {
          response = await api.put(`/api/inventory/packaged/${id}/toggle-ready`);
        } else {
          throw err;
        }
      }
      setLoading(false);
      return {
        success: true,
        message: response.data?.message || "Status updated successfully",
        data: response.data,
      };
    } catch (error) {
      setLoading(false);
      console.error("Toggle packaged ready to sell error:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.response?.data?.error || "Failed to update status",
      };
    }
  };

  const getBulkReadyToSellList = async (seedTypeId) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/inventory/bulk/by-seed-type/ready-to-sell-list`, {
        params: seedTypeId ? { seedTypeId } : {},
      });
      setLoading(false);
      return { success: true, data: response.data?.data || response.data || [] };
    } catch (error) {
      setLoading(false);
      console.error("GET bulk ready to sell list error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch bulk ready to sell items",
        data: [],
      };
    }
  };

  const getPackagedReadyToSellList = async (seedTypeId) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/inventory/packaged/by-seed-type/ready-to-sell-list`, {
        params: seedTypeId ? { seedTypeId } : {},
      });
      setLoading(false);
      return { success: true, data: response.data?.data || response.data || [] };
    } catch (error) {
      setLoading(false);
      console.error("GET packaged ready to sell list error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch packaged ready to sell items",
        data: [],
      };
    }
  };

  return {
    loading,
    getOverallInventory,
    getBulkInventory,
    getPackagedInventory,
    createPackage,
    getBatchIds,
    updateBulkInventory,
    updatePackagedInventory,
    toggleReadyToSell,
    togglePackagedReadyToSell,
    getBulkReadyToSellList,
    getPackagedReadyToSellList,
  };
};

export default useInventory;
