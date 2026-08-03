import { useState, useCallback } from "react";
import api from "../config/api";

const useReports = () => {
  const [loading, setLoading] = useState(false);

  const getSalesReport = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      // Clean empty string params
      const params = {};
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== "" && filters[key] !== null && filters[key] !== undefined) {
          params[key] = filters[key];
        }
      });

      const res = await api.get("/api/report/sales", { params });
      setLoading(false);
      return {
        success: true,
        data: res.data?.data || res.data || {},
      };
    } catch (error) {
      setLoading(false);
      console.error("GET sales report error:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Failed to fetch sales report",
        data: null,
      };
    }
  }, []);

  const getInventoryReport = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = {};
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== "" && filters[key] !== null && filters[key] !== undefined) {
          params[key] = filters[key];
        }
      });

      const res = await api.get("/api/report/inventory", { params });
      setLoading(false);
      return {
        success: true,
        data: res.data?.data || res.data || {},
      };
    } catch (error) {
      setLoading(false);
      console.error("GET inventory report error:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Failed to fetch inventory report",
        data: null,
      };
    }
  }, []);

  const getProcurementReport = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = {};
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== "" && filters[key] !== null && filters[key] !== undefined) {
          params[key] = filters[key];
        }
      });

      const res = await api.get("/api/report/procurement", { params });
      setLoading(false);
      return {
        success: true,
        data: res.data?.data || res.data || {},
      };
    } catch (error) {
      setLoading(false);
      console.error("GET procurement report error:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Failed to fetch procurement report",
        data: null,
      };
    }
  }, []);

  const getKpiSalesReport = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = {};
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== "" && filters[key] !== null && filters[key] !== undefined) {
          params[key] = filters[key];
        }
      });

      const res = await api.get("/api/report/kpi/sales", { params });
      setLoading(false);
      return {
        success: true,
        data: res.data?.data || res.data || {},
      };
    } catch (error) {
      setLoading(false);
      console.error("GET KPI sales report error:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Failed to fetch KPI sales report",
        data: null,
      };
    }
  }, []);

  const getKpiMarketingReport = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = {};
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== "" && filters[key] !== null && filters[key] !== undefined) {
          params[key] = filters[key];
        }
      });

      const res = await api.get("/api/report/kpi/marketing", { params });
      setLoading(false);
      return {
        success: true,
        data: res.data?.data || res.data || {},
      };
    } catch (error) {
      setLoading(false);
      console.error("GET KPI marketing report error:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Failed to fetch KPI marketing report",
        data: null,
      };
    }
  }, []);

  return {
    loading,
    getSalesReport,
    getInventoryReport,
    getProcurementReport,
    getKpiSalesReport,
    getKpiMarketingReport,
  };
};

export default useReports;
