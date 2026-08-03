import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import CustomModal from "../../../components/CustomModal";
import Lookup from "../../../components/Lookup";
import useMarketUpdates from "../../../hooks/useMarketUpdates";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import showToast from "../../../utils/toast";

const initialForm = {
  seedTypeId: "",
  regionId: "",
  pricePerKg: "",
  date: new Date().toISOString().split("T")[0],
  notes: "",
};

const CreateEditMarketUpdateModal = ({
  open,
  setOpen,
  updateData,
  setUpdateData,
}) => {
  const { createMarketUpdate, updateMarketUpdate, loading: submitting } = useMarketUpdates();
  const { setTriggerRefresh } = useTriggerRefreshStore();

  const [formData, setFormData] = useState(initialForm);

  // Populate form if editing
  useEffect(() => {
    if (updateData) {
      setFormData({
        seedTypeId: updateData.seedTypeId || updateData.seedType?.id || "",
        regionId: updateData.regionId || updateData.region?.id || "",
        pricePerKg: updateData.pricePerKg || "",
        date: updateData.date
          ? updateData.date.split("T")[0]
          : new Date().toISOString().split("T")[0],
        notes: updateData.notes || "",
      });
    } else {
      setFormData({
        ...initialForm,
        date: new Date().toISOString().split("T")[0],
      });
    }
  }, [updateData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    setOpen(false);
    if (setUpdateData) setUpdateData(null);
    setFormData(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.seedTypeId) {
      showToast("Please select a seed type", "error");
      return;
    }
    if (!formData.regionId) {
      showToast("Please select a region", "error");
      return;
    }
    if (!formData.pricePerKg || Number(formData.pricePerKg) <= 0) {
      showToast("Please enter a valid price per kg", "error");
      return;
    }
    if (!formData.date) {
      showToast("Please select a date", "error");
      return;
    }

    const result = await Swal.fire({
      title: updateData ? "Update Market Record?" : "Create Market Update?",
      text: updateData
        ? "Do you want to update this market price record?"
        : "Do you want to save this new market price record?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: updateData ? "Yes, Update" : "Yes, Save",
    });

    if (!result.isConfirmed) return;

    const payload = {
      seedTypeId: Number(formData.seedTypeId),
      regionId: Number(formData.regionId),
      pricePerKg: Number(formData.pricePerKg),
      date: formData.date,
      notes: formData.notes.trim(),
    };

    const res = updateData
      ? await updateMarketUpdate(updateData.id, payload)
      : await createMarketUpdate(payload);

    if (res.success) {
      setTriggerRefresh();
      handleClose();

      Swal.fire({
        title: "Success",
        text:
          res.message ||
          (updateData
            ? "Market update updated successfully"
            : "Market update recorded successfully"),
        icon: "success",
        confirmButtonColor: "#0D9488",
      });
    } else {
      Swal.fire({
        title: "Error",
        text: res.message || "Operation failed",
        icon: "error",
        confirmButtonColor: "#0D9488",
      });
    }
  };

  return (
    <CustomModal
      open={open}
      setOpen={handleClose}
      header={updateData ? "Edit Market Update" : "New Market Price Update"}
      width="w-[50vw]"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Seed Type (Lookup: seed_type) */}
          <div>
            <label className="block mb-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              Seed Type <span className="text-rose-500">*</span>
            </label>
            <Lookup
              lookupName="seed_type"
              selectedId={formData.seedTypeId}
              setSelectedId={(id) =>
                setFormData((prev) => ({
                  ...prev,
                  seedTypeId: id,
                }))
              }
              isMultiple={false}
            />
          </div>

          {/* Region (Lookup: region) */}
          <div>
            <label className="block mb-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              Region / Location <span className="text-rose-500">*</span>
            </label>
            <Lookup
              lookupName="region"
              selectedId={formData.regionId}
              setSelectedId={(id) =>
                setFormData((prev) => ({
                  ...prev,
                  regionId: id,
                }))
              }
              isMultiple={false}
            />
          </div>

          {/* Price Per Kg */}
          <div>
            <label className="block mb-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              Price Per Kg (BDT) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              name="pricePerKg"
              value={formData.pricePerKg}
              onChange={handleChange}
              placeholder="e.g. 150.00"
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block mb-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block mb-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              Notes / Market Trends
            </label>
            <textarea
              rows={3}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Record local market observations, competitor pricing, supply notes..."
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
          >
            {submitting ? "Saving..." : updateData ? "Update Record" : "Save Record"}
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

export default CreateEditMarketUpdateModal;
