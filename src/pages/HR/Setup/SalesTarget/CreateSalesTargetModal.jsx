import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import CustomModal from "../../../../components/CustomModal";
import useTarget from "../../../../hooks/useTarget";
import { useTriggerRefreshStore } from "../../../../store/triggerRefreshStore";
import SearchableSelect from "../../../../components/SearchableSelect";
import useEmployee from "../../../../hooks/useEmployee";

export const MONTH_OPTIONS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const initialForm = {
  userId: "",
  month: (new Date().getMonth() + 1).toString(),
  year: new Date().getFullYear().toString(),
  targetAmount: "",
};

const CreateSalesTargetModal = ({
  open,
  setOpen,
  targetData,
  setTargetData,
}) => {
  const { createSalesTarget, updateSalesTarget, loading } = useTarget();
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
        targetAmount: targetData.targetAmount !== undefined ? targetData.targetAmount.toString() : "",
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
      title: targetData ? "Update Sales Target?" : "Create Sales Target?",
      text: targetData
        ? "Do you want to update this sales target?"
        : "Do you want to create this sales target?",
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
      targetAmount: Number(formData.targetAmount),
    };

    const res = targetData
      ? await updateSalesTarget(targetData.id, payload)
      : await createSalesTarget(payload);

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
      header={targetData ? "Edit Sales Target" : "Create Sales Target"}
      width="w-[30vw]"
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

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Target Amount (BDT)
            </label>
            <input
              type="number"
              name="targetAmount"
              value={formData.targetAmount}
              onChange={handleChange}
              required
              min="0"
              step="any"
              placeholder="Enter target sales amount"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
            />
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

export default CreateSalesTargetModal;
