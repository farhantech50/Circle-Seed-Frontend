import { useState, useCallback } from "react";
import api from "../config/api";

const useLedger = () => {
  const [loading, setLoading] = useState(false);

  const getLedger = useCallback(async (stakeholderId) => {
    if (!stakeholderId) {
      return {
        success: false,
        message: "Stakeholder ID is required",
        data: null,
      };
    }

    setLoading(true);
    try {
      const res = await api.get("/api/accounts/ledger", {
        params: { stakeholderId },
      });

      // Expected response format:
      // {
      //   stakeholder: { id, name, stakeholderId, companyName },
      //   summary: { totalReceivable, totalReceived, outstandingReceivable, totalPayable, totalPaid, outstandingPayable, netBalance, netBalanceLabel },
      //   transactions: [ { type, direction, reference, amount, date } ]
      // }
      const data = res.data;

      return {
        success: true,
        data: data || null,
      };
    } catch (error) {
      console.error("GET ledger error:", error);
      return {
        success: false,
        message:
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to fetch ledger data",
        data: null,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const getCommissions = useCallback(async (stakeholderId) => {
    try {
      const params = stakeholderId ? { stakeholderId } : {};
      const res = await api.get("/api/accounts/commissions", { params });
      let list = [];
      if (Array.isArray(res.data)) {
        list = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        list = res.data.data;
      }
      return { success: true, data: list };
    } catch (error) {
      console.error("GET /api/accounts/commissions error:", error);
      return {
        success: false,
        message:
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to fetch commissions",
        data: [],
      };
    }
  }, []);

  const adjustCommission = useCallback(async (commissionIds) => {
    try {
      const payload = {
        commissionIds: Array.isArray(commissionIds) ? commissionIds : [commissionIds],
      };
      const res = await api.patch("/api/accounts/commissions/adjust", payload);
      return {
        success: true,
        message: res.data?.message || "Commission adjusted successfully",
        data: res.data,
      };
    } catch (error) {
      console.error("PATCH /api/accounts/commissions/adjust error:", error);
      return {
        success: false,
        message:
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to adjust commission",
      };
    }
  }, []);

  return {
    getLedger,
    getCommissions,
    adjustCommission,
    loading,
  };
};

export default useLedger;
