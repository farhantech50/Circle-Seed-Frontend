import React from "react";
import CustomModal from "../../../components/CustomModal";
import { FaUser, FaBuilding, FaPhoneAlt, FaSeedling, FaBullhorn, FaFileAlt, FaUserCheck, FaInfoCircle } from "react-icons/fa";
import { formatDhakaDate } from "../../../utils/dateUtils";

const ViewLeadModal = ({ open, setOpen, leadData }) => {
  if (!leadData) return null;

  const seedInterestName =
    leadData.seedInterest?.value ||
    leadData.seedInterestName ||
    leadData.seedInterest?.name ||
    "-";

  const sourceName =
    leadData.source?.value ||
    leadData.sourceName ||
    leadData.source?.name ||
    leadData.leadSource ||
    "-";

  const statusName =
    leadData.status?.value ||
    leadData.statusName ||
    leadData.status?.name ||
    leadData.status ||
    "New";

  const createdByName =
    leadData.createdBy?.fullName ||
    leadData.createdByName ||
    "-";

  const createdByEmpId =
    leadData.createdBy?.employeeId
      ? `(${leadData.createdBy.employeeId})`
      : "";

  const formattedDate = leadData.createdAt
    ? formatDhakaDate(leadData.createdAt)
    : "-";

  return (
    <CustomModal
      open={open}
      setOpen={() => setOpen(false)}
      header="Lead Details"
      width="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold text-xl shrink-0">
              <FaUser />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide">{leadData.name || "-"}</h2>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
                <span>{leadData.contact || "-"}</span>
                {leadData.company && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <FaBuilding className="text-emerald-400" /> {leadData.company}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shrink-0">
            {statusName}
          </span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <FaUser className="text-emerald-600" /> Lead Name
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800">{leadData.name || "-"}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <FaPhoneAlt className="text-emerald-600" /> Contact Info
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800">{leadData.contact || "-"}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <FaBuilding className="text-emerald-600" /> Company Name
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800">{leadData.company || "-"}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <FaInfoCircle className="text-emerald-600" /> Status
            </p>
            <p className="mt-1 text-sm font-bold text-emerald-800">{statusName}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <FaSeedling className="text-emerald-600" /> Seed Interest
            </p>
            <p className="mt-1 text-sm font-bold text-teal-700">{seedInterestName}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <FaBullhorn className="text-emerald-600" /> Lead Source
            </p>
            <p className="mt-1 text-sm font-bold text-blue-700">{sourceName}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <FaUserCheck className="text-emerald-600" /> Created By
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800">
              {createdByName} <span className="text-slate-500 font-medium">{createdByEmpId}</span>
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
              Created Date
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800">{formattedDate}</p>
          </div>

          <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <FaFileAlt className="text-emerald-600" /> Notes / Remarks
            </p>
            <p className="mt-2 text-xs font-medium text-slate-700 whitespace-pre-wrap leading-relaxed">
              {leadData.notes || "No notes provided."}
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

export default ViewLeadModal;
