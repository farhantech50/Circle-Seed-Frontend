import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import CustomModal from "../../../components/CustomModal";
import SearchableSelect from "../../../components/SearchableSelect";
import Lookup from "../../../components/Lookup";
import useLookUp from "../../../hooks/useLookup";
import useLeads from "../../../hooks/useLeads";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import showToast from "../../../utils/toast";

const initialForm = {
  name: "",
  contact: "",
  company: "",
  seedInterestId: "",
  sourceId: "",
  statusId: "",
  notes: "",
};

const CreateEditLeadModal = ({ open, setOpen, leadData, setLeadData }) => {
  const { createLead, updateLead, loading: submitting } = useLeads();
  const { getLookup } = useLookUp();
  const { setTriggerRefresh } = useTriggerRefreshStore();

  const [formData, setFormData] = useState(initialForm);
  const [seedInterestOptions, setSeedInterestOptions] = useState([]);
  const [leadSourceOptions, setLeadSourceOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [lookupsLoading, setLookupsLoading] = useState(false);

  // Fetch Lookups for seed_type, lead_source, lead_status
  useEffect(() => {
    if (open) {
      const fetchLookups = async () => {
        setLookupsLoading(true);
        try {
          const [seedRes, sourceRes, statusRes] = await Promise.all([
            getLookup("seed_type"),
            getLookup("lead_source"),
            getLookup("lead_status"),
          ]);

          // Seed Type
          let seedList = seedRes.success && Array.isArray(seedRes.data) ? seedRes.data : [];
          if (seedList.length === 0) {
            const fallback = await getLookup("seedType");
            if (fallback.success && Array.isArray(fallback.data)) {
              seedList = fallback.data;
            }
          }
          setSeedInterestOptions(seedList);

          // Lead Source
          let sourceList = sourceRes.success && Array.isArray(sourceRes.data) ? sourceRes.data : [];
          if (sourceList.length === 0) {
            const fallback = await getLookup("leadSource");
            if (fallback.success && Array.isArray(fallback.data)) {
              sourceList = fallback.data;
            }
          }
          setLeadSourceOptions(sourceList);

          // Lead Status
          let statusList = statusRes.success && Array.isArray(statusRes.data) ? statusRes.data : [];
          if (statusList.length === 0) {
            const fallback = await getLookup("status");
            if (fallback.success && Array.isArray(fallback.data)) {
              statusList = fallback.data;
            }
          }
          setStatusOptions(statusList);
        } catch (err) {
          console.error("Error fetching lead lookups:", err);
        } finally {
          setLookupsLoading(false);
        }
      };
      fetchLookups();
    }
  }, [open, getLookup]);

  // Populate form if editing
  useEffect(() => {
    if (leadData) {
      setFormData({
        name: leadData.name || "",
        contact: leadData.contact || "",
        company: leadData.company || "",
        seedInterestId: leadData.seedInterestId || leadData.seedInterest?.id || "",
        sourceId: leadData.sourceId || leadData.source?.id || "",
        statusId: leadData.statusId || leadData.status?.id || "",
        notes: leadData.notes || "",
      });
    } else {
      setFormData(initialForm);
    }
  }, [leadData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    setOpen(false);
    if (setLeadData) setLeadData(null);
    setFormData(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast("Please enter lead name", "error");
      return;
    }
    if (!formData.contact.trim()) {
      showToast("Please enter contact information", "error");
      return;
    }

    const result = await Swal.fire({
      title: leadData ? "Update Lead?" : "Create New Lead?",
      text: leadData
        ? "Do you want to update this lead entry?"
        : "Do you want to save this new lead?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: leadData ? "Yes, Update" : "Yes, Save",
    });

    if (!result.isConfirmed) return;

    const payload = {
      name: formData.name.trim(),
      contact: formData.contact.trim(),
      company: formData.company.trim(),
      seedInterestId: formData.seedInterestId ? Number(formData.seedInterestId) : null,
      sourceId: formData.sourceId ? Number(formData.sourceId) : null,
      ...(formData.statusId ? { statusId: Number(formData.statusId) } : {}),
      notes: formData.notes.trim(),
    };

    const res = leadData
      ? await updateLead(leadData.id, payload)
      : await createLead(payload);

    if (res.success) {
      setTriggerRefresh();
      handleClose();

      Swal.fire({
        title: "Success",
        text: res.message || (leadData ? "Lead updated successfully" : "Lead created successfully"),
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
      header={leadData ? "Edit Lead Details" : "Create New Lead"}
      width="w-[50vw]"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block mb-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              Lead Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Md. Mahmudul Hasan"
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block mb-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              Contact Info <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="e.g. 01798916082"
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Company */}
          <div>
            <label className="block mb-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              Company Name
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g. Green Agro"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Seed Interest (Lookup: seed_type) */}
          <div>
            <label className="block mb-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              Seed Interest
            </label>
            <Lookup
              lookupName="seed_type"
              selectedId={formData.seedInterestId}
              setSelectedId={(id) =>
                setFormData((prev) => ({
                  ...prev,
                  seedInterestId: id,
                }))
              }
              isMultiple={false}
            />
          </div>

          {/* Lead Source (Lookup: lead_source) */}
          <div>
            <label className="block mb-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              Lead Source
            </label>
            <Lookup
              lookupName="lead_source"
              selectedId={formData.sourceId}
              setSelectedId={(id) =>
                setFormData((prev) => ({
                  ...prev,
                  sourceId: id,
                }))
              }
              isMultiple={false}
            />
          </div>

          {/* Lead Status (Lookup: lead_status) */}
          <div>
            <label className="block mb-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              Lead Status
            </label>
            <Lookup
              lookupName="lead_status"
              selectedId={formData.statusId}
              setSelectedId={(id) =>
                setFormData((prev) => ({
                  ...prev,
                  statusId: id,
                }))
              }
              isMultiple={false}
            />
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block mb-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              Notes / Remarks
            </label>
            <textarea
              rows={3}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any additional details or context..."
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
            {submitting ? "Saving..." : leadData ? "Update Lead" : "Create Lead"}
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

export default CreateEditLeadModal;
