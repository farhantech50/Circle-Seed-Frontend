import { useState } from "react";
import api from "../config/api";
import { usePaginationStore } from "../store/paginationStore";

const useGoodsReceived = () => {
  const [loading, setLoading] = useState(false);
  const { page, limit, search } = usePaginationStore();

  const getGoodsReceived = async (filters = {}) => {
    setLoading(true);
    try {
      // Assuming standard list endpoint convention
      const res = await api.get("/api/received", {
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
      console.error("GET goods received error:", error);
      return {
        success: false,
        message: error?.response?.data?.error || "Failed to fetch received goods",
        data:
          page && limit ? { data: [], total: 0, page: 1, totalPages: 0 } : [],
      };
    }
  };

  const getProcurements = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/procurement/list");
      setLoading(false);
      return {
        success: true,
        data: res.data || [],
      };
    } catch (error) {
      setLoading(false);
      console.error("GET procurements error:", error);
      return {
        success: false,
        message: error?.response?.data?.error || "Failed to fetch procurements",
        data: [],
      };
    }
  };

  const createGoodsReceived = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post("/api/received/", formData);
      setLoading(false);
      return {
        success: true,
        message: "Goods received created successfully",
        data: res.data,
      };
    } catch (error) {
      setLoading(false);
      console.error("POST goods received error:", error?.response?.data || error);
      const errRes = error?.response?.data;
      let errMsg = "Failed to create goods received";
      if (errRes) {
        if (typeof errRes === "string") {
          errMsg = errRes;
        } else if (errRes.message) {
          errMsg = Array.isArray(errRes.message) ? errRes.message.join(", ") : errRes.message;
        } else if (errRes.error) {
          errMsg = Array.isArray(errRes.error) ? errRes.error.join(", ") : errRes.error;
        } else if (errRes.errors) {
          errMsg = Array.isArray(errRes.errors) ? errRes.errors.join(", ") : JSON.stringify(errRes.errors);
        }
      }
      return {
        success: false,
        message: errMsg,
      };
    }
  };

  const updateGoodsReceived = async (id, formData) => {
    setLoading(true);
    try {
      const res = await api.put(`/api/received/${id}`, formData);
      setLoading(false);
      return {
        success: true,
        message: "Goods received updated successfully",
        data: res.data,
      };
    } catch (error) {
      setLoading(false);
      console.error("PUT goods received error:", error?.response?.data || error);
      const errRes = error?.response?.data;
      let errMsg = "Failed to update goods received";
      if (errRes) {
        if (typeof errRes === "string") {
          errMsg = errRes;
        } else if (errRes.message) {
          errMsg = Array.isArray(errRes.message) ? errRes.message.join(", ") : errRes.message;
        } else if (errRes.error) {
          errMsg = Array.isArray(errRes.error) ? errRes.error.join(", ") : errRes.error;
        } else if (errRes.errors) {
          errMsg = Array.isArray(errRes.errors) ? errRes.errors.join(", ") : JSON.stringify(errRes.errors);
        }
      }
      return {
        success: false,
        message: errMsg,
      };
    }
  };

  const getPendingApprovals = async (filters = {}) => {
    setLoading(true);
    try {
      const res = await api.get("/api/received/pending-approvals", {
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
      console.error("GET pending approvals error:", error);
      return {
        success: false,
        message: error?.response?.data?.error || "Failed to fetch pending approvals",
        data:
          page && limit ? { data: [], total: 0, page: 1, totalPages: 0 } : [],
      };
    }
  };

  const decideApproval = async (id, payload) => {
    setLoading(true);
    try {
      // Changed from PUT to PATCH based on standard decision endpoints
      const res = await api.patch(`/api/received/${id}/decide`, payload);
      setLoading(false);
      return {
        success: true,
        message: "Decision submitted successfully",
        data: res.data,
      };
    } catch (error) {
      setLoading(false);
      console.error("PUT decide approval error:", error);
      return {
        success: false,
        message: error?.response?.data?.error || "Failed to submit decision",
      };
    }
  };

  return {
    getGoodsReceived,
    getProcurements,
    createGoodsReceived,
    updateGoodsReceived,
    getPendingApprovals,
    decideApproval,
    loading,
  };
};

export default useGoodsReceived;
