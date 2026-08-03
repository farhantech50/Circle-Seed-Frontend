import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import CustomModal from "../../../components/CustomModal";
import SearchableSelect from "../../../components/SearchableSelect";
import Lookup from "../../../components/Lookup";
import useVisit from "../../../hooks/useVisit";
import useEmployee from "../../../hooks/useEmployee";
import useLeads from "../../../hooks/useLeads";
import useSupplier from "../../../hooks/useSupplier";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import showToast from "../../../utils/toast";

const initialForm = {
  typeId: "",
  assignedToId: "",
  leadId: "",
  stakeholderId: "",
  contactName: "",
  contactPhone: "",
  plannedDate: new Date().toISOString().split("T")[0],
};

const CreateEditVisitModal = ({ open, setOpen, visitData, setVisitData }) => {
  const { createVisit, updateVisit, loading: submitting } = useVisit();
  const { getEmployees } = useEmployee();
  const { getLeads } = useLeads();
  const { getSuppliers } = useSupplier();
  const { setTriggerRefresh } = useTriggerRefreshStore();

  const [formData, setFormData] = useState(initialForm);
  const [targetMode, setTargetMode] = useState("lead"); // "lead" | "stakeholder" | "direct"
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [leadOptions, setLeadOptions] = useState([]);
  const [stakeholderOptions, setStakeholderOptions] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (open) {
      const loadOptions = async () => {
        setLoadingData(true);
        try {
          // Fetch Employees
          const empRes = await getEmployees();
          if (empRes.success && Array.isArray(empRes.data)) {
            setEmployeeOptions(empRes.data);
          }

          // Fetch Leads
          const leadRes = await getLeads({ limit: 100 });
          if (leadRes.success && Array.isArray(leadRes.data)) {
            setLeadOptions(leadRes.data);
          }

          // Fetch Stakeholders
          try {
            const suppRes = await getSuppliers({ limit: 100 });
            let suppList = [];
            if (suppRes?.success) {
              if (Array.isArray(suppRes.data)) {
                suppList = suppRes.data;
              } else if (Array.isArray(suppRes.data?.data)) {
                suppList = suppRes.data.data;
              } else if (Array.isArray(suppRes.data?.stakeholders)) {
                suppList = suppRes.data.stakeholders;
              }
            }

            if (suppList.length === 0) {
              const rawRes = await api.get("/api/stakeholders");
              let items = rawRes.data;
              if (items?.data && Array.isArray(items.data)) items = items.data;
              if (Array.isArray(items)) suppList = items;
            }

            setStakeholderOptions(suppList);
          } catch (suppErr) {
            console.error("Error loading stakeholders:", suppErr);
            setStakeholderOptions([]);
          }
        } catch (err) {
          console.error("Error loading visit modal options:", err);
        } finally {
          setLoadingData(false);
        }
      };

      loadOptions();
    }
  }, [open]);

  // Populate form if editing
  useEffect(() => {
    if (visitData) {
      const hasLead = visitData.leadId || visitData.lead?.id;
      const hasStakeholder = visitData.stakeholderId || visitData.stakeholder?.id;

      let mode = "direct";
      if (hasLead) mode = "lead";
      else if (hasStakeholder) mode = "stakeholder";

      setTargetMode(mode);
      setFormData({
        typeId: visitData.typeId || visitData.type?.id || visitData.visitType?.id || "",
        assignedToId: visitData.assignedToId || visitData.assignedTo?.id || "",
        leadId: visitData.leadId || visitData.lead?.id || "",
        stakeholderId: visitData.stakeholderId || visitData.stakeholder?.id || "",
        contactName: visitData.contactName || "",
        contactPhone: visitData.contactPhone || "",
        plannedDate: visitData.plannedDate
          ? visitData.plannedDate.split("T")[0]
          : new Date().toISOString().split("T")[0],
      });
    } else {
      setTargetMode("lead");
      setFormData({
        ...initialForm,
        plannedDate: new Date().toISOString().split("T")[0],
      });
    }
  }, [visitData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    setOpen(false);
    if (setVisitData) setVisitData(null);
    setFormData(initialForm);
    setTargetMode("lead");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.typeId) {
      showToast("Please select a Visit Type", "error");
      return;
    }
    if (!formData.assignedToId) {
      showToast("Please select Assigned Staff", "error");
      return;
    }
    if (!formData.plannedDate) {
      showToast("Please select Planned Date", "error");
      return;
    }

    // Target validation based on targetMode
    if (targetMode === "lead") {
      if (!formData.leadId) {
        showToast("Please select a Lead", "error");
        return;
      }
    } else if (targetMode === "stakeholder") {
      if (!formData.stakeholderId) {
        showToast("Please select a Stakeholder / Supplier", "error");
        return;
      }
    } else if (targetMode === "direct") {
      if (!formData.contactName?.trim()) {
        showToast("Please enter Contact Name", "error");
        return;
      }
      if (!formData.contactPhone?.trim()) {
        showToast("Please enter Contact Phone", "error");
        return;
      }
    }

    const result = await Swal.fire({
      title: visitData ? "Update Visit Assignment?" : "Create Visit Assignment?",
      text: visitData
        ? "Do you want to update this visit assignment entry?"
        : "Do you want to save this new visit assignment?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: visitData ? "Yes, Update" : "Yes, Save",
    });

    if (!result.isConfirmed) return;

    let payload = {
      typeId: Number(formData.typeId),
      assignedToId: Number(formData.assignedToId),
      plannedDate: formData.plannedDate,
    };

    if (targetMode === "lead") {
      payload.leadId = Number(formData.leadId);
    } else if (targetMode === "stakeholder") {
      payload.stakeholderId = Number(formData.stakeholderId);
    } else if (targetMode === "direct") {
      payload.contactName = formData.contactName.trim();
      payload.contactPhone = formData.contactPhone.trim();
    }

    const res = visitData
      ? await updateVisit(visitData.id, payload)
      : await createVisit(payload);

    if (res.success) {
      setTriggerRefresh();
      handleClose();

      Swal.fire({
        title: "Success",
        text:
          res.message ||
          (visitData
            ? "Visit updated successfully"
            : "Visit assigned successfully"),
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
      header={visitData ? "Edit Visit Assignment" : "New Visit Assignment"}
      width="w-[50vw]"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Visit Type (Lookup: visit_type) */}
          <div>
            <label className="block mb-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              Visit Type <span className="text-rose-500">*</span>
            </label>
            <Lookup
              lookupName="visit_type"
              selectedId={formData.typeId}
              setSelectedId={(id) =>
                setFormData((prev) => ({
                  ...prev,
                  typeId: id,
                }))
              }
              isMultiple={false}
            />
          </div>

          {/* Assigned Staff */}
          <div>
            <label className="block mb-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              Assigned Staff <span className="text-rose-500">*</span>
            </label>
            <SearchableSelect
              options={employeeOptions}
              value={formData.assignedToId}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, assignedToId: val }))
              }
              placeholder={loadingData ? "Loading staff..." : "Select Staff"}
              getOptionLabel={(opt) =>
                `${opt.fullName || opt.name || `Staff #${opt.id}`} ${
                  opt.designation ? `(${opt.designation})` : ""
                }`
              }
              getOptionValue={(opt) => opt.id}
            />
          </div>

          {/* Planned Date */}
          <div className="md:col-span-2">
            <label className="block mb-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              Planned Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              name="plannedDate"
              value={formData.plannedDate}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Target Type Selector Tabs */}
          <div className="md:col-span-2">
            <label className="block mb-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Contact Target <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setTargetMode("lead");
                  setFormData((prev) => ({
                    ...prev,
                    stakeholderId: "",
                    contactName: "",
                    contactPhone: "",
                  }));
                }}
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  targetMode === "lead"
                    ? "bg-white text-emerald-700 shadow-xs border border-emerald-300"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                Lead
              </button>

              <button
                type="button"
                onClick={() => {
                  setTargetMode("stakeholder");
                  setFormData((prev) => ({
                    ...prev,
                    leadId: "",
                    contactName: "",
                    contactPhone: "",
                  }));
                }}
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  targetMode === "stakeholder"
                    ? "bg-white text-emerald-700 shadow-xs border border-emerald-300"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                Stakeholder / Supplier
              </button>

              <button
                type="button"
                onClick={() => {
                  setTargetMode("direct");
                  setFormData((prev) => ({
                    ...prev,
                    leadId: "",
                    stakeholderId: "",
                  }));
                }}
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  targetMode === "direct"
                    ? "bg-white text-emerald-700 shadow-xs border border-emerald-300"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                Direct Contact
              </button>
            </div>
          </div>

          {/* Conditional Input based on Target Mode */}
          {targetMode === "lead" && (
            <div className="md:col-span-2">
              <label className="block mb-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Lead <span className="text-rose-500">*</span>
              </label>
              <SearchableSelect
                options={leadOptions}
                value={formData.leadId}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, leadId: val }))
                }
                placeholder={loadingData ? "Loading leads..." : "Select Lead"}
                getOptionLabel={(opt) =>
                  `${opt.name || opt.contact || `Lead #${opt.id}`} ${
                    opt.company ? `(${opt.company})` : ""
                  }`
                }
                getOptionValue={(opt) => opt.id}
              />
            </div>
          )}

          {targetMode === "stakeholder" && (
            <div className="md:col-span-2">
              <label className="block mb-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Stakeholder / Supplier <span className="text-rose-500">*</span>
              </label>
              <SearchableSelect
                options={stakeholderOptions}
                value={formData.stakeholderId}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, stakeholderId: val }))
                }
                placeholder={
                  loadingData ? "Loading stakeholders..." : "Select Stakeholder"
                }
                getOptionLabel={(opt) =>
                  `${opt.name || opt.companyName || opt.contactPerson || `Stakeholder #${opt.id}`}${
                    opt.companyName && opt.name !== opt.companyName ? ` (${opt.companyName})` : ""
                  }`
                }
                getOptionValue={(opt) => opt.id}
              />
            </div>
          )}

          {targetMode === "direct" && (
            <>
              <div>
                <label className="block mb-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Contact Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  placeholder="Enter contact person name"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Contact Phone <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="Enter contact phone number"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </>
          )}
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
            {submitting
              ? "Saving..."
              : visitData
              ? "Update Assignment"
              : "Assign Visit"}
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

export default CreateEditVisitModal;
