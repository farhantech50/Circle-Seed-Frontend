import { useState, useCallback } from "react";
import api from "../config/api";

// Custom React Hook for POS operations & Sales Order Management
const usePOS = () => {
  const [loading, setLoading] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Fetch packaged inventory ready for sale
  const getPackagedProducts = useCallback(async (seedTypeId = "") => {
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

      let productsList = [];
      if (Array.isArray(rawData)) {
        productsList = rawData;
      } else if (typeof rawData === "object" && rawData !== null) {
        Object.keys(rawData).forEach((key) => {
          const item = rawData[key];
          if (Array.isArray(item.packages)) {
            item.packages.forEach((pkg) => {
              productsList.push({
                ...pkg,
                seedTypeName: item.seedTypeName || pkg.seedTypeName,
                seedTypeId: item.seedTypeId || key,
              });
            });
          } else if (Array.isArray(item)) {
            productsList.push(...item);
          }
        });
      }

      const formattedList = productsList.map((pkg) => ({
        id: pkg.id || pkg.packageId,
        packagedInventoryId: pkg.id || pkg.packageId,
        batchId: pkg.bulkInventory?.batchId || pkg.batchId || pkg.bulkInventoryId || "N/A",
        seedTypeId: pkg.seedTypeId || pkg.bulkInventory?.seedTypeId || "other",
        seedTypeName:
          pkg.seedTypeName ||
          pkg.bulkInventory?.seedType?.name ||
          pkg.bulkInventory?.seedTypeName ||
          "Packaged Seed",
        varietyName: pkg.varietyName || pkg.bulkInventory?.varietyName || "",
        packetSize: pkg.packetSize?.value
          ? `${pkg.packetSize.value}g`
          : pkg.packetSizeId
          ? `${pkg.packetSizeId}g`
          : "Pack",
        packetSizeId: pkg.packetSizeId || pkg.packetSize?.id,
        unitPrice: Number(pkg.unitPrice || 0),
        quantity: Number(pkg.quantity || 0),
        remainingQuantity: Number(
          pkg.remainingQuantity !== undefined ? pkg.remainingQuantity : pkg.quantity || 0
        ),
        isReadyToSell: pkg.isReadyToSell !== undefined ? pkg.isReadyToSell : true,
      }));

      return { success: true, data: formattedList };
    } catch (error) {
      console.error("GET POS packaged products error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch packaged products",
        data: [],
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch payment methods lookup
  const getPaymentMethods = useCallback(async () => {
    try {
      const res1 = await api.get("/api/lookup/values/payment_method");
      if (res1.data && Array.isArray(res1.data) && res1.data.length > 0) {
        return { success: true, data: res1.data };
      }
    } catch (e) {}

    try {
      const res2 = await api.get("/api/lookup/values/paymentMethod");
      if (res2.data && Array.isArray(res2.data) && res2.data.length > 0) {
        return { success: true, data: res2.data };
      }
    } catch (e) {}

    return {
      success: true,
      data: [
        { id: 1, value: "Cash" },
        { id: 2, value: "Bank" },
        { id: 3, value: "Mobile Banking" },
      ],
    };
  }, []);

  // Submit POS Order
  const createPOSOrder = async (payload) => {
    setSubmittingOrder(true);
    try {
      console.log("Submitting POS payload to /api/sales/create-pos-order:", payload);
      const response = await api.post("/api/sales/create-pos-order", payload);
      return {
        success: true,
        message: response.data?.message || "POS order created successfully",
        data: response.data?.data || response.data,
      };
    } catch (error) {
      console.error("POST create POS order error details:", error);
      console.error("Backend error response:", error.response?.data);

      let errorMsg = "Failed to process POS order (Server 500 Error)";
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

  // Fetch POS Orders List (API with pagination & filters)
  const getPOSOrders = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const cleanParams = {};
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== "" && filters[key] !== null && filters[key] !== undefined) {
          cleanParams[key] = filters[key];
        }
      });

      // Format YYYY-MM-DD date filters to cover full day (00:00:00 to 23:59:59) for backend timestamp filtering
      if (cleanParams.startDate && cleanParams.startDate.length === 10) {
        cleanParams.startDate = `${cleanParams.startDate}T00:00:00.000Z`;
      }
      if (cleanParams.endDate && cleanParams.endDate.length === 10) {
        cleanParams.endDate = `${cleanParams.endDate}T23:59:59.999Z`;
      }

      // console.log("GET /api/sales/get-pos-order params:", cleanParams);

      const response = await api.get("/api/sales/get-pos-order", {
        params: cleanParams,
      });

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
      console.error("GET POS orders error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch POS orders",
        data: [],
        total: 0,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    submittingOrder,
    getPackagedProducts,
    getPaymentMethods,
    createPOSOrder,
    getPOSOrders,
  };
};

export default usePOS;
