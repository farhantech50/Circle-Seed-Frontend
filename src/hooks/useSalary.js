import { useState } from "react";
import api from "../config/api";
import { usePaginationStore } from "../store/paginationStore";

const useSalary = () => {
  const [loading, setLoading] = useState(false);
  const { page, limit, search } = usePaginationStore();
  const getSalaryStructures = async (filters = {}) => {
    setLoading(true);

    try {
      const res = await api.get("/api/payroll/get-salary-structure", {
        params: {
          page,
          limit,
          search,
          id: filters.id,
          userId: filters.userId,
        },
      });

      setLoading(false);

      return {
        success: true,
        data: res.data || [],
      };
    } catch (error) {
      setLoading(false);
      console.error("GET salary structures error:", error);

      return {
        success: false,
        message:
          error?.response?.data?.message || "Failed to fetch salary structures",
        data: [],
      };
    }
  };

  const createSalaryStructure = async (formData) => {
    setLoading(true);

    try {
      const res = await api.post(
        "/api/payroll/create-salary-structure",
        formData,
      );

      setLoading(false);

      return {
        success: true,
        message: res.data?.message || "Salary structure created successfully",
        data: res.data,
      };
    } catch (error) {
      setLoading(false);

      return {
        success: false,
        message:
          error?.response?.data?.error || "Failed to create salary structure",
      };
    }
  };

  const updateSalaryStructure = async (id, formData) => {
    setLoading(true);

    try {
      const res = await api.put(
        `/api/payroll/update-salary-structure/${id}`,
        formData,
      );

      setLoading(false);

      return {
        success: true,
        message: res.data?.message || "Salary structure updated successfully",
        data: res.data,
      };
    } catch (error) {
      setLoading(false);

      return {
        success: false,
        message:
          error?.response?.data?.error || "Failed to update salary structure",
      };
    }
  };

  const deleteSalaryStructure = async (id) => {
    setLoading(true);

    try {
      const res = await api.delete(
        `/api/payroll/delete-salary-structure/${id}`,
      );

      setLoading(false);

      return {
        success: true,
        message: res.data?.message || "Salary structure deleted successfully",
      };
    } catch (error) {
      setLoading(false);
      console.error("DELETE salary structure error:", error);

      return {
        success: false,
        message:
          error?.response?.data?.message || "Failed to delete salary structure",
      };
    }
  };

  return {
    getSalaryStructures,
    createSalaryStructure,
    updateSalaryStructure,
    deleteSalaryStructure,
    loading,
  };
};

export default useSalary;
