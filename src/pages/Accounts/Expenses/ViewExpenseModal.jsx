import React, { useState } from "react";
import CustomModal from "../../../components/CustomModal";
import { FaFileInvoiceDollar, FaTag, FaCalendarAlt, FaCreditCard, FaUserCheck, FaNotesMedical, FaExternalLinkAlt, FaExpand } from "react-icons/fa";
import { formatDhakaDate, formatDhakaDateTime } from "../../../utils/dateUtils";

const ViewExpenseModal = ({ open, setOpen, expenseData }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  if (!expenseData) return null;

  const expenseId = expenseData.id || "-";
  const categoryName = expenseData.category?.value || expenseData.categoryValue || "General";
  const amount = Number(expenseData.amount || 0);
  const expenseDate = expenseData.date ? formatDhakaDate(expenseData.date) : "-";
  const paymentMethod = expenseData.paymentMethod?.value || expenseData.paymentMethodValue || "N/A";
  const createdBy = expenseData.createdBy?.fullName || expenseData.createdByName || "System";
  const createdByEmployeeId = expenseData.createdBy?.employeeId || "";
  const createdAt = expenseData.createdAt ? formatDhakaDateTime(expenseData.createdAt) : "-";
  const description = expenseData.description || "No description provided";

  const rawAttachments =
    (Array.isArray(expenseData.attachments) && expenseData.attachments.length > 0)
      ? expenseData.attachments
      : (Array.isArray(expenseData.imageUrls) && expenseData.imageUrls.length > 0)
      ? expenseData.imageUrls
      : (Array.isArray(expenseData.images) && expenseData.images.length > 0)
      ? expenseData.images
      : [];

  const attachments = Array.from(
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
        header="Expense Entry Details"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4 text-xs">
          {/* Header summary */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider">
                Expense Record ID #{expenseId}
              </span>
              <span className="text-2xl font-black text-emerald-900 font-mono">
                ৳{amount.toLocaleString()}
              </span>
            </div>
            <div className="bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-emerald-200 text-right">
              <span className="text-[10px] text-slate-500 block font-semibold">Category</span>
              <span className="font-bold text-emerald-800">{categoryName}</span>
            </div>
          </div>

          {/* Details card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3 pb-2.5 border-b border-slate-200">
              <div className="flex items-start gap-2">
                <FaCalendarAlt className="w-3.5 h-3.5 text-emerald-600 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Expense Date</span>
                  <span className="font-bold text-slate-800">{expenseDate}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FaCreditCard className="w-3.5 h-3.5 text-emerald-600 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Payment Method</span>
                  <span className="font-bold text-slate-800">{paymentMethod}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pb-2.5 border-b border-slate-200">
              <div className="flex items-start gap-2">
                <FaUserCheck className="w-3.5 h-3.5 text-emerald-600 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Recorded By</span>
                  <span className="font-bold text-slate-800">{createdBy}</span>
                  {createdByEmployeeId && <span className="text-slate-500 font-mono text-[10px] block">{createdByEmployeeId}</span>}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FaFileInvoiceDollar className="w-3.5 h-3.5 text-emerald-600 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Record Created At</span>
                  <span className="font-semibold text-slate-700">{createdAt}</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <FaNotesMedical className="w-3.5 h-3.5 text-emerald-600 mt-0.5" />
              <div className="flex-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Description</span>
                <p className="text-slate-700 bg-white border border-slate-200 rounded-lg p-2.5 mt-1 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            {/* Attached Voucher Images */}
            {attachments.length > 0 && (
              <div className="border-t border-slate-200 pt-2.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5">
                  Attached Expense Vouchers / Receipts ({attachments.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((img, idx) => {
                    const url = typeof img === "string" ? img : img?.imageUrl || img?.url;
                    if (!url) return null;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPreviewUrl(url)}
                        className="block w-20 h-20 rounded-lg overflow-hidden border border-slate-200 hover:border-emerald-500 transition shadow-xs group relative cursor-pointer text-left focus:outline-none"
                      >
                        <img src={url} alt={`expense-${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition" />
                        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition flex items-center justify-center">
                          <FaExpand className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition drop-shadow-md" />
                        </div>
                      </button>
                    );
                  })}
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
          header="Expense Voucher Image Preview"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="relative bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center p-2 min-h-[250px] max-h-[70vh]">
              <img
                src={previewUrl}
                alt="Expense Voucher Preview"
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

export default ViewExpenseModal;
