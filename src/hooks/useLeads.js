import { useState, useCallback } from "react";
import api from "../config/api";
import { usePaginationStore } from "../store/paginationStore";

const useLeads = () => {
  const [loading, setLoading] = useState(false);
  const { page, limit, search } = usePaginationStore();

  const getLeads = useCallback(
    async (filters = {}) => {
      setLoading(true);
      try {
        const res = await api.get("/api/leads", {
          params: {
            page: filters.page !== undefined ? filters.page : page,
            limit: filters.limit !== undefined ? filters.limit : limit,
            search: filters.search !== undefined ? filters.search : search,
            ...filters,
          },
        });

        const rawData = res.data;
        let list = [];
        let total = 0;

        if (Array.isArray(rawData)) {
          list = rawData;
          total = rawData.length;
        } else if (rawData?.data && Array.isArray(rawData.data)) {
          list = rawData.data;
          total = rawData.total || rawData.pagination?.total || rawData.data.length;
        } else if (rawData?.leads && Array.isArray(rawData.leads)) {
          list = rawData.leads;
          total = rawData.total || rawData.pagination?.total || rawData.leads.length;
        }

        return {
          success: true,
          data: list,
          total: total,
        };
      } catch (error) {
        console.error("GET leads error:", error);
        return {
          success: false,
          message:
            error?.response?.data?.error ||
            error?.response?.data?.message ||
            "Failed to fetch leads",
          data: [],
          total: 0,
        };
      } finally {
        setLoading(false);
      }
    },
    [page, limit, search]
  );

  const createLead = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post("/api/leads", formData);
      return {
        success: true,
        message: res.data?.message || "Lead created successfully",
        data: res.data,
      };
    } catch (error) {
      console.error("POST lead error:", error);
      return {
        success: false,
        message:
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to create lead",
      };
    } finally {
      setLoading(false);
    }
  };

  const updateLead = async (id, formData) => {
    setLoading(true);
    try {
      const res = await api.put(`/api/leads/${id}`, formData);
      return {
        success: true,
        message: res.data?.message || "Lead updated successfully",
        data: res.data,
      };
    } catch (error) {
      console.error("PUT lead error:", error);
      return {
        success: false,
        message:
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to update lead",
      };
    } finally {
      setLoading(false);
    }
  };

  const deleteLead = async (id) => {
    setLoading(true);
    try {
      const res = await api.delete(`/api/leads/${id}`);
      return {
        success: true,
        message: res.data?.message || "Lead deleted successfully",
      };
    } catch (error) {
      console.error("DELETE lead error:", error);
      return {
        success: false,
        message:
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to delete lead",
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    getLeads,
    createLead,
    updateLead,
    deleteLead,
    loading,
  };
};

export default useLeads;
