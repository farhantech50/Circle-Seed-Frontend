import { useState, useCallback } from "react";
import api from "../config/api";

const useInvoices = () => {
  const [loading, setLoading] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Fetch All Invoices list from GET /api/sales/invoices with query filters
  const getAllInvoices = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const cleanParams = {};
      Object.keys(filters).forEach((key) => {
        if (
          filters[key] !== "" &&
          filters[key] !== null &&
          filters[key] !== undefined
        ) {
          cleanParams[key] = filters[key];
        }
      });

      if (cleanParams.startDate && cleanParams.startDate.length === 10) {
        cleanParams.startDate = `${cleanParams.startDate}T00:00:00.000Z`;
      }
      if (cleanParams.endDate && cleanParams.endDate.length === 10) {
        cleanParams.endDate = `${cleanParams.endDate}T23:59:59.999Z`;
      }

      const response = await api.get("/api/sales/invoices", {
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
      } else if (rawData?.invoices && Array.isArray(rawData.invoices)) {
        list = rawData.invoices;
        total = rawData.total || rawData.invoices.length;
      }

      return {
        success: true,
        data: list,
        total: total,
      };
    } catch (error) {
      console.error("GET /api/sales/invoices error:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch invoices list";
      return {
        success: false,
        message: errorMsg,
        data: [],
        total: 0,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single invoice details via GET /api/sales/invoices/{id}
  const getInvoiceById = useCallback(async (invoiceId) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/sales/invoices/${invoiceId}`);
      const rawData = response.data?.data || response.data;
      return {
        success: true,
        data: rawData,
      };
    } catch (error) {
      console.error(`GET /api/sales/invoices/${invoiceId} error:`, error);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch invoice details";
      return {
        success: false,
        message: errorMsg,
        data: null,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Record payment for an invoice via PATCH /api/sales/invoices/{invoiceId}/record-payment
  const recordInvoicePayment = async (invoiceId, payload) => {
    setSubmittingPayment(true);
    try {
      const response = await api.patch(
        `/api/sales/invoices/${invoiceId}/record-payment`,
        {
          amount: payload.amount,
          paymentMethodId: payload.paymentMethodId,
          note: payload.note || "",
        }
      );

      return {
        success: true,
        message:
          response.data?.message || "Payment recorded successfully",
        data: response.data?.data || response.data,
      };
    } catch (error) {
      console.error(
        `PATCH /api/sales/invoices/${invoiceId}/record-payment error:`,
        error
      );
      const resData = error.response?.data;
      let errorMsg = "Failed to record invoice payment";

      if (resData) {
        if (typeof resData === "string") {
          errorMsg = resData;
        } else if (resData.message) {
          errorMsg = resData.message;
        } else if (resData.error) {
          errorMsg = resData.error;
        }
      }

      return {
        success: false,
        message: errorMsg,
      };
    } finally {
      setSubmittingPayment(false);
    }
  };

  return {
    loading,
    submittingPayment,
    getAllInvoices,
    getInvoiceById,
    recordInvoicePayment,
  };
};

export default useInvoices;
