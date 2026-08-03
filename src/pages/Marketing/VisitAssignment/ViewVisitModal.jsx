import React from "react";
import CustomModal from "../../../components/CustomModal";
import { formatDhakaDate, formatDhakaDateTime } from "../../../utils/dateUtils";
import {
  FaMapMarkedAlt,
  FaUserCheck,
  FaCalendarAlt,
  FaPhoneAlt,
  FaUser,
  FaBuilding,
  FaTag,
  FaMapMarkerAlt,
  FaClock,
  FaFileAlt,
  FaUserPlus,
  FaExternalLinkAlt,
} from "react-icons/fa";

const ViewVisitModal = ({ open, setOpen, visitData }) => {
  if (!visitData) return null;

  const visitCode = visitData.visitId || `VST-${String(visitData.id).padStart(4, "0")}`;

  const typeName =
    visitData.type?.value ||
    visitData.type?.name ||
    visitData.typeName ||
    "-";

  const statusName =
    visitData.status?.value ||
    visitData.status?.name ||
    visitData.statusName ||
    "Planned";

  const assignedToName =
    visitData.assignedTo?.fullName ||
    visitData.assignedTo?.name ||
    "-";

  const assignedToCode = visitData.assignedTo?.employeeId || "";

  const createdByName =
    visitData.createdBy?.fullName ||
    visitData.createdBy?.name ||
    "-";

  const createdByCode = visitData.createdBy?.employeeId || "";

  const leadName =
    visitData.lead?.name ||
    visitData.leadName ||
    "-";

  const leadContact =
    visitData.lead?.contact ||
    visitData.lead?.phone ||
    "-";

  const stakeholderName =
    visitData.stakeholder?.name ||
    visitData.stakeholder?.companyName ||
    visitData.stakeholderName ||
    "-";

  const contactName = visitData.contactName || (leadName !== "-" ? leadName : stakeholderName !== "-" ? stakeholderName : "-");
  const contactPhone = visitData.contactPhone || (leadContact !== "-" ? leadContact : visitData.stakeholder?.phone || "-");

  const formattedPlannedDate = visitData.plannedDate
    ? formatDhakaDate(visitData.plannedDate)
    : "-";

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "-";
    return formatDhakaDateTime(dateStr);
  };

  const renderStatusBadge = (statusVal) => {
    let colorClasses = "bg-amber-500/20 text-amber-300 border border-amber-400/30";
    if (statusVal.toLowerCase().includes("completed")) {
      colorClasses = "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30";
    } else if (statusVal.toLowerCase().includes("progress")) {
      colorClasses = "bg-blue-500/20 text-blue-300 border border-blue-400/30";
    } else if (statusVal.toLowerCase().includes("cancel")) {
      colorClasses = "bg-rose-500/20 text-rose-300 border border-rose-400/30";
    }
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${colorClasses}`}>
        {statusVal}
      </span>
    );
  };

  const hasCheckInLocation = Boolean(visitData.checkInLatitude || visitData.checkInLongitude);
  const hasCheckOutLocation = Boolean(visitData.checkOutLatitude || visitData.checkOutLongitude);

  return (
    <CustomModal
      open={open}
      setOpen={() => setOpen(false)}
      header={`Visit Details — ${visitCode}`}
      width="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold text-xl shrink-0">
              <FaMapMarkedAlt />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-wide">{visitCode}</h2>
                {renderStatusBadge(statusName)}
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <span className="font-semibold text-emerald-400">{typeName}</span>
                <span>•</span>
                <span>Assigned: {assignedToName} {assignedToCode ? `(${assignedToCode})` : ""}</span>
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-emerald-300 uppercase tracking-wider block font-bold">
              Planned Visit Date
            </span>
            <span className="text-sm font-bold text-white">
              {formattedPlannedDate}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <FaTag className="text-emerald-600" /> Visit Type & Code
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800">{typeName} ({visitCode})</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <FaUserCheck className="text-emerald-600" /> Assigned Staff
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800">
              {assignedToName} {assignedToCode ? `(${assignedToCode})` : ""}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <FaUserPlus className="text-emerald-600" /> Created By
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800">
              {createdByName} {createdByCode ? `(${createdByCode})` : ""}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <FaCalendarAlt className="text-emerald-600" /> Planned Date
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800">{formattedPlannedDate}</p>
          </div>

          {/* Contact Details */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <FaUser className="text-emerald-600" /> Contact Name
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800">{contactName}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <FaPhoneAlt className="text-emerald-600" /> Contact Phone
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800">{contactPhone}</p>
          </div>

          {/* Target Association */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <FaBuilding className="text-emerald-600" /> Target Association
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800">
              {leadName !== "-"
                ? `Lead: ${leadName} (${leadContact})`
                : stakeholderName !== "-"
                ? `Stakeholder: ${stakeholderName}`
                : "Direct Contact"}
            </p>
          </div>

          {/* Check-In Information & Location */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <FaClock className="text-emerald-600" /> Check-In Time & GPS Location
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800">
              {formatDateTime(visitData.checkInTime)}
            </p>
            {hasCheckInLocation ? (
              <div className="mt-2.5">
                <a
                  href={`https://www.google.com/maps?q=${visitData.checkInLatitude},${visitData.checkInLongitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-lg border border-emerald-300 transition shadow-2xs group"
                >
                  <FaMapMarkerAlt className="text-emerald-600 group-hover:scale-110 transition" />
                  <span>Lat: {visitData.checkInLatitude || "-"}, Long: {visitData.checkInLongitude || "-"}</span>
                  <FaExternalLinkAlt className="w-2.5 h-2.5 text-emerald-500 ml-1" />
                </a>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1 italic">
                Check-in GPS coordinates not recorded
              </p>
            )}
          </div>

          {/* Check-Out Information & Location */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <FaClock className="text-emerald-600" /> Check-Out Time & GPS Location
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800">
              {formatDateTime(visitData.checkOutTime)}
            </p>
            {hasCheckOutLocation ? (
              <div className="mt-2.5">
                <a
                  href={`https://www.google.com/maps?q=${visitData.checkOutLatitude},${visitData.checkOutLongitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-lg border border-emerald-300 transition shadow-2xs group"
                >
                  <FaMapMarkerAlt className="text-emerald-600 group-hover:scale-110 transition" />
                  <span>Lat: {visitData.checkOutLatitude || "-"}, Long: {visitData.checkOutLongitude || "-"}</span>
                  <FaExternalLinkAlt className="w-2.5 h-2.5 text-emerald-500 ml-1" />
                </a>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1 italic">
                Check-out GPS coordinates not recorded
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <FaFileAlt className="text-emerald-600" /> Visit Notes
            </p>
            <p className="mt-2 text-xs font-medium text-slate-700 whitespace-pre-wrap leading-relaxed">
              {visitData.notes || "No visit notes recorded yet."}
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

export default ViewVisitModal;
