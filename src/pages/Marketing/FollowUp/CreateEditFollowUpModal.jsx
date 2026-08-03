import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import CustomModal from "../../../components/CustomModal";
import SearchableSelect from "../../../components/SearchableSelect";
import Lookup from "../../../components/Lookup";
import useLookUp from "../../../hooks/useLookup";
import useLeads from "../../../hooks/useLeads";
import useFollowUp from "../../../hooks/useFollowUp";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import showToast from "../../../utils/toast";
import { FaCalendarAlt } from "react-icons/fa";

const initialForm = {
  leadId: "",
  followUpDate: new Date().toISOString().split("T")[0],
  notes: "",
  outcomeId: "",
};

const CreateEditFollowUpModal = ({
  open,
  setOpen,
  followUpData,
  setFollowUpData,
}) => {
  const { createFollowUp, updateFollowUp, loading: submitting } = useFollowUp();
  const { getLeads } = useLeads();
  const { getLookup } = useLookUp();
  const { setTriggerRefresh } = useTriggerRefreshStore();

  const [formData, setFormData] = useState(initialForm);
  const [leadOptions, setLeadOptions] = useState([]);
  const [outcomeOptions, setOutcomeOptions] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Fetch Leads and Outcome Lookups
  useEffect(() => {
    if (open) {
      const loadOptions = async () => {
        setLoadingData(true);
        try {
          // Fetch Leads list
          const leadsRes = await getLeads({ limit: 100 });
          if (leadsRes.success && Array.isArray(leadsRes.data)) {
            setLeadOptions(leadsRes.data);
          }

          // Fetch Outcome Lookup (followup_outcome / follow_up_outcome / outcome)
          let outcomeRes = await getLookup("followup_outcome");
          let outcomeList =
            outcomeRes.success && Array.isArray(outcomeRes.data)
              ? outcomeRes.data
              : [];

          if (outcomeList.length === 0) {
            outcomeRes = await getLookup("follow_up_outcome");
            if (outcomeRes.success && Array.isArray(outcomeRes.data)) {
              outcomeList = outcomeRes.data;
            }
          }
          if (outcomeList.length === 0) {
            outcomeRes = await getLookup("outcome");
            if (outcomeRes.success && Array.isArray(outcomeRes.data)) {
              outcomeList = outcomeRes.data;
            }
          }

          setOutcomeOptions(outcomeList);
        } catch (err) {
          console.error("Error loading follow-up modal options:", err);
        } finally {
          setLoadingData(false);
        }
      };

      loadOptions();
    }
  }, [open, getLeads, getLookup]);

  // Populate form if editing
  useEffect(() => {
    if (followUpData) {
      setFormData({
        leadId: followUpData.leadId || followUpData.lead?.id || "",
        followUpDate: followUpData.followUpDate
          ? followUpData.followUpDate.split("T")[0]
          : new Date().toISOString().split("T")[0],
        notes: followUpData.notes || "",
        outcomeId: followUpData.outcomeId || followUpData.outcome?.id || "",
      });
    } else {
      setFormData({
        ...initialForm,
        followUpDate: new Date().toISOString().split("T")[0],
      });
    }
  }, [followUpData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    setOpen(false);
    if (setFollowUpData) setFollowUpData(null);
    setFormData(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.leadId) {
      showToast("Please select a lead", "error");
      return;
    }
    if (!formData.followUpDate) {
      showToast("Please select a follow-up date", "error");
      return;
    }

    const result = await Swal.fire({
      title: followUpData ? "Update Follow-Up?" : "Record Follow-Up?",
      text: followUpData
        ? "Do you want to update this follow-up entry?"
        : "Do you want to save this follow-up record?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: followUpData ? "Yes, Update" : "Yes, Save",
    });

    if (!result.isConfirmed) return;

    const payload = {
      leadId: Number(formData.leadId),
      followUpDate: formData.followUpDate,
      notes: formData.notes.trim(),
      ...(formData.outcomeId ? { outcomeId: Number(formData.outcomeId) } : {}),
    };

    const res = followUpData
      ? await updateFollowUp(followUpData.id, payload)
      : await createFollowUp(payload);

    if (res.success) {
      setTriggerRefresh();
      handleClose();

      Swal.fire({
        title: "Success",
        text:
          res.message ||
          (followUpData
            ? "Follow-up updated successfully"
            : "Follow-up recorded successfully"),
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
      header={followUpData ? "Edit Follow-Up Record" : "New Follow-Up Record"}
      width="w-[50vw]"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Lead Select */}
          <div className="md:col-span-2">
            <label className="block mb-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Lead <span className="text-rose-500">*</span>
            </label>
            <SearchableSelect
              options={leadOptions}
              value={formData.leadId}
              onChange={(val) => setFormData((prev) => ({ ...prev, leadId: val }))}
              placeholder={loadingData ? "Loading leads..." : "Select Lead"}
              getOptionLabel={(opt) =>
                `${opt.name || opt.contact || `Lead #${opt.id}`} ${opt.company ? `(${opt.company})` : ""
                }`
              }
              getOptionValue={(opt) => opt.id}
            />
          </div>

          {/* Follow-Up Date */}
          <div>
            <label className="block mb-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              Follow-Up Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                name="followUpDate"
                value={formData.followUpDate}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Outcome (Lookup: follow_up_outcome) */}
          <div>
            <label className="block mb-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              Follow-Up Outcome / Status
            </label>
            <Lookup
              lookupName="follow_up_outcome"
              selectedId={formData.outcomeId}
              setSelectedId={(id) =>
                setFormData((prev) => ({
                  ...prev,
                  outcomeId: id,
                }))
              }
              isMultiple={false}
            />
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block mb-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              Follow-Up Notes / Conversation Details
            </label>
            <textarea
              rows={4}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Record key discussion points, customer feedback, next steps..."
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
            {submitting ? "Saving..." : followUpData ? "Update Record" : "Save Follow-Up"}
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

export default CreateEditFollowUpModal;
