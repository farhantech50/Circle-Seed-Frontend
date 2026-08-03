import React from "react";
import CustomModal from "../../../components/CustomModal";
import { FaUser, FaBuilding, FaCalendarCheck, FaFileAlt, FaUserCheck, FaCheckCircle } from "react-icons/fa";
import { formatDhakaDate } from "../../../utils/dateUtils";

const ViewFollowUpModal = ({ open, setOpen, followUpData }) => {
  if (!followUpData) return null;

  const leadName =
    followUpData.lead?.name ||
    followUpData.leadName ||
    "-";

  const leadCompany =
    followUpData.lead?.company ||
    followUpData.company ||
    "-";

  const outcomeName =
    followUpData.outcome?.value ||
    followUpData.outcomeName ||
    followUpData.outcome?.name ||
    followUpData.status ||
    "-";

  const createdByName =
    followUpData.user?.fullName ||
    followUpData.createdBy?.fullName ||
    followUpData.createdByName ||
    "-";

  const formattedDate = followUpData.followUpDate
    ? formatDhakaDate(followUpData.followUpDate)
    : "-";

  return (
    <CustomModal
      open={open}
      setOpen={() => setOpen(false)}
      header="Follow-Up Details"
      width="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold text-xl shrink-0">
              <FaCalendarCheck />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide">{leadName}</h2>
              {leadCompany && (
                <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
                  <FaBuilding className="text-emerald-400" /> {leadCompany}
                </p>
              )}
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shrink-0">
            {outcomeName}
          </span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <FaUser className="text-emerald-600" /> Lead Name
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800">{leadName}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <FaBuilding className="text-emerald-600" /> Company
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800">{leadCompany || "-"}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <FaCalendarCheck className="text-emerald-600" /> Follow-Up Date
            </p>
            <p className="mt-1 text-sm font-bold text-emerald-800">{formattedDate}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <FaCheckCircle className="text-emerald-600" /> Outcome / Result
            </p>
            <p className="mt-1 text-sm font-bold text-blue-700">{outcomeName}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <FaUserCheck className="text-emerald-600" /> Recorded By
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800">{createdByName}</p>
          </div>

          <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <FaFileAlt className="text-emerald-600" /> Notes & Discussion Points
            </p>
            <p className="mt-2 text-xs font-medium text-slate-700 whitespace-pre-wrap leading-relaxed">
              {followUpData.notes || "No notes recorded."}
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 pt-4">
          <button
            onClick={() => setOpen(false)}
            className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-bold text-white hover:bg-slate-900 transition shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </CustomModal>
  );
};

export default ViewFollowUpModal;
