import { useState, useCallback } from "react";
import api from "../config/api";

const useVisit = () => {
  const [loading, setLoading] = useState(false);

  const getVisits = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const res = await api.get("/api/visit", {
        params: {
          page: filters.page,
          limit: filters.limit,
          search: filters.search || undefined,
          typeId: filters.typeId || undefined,
          assignedToId: filters.assignedToId || undefined,
          leadId: filters.leadId || undefined,
          stakeholderId: filters.stakeholderId || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
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
      } else if (rawData?.visits && Array.isArray(rawData.visits)) {
        list = rawData.visits;
        total = rawData.total || rawData.pagination?.total || rawData.visits.length;
      }

      return {
        success: true,
        data: list,
        total: total,
      };
    } catch (error) {
      console.error("GET visits error:", error);
      return {
        success: false,
        message:
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to fetch visits",
        data: [],
        total: 0,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const getVisitById = useCallback(async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/visit/${id}`);
      return {
        success: true,
        data: res.data?.data || res.data,
      };
    } catch (error) {
      console.error("GET visit by id error:", error);
      return {
        success: false,
        message:
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to fetch visit details",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const createVisit = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post("/api/visit", formData);
      return {
        success: true,
        message: res.data?.message || "Visit assigned successfully",
        data: res.data,
      };
    } catch (error) {
      console.error("POST visit error:", error);
      return {
        success: false,
        message:
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to assign visit",
      };
    } finally {
      setLoading(false);
    }
  };

  const updateVisit = async (id, formData) => {
    setLoading(true);
    try {
      const res = await api.put(`/api/visit/${id}`, formData);
      return {
        success: true,
        message: res.data?.message || "Visit updated successfully",
        data: res.data,
      };
    } catch (error) {
      console.error("PUT visit error:", error);
      return {
        success: false,
        message:
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to update visit",
      };
    } finally {
      setLoading(false);
    }
  };

  const cancelVisit = async (id) => {
    setLoading(true);
    try {
      let res;
      try {
        res = await api.put(`/api/visit/${id}/cancel`);
      } catch (err1) {
        if (err1?.response?.status === 404 || err1?.response?.status === 405) {
          try {
            res = await api.patch(`/api/visit/${id}/cancel`);
          } catch (err2) {
            if (err2?.response?.status === 404 || err2?.response?.status === 405) {
              try {
                res = await api.post(`/api/visit/${id}/cancel`);
              } catch (err3) {
                if (err3?.response?.status === 404 || err3?.response?.status === 405) {
                  try {
                    res = await api.put(`/api/visit/cancel/${id}`);
                  } catch (err4) {
                    if (err4?.response?.status === 404 || err4?.response?.status === 405) {
                      res = await api.put(`/api/visit/${id}`, {
                        status: "Cancelled",
                        statusId: 135,
                      });
                    } else {
                      throw err4;
                    }
                  }
                } else {
                  throw err3;
                }
              }
            } else {
              throw err2;
            }
          }
        } else {
          throw err1;
        }
      }

      return {
        success: true,
        message: res.data?.message || "Visit cancelled successfully",
        data: res.data,
      };
    } catch (error) {
      console.error("Cancel visit error:", error);
      return {
        success: false,
        message:
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to cancel visit",
      };
    } finally {
      setLoading(false);
    }
  };

  const deleteVisit = async (id) => {
    setLoading(true);
    try {
      const res = await api.delete(`/api/visit/${id}`);
      return {
        success: true,
        message: res.data?.message || "Visit deleted successfully",
      };
    } catch (error) {
      console.error("DELETE visit error:", error);
      return {
        success: false,
        message:
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to delete visit",
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    getVisits,
    getVisitById,
    createVisit,
    updateVisit,
    cancelVisit,
    deleteVisit,
    loading,
  };
};

export default useVisit;
