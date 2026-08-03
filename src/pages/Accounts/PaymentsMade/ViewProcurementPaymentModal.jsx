import React, { useState } from "react";
import CustomModal from "../../../components/CustomModal";
import { FaMoneyCheckAlt, FaBuilding, FaUserCheck, FaCalendarAlt, FaReceipt, FaFileInvoiceDollar, FaExternalLinkAlt, FaTimes, FaExpand } from "react-icons/fa";
import { formatDhakaDateTime } from "../../../utils/dateUtils";

const ViewProcurementPaymentModal = ({ open, setOpen, paymentData }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  if (!paymentData) return null;

  const paymentId = paymentData.id || "-";
  const procurementId = paymentData.procurementOrder?.procurementId || (paymentData.procurementOrderId ? `PRC-${paymentData.procurementOrderId}` : "-");
  const stakeholderName = paymentData.stakeholder?.name || paymentData.stakeholderName || "N/A";
  const stakeholderCode = paymentData.stakeholder?.stakeholderId || "";
  const paymentMethod = paymentData.paymentMethod?.value || paymentData.paymentMethodValue || "Cash";
  const amount = Number(paymentData.amount || 0);
  const paidBy = paymentData.paidBy?.fullName || paymentData.paidByName || "N/A";
  const paidByEmployeeId = paymentData.paidBy?.employeeId || "";
  const createdAt = paymentData.createdAt ? formatDhakaDateTime(paymentData.createdAt) : "-";
  const note = paymentData.note || "No notes provided";

  const totalAmount = paymentData.procurementOrder?.totalAmount !== undefined ? Number(paymentData.procurementOrder.totalAmount) : null;
  const paidAmountTotal = paymentData.procurementOrder?.paidAmount !== undefined ? Number(paymentData.procurementOrder.paidAmount) : null;
  const dueAmountTotal = paymentData.procurementOrder?.dueAmount !== undefined ? Number(paymentData.procurementOrder.dueAmount) : null;

  return (
    <>
      <CustomModal
        open={open}
        setOpen={setOpen}
        header="Procurement Payment Details"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4 text-xs">
          {/* Payment Summary Header */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider">
                Payment Record ID #{paymentId}
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
            {/* Procurement Order Info */}
            <div className="flex items-start gap-2.5 pb-2.5 border-b border-slate-200">
              <FaFileInvoiceDollar className="w-4 h-4 text-emerald-600 mt-0.5" />
              <div className="flex-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Procurement Order</span>
                <span className="font-extrabold text-slate-800 font-mono text-sm">{procurementId}</span>
                {totalAmount !== null && (
                  <div className="flex gap-3 text-[11px] text-slate-600 mt-1">
                    <span>Total: <strong>৳{totalAmount.toLocaleString()}</strong></span>
                    {paidAmountTotal !== null && <span>Paid: <strong className="text-emerald-600">৳{paidAmountTotal.toLocaleString()}</strong></span>}
                    {dueAmountTotal !== null && <span>Due: <strong className="text-rose-600">৳{dueAmountTotal.toLocaleString()}</strong></span>}
                  </div>
                )}
              </div>
            </div>

            {/* Stakeholder Info */}
            <div className="flex items-start gap-2.5 pb-2.5 border-b border-slate-200">
              <FaBuilding className="w-4 h-4 text-emerald-600 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Stakeholder / Vendor</span>
                <span className="font-bold text-slate-800">{stakeholderName}</span>
                {stakeholderCode && <span className="text-slate-500 font-mono text-[11px] block">({stakeholderCode})</span>}
              </div>
            </div>

            {/* Paid By & Date */}
            <div className="grid grid-cols-2 gap-3 pb-2.5 border-b border-slate-200">
              <div className="flex items-start gap-2">
                <FaUserCheck className="w-3.5 h-3.5 text-emerald-600 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Recorded / Paid By</span>
                  <span className="font-bold text-slate-800">{paidBy}</span>
                  {paidByEmployeeId && <span className="text-slate-500 font-mono text-[10px] block">{paidByEmployeeId}</span>}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FaCalendarAlt className="w-3.5 h-3.5 text-emerald-600 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Payment Date & Time</span>
                  <span className="font-semibold text-slate-700">{createdAt}</span>
                </div>
              </div>
            </div>

            {/* Note / Remarks */}
            <div className="flex items-start gap-2.5">
              <FaReceipt className="w-3.5 h-3.5 text-emerald-600 mt-0.5" />
              <div className="flex-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Notes / Remarks</span>
                <p className="text-slate-700 bg-white border border-slate-200 rounded-lg p-2 mt-1">
                  {note}
                </p>
              </div>
            </div>

            {(() => {
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

              if (uniqueUrls.length === 0) return null;

              return (
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
              );
            })()}
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

export default ViewProcurementPaymentModal;
