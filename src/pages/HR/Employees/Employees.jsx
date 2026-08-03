import { useEffect, useState } from "react";
import { FaEdit, FaEye, FaTrash, FaUserShield } from "react-icons/fa";
import { MdAddCircle } from "react-icons/md";
import Swal from "sweetalert2";
import DataTable from "../../../components/DataTable";
import Lookup from "../../../components/Lookup";
import useEmployee from "../../../hooks/useEmployee";
import { useAuthStore } from "../../../store/authStore";
import { usePaginationStore } from "../../../store/paginationStore";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import showToast from "../../../utils/toast";
import CreateEmployeeModal from "./CreateEmployeeModal";
import ViewEmployeeModal from "./ViewEmployeeModal";

const Employees = () => {
  const { getEmployees, getEmployeeById, loading } =
    useEmployee();

  const { page, limit, search, setTotalData } = usePaginationStore();
  const { triggerRefresh } = useTriggerRefreshStore();
  const { authUser } = useAuthStore();
  const [selectedRoleId, setSelectedRoleId] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);

  const [open, setOpen] = useState(false);
  const [openView, setOpenView] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      const res = await getEmployees(true, selectedRoleId); // Fetch employees with pagination

      if (res.success) {
        const formattedData = res.data.map((emp) => ({
          ...emp,
          roleName: emp.role?.value,
          roleId: emp.role?.id,
          status: emp.isActive ? "Active" : "Inactive",
        }));

        setEmployees(formattedData);
        setTotalData(res.total);
      } else {
        setEmployees([]);
        showToast(res.message, "error");
      }
    };

    fetchEmployees();
  }, [page, limit, search, triggerRefresh, selectedRoleId]);

  const handleEdit = async (id) => {
    const res = await getEmployeeById(id);

    if (res.success) {
      setSelectedEmployee(res.data);
      setOpen(true);
    } else {
      showToast(res.message, "error");
    }
  };

  const handleView = (id) => {
    setEmployeeId(id);
    setOpenView(true);
  };

  const tableHead = [
    "SL",
    "Employee ID",
    "Full Name",
    "Username",
    "Role",
    "Status",
    "Action",
  ];

  const columnMapping = {
    "Employee ID": "employeeId",
    "Full Name": "fullName",
    Username: "username",
    Role: "roleName",
    Status: "status",
  };

  const columnAlignment = {
    SL: "left",
    "Employee ID": "left",
    "Full Name": "left",
    Username: "left",
    Role: "left",
    Status: "center",
    Action: "center",
  };

  const ACTION_BUTTONS = [
    {
      show: () => {
        return Boolean(
          authUser?.permissions?.includes("SUPER") ||
          authUser?.permissions?.includes("UPDATE_USER"),
        );
      },
      icon: <FaEdit className="text-blue-500 w-5 h-5" />,
      onClick: (row) => handleEdit(row.id),
      label: "Edit Employee",
    },
    {
      show: () => {
        return Boolean(
          authUser?.permissions?.includes("SUPER") ||
          authUser?.permissions?.includes("VIEW_USER"),
        );
      },
      icon: <FaEye className="text-lime-500 w-5 h-5" />,
      onClick: (row) => handleView(row.id),
      label: "View Employee",
    },
    {
      show: () => {
        return Boolean(
          authUser?.permissions?.includes("SUPER") ||
          authUser?.permissions?.includes("DELETE_USER"),
        );
      },
      icon: <FaTrash className="text-red-500 w-5 h-5" />,
      onClick: (row) => handleDelete(row.id),
      label: "Delete Employee",
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 w-full">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="w-full md:w-72">
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-700">
            <FaUserShield className="text-primary-500" />
            Select Roles
          </label>

          <Lookup
            lookupName="role"
            selectedId={selectedRoleId}
            setSelectedId={setSelectedRoleId}
            isMultiple={true}
          />
        </div>

        {(authUser?.permissions?.includes("SUPER") ||
          authUser?.permissions?.includes("CREATE_USER")) && (
          <button
            type="button"
            onClick={() => {
              setSelectedEmployee(null);
              setOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-button-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-button-primary-hover hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            <MdAddCircle className="h-5 w-5" />
            Create Employee
          </button>
        )}
      </div>

      <DataTable
        tableHead={tableHead}
        tableData={employees}
        columnMapping={columnMapping}
        columnAlignment={columnAlignment}
        loading={loading}
        headerConfig={{
          title: "Employee List",
          searchPlaceholder:
            "Search Employee by Name, Username, Email, Employee ID...",
        }}
        actionButtonsConfig={ACTION_BUTTONS}
      />

      <CreateEmployeeModal
        open={open}
        setOpen={setOpen}
        employeeData={selectedEmployee}
        setEmployeeData={setSelectedEmployee}
      />

      <ViewEmployeeModal
        open={openView}
        setOpen={setOpenView}
        employeeId={employeeId}
        setEmployeeId={setEmployeeId}
      />
    </div>
  );
};

export default Employees;
