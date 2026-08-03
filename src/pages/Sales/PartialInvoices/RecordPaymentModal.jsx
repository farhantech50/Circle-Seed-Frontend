import React, { useState, useEffect } from "react";
import { FaMoneyBillWave, FaCheckCircle, FaCreditCard, FaFileInvoiceDollar, FaNotesMedical, FaCloudUploadAlt, FaTrash, FaImage, FaSpinner } from "react-icons/fa";
import CustomModal from "../../../components/CustomModal";
import showToast from "../../../utils/toast";
import useLookUp from "../../../hooks/useLookup";

const RecordPaymentModal = ({
  open,
  setOpen,
  invoiceData,
  onPaymentSuccess,
  recordInvoicePayment,
  submitting,
}) => {
  const { getLookup } = useLookUp();

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingMethods, setLoadingMethods] = useState(false);

  const [amount, setAmount] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [note, setNote] = useState("");

  // Image Upload States
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Fetch payment methods lookup on modal open
  useEffect(() => {
    if (open) {
      fetchPaymentMethods();
      if (invoiceData) {
        setAmount(invoiceData.dueAmount || "");
      }
      setNote("");
      setSelectedFiles([]);
    }
  }, [open]);

  const fetchPaymentMethods = async () => {
    setLoadingMethods(true);
    const res = await getLookup("payment_method");
    if (res.success && Array.isArray(res.data)) {
      setPaymentMethods(res.data);
      if (res.data.length > 0) {
        setPaymentMethodId(res.data[0].id);
      }
    }
    setLoadingMethods(false);
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    e.target.value = null;
  };

  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      showToast("Please enter a valid payment amount", "error");
      return;
    }

    if (!paymentMethodId) {
      showToast("Please select a payment method", "error");
      return;
    }

    const targetInvoiceId = invoiceData?.invoiceId || invoiceData?.id;
    if (!targetInvoiceId) {
      showToast("Invoice identifier missing", "error");
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
          uploadData.append("folder", "Circle Seed Invoice Payments");

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
        showToast(error.message || "Failed to upload payment receipts", "error");
        return;
      }
      setUploadingImages(false);
      setSelectedFiles([]);
    }

    const payload = {
      amount: Number(amount),
      paymentMethodId: Number(paymentMethodId) || paymentMethodId,
      note: note.trim(),
      imageUrls: uploadedImageUrls,
    };

    const res = await recordInvoicePayment(targetInvoiceId, payload);
    if (res.success) {
      showToast(res.message || "Payment recorded successfully", "success");
      setOpen(false);
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    } else {
      showToast(res.message || "Failed to record payment", "error");
    }
  };

  const invoiceNo = invoiceData?.invoiceId || invoiceData?.invoiceNo || (invoiceData?.id ? `INV-${invoiceData.id}` : "-");
  const orderNo = invoiceData?.orderNumber || "-";
  const stakeholder = invoiceData?.stakeholderName || invoiceData?.stakeholder?.name || "N/A";
  const orderType = invoiceData?.orderType ? invoiceData.orderType.toUpperCase() : "-";
  const totalAmt = Number(invoiceData?.totalAmount || 0);
  const dueAmtDisplay = invoiceData?.dueAmount !== undefined && invoiceData?.dueAmount !== null ? Number(invoiceData.dueAmount) : 0;
  const paidAmtCalculated = Math.max(0, totalAmt - dueAmtDisplay);

  return (
    <CustomModal
      open={open}
      setOpen={setOpen}
      header="Record Invoice Payment"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleFormSubmit} className="space-y-3.5">
        {/* Invoice Summary Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
          <div className="flex justify-between items-center border-b border-slate-200/80 pb-2">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Invoice Reference</span>
              <span className="text-xs font-black text-slate-800 font-mono">{invoiceNo}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Order Ref ({orderType})</span>
              <span className="text-xs font-bold text-slate-700 font-mono">{orderNo}</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Stakeholder</span>
              <span className="font-bold text-slate-700">{stakeholder}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">Net Total</span>
              <span className="font-bold text-slate-800 font-mono">৳{totalAmt.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1.5 border-t border-slate-200/80">
            <div>
              <span className="text-slate-400 block text-[10px]">Paid Amount</span>
              <span className="font-bold text-emerald-600 font-mono">৳{paidAmtCalculated.toLocaleString()}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">Current Due Amount</span>
              <span className="font-extrabold text-rose-600 font-mono text-sm">
                ৳{dueAmtDisplay.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Form Fields */}
        <div className="space-y-3">
          {/* Payment Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <FaMoneyBillWave className="text-emerald-600" /> Payment Amount (BDT) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0.01"
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Enter amount (Due: ${dueAmtDisplay})`}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <FaCreditCard className="text-emerald-600" /> Payment Method <span className="text-rose-500">*</span>
            </label>
            <select
              value={paymentMethodId}
              onChange={(e) => setPaymentMethodId(e.target.value)}
              disabled={loadingMethods}
              required
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none disabled:bg-slate-100"
            >
              {loadingMethods ? (
                <option value="">Loading payment methods...</option>
              ) : (
                paymentMethods.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.value || pm.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Remarks / Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <FaNotesMedical className="text-emerald-600" /> Remarks / Notes (Optional)
            </label>
            <textarea
              rows="2"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter payment remarks or reference details..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Receipt Image Upload */}
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

            {/* Selected File Previews */}
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
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || uploadingImages || !amount}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadingImages ? (
              <>
                <FaSpinner className="w-3.5 h-3.5 animate-spin" /> Uploading...
              </>
            ) : submitting ? (
              "Processing Payment..."
            ) : (
              <>
                <FaCheckCircle className="w-3.5 h-3.5" />
                Confirm & Save Payment
              </>
            )}
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

export default RecordPaymentModal;
