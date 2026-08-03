import React from "react";
import { FaStore, FaMapMarkerAlt, FaPhoneAlt, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import CustomModal from "../../../components/CustomModal";

const BranchSelectModal = ({
  open,
  setOpen,
  locations = [],
  selectedBranch,
  onSelectBranch,
  loading = false,
  allowClose = true,
}) => {
  const handleSelect = (loc) => {
    onSelectBranch(loc);
    setOpen(false);
  };

  return (
    <CustomModal
      open={open}
      setOpen={(val) => {
        if (allowClose || selectedBranch) {
          setOpen(val);
        }
      }}
      header="Select POS Branch / Outlet"
      width="max-w-xl"
    >
      <div className="space-y-5">
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-slate-700">
            Choose the active POS location you are operating from
          </p>
          <p className="text-xs text-slate-500">
            Sales, orders, and receipts will be linked to your selected outlet.
          </p>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            Loading assigned POS branches...
          </div>
        ) : locations.length === 0 ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 mx-auto">
              <FaExclamationTriangle className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-amber-900">
                No POS Outlets Assigned
              </h4>
              <p className="text-xs text-amber-700 mt-1 max-w-md mx-auto">
                Your account is currently not assigned to any active POS outlet location. Please ask an HR/Admin manager to assign you to a POS location.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto pr-1">
            {locations.map((loc) => {
              const isSelected = selectedBranch && String(selectedBranch.id) === String(loc.id);

              return (
                <div
                  key={loc.id}
                  onClick={() => handleSelect(loc)}
                  className={`group cursor-pointer rounded-2xl border p-4 transition-all duration-200 flex items-center justify-between gap-4 ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20"
                      : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${
                        isSelected
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-700"
                      }`}
                    >
                      <FaStore className="h-6 w-6" />
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-slate-800 group-hover:text-emerald-800">
                        {loc.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <FaMapMarkerAlt className="text-slate-400" />
                          {loc.address || "Main Branch"}
                        </span>
                        {loc.contact && (
                          <span className="flex items-center gap-1">
                            <FaPhoneAlt className="text-slate-400" />
                            {loc.contact}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-xs">
                        <FaCheckCircle className="h-3.5 w-3.5" /> Selected
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(loc);
                        }}
                        className="rounded-xl border border-emerald-300 bg-white px-3.5 py-1.5 text-xs font-bold text-emerald-700 shadow-2xs transition hover:bg-emerald-600 hover:text-white"
                      >
                        Select Outlet
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {(allowClose || selectedBranch) && (
          <div className="flex justify-end border-t pt-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </CustomModal>
  );
};

export default BranchSelectModal;
