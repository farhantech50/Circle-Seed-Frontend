import React, { useState, useEffect, useCallback } from "react";
import { FaPercentage, FaCheckCircle, FaExchangeAlt, FaSlidersH, FaRedo } from "react-icons/fa";
import Swal from "sweetalert2";
import CustomModal from "../../../components/CustomModal";
import useLedger from "../../../hooks/useLedger";
import showToast from "../../../utils/toast";
import { formatDhakaDate } from "../../../utils/dateUtils";

const AdjustCommissionModal = ({ open, setOpen, stakeholder, summary, onAdjustSuccess }) => {
  const { getCommissions, adjustCommission } = useLedger();

  const [commissionsList, setCommissionsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adjustingId, setAdjustingId] = useState(null);

  const fetchCommissions = useCallback(async () => {
    if (!stakeholder?.id && !stakeholder?.stakeholderId) return;

    setLoading(true);
    const targetId = stakeholder?.id || stakeholder?.stakeholderId;
    const res = await getCommissions(targetId);
    if (res.success) {
      setCommissionsList(res.data || []);
    } else {
      setCommissionsList([]);
      showToast(res.message || "Failed to load commissions", "error");
    }
    setLoading(false);
  }, [stakeholder, getCommissions]);

  useEffect(() => {
    if (open && stakeholder) {
      fetchCommissions();
    } else {
      setCommissionsList([]);
    }
  }, [open, stakeholder, fetchCommissions]);

  if (!stakeholder) return null;

  const handleAdjust = (commissionItem) => {
    const commAmt = Number(commissionItem.commissionAmount || 0).toLocaleString();
    const invoiceRef = commissionItem.invoice?.invoiceId || (commissionItem.invoiceId ? `INV-${commissionItem.invoiceId}` : "Invoice");

    Swal.fire({
      title: "Adjust Commission?",
      text: `Are you sure you want to adjust ৳${commAmt} commission for ${invoiceRef}? This will credit the commission to stakeholder's ledger balance.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#059669",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Yes, Adjust Now",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      setAdjustingId(commissionItem.id);
      const res = await adjustCommission(commissionItem.id);
      if (res.success) {
        Swal.fire({
          title: "Adjusted!",
          text: res.message || `Commission ৳${commAmt} adjusted successfully!`,
          icon: "success",
          confirmButtonColor: "#059669",
        });
        fetchCommissions();
        if (onAdjustSuccess) {
          onAdjustSuccess(commissionItem);
        }
      } else {
        Swal.fire({
          title: "Adjustment Failed",
          text: res.message || "Failed to adjust commission.",
          icon: "error",
          confirmButtonColor: "#059669",
        });
      }
      setAdjustingId(null);
    });
  };

  const stakeholderName = stakeholder.name || "Stakeholder";
  const stakeholderId = stakeholder.stakeholderId || (stakeholder.id ? `STK-${String(stakeholder.id).padStart(4, "0")}` : "-");
  const totalAdjusted = summary?.totalAdjustedCommissions || 0;

  return (
    <CustomModal
      open={open}
      setOpen={setOpen}
      header="Adjust Stakeholder Commission"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4 text-xs">
        {/* Header Summary Banner */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-800 to-emerald-900 text-white p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border border-teal-700/60 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <FaPercentage className="text-emerald-400 w-4 h-4" />
              <span className="font-extrabold text-sm">{stakeholderName}</span>
              <span className="bg-emerald-500/30 text-emerald-300 font-mono font-bold text-[10px] px-2 py-0.5 rounded-md border border-emerald-400/30">
                {stakeholderId}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Adjust pending sales/procurement commissions directly into the stakeholder ledger balance.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={fetchCommissions}
              disabled={loading}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
              title="Refresh Commissions List"
            >
              <FaRedo className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-lg text-right">
              <span className="text-[10px] text-slate-300 block font-bold uppercase tracking-wider">
                Total Adjusted Commission
              </span>
              <span className="text-lg font-black text-emerald-300 font-mono">
                ৳{Number(totalAdjusted).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Commission List Table */}
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <FaSlidersH className="text-emerald-600" /> Commissions List ({commissionsList.length})
            </h4>
            <span className="text-[10px] text-slate-400 font-medium">
              Click &quot;Adjust&quot; to credit commission to ledger
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 font-bold uppercase text-slate-600 text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Ref ID</th>
                  <th className="py-2.5 px-3">Invoice Ref</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Total Amount</th>
                  <th className="py-2.5 px-3 text-center">Rate (%)</th>
                  <th className="py-2.5 px-3 text-right">Commission</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Adjusted By</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="py-8 text-center text-slate-400 font-semibold">
                      <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      Loading commissions data...
                    </td>
                  </tr>
                ) : commissionsList.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-8 text-center text-slate-400 italic">
                      No commissions found for this stakeholder.
                    </td>
                  </tr>
                ) : (
                  commissionsList.map((comm) => {
                    const isAdjusted = comm.isAdjusted === true;
                    const commRef = comm.id ? `COM-${String(comm.id).padStart(4, "0")}` : "-";
                    const invoiceRef = comm.invoice?.invoiceId || (comm.invoiceId ? `INV-${comm.invoiceId}` : "-");
                    const dateStr = comm.createdAt ? formatDhakaDate(comm.createdAt) : comm.date || "-";
                    const totalAmt = Number(comm.invoice?.totalAmount || comm.totalAmount || 0);
                    const commRate = comm.commissionPercentage || comm.commissionRate || 0;
                    const commAmt = Number(comm.commissionAmount || 0);
                    const adjustedBy = comm.adjustedBy?.fullName || comm.adjustedBy?.employeeId || "-";

                    return (
                      <tr key={comm.id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                          {commRef}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {invoiceRef}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-medium">
                          {dateStr}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                          ৳{totalAmt.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-teal-700 font-mono">
                          {commRate}%
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-extrabold text-emerald-700">
                          ৳{commAmt.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {isAdjusted ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                              <FaCheckCircle className="w-2.5 h-2.5 text-emerald-600" /> Adjusted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-600 text-[11px]">
                          {isAdjusted ? adjustedBy : "-"}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleAdjust(comm)}
                            disabled={isAdjusted || adjustingId === comm.id}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition shadow-2xs ${
                              isAdjusted
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                            }`}
                          >
                            <FaExchangeAlt className="w-3 h-3" />
                            {adjustingId === comm.id ? "Adjusting..." : isAdjusted ? "Adjusted" : "Adjust"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
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
  );
};

export default AdjustCommissionModal;
