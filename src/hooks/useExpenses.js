import { useState, useCallback } from "react";
import api from "../config/api";

const useExpenses = () => {
  const [loading, setLoading] = useState(false);

  const getExpenses = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const res = await api.get("/api/accounts/expenses", {
        params: filters,
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
      } else if (rawData?.expenses && Array.isArray(rawData.expenses)) {
        list = rawData.expenses;
        total = rawData.total || rawData.pagination?.total || rawData.expenses.length;
      }

      return {
        success: true,
        data: list,
        total: total,
      };
    } catch (error) {
      console.error("GET expenses error:", error);
      return {
        success: false,
        message:
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to fetch expenses",
        data: [],
        total: 0,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const createExpense = async (payload) => {
    setLoading(true);
    try {
      const res = await api.post("/api/accounts/expenses", payload);
      return {
        success: true,
        message: res.data?.message || "Expense created successfully",
        data: res.data,
      };
    } catch (error) {
      console.error("POST expense error:", error);
      const errRes = error?.response?.data;
      let errMsg = "Failed to record expense";
      if (errRes) {
        if (typeof errRes === "string") {
          errMsg = errRes;
        } else if (errRes.message) {
          errMsg = Array.isArray(errRes.message) ? errRes.message.join(", ") : errRes.message;
        } else if (errRes.error) {
          errMsg = Array.isArray(errRes.error) ? errRes.error.join(", ") : errRes.error;
        }
      }
      return {
        success: false,
        message: errMsg,
      };
    } finally {
      setLoading(false);
    }
  };

  const updateExpense = async (id, payload) => {
    setLoading(true);
    try {
      const res = await api.put(`/api/accounts/expenses/${id}`, payload);
      return {
        success: true,
        message: res.data?.message || "Expense updated successfully",
        data: res.data,
      };
    } catch (error) {
      console.error("PUT expense error:", error);
      const errRes = error?.response?.data;
      let errMsg = "Failed to update expense";
      if (errRes) {
        if (typeof errRes === "string") {
          errMsg = errRes;
        } else if (errRes.message) {
          errMsg = Array.isArray(errRes.message) ? errRes.message.join(", ") : errRes.message;
        } else if (errRes.error) {
          errMsg = Array.isArray(errRes.error) ? errRes.error.join(", ") : errRes.error;
        }
      }
      return {
        success: false,
        message: errMsg,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    getExpenses,
    createExpense,
    updateExpense,
    loading,
  };
};

export default useExpenses;
