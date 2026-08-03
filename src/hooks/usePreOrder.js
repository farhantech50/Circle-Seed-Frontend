import { useState } from "react";
import api from "../config/api";
import { usePaginationStore } from "../store/paginationStore";

const usePreOrder = () => {
  const [loading, setLoading] = useState(false);
  const { page, limit, search } = usePaginationStore();

  const getPreOrders = async (filters = {}) => {
    setLoading(true);
    try {
      const res = await api.get("/api/procurement", {
        params: {
          page: page,
          limit: limit,
          search: search,
          ...filters
        },
      });
      setLoading(false);

      return {
        success: true,
        data: res.data || [],
      };
    } catch (error) {
      setLoading(false);
      console.error("GET pre-orders error:", error);
      return {
        success: false,
        message: error?.response?.data?.error || "Failed to fetch pre-orders",
        data: page && limit ? { data: [], total: 0, page: 1, totalPages: 0 } : [],
      };
    }
  };

  const createPreOrder = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post("/api/procurement", formData);
      setLoading(false);
      return {
        success: true,
        message: "Pre-order created successfully",
        data: res.data,
      };
    } catch (error) {
      setLoading(false);
      console.error("POST pre-order error:", error);
      return {
        success: false,
        message: error?.response?.data?.error || "Failed to create pre-order",
      };
    }
  };

  const updatePreOrder = async (id, formData) => {
    setLoading(true);
    try {
      const res = await api.put(`/api/procurement/${id}`, formData);
      setLoading(false);
      return {
        success: true,
        message: "Pre-order updated successfully",
        data: res.data,
      };
    } catch (error) {
      setLoading(false);
      console.error("PUT pre-order error:", error);
      return {
        success: false,
        message: error?.response?.data?.error || "Failed to update pre-order",
      };
    }
  };

  const deletePreOrder = async (id) => {
    setLoading(true);
    try {
      const res = await api.delete(`/api/procurement/${id}`);
      setLoading(false);
      return {
        success: true,
        message: res.data?.message || "Pre-order deleted successfully",
      };
    } catch (error) {
      setLoading(false);
      console.error("DELETE pre-order error:", error);
      return {
        success: false,
        message: error?.response?.data?.error || "Failed to delete pre-order",
      };
    }
  };

  return {
    getPreOrders,
    createPreOrder,
    updatePreOrder,
    deletePreOrder,
    loading,
  };
};

export default usePreOrder;
