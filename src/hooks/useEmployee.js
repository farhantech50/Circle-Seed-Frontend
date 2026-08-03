import { useState, useCallback } from "react";
import { usePaginationStore } from "../store/paginationStore";
import api from "../config/api";

const useEmployee = () => {
  const { page, limit, search } = usePaginationStore();
  const [loading, setLoading] = useState(false);

  const getEmployees = useCallback(
    async (isPaginate, roleIdArr) => {
      setLoading(true);
      try {
        const res = await api.get("/api/employees", {
          params: isPaginate
            ? { roleId: roleIdArr?.join(","), search, page, limit }
            : undefined,
        });

        setLoading(false);

        if (isPaginate) {
          return {
            success: true,
            data: res.data?.data || [],
            total: res.data?.total || 0,
            totalPages: res.data?.totalPages || 1,
          };
        }

        return {
          success: true,
          data: res.data || [],
        };
      } catch (error) {
        setLoading(false);
        console.error("GET employees error:", error);

        return {
          success: false,
          message: error?.response?.data?.message || "Failed to fetch employees",
          data: [],
          ...(isPaginate && { total: 0, totalPages: 1 }),
        };
      }
    },
    [page, limit, search]
  );

  const getEmployeeById = async (id) => {
    try {
      const res = await api.get(`/api/employees/`, {
        params: { id },
      });
      return {
        success: true,
        data: Array.isArray(res.data?.data)
          ? res.data.data[0]
          : res.data?.data || res.data,
      };
    } catch (error) {
      console.error("GET employee by id error:", error);
      return {
        success: false,
        message:
          error?.response?.data?.message || "Failed to fetch employee details",
      };
    }
  };

  const createEmployee = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post("/api/employees/", formData);
      setLoading(false);
      return {
        success: true,
        message: res.data?.message || "Employee created successfully",
        data: res.data,
      };
    } catch (error) {
      setLoading(false);
      console.error("POST employee error:", error);
      const data = error?.response?.data;
      const status = error?.response?.status;
      const message =
        data?.error ||
        data?.message ||
        (typeof data === "string" && data.length < 200 ? data : "") ||
        `Server Error (${status || 500}): Failed to create employee. Please check backend parameters or logs.`;

      return {
        success: false,
        message,
        errors: data?.errors || data?.details || (typeof data === "object" ? data : null),
      };
    }
  };

  const updateEmployee = async (id, formData) => {
    setLoading(true);
    try {
      const res = await api.put(`/api/employees/${id}`, formData);
      setLoading(false);
      return {
        success: true,
        message: res.data?.message || "Employee updated successfully",
        data: res.data,
      };
    } catch (error) {
      setLoading(false);
      console.error("PUT employee error:", error);
      const data = error?.response?.data;
      const status = error?.response?.status;
      const message =
        data?.error ||
        data?.message ||
        (typeof data === "string" && data.length < 200 ? data : "") ||
        `Server Error (${status || 500}): Failed to update employee. Please check backend parameters or logs.`;

      return {
        success: false,
        message,
        errors: data?.errors || data?.details || (typeof data === "object" ? data : null),
      };
    }
  };

  const deleteEmployee = async (id) => {
    setLoading(true);
    try {
      const res = await api.delete(`/api/employees/${id}`);
      setLoading(false);
      return {
        success: true,
        message: res.data?.message || "Employee deleted successfully",
      };
    } catch (error) {
      setLoading(false);
      console.error("DELETE employee error:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Failed to delete employee",
      };
    }
  };

  return {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    loading,
  };
};

export default useEmployee;
