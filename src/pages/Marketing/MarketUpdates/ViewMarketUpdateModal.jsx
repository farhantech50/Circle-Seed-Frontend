import React from "react";
import CustomModal from "../../../components/CustomModal";
import { FaChartLine, FaSeedling, FaMapMarkerAlt, FaTag, FaCalendarAlt, FaFileAlt, FaUserCheck } from "react-icons/fa";
import { formatDhakaDate } from "../../../utils/dateUtils";

const ViewMarketUpdateModal = ({ open, setOpen, updateData }) => {
  if (!updateData) return null;

  const seedTypeName =
    updateData.seedType?.value ||
    updateData.seedTypeName ||
    updateData.seedType?.name ||
    "-";

  const regionName =
    updateData.region?.value ||
    updateData.regionName ||
    updateData.region?.name ||
    "-";

  const createdByName =
    updateData.createdBy?.fullName ||
    updateData.createdByName ||
    "-";

  const formattedDate = updateData.date
    ? formatDhakaDate(updateData.date)
    : "-";

  const formatCurrency = (val) => {
    const num = Number(val);
    return isNaN(num) ? "৳0.00" : `৳${num.toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;
  };

  return (
    <CustomModal
      open={open}
      setOpen={() => setOpen(false)}
      header="Market Update Details"
      width="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold text-xl shrink-0">
              <FaChartLine />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide">{seedTypeName}</h2>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <FaMapMarkerAlt className="text-emerald-400" /> {regionName}
                </span>
                <span>•</span>
                <span>{formattedDate}</span>
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-emerald-300 uppercase tracking-wider block font-bold">
              Market Price
            </span>
            <span className="text-xl font-black text-emerald-400">
              {formatCurrency(updateData.pricePerKg)} <span className="text-xs font-semibold text-slate-300">/ kg</span>
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <FaSeedling className="text-emerald-600" /> Seed Type
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800">{seedTypeName}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <FaMapMarkerAlt className="text-emerald-600" /> Region / Location
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800">{regionName}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <FaTag className="text-emerald-600" /> Price Per Kg
            </p>
            <p className="mt-1 text-sm font-bold text-emerald-800">{formatCurrency(updateData.pricePerKg)}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <FaCalendarAlt className="text-emerald-600" /> Date
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800">{formattedDate}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <FaUserCheck className="text-emerald-600" /> Recorded By
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800">{createdByName}</p>
          </div>

          <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <FaFileAlt className="text-emerald-600" /> Notes & Market Trends
            </p>
            <p className="mt-2 text-xs font-medium text-slate-700 whitespace-pre-wrap leading-relaxed">
              {updateData.notes || "No notes recorded."}
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

export default ViewMarketUpdateModal;
