import { useState, useCallback } from "react";
import api from "../config/api";
import { usePaginationStore } from "../store/paginationStore";

const useFollowUp = () => {
  const [loading, setLoading] = useState(false);
  const { page, limit, search } = usePaginationStore();

  const getFollowUps = useCallback(
    async (filters = {}) => {
      setLoading(true);
      try {
        const res = await api.get("/api/followup/follow-ups", {
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
        } else if (rawData?.followUps && Array.isArray(rawData.followUps)) {
          list = rawData.followUps;
          total = rawData.total || rawData.pagination?.total || rawData.followUps.length;
        }

        return {
          success: true,
          data: list,
          total: total,
        };
      } catch (error) {
        console.error("GET follow-ups error:", error);
        return {
          success: false,
          message:
            error?.response?.data?.error ||
            error?.response?.data?.message ||
            "Failed to fetch follow-ups",
          data: [],
          total: 0,
        };
      } finally {
        setLoading(false);
      }
    },
    [page, limit, search]
  );

  const createFollowUp = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post("/api/followup/follow-ups", formData);
      return {
        success: true,
        message: res.data?.message || "Follow-up recorded successfully",
        data: res.data,
      };
    } catch (error) {
      console.error("POST follow-up error:", error);
      return {
        success: false,
        message:
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to record follow-up",
      };
    } finally {
      setLoading(false);
    }
  };

  const updateFollowUp = async (id, formData) => {
    setLoading(true);
    try {
      const res = await api.put(`/api/followup/follow-ups/${id}`, formData);
      return {
        success: true,
        message: res.data?.message || "Follow-up updated successfully",
        data: res.data,
      };
    } catch (error) {
      console.error("PUT follow-up error:", error);
      return {
        success: false,
        message:
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to update follow-up",
      };
    } finally {
      setLoading(false);
    }
  };

  const deleteFollowUp = async (id) => {
    setLoading(true);
    try {
      const res = await api.delete(`/api/followup/follow-ups/${id}`);
      return {
        success: true,
        message: res.data?.message || "Follow-up deleted successfully",
      };
    } catch (error) {
      console.error("DELETE follow-up error:", error);
      return {
        success: false,
        message:
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to delete follow-up",
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    getFollowUps,
    createFollowUp,
    updateFollowUp,
    deleteFollowUp,
    loading,
  };
};

export default useFollowUp;
