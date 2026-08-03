import { useState } from "react";
import api from "../config/api";
import { usePaginationStore } from "../store/paginationStore";
const useSupplier = () => {
  const [loading, setLoading] = useState(false);
  const { page, limit, search } = usePaginationStore();
  const getSuppliers = async (filters = {}) => {
    setLoading(true);
    try {
      const res = await api.get("/api/stakeholders", {
        params: {
          id: filters.id,
          stakeholderTypeId: filters.stakeholderTypeId,
          typeId: filters.typeId,
          page: page,
          limit: limit,
          search: search,
        },
      });
      setLoading(false);

      return {
        success: true,
        data: res.data || [],
      };
    } catch (error) {
      setLoading(false);
      console.error("GET suppliers error:", error);
      return {
        success: false,
        message: error?.response?.data?.error || "Failed to fetch suppliers",
        data:
          page && limit ? { data: [], total: 0, page: 1, totalPages: 0 } : [],
      };
    }
  };

  const createSupplier = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post("/api/stakeholders", formData);
      setLoading(false);
      return {
        success: true,
        message: "Supplier created successfully",
        data: res.data,
      };
    } catch (error) {
      setLoading(false);
      console.error("POST supplier error:", error);
      return {
        success: false,
        message: error?.response?.data?.error || "Failed to create supplier",
      };
    }
  };

  const updateSupplier = async (id, formData) => {
    setLoading(true);
    try {
      const res = await api.put(`/api/stakeholders/${id}`, formData);
      setLoading(false);
      return {
        success: true,
        message: "Supplier updated successfully",
        data: res.data,
      };
    } catch (error) {
      setLoading(false);
      console.error("PUT supplier error:", error);
      return {
        success: false,
        message: error?.response?.data?.error || "Failed to update supplier",
      };
    }
  };

  const deleteSupplier = async (id) => {
    setLoading(true);
    try {
      const res = await api.delete(`/api/stakeholders/${id}`);
      setLoading(false);
      return {
        success: true,
        message: res.data?.message || "Supplier deleted successfully",
      };
    } catch (error) {
      setLoading(false);
      console.error("DELETE supplier error:", error);
      return {
        success: false,
        message: error?.response?.data?.error || "Failed to delete supplier",
      };
    }
  };

  return {
    getSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    loading,
  };
};

export default useSupplier;
