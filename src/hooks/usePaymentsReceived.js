import { useState, useCallback } from "react";
import api from "../config/api";

const usePaymentsReceived = () => {
  const [loading, setLoading] = useState(false);

  const getPaymentsReceived = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const res = await api.get("/api/accounts/payments-received", {
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
      console.error("GET payments-received error:", error);
      return {
        success: false,
        message:
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to fetch payments received",
        data: [],
        total: 0,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getPaymentsReceived,
    loading,
  };
};

export default usePaymentsReceived;
