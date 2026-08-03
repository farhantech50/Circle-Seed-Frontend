import { useState } from "react";
import { usePaginationStore } from "../store/paginationStore";
import api from "../config/api";

const usePermission = () => {
  const [loading, setLoading] = useState(false);
  const getRoles = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/lookup/values/role");
      setLoading(false);
      return {
        success: true,
        data: res.data || [],
      };
    } catch (error) {
      setLoading(false);
      console.error("GET roles error:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Failed to fetch roles",
      };
    }
  };
  const getAllPermissions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/permissions");
      setLoading(false);
      return {
        success: true,
        data: res.data || [],
      };
    } catch (error) {
      setLoading(false);
      console.error("GET all permissions error:", error);
      return {
        success: false,
        message:
          error?.response?.data?.message || "Failed to fetch permissions",
      };
    }
  };
  const getPermissionsByRole = async (roleId) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/permissions/role/${roleId}`);
      setLoading(false);
      return {
        success: true,
        data: res.data || [],
      };
    } catch (error) {
      setLoading(false);
      console.error("GET permissions by role error:", error);
      return {
        success: false,
        message:
          error?.response?.data?.message || "Failed to fetch permissions",
      };
    }
  };
  const deletePermissionForRole = async (roleId, permissionId) => {
    setLoading(true);
    try {
      const res = await api.delete(`/api/permissions/role`, {
        data: { roleId, permissionId },
      });
      setLoading(false);
      return {
        success: true,
        message: res.data?.message || "Permission removed",
      };
    } catch (error) {
      setLoading(false);
      console.error("DELETE role permission error:", error);
      return {
        success: false,
        message: error?.response?.data?.error || "Failed to remove permission",
      };
    }
  };
  const setRolePermissions = async ({ role, permissionIds }) => {
    setLoading(true);
    try {
      const res = await api.put(`/api/permissions/role/${role}`, {
        permissionIds,
      });
      setLoading(false);
      return {
        success: true,
        message: res.data?.message || "Permissions updated",
      };
    } catch (error) {
      setLoading(false);
      console.error("PUT permissions by role error:", error);
      return {
        success: false,
        message: error?.response?.data?.error || "Failed to update permissions",
      };
    }
  };
  return {
    getRoles,
    getPermissionsByRole,
    deletePermissionForRole,
    getAllPermissions,
    setRolePermissions,
    loading,
  };
};

export default usePermission;
