import { useState } from "react";
import api from "../config/api";

const useAttendance = () => {
  const [loading, setLoading] = useState(false);

  const getAttendances = async (filters = {}) => {
    setLoading(true);

    try {
      const res = await api.get("/api/attendance/by-date", {
        params: {
          id: filters.id,
          date: filters.date,
        },
      });

      setLoading(false);

      return {
        success: true,
        data: res.data || [],
      };
    } catch (error) {
      setLoading(false);
      console.error("GET attendance error:", error);

      return {
        success: false,
        message: error?.response?.data?.message || "Failed to fetch attendance",
        data: [],
      };
    }
  };

  const getAttendanceReport = async (filters = {}) => {
    setLoading(true);

    try {
      const res = await api.get("/api/attendance/report", {
        params: {
          userId: filters.userId,
          startDate: filters.startDate,
          endDate: filters.endDate,
        },
      });

      setLoading(false);

      return {
        success: true,
        data: res.data || [],
      };
    } catch (error) {
      setLoading(false);
      console.error("GET attendance report error:", error);

      return {
        success: false,
        message:
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to fetch attendance report",
        data: [],
      };
    }
  };

  const createAttendance = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post("/api/attendance", formData);
      setLoading(false);
      return {
        success: true,
        message: "Attendance created successfully",
        data: res.data,
      };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error?.response?.data?.error || "Failed to create attendance",
      };
    }
  };

  const updateAttendance = async (id, formData) => {
    setLoading(true);
    try {
      const res = await api.put(`/api/attendance/${id}`, formData);
      setLoading(false);
      return {
        success: true,
        message: "Attendance updated successfully",
        data: res.data,
      };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error?.response?.data?.error || "Failed to update attendance",
      };
    }
  };

  const deleteAttendance = async (id) => {
    setLoading(true);

    try {
      const res = await api.delete(`/api/attendance/${id}`);

      setLoading(false);

      return {
        success: true,
        message: res.data?.message || "Attendance deleted successfully",
      };
    } catch (error) {
      setLoading(false);
      console.error("DELETE attendance error:", error);

      return {
        success: false,
        message:
          error?.response?.data?.message || "Failed to delete attendance",
      };
    }
  };

  const getOvertimes = async (filters = {}) => {
    setLoading(true);
    try {
      const res = await api.get("/api/attendance/overtime", {
        params: {
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          overtimeStatusId: filters.overtimeStatusId || undefined,
        },
      });
      setLoading(false);
      return {
        success: true,
        data: res.data || [],
      };
    } catch (error) {
      setLoading(false);
      console.error("GET overtime error:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Failed to fetch overtime data",
        data: [],
      };
    }
  };

  const submitOvertimeDecision = async (id, payload) => {
    setLoading(true);
    try {
      const res = await api.patch(`/api/attendance/overtime/${id}/decision`, payload);
      setLoading(false);
      return {
        success: true,
        message: res.data?.message || "Overtime decision submitted successfully",
        data: res.data,
      };
    } catch (error) {
      setLoading(false);
      console.error("POST overtime decision error:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Failed to submit overtime decision",
      };
    }
  };

  const getAttendanceStatement = async (filters = {}) => {
    setLoading(true);
    try {
      const res = await api.get("/api/attendance/statement", {
        params: {
          userId: filters.userId || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
        },
      });
      setLoading(false);
      return {
        success: true,
        data: res.data || null,
      };
    } catch (error) {
      setLoading(false);
      console.error("GET attendance statement error:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Failed to fetch attendance statement",
      };
    }
  };

  return {
    getAttendances,
    getAttendanceReport,
    getAttendanceStatement,
    createAttendance,
    updateAttendance,
    deleteAttendance,
    getOvertimes,
    submitOvertimeDecision,
    loading,
  };
};

export default useAttendance;
