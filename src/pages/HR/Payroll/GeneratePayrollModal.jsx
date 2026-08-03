import { useState } from "react";
import Swal from "sweetalert2";
import CustomModal from "../../../components/CustomModal";
import EmployeeSelectionModal from "./EmployeeSelectionModal";
import usePayroll from "../../../hooks/usePayroll";

const MONTHS = [
  { id: 1, name: "January" },
  { id: 2, name: "February" },
  { id: 3, name: "March" },
  { id: 4, name: "April" },
  { id: 5, name: "May" },
  { id: 6, name: "June" },
  { id: 7, name: "July" },
  { id: 8, name: "August" },
  { id: 9, name: "September" },
  { id: 10, name: "October" },
  { id: 11, name: "November" },
  { id: 12, name: "December" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => ({
  id: currentYear - 2 + i,
  name: (currentYear - 2 + i).toString(),
}));

const GeneratePayrollModal = ({ open, setOpen, onGenerated, employees }) => {
  const { generatePayroll, loading } = usePayroll();

  const [formData, setFormData] = useState({
    userId: [],
    month: new Date().getMonth() + 1,
    year: currentYear,
  });
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
    setFormData({
      userId: [],
      month: new Date().getMonth() + 1,
      year: currentYear,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.userId || formData.userId.length === 0) {
      await Swal.fire({
        title: "Error!",
        text: "Please select at least one user.",
        icon: "error",
        confirmButtonColor: "#0D9488",
      });
      return;
    }

    const payload = {
      userIds: formData.userId.map(id => Number(id)),
      month: Number(formData.month),
      year: Number(formData.year),
    };

    const result = await Swal.fire({
      title: "Generate Payroll?",
      text: "Do you want to generate payroll for the selected users?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Generate",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    const res = await generatePayroll(payload);
    if (res.success) {
      handleClose();
      await Swal.fire({
        title: "Success!",
        text: res.message,
        icon: "success",
        confirmButtonColor: "#0D9488",
      });
      if (onGenerated) {
        onGenerated();
      }
    } else {
      await Swal.fire({
        title: "Error!",
        text: res.message || "Failed to generate payroll.",
        icon: "error",
        confirmButtonColor: "#0D9488",
      });
    }
  };

  return (
    <CustomModal
      open={open}
      setOpen={handleClose}
      header="Generate Payroll"
      width="w-[90vw] md:w-[40vw]"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Employees
            </label>
            <button
              type="button"
              onClick={() => setIsEmployeeModalOpen(true)}
              className="w-full text-left rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary-500 focus:ring-primary-500 transition hover:bg-gray-50 flex justify-between items-center"
            >
              <span>
                {formData.userId.length > 0
                  ? `${formData.userId.length} Employee(s) Selected`
                  : "Select employees..."}
              </span>
              <span className="text-gray-400">🔍</span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month
            </label>
            <select
              value={formData.month}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, month: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Select Month</option>
              {MONTHS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              value={formData.year}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, year: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Select Year</option>
              {YEARS.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-5">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 transition"
          >
            {loading ? "Generating..." : "Generate Payroll"}
          </button>
        </div>
      </form>

      {/* Nested Employee Selection Modal */}
      {isEmployeeModalOpen && (
        <EmployeeSelectionModal
          open={isEmployeeModalOpen}
          setOpen={setIsEmployeeModalOpen}
          employees={employees}
          selectedIds={formData.userId}
          onConfirm={(ids) =>
            setFormData((prev) => ({ ...prev, userId: ids }))
          }
        />
      )}
    </CustomModal>
  );
};

export default GeneratePayrollModal;
