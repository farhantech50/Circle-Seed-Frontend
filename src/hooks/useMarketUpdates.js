import { useState, useCallback } from "react";
import api from "../config/api";
import { usePaginationStore } from "../store/paginationStore";

const useMarketUpdates = () => {
  const [loading, setLoading] = useState(false);
  const { page, limit, search } = usePaginationStore();

  const getMarketUpdates = useCallback(
    async (filters = {}) => {
      setLoading(true);
      try {
        const res = await api.get("/api/market-update/", {
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
        } else if (rawData?.marketUpdates && Array.isArray(rawData.marketUpdates)) {
          list = rawData.marketUpdates;
          total = rawData.total || rawData.pagination?.total || rawData.marketUpdates.length;
        }

        return {
          success: true,
          data: list,
          total: total,
        };
      } catch (error) {
        console.error("GET market updates error:", error);
        return {
          success: false,
          message:
            error?.response?.data?.error ||
            error?.response?.data?.message ||
            "Failed to fetch market updates",
          data: [],
          total: 0,
        };
      } finally {
        setLoading(false);
      }
    },
    [page, limit, search]
  );

  const getTrendGraph = useCallback(async (filters = {}) => {
    try {
      const res = await api.get("/api/market-update/trend-graph", {
        params: {
          ...(filters.seedTypeId ? { seedTypeId: filters.seedTypeId } : {}),
          ...(filters.regionId ? { regionId: filters.regionId } : {}),
        },
      });

      const rawData = res.data;
      let list = [];
      if (Array.isArray(rawData)) {
        list = rawData;
      } else if (rawData?.data && Array.isArray(rawData.data)) {
        list = rawData.data;
      }

      return {
        success: true,
        data: list,
      };
    } catch (error) {
      console.error("GET trend graph error:", error);
      return {
        success: false,
        message:
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to fetch market price trend graph",
        data: [],
      };
    }
  }, []);

  const createMarketUpdate = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post("/api/market-update/", formData);
      return {
        success: true,
        message: res.data?.message || "Market update created successfully",
        data: res.data,
      };
    } catch (error) {
      console.error("POST market update error:", error);
      return {
        success: false,
        message:
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to create market update",
      };
    } finally {
      setLoading(false);
    }
  };

  const updateMarketUpdate = async (id, formData) => {
    setLoading(true);
    try {
      const res = await api.put(`/api/market-update/${id}`, formData);
      return {
        success: true,
        message: res.data?.message || "Market update updated successfully",
        data: res.data,
      };
    } catch (error) {
      console.error("PUT market update error:", error);
      return {
        success: false,
        message:
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to update market update",
      };
    } finally {
      setLoading(false);
    }
  };

  const deleteMarketUpdate = async (id) => {
    setLoading(true);
    try {
      const res = await api.delete(`/api/market-update/${id}`);
      return {
        success: true,
        message: res.data?.message || "Market update deleted successfully",
      };
    } catch (error) {
      console.error("DELETE market update error:", error);
      return {
        success: false,
        message:
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to delete market update",
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    getMarketUpdates,
    getTrendGraph,
    createMarketUpdate,
    updateMarketUpdate,
    deleteMarketUpdate,
    loading,
  };
};

export default useMarketUpdates;
