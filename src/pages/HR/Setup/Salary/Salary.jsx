import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaUser } from "react-icons/fa";
import { MdAddCircle } from "react-icons/md";
import Lookup from "../../../../components/Lookup";
import DataTable from "../../../../components/DataTable";
import useSalary from "../../../../hooks/useSalary";
import { useTriggerRefreshStore } from "../../../../store/triggerRefreshStore";
import { useAuthStore } from "../../../../store/authStore";
import { usePaginationStore } from "../../../../store/paginationStore";
import showToast from "../../../../utils/toast";
import SearchableSelect from "../../../../components/SearchableSelect";
import useEmployee from "../../../../hooks/useEmployee";
import CreateSalaryModal from "./CreateSalaryModal";
import { formatDhakaDate } from "../../../../utils/dateUtils";

const Salary = () => {
  const { getSalaryStructures, deleteSalaryStructure, loading } = useSalary();

  const { authUser } = useAuthStore();
  const { triggerRefresh, setTriggerRefresh } = useTriggerRefreshStore();
  const { page, limit, search, setTotalData } = usePaginationStore();
  const [employees, setEmployees] = useState([]);
  const [salaryStructures, setSalaryStructures] = useState([]);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [open, setOpen] = useState(false);
  const { getEmployees } = useEmployee();

  useEffect(() => {
    fetchSalaryStructures();
  }, [selectedUserId, triggerRefresh, page, limit, search]);

  useEffect(() => {
    const fetchEmployees = async () => {
      const res = await getEmployees(false); // Fetch all employees without pagination

      if (res.success) {
        setEmployees(res.data || []);
      }
    };
    fetchEmployees();
  }, [triggerRefresh]);

  const fetchSalaryStructures = async () => {
    const res = await getSalaryStructures({
      userId: selectedUserId || undefined,
      page,
      limit,
      search,
    });

    if (res.success) {
      setSalaryStructures(
        res?.data?.data?.map((item) => ({
          ...item,
          employee: item.user?.fullName || "-",
          role: item.user?.role?.value || "-",
          amount: parseInt(item.amount),
          effectiveFrom: item.effectiveFrom
            ? formatDhakaDate(item.effectiveFrom)
            : "-",
        })),
      );

      setTotalData(res?.data?.total);
    } else {
      setSalaryStructures([]);
      setTotalData(0);
      showToast(res.message, "error");
    }
  };

  const handleEdit = (row) => {
    setSelectedSalary(row);
    setOpen(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Salary Structure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Delete",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      const res = await deleteSalaryStructure(id);

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
    "Employee",
    "Role",
    "Amount (BDT)",
    "Effective From",
    "Action",
  ];

  const columnMapping = {
    Employee: "employee",
    Role: "role",
    "Amount (BDT)": "amount",
    "Effective From": "effectiveFrom",
  };

  const columnAlignment = {
    SL: "left",
    Employee: "left",
    Role: "left",
    "Amount (BDT)": "right",
    "Effective From": "center",
    Action: "center",
  };

  const ACTION_BUTTONS = [
    {
      show: () =>
        Boolean(
          authUser?.permissions?.includes("SUPER") ||
          authUser?.permissions?.includes("UPDATE_SALARY"),
        ),
      icon: <FaEdit className="text-blue-500 w-5 h-5" />,
      onClick: handleEdit,
      label: "Edit Salary",
    },
    {
      show: () =>
        Boolean(
          authUser?.permissions?.includes("SUPER") ||
          authUser?.permissions?.includes("DELETE_SALARY"),
        ),
      icon: <FaTrash className="text-red-500 w-5 h-5" />,
      onClick: (row) => handleDelete(row.id),
      label: "Delete Salary",
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="min-w-[320px]">
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-700">
            <FaUser className="text-primary-500" />
            Employee
          </label>

          <SearchableSelect
            options={employees}
            value={selectedUserId}
            onChange={setSelectedUserId}
            placeholder="All Employees"
            searchPlaceholder="Search employee name or ID..."
            getOptionLabel={(emp) =>
              `${emp.fullName || `Employee ${emp.id}`} - ${emp.employeeId}`
            }
            getOptionValue={(emp) => emp.id}
          />
        </div>

        <div className="flex items-end">
          {(authUser?.permissions?.includes("SUPER") ||
            authUser?.permissions?.includes("CREATE_SALARY")) && (
            <button
              onClick={() => {
                setSelectedSalary(null);
                setOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-button-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-button-primary-hover"
            >
              <MdAddCircle className="h-5 w-5" />
              Create Salary Structure
            </button>
          )}
        </div>
      </div>

      <DataTable
        tableHead={tableHead}
        tableData={salaryStructures}
        columnMapping={columnMapping}
        columnAlignment={columnAlignment}
        loading={loading}
        actionButtonsConfig={ACTION_BUTTONS}
        headerConfig={{
          title: "Salary Structure List",
          searchPlaceholder:
            "Search Salary by Name, Username, Email, Employee ID...",
        }}
      />

      <CreateSalaryModal
        open={open}
        setOpen={setOpen}
        salaryData={selectedSalary}
        setSalaryData={setSelectedSalary}
      />
    </div>
  );
};

export default Salary;
