import { useState, useCallback } from "react";
import api from "../config/api";

const usePackagedSales = () => {
  const [loading, setLoading] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Submit Wholesale Packaged Sale Order
  const createPackagedOrder = async (payload) => {
    setSubmittingOrder(true);
    try {
      console.log("Submitting packaged order payload to /api/sales/create-packaged-order:", payload);
      const response = await api.post("/api/sales/create-packaged-order", payload);
      return {
        success: true,
        message: response.data?.message || "Packaged sale order created successfully",
        data: response.data?.data || response.data,
      };
    } catch (error) {
      console.error("POST create packaged order error details:", error);
      console.error("Backend error response:", error.response?.data);

      let errorMsg = "Failed to process packaged sale order";
      const resData = error.response?.data;

      if (resData) {
        if (typeof resData === "string") {
          errorMsg = resData;
        } else if (resData.message) {
          errorMsg = resData.message;
        } else if (resData.error) {
          errorMsg = resData.error;
        } else if (resData.details) {
          errorMsg = typeof resData.details === "string" ? resData.details : JSON.stringify(resData.details);
        }
      }

      return {
        success: false,
        message: errorMsg,
      };
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Fetch Packaged Sales Orders List
  const getPackagedOrders = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const cleanParams = {};
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== "" && filters[key] !== null && filters[key] !== undefined) {
          cleanParams[key] = filters[key];
        }
      });

      if (cleanParams.startDate && cleanParams.startDate.length === 10) {
        cleanParams.startDate = `${cleanParams.startDate}T00:00:00.000Z`;
      }
      if (cleanParams.endDate && cleanParams.endDate.length === 10) {
        cleanParams.endDate = `${cleanParams.endDate}T23:59:59.999Z`;
      }

      let response;
      try {
        response = await api.get("/api/sales/get-packaged-order", { params: cleanParams });
      } catch (err) {
        if (err.response?.status === 404) {
          try {
            response = await api.get("/api/sales/packaged-orders", { params: cleanParams });
          } catch (e2) {
            response = await api.get("/api/sales/get-packaged-orders", { params: cleanParams });
          }
        } else {
          throw err;
        }
      }

      const rawData = response.data;
      let list = [];
      let total = 0;

      if (Array.isArray(rawData)) {
        list = rawData;
        total = rawData.length;
      } else if (rawData?.data && Array.isArray(rawData.data)) {
        list = rawData.data;
        total = rawData.total || rawData.data.length;
      } else if (Array.isArray(rawData?.orders)) {
        list = rawData.orders;
        total = rawData.total || rawData.orders.length;
      }

      return {
        success: true,
        data: list,
        total: total,
      };
    } catch (error) {
      console.error("GET packaged orders error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch packaged sales orders",
        data: [],
        total: 0,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Packaged Inventory ready for sale
  const getPackagedReadyToSellList = useCallback(async (seedTypeId = "") => {
    setLoading(true);
    try {
      let response;
      try {
        response = await api.get("/api/inventory/packaged/by-seed-type/ready-to-sell-list", {
          params: seedTypeId ? { seedTypeId } : {},
        });
      } catch (err) {
        response = await api.get("/api/inventory/packaged", {
          params: seedTypeId ? { seedTypeId } : {},
        });
      }

      const rawData = response.data?.data || response.data || [];
      let list = [];
      if (Array.isArray(rawData)) {
        list = rawData;
      } else if (typeof rawData === "object" && rawData !== null) {
        Object.keys(rawData).forEach((key) => {
          const item = rawData[key];
          if (Array.isArray(item.packages)) {
            item.packages.forEach((pkg) => {
              list.push({
                ...pkg,
                seedTypeName: item.seedTypeName || pkg.seedTypeName,
                seedTypeId: item.seedTypeId || key,
              });
            });
          } else if (Array.isArray(item)) {
            list.push(...item);
          }
        });
      }

      return {
        success: true,
        data: list,
      };
    } catch (error) {
      console.error("GET packaged ready to sell list error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch packaged inventory items",
        data: [],
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Stakeholders / Customers
  const getStakeholders = useCallback(async () => {
    try {
      const response = await api.get("/api/stakeholders");
      const list = response.data?.data || response.data || [];
      return {
        success: true,
        data: Array.isArray(list) ? list : [],
      };
    } catch (error) {
      console.error("GET stakeholders error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch stakeholders",
        data: [],
      };
    }
  }, []);

  // Fetch Seed Types
  const getSeedTypes = useCallback(async () => {
    try {
      const response = await api.get("/api/lookup/values/seed_type");
      const list = response.data?.data || response.data || [];
      return {
        success: true,
        data: Array.isArray(list) ? list : [],
      };
    } catch (error) {
      return { success: false, data: [] };
    }
  }, []);

  return {
    loading,
    submittingOrder,
    createPackagedOrder,
    getPackagedOrders,
    getPackagedReadyToSellList,
    getStakeholders,
    getSeedTypes,
  };
};

export default usePackagedSales;
