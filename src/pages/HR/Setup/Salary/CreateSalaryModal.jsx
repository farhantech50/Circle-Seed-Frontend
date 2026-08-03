import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import CustomModal from "../../../../components/CustomModal";
import Lookup from "../../../../components/Lookup";
import useSalary from "../../../../hooks/useSalary";
import { useTriggerRefreshStore } from "../../../../store/triggerRefreshStore";
import SearchableSelect from "../../../../components/SearchableSelect";
import useEmployee from "../../../../hooks/useEmployee";

const initialForm = {
  userId: "",
  amount: "",
  effectiveFrom: "",
};

const CreateSalaryModal = ({ open, setOpen, salaryData, setSalaryData }) => {
  const { createSalaryStructure, updateSalaryStructure, loading } = useSalary();

  const { triggerRefresh, setTriggerRefresh } = useTriggerRefreshStore();
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const { getEmployees } = useEmployee();
  useEffect(() => {
    if (salaryData) {
      setFormData({
        userId: salaryData.userId || "",
        amount: salaryData.amount || "",
        effectiveFrom: salaryData.effectiveFrom
          ? new Date(salaryData.effectiveFrom).toISOString().split("T")[0]
          : "",
      });
    } else {
      setFormData(initialForm);
    }
  }, [salaryData]);
  useEffect(() => {
    const fetchEmployees = async () => {
      const res = await getEmployees(false); // Fetch all employees without pagination

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
    setSalaryData(null);
    setFormData(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: salaryData
        ? "Update Salary Structure?"
        : "Create Salary Structure?",
      text: salaryData
        ? "Do you want to update this salary structure?"
        : "Do you want to create this salary structure?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: salaryData ? "Yes, Update" : "Yes, Create",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    const payload = {
      ...formData,
      userId: Number(formData.userId),
      amount: Number(formData.amount),
    };

    const res = salaryData
      ? await updateSalaryStructure(salaryData.id, payload)
      : await createSalaryStructure(payload);

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
      header={salaryData ? "Edit Salary Structure" : "Create Salary Structure"}
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
              placeholder="All Employees"
              searchPlaceholder="Search employee name or ID..."
              getOptionLabel={(emp) =>
                `${emp.fullName || `Employee ${emp.id}`} - ${emp.employeeId}`
              }
              getOptionValue={(emp) => emp.id}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Salary Amount
            </label>

            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0"
              placeholder="Enter salary amount"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Effective From
            </label>

            <input
              type="date"
              name="effectiveFrom"
              value={formData.effectiveFrom}
              onChange={handleChange}
              required
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
              : salaryData
                ? "Update Salary"
                : "Create Salary"}
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

export default CreateSalaryModal;
