import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import CustomModal from "../../../../components/CustomModal";
import useLeaveQuota from "../../../../hooks/useLeaveQuota";
import { useTriggerRefreshStore } from "../../../../store/triggerRefreshStore";
import SearchableSelect from "../../../../components/SearchableSelect";
import useEmployee from "../../../../hooks/useEmployee";

const initialForm = {
  userId: "",
  year: new Date().getFullYear().toString(),
  quota: "",
};

const CreateLeaveQuotaModal = ({
  open,
  setOpen,
  leaveQuotaData,
  setLeaveQuotaData,
}) => {
  const { createLeaveQuota, updateLeaveQuota, loading } = useLeaveQuota();

  const { triggerRefresh, setTriggerRefresh } = useTriggerRefreshStore();
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const { getEmployees } = useEmployee();

  useEffect(() => {
    if (leaveQuotaData) {
      setFormData({
        userId: leaveQuotaData.userId || "",
        year: leaveQuotaData.year || new Date().getFullYear().toString(),
        quota: leaveQuotaData.quota || "",
      });
    } else {
      setFormData(initialForm);
    }
  }, [leaveQuotaData]);

  useEffect(() => {
    const fetchEmployees = async () => {
      const res = await getEmployees(false);

      if (res.success) {
        setEmployees(res.data || []);
      }
    };
    fetchEmployees();
  }, [triggerRefresh]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleClose = () => {
    setOpen(false);
    setLeaveQuotaData(null);
    setFormData(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: leaveQuotaData ? "Update Leave Quota?" : "Create Leave Quota?",
      text: leaveQuotaData
        ? "Do you want to update this leave quota?"
        : "Do you want to create this leave quota?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: leaveQuotaData ? "Yes, Update" : "Yes, Create",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    const payload = {
      ...formData,
      userId: formData.userId ? Number(formData.userId) : null,
      year: Number(formData.year),
      quota: Number(formData.quota),
    };

    const res = leaveQuotaData
      ? await updateLeaveQuota(leaveQuotaData.id, payload)
      : await createLeaveQuota(payload);

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
      header={leaveQuotaData ? "Edit Leave Quota" : "Create Leave Quota"}
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
              placeholder="Select an employee"
              searchPlaceholder="Search employee name or ID..."
              getOptionLabel={(emp) =>
                `${emp.fullName || `Employee ${emp.id}`} - ${emp.employeeId}`
              }
              getOptionValue={(emp) => emp.id}
            />
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
              Leave Quota (Days)
            </label>

            <input
              type="number"
              name="quota"
              value={formData.quota}
              onChange={handleChange}
              required
              min="0"
              placeholder="Enter leave quota"
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
              : leaveQuotaData
                ? "Update Quota"
                : "Create Quota"}
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

export default CreateLeaveQuotaModal;
