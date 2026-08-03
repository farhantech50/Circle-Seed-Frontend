import { useState, useCallback } from "react";
import api from "../config/api";

const useProcurementPayments = () => {
  const [loading, setLoading] = useState(false);

  const getProcurementPayments = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const res = await api.get("/api/accounts/payments-made", {
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
      } else if (rawData?.payments && Array.isArray(rawData.payments)) {
        list = rawData.payments;
        total = rawData.total || rawData.pagination?.total || rawData.payments.length;
      }

      return {
        success: true,
        data: list,
        total: total,
      };
    } catch (error) {
      console.error("GET payments-made error:", error);
      return {
        success: false,
        message:
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to fetch payments made",
        data: [],
        total: 0,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const getDueProcurementOrders = useCallback(async () => {
    try {
      const res = await api.get("/api/accounts/procurement-orders/due");
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
      console.error("GET due procurement orders error:", error);
      return {
        success: false,
        message:
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to fetch due procurement orders",
        data: [],
      };
    }
  }, []);

  const createProcurementPayment = async (payload) => {
    setLoading(true);
    try {
      const res = await api.post("/api/accounts/payments-made", payload);
      return {
        success: true,
        message: res.data?.message || "Payment created successfully",
        data: res.data,
      };
    } catch (error) {
      console.error("POST payments-made error:", error);
      const errRes = error?.response?.data;
      let errMsg = "Failed to record payment";
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
    getProcurementPayments,
    getDueProcurementOrders,
    createProcurementPayment,
    loading,
  };
};

export default useProcurementPayments;
