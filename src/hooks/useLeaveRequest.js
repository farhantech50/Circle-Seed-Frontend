import { useState, useCallback } from "react";
import { usePaginationStore } from "../store/paginationStore";
import api from "../config/api";

const useLeaveRequest = () => {
  const { page, limit, search } = usePaginationStore();
  const [loading, setLoading] = useState(false);

  const getLeaveRequests = useCallback(async (filters = {}) => {
    setLoading(true);

    try {
      const res = await api.get("/api/leave-requests/", {
        params: {
          search,
          page,
          limit,
          ...filters,
        },
      });

      setLoading(false);

      return {
        success: true,
        data: res.data?.data || res.data || [],
        total: res.data?.total || 0,
      };
    } catch (error) {
      setLoading(false);
      console.error("GET leave requests error:", error);

      return {
        success: false,
        message: error?.response?.data?.message || "Failed to fetch leave requests",
        data: [],
      };
    }
  }, [page, limit, search]);

  const createLeaveRequest = useCallback(async (formData) => {
    setLoading(true);
    try {
      const res = await api.post("/api/leave-requests/", formData);
      setLoading(false);
      return {
        success: true,
        message: res.data?.message || "Leave request created successfully",
        data: res.data,
      };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error?.response?.data?.error || "Failed to create leave request",
      };
    }
  }, []);

  const getPendingApprovals = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const res = await api.get("/api/leave-requests/pending-approvals", {
        params: {
          search,
          page,
          limit,
          ...filters,
        },
      });
      setLoading(false);
      return {
        success: true,
        data: res.data?.data || res.data || [],
        total: res.data?.total || 0,
      };
    } catch (error) {
      setLoading(false);
      console.error("GET pending approvals error:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Failed to fetch pending approvals",
        data: [],
      };
    }
  }, [page, limit, search]);

  const makeLeaveDecision = useCallback(async (id, formData) => {
    setLoading(true);
    try {
      const res = await api.patch(`/api/leave-requests/${id}/decision`, formData);
      setLoading(false);
      return {
        success: true,
        message: res.data?.message || "Decision submitted successfully",
        data: res.data,
      };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error?.response?.data?.error || "Failed to submit decision",
      };
    }
  }, []);

  const getLeaveBalance = useCallback(async (userId) => {
    try {
      const res = await api.get("/api/leave-requests/leave-balance", {
        params: { userId },
      });
      return {
        success: true,
        data: res.data,
      };
    } catch (error) {
      console.error("GET leave balance error:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Failed to fetch leave balance",
        data: null,
      };
    }
  }, []);

  return {
    getLeaveRequests,
    createLeaveRequest,
    getPendingApprovals,
    makeLeaveDecision,
    getLeaveBalance,
    loading,
  };
};

export default useLeaveRequest;
