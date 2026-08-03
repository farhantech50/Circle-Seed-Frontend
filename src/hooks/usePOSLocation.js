import { useState, useCallback } from "react";
import api from "../config/api";

const usePOSLocation = () => {
  const [loading, setLoading] = useState(false);

  // Fetch all POS locations
  const getPOSLocations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/pos/");
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      return { success: true, data };
    } catch (error) {
      console.error("GET POS locations error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch POS locations",
        data: [],
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new POS location
  const createPOSLocation = async (payload) => {
    setLoading(true);
    try {
      const response = await api.post("/api/pos/", payload);
      return {
        success: true,
        message: response.data?.message || "POS location created successfully",
        data: response.data?.data || response.data,
      };
    } catch (error) {
      console.error("POST POS location error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create POS location",
      };
    } finally {
      setLoading(false);
    }
  };

  // Update existing POS location
  const updatePOSLocation = async (id, payload) => {
    setLoading(true);
    try {
      let response;
      try {
        response = await api.patch(`/api/pos/${id}`, payload);
      } catch (err) {
        response = await api.put(`/api/pos/${id}`, payload);
      }
      return {
        success: true,
        message: response.data?.message || "POS location updated successfully",
        data: response.data?.data || response.data,
      };
    } catch (error) {
      console.error("UPDATE POS location error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update POS location",
      };
    } finally {
      setLoading(false);
    }
  };

  // Delete POS location
  const deletePOSLocation = async (id) => {
    setLoading(true);
    try {
      const response = await api.delete(`/api/pos/${id}`);
      return {
        success: true,
        message: response.data?.message || "POS location deleted successfully",
      };
    } catch (error) {
      console.error("DELETE POS location error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete POS location",
      };
    } finally {
      setLoading(false);
    }
  };

  // Assign user to POS location
  const assignPOSUser = async (payload) => {
    setLoading(true);
    try {
      const response = await api.post("/api/pos/assign", payload);
      return {
        success: true,
        message: response.data?.message || "User assigned successfully",
        data: response.data?.data || response.data,
      };
    } catch (error) {
      console.error("Assign POS user error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to assign user",
      };
    } finally {
      setLoading(false);
    }
  };

  // Unassign user from POS location
  const unassignPOSUser = async (payload) => {
    setLoading(true);
    try {
      const response = await api.post("/api/pos/unassign", payload);
      return {
        success: true,
        message: response.data?.message || "User unassigned successfully",
        data: response.data?.data || response.data,
      };
    } catch (error) {
      console.error("Unassign POS user error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to unassign user",
      };
    } finally {
      setLoading(false);
    }
  };

  // Fetch my assigned POS locations
  const getMyPOSLocations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/pos/my-locations");
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      return { success: true, data };
    } catch (error) {
      console.error("GET my POS locations error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch assigned POS locations",
        data: [],
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    getPOSLocations,
    createPOSLocation,
    updatePOSLocation,
    deletePOSLocation,
    assignPOSUser,
    unassignPOSUser,
    getMyPOSLocations,
  };
};

export default usePOSLocation;
