import { useState, useCallback } from "react";
import api from "../config/api";
import { usePaginationStore } from "../store/paginationStore";

const useLookUp = () => {
  const [loading, setLoading] = useState(false);
  const { page, limit, search } = usePaginationStore();

  const getLookups = async (filters = {}) => {
    setLoading(true);

    try {
      const res = await api.get("/api/lookup/list", {
        params: {
          page,
          limit,
          search,
          ...filters,
        },
      });

      setLoading(false);

      return {
        success: true,
        data: res.data || [],
      };
    } catch (error) {
      setLoading(false);
      console.error("GET lookups error:", error);

      return {
        success: false,
        message: error?.response?.data?.message || "Failed to fetch lookups",
        data: [],
      };
    }
  };

  const getLookup = useCallback(async (value) => {
    try {
      const res = await api.get(`/api/lookup/values/${value}`);
      if (res.status) {
        return {
          success: true,
          data: res.data,
          message: res.data.message,
        };
      }

      return {
        success: false,
        message: res.data?.message || "Something went wrong",
      };
    } catch (error) {
      console.error("GET lookup error:", error);

      return {
        success: false,
        message: error?.message || "Network error",
      };
    }
  }, []);

  const createLookup = async (formData) => {
    setLoading(true);

    try {
      // The backend expects an array of lookup objects
      const res = await api.post("/api/lookup", [formData]);

      setLoading(false);

      return {
        success: true,
        message: res.data?.message || "Lookup created successfully",
        data: res.data,
      };
    } catch (error) {
      setLoading(false);

      return {
        success: false,
        message: error?.response?.data?.error || "Failed to create lookup",
      };
    }
  };

  const updateLookup = async (id, formData) => {
    setLoading(true);

    try {
      const res = await api.put(`/api/lookup/${id}`, formData);

      setLoading(false);

      return {
        success: true,
        message: res.data?.message || "Lookup updated successfully",
        data: res.data,
      };
    } catch (error) {
      setLoading(false);

      return {
        success: false,
        message: error?.response?.data?.error || "Failed to update lookup",
      };
    }
  };

  const deleteLookup = async (id) => {
    setLoading(true);

    try {
      const res = await api.delete(`/api/lookup/${id}`);

      setLoading(false);

      return {
        success: true,
        message: res.data?.message || "Lookup deleted successfully",
      };
    } catch (error) {
      setLoading(false);
      console.error("DELETE lookup error:", error);

      return {
        success: false,
        message: error?.response?.data?.error || "Failed to delete lookup",
      };
    }
  };

  return {
    getLookups,
    getLookup,
    createLookup,
    updateLookup,
    deleteLookup,
    loading,
  };
};

export default useLookUp;
