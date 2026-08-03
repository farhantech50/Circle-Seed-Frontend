import React, { useState, useEffect } from "react";
import { FaMoneyBillWave, FaCheckCircle, FaCreditCard, FaNotesMedical, FaFileInvoiceDollar, FaCloudUploadAlt, FaTrash, FaImage, FaSpinner } from "react-icons/fa";
import CustomModal from "../../../components/CustomModal";
import SearchableSelect from "../../../components/SearchableSelect";
import showToast from "../../../utils/toast";
import useLookUp from "../../../hooks/useLookup";
import useProcurementPayments from "../../../hooks/useProcurementPayments";
import api from "../../../config/api";

const CreateProcurementPaymentModal = ({
  open,
  setOpen,
  onSuccess,
  onPaymentSuccess,
  createPayment,
  createProcurementPayment: createProcurementPaymentProp,
  submitting,
}) => {
  const { getLookup } = useLookUp();
  const { getDueProcurementOrders, createProcurementPayment: createProcurementPaymentHook } = useProcurementPayments();

  const handleSuccess = onSuccess || onPaymentSuccess;

  const [dueOrders, setDueOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingMethods, setLoadingMethods] = useState(false);

  const [procurementOrderId, setProcurementOrderId] = useState("");
  const [selectedProcurementOrder, setSelectedProcurementOrder] = useState(null);
  const [amount, setAmount] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [note, setNote] = useState("");

  // Image upload state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    if (open) {
      fetchDueProcurementOrders();
      fetchPaymentMethods();
      setProcurementOrderId("");
      setSelectedProcurementOrder(null);
      setAmount("");
      setNote("");
      setSelectedFiles([]);
    }
  }, [open]);

  const fetchDueProcurementOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await getDueProcurementOrders();
      if (res.success && Array.isArray(res.data)) {
        setDueOrders(res.data);
      } else {
        const directRes = await api.get("/api/accounts/procurement-orders/due");
        setDueOrders(directRes.data?.data || directRes.data || []);
      }
    } catch (error) {
      console.error("Error fetching due procurement orders:", error);
    }
    setOrdersLoading(false);
  };

  const fetchPaymentMethods = async () => {
    setLoadingMethods(true);
    try {
      const res = await getLookup("payment_method");
      if (res.success && Array.isArray(res.data)) {
        setPaymentMethods(res.data);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    }
    setLoadingMethods(false);
  };

  const handleOrderChange = (orderId) => {
    setProcurementOrderId(orderId);
    const orderObj = dueOrders.find((item) => String(item.id) === String(orderId));
    setSelectedProcurementOrder(orderObj || null);
    if (orderObj && orderObj.dueAmount !== undefined && orderObj.dueAmount !== null) {
      setAmount(String(orderObj.dueAmount));
    } else if (orderObj && orderObj.totalAmount) {
      setAmount(String(orderObj.totalAmount));
    }
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    e.target.value = null;
  };

  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!procurementOrderId) {
      showToast("Please select a procurement order", "error");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      showToast("Please enter a valid payment amount", "error");
      return;
    }

    if (!paymentMethodId) {
      showToast("Please select a payment method", "error");
      return;
    }

    let uploadedImageUrls = [];

    if (selectedFiles.length > 0) {
      setUploadingImages(true);
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dchx1y8g1";
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "circle_seed";

      try {
        const uploadPromises = selectedFiles.map(async (file) => {
          const uploadData = new FormData();
          uploadData.append("file", file);
          uploadData.append("upload_preset", uploadPreset);
          uploadData.append("folder", "Circle Seed Payments");

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
              method: "POST",
              body: uploadData,
            }
          );

          const data = await response.json();
          if (data.secure_url) {
            return data.secure_url;
          } else {
            throw new Error(data.error?.message || "Image upload failed");
          }
        });

        uploadedImageUrls = await Promise.all(uploadPromises);
      } catch (error) {
        setUploadingImages(false);
        showToast(error.message || "Failed to upload payment receipt images", "error");
        return;
      }
      setUploadingImages(false);
    }

    const payload = {
      procurementOrderId: Number(procurementOrderId),
      amount: Number(amount),
      paymentMethodId: Number(paymentMethodId),
      note: note.trim(),
      imageUrls: uploadedImageUrls,
    };

    try {
      let res;
      if (typeof createProcurementPaymentProp === "function") {
        res = await createProcurementPaymentProp(payload);
      } else if (typeof createPayment === "function") {
        res = await createPayment(payload);
      } else if (typeof createProcurementPaymentHook === "function") {
        res = await createProcurementPaymentHook(payload);
      } else {
        const directApiRes = await api.post("/api/accounts/payments-made", payload);
        res = {
          success: true,
          message: directApiRes.data?.message || "Payment recorded successfully",
          data: directApiRes.data,
        };
      }

      if (res && res.success) {
        showToast(res.message || "Payment recorded successfully", "success");
        setOpen(false);
        if (handleSuccess) {
          handleSuccess();
        }
      } else {
        showToast(res?.message || "Failed to record payment", "error");
      }
    } catch (error) {
      console.error("Submit payment error:", error);
      showToast(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to record payment",
        "error"
      );
    }
  };

  const totalAmt = Number(selectedProcurementOrder?.totalAmount || 0);
  const paidAmt = Number(selectedProcurementOrder?.paidAmount || 0);
  const dueAmt = selectedProcurementOrder?.dueAmount !== undefined && selectedProcurementOrder?.dueAmount !== null
    ? Number(selectedProcurementOrder.dueAmount)
    : Math.max(0, totalAmt - paidAmt);

  return (
    <CustomModal
      open={open}
      setOpen={setOpen}
      title="Record Procurement Payment"
      width="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Header summary banner */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-emerald-800">
            <div className="p-2 bg-emerald-100/80 rounded-lg text-emerald-600">
              <FaMoneyBillWave className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Supplier Payment Entry
              </p>
              <p className="text-[11px] text-slate-500">
                Record new payment against pending procurement orders.
              </p>
            </div>
          </div>
        </div>

        {/* Procurement Order Dropdown */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <FaFileInvoiceDollar className="text-emerald-600" />
            Select Due Procurement Order <span className="text-rose-500">*</span>
          </label>
          <SearchableSelect
            options={dueOrders}
            value={procurementOrderId}
            onChange={handleOrderChange}
            placeholder={ordersLoading ? "Loading due orders..." : "Choose a procurement order"}
            getOptionLabel={(order) => {
              const code = order.procurementId || `PRC-${order.id}`;
              const supplier = order.stakeholder?.name || order.supplierName || "Supplier";
              const due = order.dueAmount !== undefined ? `(Due: ৳${Number(order.dueAmount).toLocaleString()})` : "";
              return `${code} - ${supplier} ${due}`;
            }}
            getOptionValue={(order) => order.id}
          />
        </div>

        {/* Selected Order Calculation Badges */}
        {selectedProcurementOrder && (
          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Amount</span>
              <span className="text-sm font-black text-slate-800">৳{totalAmt.toLocaleString()}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Paid Amount</span>
              <span className="text-sm font-black text-emerald-600">৳{paidAmt.toLocaleString()}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-amber-200 bg-amber-50/50 text-center">
              <span className="text-[10px] text-amber-700 font-bold uppercase block">Current Due</span>
              <span className="text-sm font-black text-amber-800">৳{dueAmt.toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Payment Amount Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FaCreditCard className="text-emerald-600" />
              Payment Amount (BDT) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter payment amount"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>

          {/* Payment Method Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FaCheckCircle className="text-emerald-600" />
              Payment Method <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={paymentMethodId}
              onChange={(e) => setPaymentMethodId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            >
              <option value="">Select Payment Method</option>
              {paymentMethods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.value || m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Note / Remarks */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <FaNotesMedical className="text-emerald-600" />
            Note / Payment Remarks
          </label>
          <textarea
            rows="2"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add payment notes or transaction reference..."
            className="w-full rounded-xl border border-slate-300 p-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition resize-none"
          />
        </div>

        {/* Payment Voucher / Receipt Image Upload */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
            <FaImage className="text-emerald-600" />
            Upload Payment Vouchers / Receipt Images
          </label>

          <div className="border border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-2.5 bg-slate-50 hover:bg-emerald-50/20 transition flex items-center justify-center gap-2 cursor-pointer relative">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            />
            <FaCloudUploadAlt className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700">Click or drag images to upload</span>
            <span className="text-[10px] text-slate-400 font-normal">(PNG, JPG, WEBP)</span>
          </div>

          {/* Upload Previews (Compact Scroll Box) */}
          {selectedFiles.length > 0 && (
            <div className="mt-2 max-h-24 overflow-y-auto p-1.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-wrap gap-2">
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 bg-white w-14 h-14 shrink-0 shadow-xs">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`receipt-${idx}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="absolute top-0.5 right-0.5 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 transition shadow-sm"
                    title="Remove image"
                  >
                    <FaTrash className="w-2 h-2" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || uploadingImages}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition disabled:opacity-50"
          >
            {uploadingImages ? (
              <>
                <FaSpinner className="w-3.5 h-3.5 animate-spin" /> Uploading Images...
              </>
            ) : submitting ? (
              "Processing..."
            ) : (
              "Save Payment"
            )}
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

export default CreateProcurementPaymentModal;
