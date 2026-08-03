import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import CustomModal from "../../../components/CustomModal";
import useAttendance from "../../../hooks/useAttendance";
import useEmployee from "../../../hooks/useEmployee";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import Lookup from "../../../components/Lookup";

const todayDate = new Date().toISOString().split("T")[0];

const initialForm = {
  date: todayDate,
  userIds: [],
  statusId: "",
  notes: "",
};

const CreateAttendanceModal = ({ open, setOpen }) => {
  const { createAttendance, loading } = useAttendance();
  const { getEmployees } = useEmployee();
  const { setTriggerRefresh } = useTriggerRefreshStore();

  const [formData, setFormData] = useState(initialForm);
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData(initialForm);
      setSearchQuery("");
      fetchEmployees();
    }
  }, [open]);

  const fetchEmployees = async () => {
    // Assuming limit=1000 to get all employees for dropdown
    const res = await getEmployees();
    if (res.success) {
      const filteredList = (res.data || []).filter(
        (emp) =>
          emp.role?.value?.toLowerCase() !== "superadmin" &&
          emp.username?.toLowerCase() !== "superadmin",
      );
      setEmployees(filteredList);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "statusId" && value !== "" ? parseInt(value) : value,
    }));
  };

  const filteredEmployees = employees.filter((emp) =>
    (emp.fullName || `Employee ${emp.id}`)
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  const isAllSelected =
    filteredEmployees.length > 0 &&
    filteredEmployees.every((emp) => formData.userIds.includes(emp.id));

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const newIds = filteredEmployees.map((emp) => emp.id);
      setFormData((prev) => ({
        ...prev,
        userIds: Array.from(new Set([...prev.userIds, ...newIds])),
      }));
    } else {
      const filteredIds = filteredEmployees.map((emp) => emp.id);
      setFormData((prev) => ({
        ...prev,
        userIds: prev.userIds.filter((id) => !filteredIds.includes(id)),
      }));
    }
  };

  const handleCheckboxChange = (id) => {
    setFormData((prev) => {
      const isSelected = prev.userIds.includes(id);
      return {
        ...prev,
        userIds: isSelected
          ? prev.userIds.filter((uid) => uid !== id)
          : [...prev.userIds, parseInt(id)],
      };
    });
  };

  const handleClose = () => {
    setOpen(false);
    setFormData(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: "Create Attendance?",
      text: "Do you want to create this attendance record?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Create",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const payload = {
        ...formData,
        // Send userIds as an array or comma-separated if needed by backend, keeping it array as per standard
      };

      const res = await createAttendance(payload);

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
          text: res.message || "Operation failed.",
          icon: "error",
          confirmButtonColor: "#0D9488",
        });
      }
    } catch (error) {
      console.error(error);

      Swal.fire({
        title: "Error!",
        text: "Something went wrong.",
        icon: "error",
        confirmButtonColor: "#0D9488",
      });
    }
  };

  return (
    <CustomModal
      open={open}
      setOpen={handleClose}
      header="Create Attendance"
      width="w-[50vw]"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-5">
          {/* Row 1: Date and Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Lookup
              lookupName="attendance_status"
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

          {/* Row 2: Employees and Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employees
            </label>
            <button
              type="button"
              onClick={() => setEmployeeModalOpen(true)}
              className="w-full flex items-center justify-between rounded-lg border border-gray-300 px-3 py-2 bg-white text-gray-700 hover:bg-gray-50 focus:border-primary-500 focus:ring-primary-500 transition text-left"
            >
              <span className="truncate">
                {formData.userIds.length > 0
                  ? `${formData.userIds.length} employee(s) selected`
                  : "Select Employees"}
              </span>
              <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-md font-medium shrink-0">
                Browse
              </span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any notes here..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-5">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-gray-700 transition hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-button-primary px-5 py-2 text-white transition hover:bg-button-primary-hover disabled:opacity-50"
          >
            {loading ? "Saving..." : "Create Attendance"}
          </button>
        </div>
      </form>

      <CustomModal
        open={employeeModalOpen}
        setOpen={setEmployeeModalOpen}
        header="Select Employees"
        width="w-[40vw]"
      >
        <div className="flex flex-col h-[50vh]">
          <input
            type="text"
            placeholder="Search employees by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 mb-3 focus:border-primary-500 focus:ring-primary-500 text-sm"
          />
          <div className="flex items-center mb-3 pb-3 border-b border-gray-200">
            <input
              type="checkbox"
              id="selectAll"
              checked={isAllSelected}
              onChange={handleSelectAll}
              className="mr-2 rounded text-primary-600 focus:ring-primary-500"
            />
            <label
              htmlFor="selectAll"
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              Select All
            </label>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => (
                <div key={emp.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`emp-${emp.id}`}
                    checked={formData.userIds.includes(emp.id)}
                    onChange={() => handleCheckboxChange(emp.id)}
                    className="mr-2 rounded text-primary-600 focus:ring-primary-500"
                  />
                  <label
                    htmlFor={`emp-${emp.id}`}
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    {emp.fullName || `Employee ${emp.id}`} - {emp.employeeId || "N/A"} ({emp.role?.value || "N/A"})
                  </label>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No employees found.</p>
            )}
          </div>
          <div className="flex justify-end gap-3 border-t pt-4 mt-4">
            <button
              type="button"
              onClick={() => setEmployeeModalOpen(false)}
              className="rounded-lg bg-button-primary px-5 py-2 text-white transition hover:bg-button-primary-hover"
            >
              Done
            </button>
          </div>
        </div>
      </CustomModal>
    </CustomModal>
  );
};

export default CreateAttendanceModal;
