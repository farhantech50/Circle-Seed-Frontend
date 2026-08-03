import { useState } from "react";
import api from "../config/api";
import { usePaginationStore } from "../store/paginationStore";

const usePayroll = () => {
  const [loading, setLoading] = useState(false);
  const { page, limit, search } = usePaginationStore();
  const getPayroll = async (filters) => {
    setLoading(true);
    try {
      const res = await api.get("/api/payroll", {
        params: filters,
        page,
        limit,
        search,
      });
      setLoading(false);
      return {
        success: true,
        data: res.data?.data || res.data || [],
        total: res.data?.total || res.data?.length || 0,
      };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch payroll",
      };
    }
  };

  const generatePayroll = async (payload) => {
    setLoading(true);
    try {
      const res = await api.post("/api/payroll/", payload);
      setLoading(false);
      return {
        success: true,
        message: res.data?.message || "Payroll generated successfully",
      };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to generate payroll",
      };
    }
  };

  const getPayslips = async (userId) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/payroll/?userId=${userId}`);
      setLoading(false);
      return {
        success: true,
        data: res.data?.data || res.data || [],
        total: res.data?.total || res.data?.length || 0,
      };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch payslips",
      };
    }
  };

  const getPendingApprovals = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/payroll/pending-approvals");
      setLoading(false);
      return {
        success: true,
        data: res.data?.data || res.data || [],
        total: res.data?.total || res.data?.length || 0,
      };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch pending approvals",
      };
    }
  };

  const makePayrollDecision = async (id, payload) => {
    setLoading(true);
    try {
      const res = await api.patch(`/api/payroll/${id}/decision`, payload);
      setLoading(false);
      return {
        success: true,
        message: res.data?.message || "Decision submitted successfully",
      };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to submit decision",
      };
    }
  };

  return {
    getPayroll,
    generatePayroll,
    getPayslips,
    getPendingApprovals,
    makePayrollDecision,
    loading,
  };
};

export default usePayroll;
