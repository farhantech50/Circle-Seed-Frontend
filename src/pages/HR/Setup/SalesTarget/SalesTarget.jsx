import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaCalendarAlt, FaEdit, FaTrash, FaUser } from "react-icons/fa";
import { MdAddCircle } from "react-icons/md";
import CreateSalesTargetModal, { MONTH_OPTIONS } from "./CreateSalesTargetModal";
import useTarget from "../../../../hooks/useTarget";
import useEmployee from "../../../../hooks/useEmployee";
import SearchableSelect from "../../../../components/SearchableSelect";
import { useTriggerRefreshStore } from "../../../../store/triggerRefreshStore";
import showToast from "../../../../utils/toast";
import DataTableWithoutApiPagination from "../../../../components/DataTableWithoutApiPagination";
import { useAuthStore } from "../../../../store/authStore";

const SalesTarget = () => {
  const { getSalesTargets, deleteSalesTarget, loading } = useTarget();
  const { getEmployees } = useEmployee();
  const { triggerRefresh, setTriggerRefresh } = useTriggerRefreshStore();
  const { authUser } = useAuthStore();

  const [targets, setTargets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [open, setOpen] = useState(false);

  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
    month: "",
    userId: "",
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      const res = await getEmployees(false);
      if (res.success) {
        setEmployees(res.data || []);
      }
    };
    fetchEmployees();
  }, [getEmployees]);

  useEffect(() => {
    fetchTargets();
  }, [filters, triggerRefresh]);

  const fetchTargets = async () => {
    const res = await getSalesTargets({
      year: filters.year || undefined,
      month: filters.month || undefined,
      userId: filters.userId || undefined,
    });

    if (res.success) {
      setTargets(
        res.data.map((target) => {
          const monthObj = MONTH_OPTIONS.find(
            (m) => m.value === Number(target.month)
          );
          return {
            ...target,
            employeeName: target.user?.fullName || "All Employees",
            employeeId: target.user?.employeeId || "-",
            createdByName: target.createdBy?.fullName || "-",
            monthName: monthObj ? monthObj.label : target.month || "-",
            formattedAmount: target.targetAmount
              ? Number(target.targetAmount).toLocaleString("en-BD", {
                  minimumFractionDigits: 2,
                })
              : "0.00",
          };
        })
      );
    } else {
      setTargets([]);
      showToast(res.message, "error");
    }
  };

  const handleEdit = (row) => {
    setSelectedTarget(row);
    setOpen(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Sales Target?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Delete",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      const res = await deleteSalesTarget(id);

      if (res.success) {
        setTriggerRefresh();
        Swal.fire({
          title: "Deleted!",
          text: res.message,
          icon: "success",
          confirmButtonColor: "#0D9488",
        });
      } else {
        Swal.fire({
          title: "Error",
          text: res.message,
          icon: "error",
          confirmButtonColor: "#0D9488",
        });
      }
    });
  };

  const tableHead = [
    "SL",
    "Employee Name",
    "Employee ID",
    "Month",
    "Year",
    "Target Amount (BDT)",
    "Created By",
    "Action",
  ];

  const columnMapping = {
    "Employee Name": "employeeName",
    "Employee ID": "employeeId",
    Month: "monthName",
    Year: "year",
    "Target Amount (BDT)": "formattedAmount",
    "Created By": "createdByName",
  };

  const columnAlignment = {
    SL: "left",
    "Employee Name": "left",
    "Employee ID": "center",
    Month: "center",
    Year: "center",
    "Target Amount (BDT)": "right",
    "Created By": "left",
    Action: "center",
  };

  const ACTION_BUTTONS = [
    {
      show: () => true,
      icon: <FaEdit className="text-blue-500 w-5 h-5" />,
      onClick: handleEdit,
      label: "Edit Target",
    },
    {
      show: () => true,
      icon: <FaTrash className="text-red-500 w-5 h-5" />,
      onClick: (row) => handleDelete(row.id),
      label: "Delete Target",
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="min-w-[220px]">
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-700">
              <FaUser className="text-primary-500" />
              Employee
            </label>
            <SearchableSelect
              options={employees}
              value={filters.userId}
              onChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  userId: value,
                }))
              }
              placeholder="All Employees"
              searchPlaceholder="Search employee..."
              getOptionLabel={(emp) =>
                `${emp.fullName || `Employee ${emp.id}`} - ${emp.employeeId || ""}`
              }
              getOptionValue={(emp) => emp.id}
            />
          </div>

          <div className="min-w-[180px]">
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-700">
              <FaCalendarAlt className="text-primary-500" />
              Year
            </label>
            <input
              type="number"
              placeholder="YYYY"
              value={filters.year}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  year: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-primary-200 bg-white px-4 py-2.5 text-text shadow-sm transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div className="min-w-[180px]">
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-700">
              <FaCalendarAlt className="text-primary-500" />
              Month
            </label>
            <select
              value={filters.month}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  month: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-primary-200 bg-white px-4 py-2.5 text-text shadow-sm transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            >
              <option value="">All Months</option>
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setSelectedTarget(null);
              setOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-button-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-button-primary-hover"
          >
            <MdAddCircle className="h-5 w-5" />
            Add Sales Target
          </button>
        </div>
      </div>

      <DataTableWithoutApiPagination
        tableHead={tableHead}
        tableData={targets}
        columnMapping={columnMapping}
        columnAlignment={columnAlignment}
        loading={loading}
        actionButtonsConfig={ACTION_BUTTONS}
        headerConfig={{
          title: "Sales Targets List",
          searchPlaceholder: "Search Sales Targets...",
        }}
      />

      <CreateSalesTargetModal
        open={open}
        setOpen={setOpen}
        targetData={selectedTarget}
        setTargetData={setSelectedTarget}
      />
    </div>
  );
};

export default SalesTarget;
