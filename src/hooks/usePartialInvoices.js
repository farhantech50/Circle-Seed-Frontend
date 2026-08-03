import { useState, useCallback } from "react";
import api from "../config/api";

const usePartialInvoices = () => {
  const [loading, setLoading] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Fetch Partial / Due Invoices list from GET /api/sales/invoices/partial
  const getPartialInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/sales/invoices/partial");
      const rawData = response.data;
      let list = [];

      if (Array.isArray(rawData)) {
        list = rawData;
      } else if (rawData?.data && Array.isArray(rawData.data)) {
        list = rawData.data;
      } else if (rawData?.invoices && Array.isArray(rawData.invoices)) {
        list = rawData.invoices;
      }

      return {
        success: true,
        data: list,
      };
    } catch (error) {
      console.error("GET /api/sales/invoices/partial error:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch partial due invoices";
      return {
        success: false,
        message: errorMsg,
        data: [],
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Record payment for an invoice via PATCH /api/sales/invoices/{invoiceId}/record-payment
  const recordInvoicePayment = async (invoiceId, payload) => {
    setSubmittingPayment(true);
    try {
      const targetId = invoiceId;
      console.log(`Submitting payment for invoice ${targetId}:`, payload);
      const response = await api.patch(
        `/api/sales/invoices/${targetId}/record-payment`,
        {
          amount: payload.amount,
          paymentMethodId: payload.paymentMethodId,
          note: payload.note || "",
          imageUrls: payload.imageUrls || [],
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

  // Fetch full Invoice Details by ID via GET /api/sales/invoices/{id}
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

  return {
    loading,
    submittingPayment,
    getPartialInvoices,
    recordInvoicePayment,
    getInvoiceById,
  };
};

export default usePartialInvoices;
