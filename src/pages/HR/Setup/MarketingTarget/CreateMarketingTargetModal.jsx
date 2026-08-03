import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import CustomModal from "../../../../components/CustomModal";
import useTarget from "../../../../hooks/useTarget";
import { useTriggerRefreshStore } from "../../../../store/triggerRefreshStore";
import SearchableSelect from "../../../../components/SearchableSelect";
import useEmployee from "../../../../hooks/useEmployee";
import { MONTH_OPTIONS } from "../SalesTarget/CreateSalesTargetModal";

const initialForm = {
  userId: "",
  month: (new Date().getMonth() + 1).toString(),
  year: new Date().getFullYear().toString(),
  targetLeads: "",
  targetVisits: "",
  targetFollowUps: "",
};

const CreateMarketingTargetModal = ({
  open,
  setOpen,
  targetData,
  setTargetData,
}) => {
  const { createMarketingTarget, updateMarketingTarget, loading } = useTarget();
  const { triggerRefresh, setTriggerRefresh } = useTriggerRefreshStore();
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const { getEmployees } = useEmployee();

  useEffect(() => {
    if (targetData) {
      setFormData({
        userId: targetData.userId || targetData.user?.id || "",
        month: targetData.month ? targetData.month.toString() : (new Date().getMonth() + 1).toString(),
        year: targetData.year ? targetData.year.toString() : new Date().getFullYear().toString(),
        targetLeads: targetData.targetLeads !== undefined ? targetData.targetLeads.toString() : "",
        targetVisits: targetData.targetVisits !== undefined ? targetData.targetVisits.toString() : "",
        targetFollowUps: targetData.targetFollowUps !== undefined ? targetData.targetFollowUps.toString() : "",
      });
    } else {
      setFormData(initialForm);
    }
  }, [targetData]);

  useEffect(() => {
    const fetchEmployees = async () => {
      const res = await getEmployees(false);
      if (res.success) {
        setEmployees(res.data || []);
      }
    };
    fetchEmployees();
  }, [triggerRefresh, getEmployees]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleClose = () => {
    setOpen(false);
    setTargetData(null);
    setFormData(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: targetData ? "Update Marketing Target?" : "Create Marketing Target?",
      text: targetData
        ? "Do you want to update this marketing target?"
        : "Do you want to create this marketing target?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: targetData ? "Yes, Update" : "Yes, Create",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    const payload = {
      userId: formData.userId ? Number(formData.userId) : null,
      month: Number(formData.month),
      year: Number(formData.year),
      targetLeads: Number(formData.targetLeads),
      targetVisits: Number(formData.targetVisits),
      targetFollowUps: Number(formData.targetFollowUps),
    };

    const res = targetData
      ? await updateMarketingTarget(targetData.id, payload)
      : await createMarketingTarget(payload);

    if (res.success) {
      setTriggerRefresh();
      handleClose();

      Swal.fire({
        title: "Success!",
        text: res.message,
        icon: "success",
        confirmButtonColor: "#0D9488",
      });
    } else {
      Swal.fire({
        title: "Error!",
        text: res.message,
        icon: "error",
        confirmButtonColor: "#0D9488",
      });
    }
  };

  return (
    <CustomModal
      open={open}
      setOpen={handleClose}
      header={targetData ? "Edit Marketing Target" : "Create Marketing Target"}
      width="w-[35vw]"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Employee
            </label>
            <SearchableSelect
              options={employees}
              value={formData.userId}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  userId: value,
                }))
              }
              placeholder="All / Select Employee"
              searchPlaceholder="Search employee name or ID..."
              getOptionLabel={(emp) =>
                `${emp.fullName || `Employee ${emp.id}`} - ${emp.employeeId || ""}`
              }
              getOptionValue={(emp) => emp.id}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Month
              </label>
              <select
                name="month"
                value={formData.month}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
              >
                {MONTH_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Year
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                min="1900"
                max="2100"
                placeholder="Enter Year"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Target Leads
              </label>
              <input
                type="number"
                name="targetLeads"
                value={formData.targetLeads}
                onChange={handleChange}
                required
                min="0"
                placeholder="Enter leads count"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Target Visits
              </label>
              <input
                type="number"
                name="targetVisits"
                value={formData.targetVisits}
                onChange={handleChange}
                required
                min="0"
                placeholder="Enter visits count"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Target Follow-ups
              </label>
              <input
                type="number"
                name="targetFollowUps"
                value={formData.targetFollowUps}
                onChange={handleChange}
                required
                min="0"
                placeholder="Enter follow-ups count"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-5">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-button-primary px-5 py-2 text-white hover:bg-button-primary-hover disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : targetData
              ? "Update Target"
              : "Create Target"}
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

export default CreateMarketingTargetModal;
