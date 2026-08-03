import React, { useState } from "react";
import CustomModal from "../../../components/CustomModal";
import { FaHandHoldingUsd, FaFileInvoiceDollar, FaUserCheck, FaCalendarAlt, FaReceipt, FaShoppingBag, FaExternalLinkAlt, FaExpand } from "react-icons/fa";
import { formatDhakaDateTime } from "../../../utils/dateUtils";

const ViewPaymentReceivedModal = ({ open, setOpen, paymentData }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  if (!paymentData) return null;

  const paymentId = paymentData.id || "-";
  const invoiceNo = paymentData.invoice?.invoiceId || (paymentData.invoiceId ? `INV-${paymentData.invoiceId}` : "-");
  const orderRef = paymentData.invoice?.orderRef || paymentData.invoice?.posOrder?.orderNumber || paymentData.invoice?.bulkSale?.saleId || paymentData.invoice?.packagedSale?.saleId || "-";
  const amount = Number(paymentData.amount || 0);
  const paymentMethod = paymentData.paymentMethod?.value || paymentData.paymentMethodValue || "Cash";
  const receivedBy = paymentData.receivedBy?.fullName || paymentData.receivedByName || "System";
  const receivedByEmployeeId = paymentData.receivedBy?.employeeId || "";
  const createdAt = paymentData.createdAt ? formatDhakaDateTime(paymentData.createdAt) : "-";
  const note = paymentData.note || "No notes provided";

  const statusValue = paymentData.invoice?.status?.value || "Completed";
  const totalAmount = paymentData.invoice?.totalAmount !== undefined ? Number(paymentData.invoice.totalAmount) : null;
  const rawPaidAmountTotal = paymentData.invoice?.paidAmount !== undefined ? Number(paymentData.invoice.paidAmount) : null;
  const dueAmountTotal = paymentData.invoice?.dueAmount !== undefined ? Number(paymentData.invoice.dueAmount) : null;

  const commissionObj = paymentData.invoice?.commission || paymentData.commission;
  const isCommissionAdjusted = commissionObj?.isAdjusted === true;
  const commissionAmt = isCommissionAdjusted ? Number(commissionObj?.commissionAmount || 0) : 0;
  const paidAmountTotal = isCommissionAdjusted && rawPaidAmountTotal !== null ? Math.max(0, rawPaidAmountTotal - commissionAmt) : rawPaidAmountTotal;

  const rawAttachments =
    (Array.isArray(paymentData.attachments) && paymentData.attachments.length > 0)
      ? paymentData.attachments
      : (Array.isArray(paymentData.imageUrls) && paymentData.imageUrls.length > 0)
      ? paymentData.imageUrls
      : (Array.isArray(paymentData.images) && paymentData.images.length > 0)
      ? paymentData.images
      : [];

  const uniqueUrls = Array.from(
    new Set(
      rawAttachments
        .map((img) => (typeof img === "string" ? img : img?.imageUrl || img?.url))
        .filter(Boolean)
    )
  );

  return (
    <>
      <CustomModal
        open={open}
        setOpen={setOpen}
        header="Payment Received Details"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4 text-xs">
          {/* Payment Summary Header */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider">
                Payment Receipt Record #{paymentId}
              </span>
              <span className="text-2xl font-black text-emerald-900 font-mono">
                ৳{amount.toLocaleString()}
              </span>
            </div>
            <div className="bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-emerald-200 text-right">
              <span className="text-[10px] text-slate-500 block font-semibold">Payment Method</span>
              <span className="font-bold text-emerald-800">{paymentMethod}</span>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            {/* Invoice & Order Ref Info */}
            <div className="grid grid-cols-2 gap-3 pb-2.5 border-b border-slate-200">
              <div className="flex items-start gap-2">
                <FaFileInvoiceDollar className="w-4 h-4 text-emerald-600 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Invoice No</span>
                  <span className="font-extrabold text-slate-800 font-mono text-sm">{invoiceNo}</span>
                </div>
              </div>
              <div className="flex items-start gap-2 text-right justify-end">
                <FaShoppingBag className="w-4 h-4 text-emerald-600 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Order Ref</span>
                  <span className="font-bold text-slate-800 font-mono text-xs">{orderRef}</span>
                </div>
              </div>
            </div>

            {/* Invoice Summary Row */}
            {totalAmount !== null && (
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 grid grid-cols-3 gap-2 text-center pb-2.5">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Invoice Total</span>
                  <span className="font-bold text-slate-800 font-mono">৳{totalAmount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Total Paid</span>
                  <span className="font-bold text-emerald-600 font-mono">৳{(paidAmountTotal || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Remaining Due</span>
                  <span className="font-extrabold text-rose-600 font-mono">৳{(dueAmountTotal || 0).toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Received By & Date */}
            <div className="grid grid-cols-2 gap-3 pb-2.5 border-b border-slate-200">
              <div className="flex items-start gap-2">
                <FaUserCheck className="w-3.5 h-3.5 text-emerald-600 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Received By</span>
                  <span className="font-bold text-slate-800">{receivedBy}</span>
                  {receivedByEmployeeId && <span className="text-slate-500 font-mono text-[10px] block">{receivedByEmployeeId}</span>}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FaCalendarAlt className="w-3.5 h-3.5 text-emerald-600 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Received Date & Time</span>
                  <span className="font-semibold text-slate-700">{createdAt}</span>
                </div>
              </div>
            </div>

            {/* Status & Remarks */}
            <div className="flex items-start gap-2.5">
              <FaReceipt className="w-3.5 h-3.5 text-emerald-600 mt-0.5" />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Status</span>
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {statusValue}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Notes / Remarks</span>
                <p className="text-slate-700 bg-white border border-slate-200 rounded-lg p-2 mt-1">
                  {note}
                </p>
              </div>
            </div>

            {/* Attached Receipt Images */}
            {uniqueUrls.length > 0 && (
              <div className="border-t border-slate-200 pt-2.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5">
                  Attached Payment Receipts / Vouchers ({uniqueUrls.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {uniqueUrls.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPreviewUrl(url)}
                      className="block w-20 h-20 rounded-lg overflow-hidden border border-slate-200 hover:border-emerald-500 transition shadow-xs group relative cursor-pointer text-left focus:outline-none"
                    >
                      <img src={url} alt={`receipt-${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition" />
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition flex items-center justify-center">
                        <FaExpand className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition drop-shadow-md" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      </CustomModal>

      {/* Image Lightbox Preview Modal */}
      {previewUrl && (
        <CustomModal
          open={!!previewUrl}
          setOpen={() => setPreviewUrl(null)}
          header="Payment Receipt Image Preview"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="relative bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center p-2 min-h-[250px] max-h-[70vh]">
              <img
                src={previewUrl}
                alt="Payment Voucher Preview"
                className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-lg"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3">
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition shadow-xs"
              >
                <FaExternalLinkAlt className="w-3.5 h-3.5" /> Open in New Tab
              </a>

              <button
                type="button"
                onClick={() => setPreviewUrl(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </CustomModal>
      )}
    </>
  );
};

export default ViewPaymentReceivedModal;
