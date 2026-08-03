import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaCalendarAlt, FaEdit, FaTrash } from "react-icons/fa";
import { MdAddCircle } from "react-icons/md";
import CreateLeaveQuotaModal from "./CreateLeaveQuotaModal";
import useLeaveQuota from "../../../../hooks/useLeaveQuota";
import { useTriggerRefreshStore } from "../../../../store/triggerRefreshStore";
import showToast from "../../../../utils/toast";
import DataTableWithoutApiPagination from "../../../../components/DataTableWithoutApiPagination";
import { useAuthStore } from "../../../../store/authStore";

const LeaveQuota = () => {
  const { getLeaveQuotas, deleteLeaveQuota, loading } = useLeaveQuota();

  const { triggerRefresh, setTriggerRefresh } = useTriggerRefreshStore();
  const { authUser } = useAuthStore();

  const [leaveQuotas, setLeaveQuotas] = useState([]);
  const [selectedLeaveQuota, setSelectedLeaveQuota] = useState(null);

  const [open, setOpen] = useState(false);

  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
  });

  useEffect(() => {
    fetchLeaveQuotas();
  }, [filters, triggerRefresh]);

  const fetchLeaveQuotas = async () => {
    const res = await getLeaveQuotas({
      year: filters.year || undefined,
    });
    if (res.success) {
      setLeaveQuotas(
        res.data.map((quota) => ({
          ...quota,
          employeeName: quota.user?.fullName || "All Employees",
          employeeId: quota.user?.employeeId || "-",
        })),
      );
    } else {
      setLeaveQuotas([]);
      showToast(res.message, "error");
    }
  };

  const handleEdit = (row) => {
    setSelectedLeaveQuota(row);
    setOpen(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Leave Quota?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Delete",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      const res = await deleteLeaveQuota(id);

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
    "Year",
    "Quota (days)",
    "Action",
  ];

  const columnMapping = {
    "Employee Name": "employeeName",
    "Employee ID": "employeeId",
    Year: "year",
    "Quota (days)": "quota",
  };

  const columnAlignment = {
    SL: "left",
    "Employee Name": "left",
    "Employee ID": "center",
    Year: "center",
    "Quota (days)": "center",
    Action: "center",
  };

  const ACTION_BUTTONS = [
    {
      show: () => {
        return Boolean(
          authUser?.permissions?.includes("SUPER") ||
          authUser?.permissions?.includes("UPDATE_LEAVE_QUOTA"),
        );
      },
      icon: <FaEdit className="text-blue-500 w-5 h-5" />,
      onClick: handleEdit,
      label: "Edit Leave Quota",
    },
    {
      show: () => {
        return Boolean(
          authUser?.permissions?.includes("SUPER") ||
          authUser?.permissions?.includes("DELETE_LEAVE_QUOTA"),
        );
      },
      icon: <FaTrash className="text-red-500 w-5 h-5" />,
      onClick: (row) => handleDelete(row.id),
      label: "Delete Leave Quota",
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="min-w-[220px]">
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-700">
              <FaCalendarAlt className="text-primary-500" />
              Year
            </label>

            <div className="relative">
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
                className="w-full rounded-xl border border-primary-200 bg-white px-4 py-3 text-text shadow-sm transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>
        </div>

        <div className="flex items-end">
          {(authUser?.permissions?.includes("SUPER") ||
            authUser?.permissions?.includes("CREATE_LEAVE_QUOTA")) && (
            <button
              onClick={() => {
                setSelectedLeaveQuota(null);
                setOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-button-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-button-primary-hover"
            >
              <MdAddCircle className="h-5 w-5" />
              Add Leave Quota
            </button>
          )}
        </div>
      </div>

      <DataTableWithoutApiPagination
        tableHead={tableHead}
        tableData={leaveQuotas}
        columnMapping={columnMapping}
        columnAlignment={columnAlignment}
        loading={loading}
        actionButtonsConfig={ACTION_BUTTONS}
        headerConfig={{
          title: "Leave Quota List",
          searchPlaceholder: "Search Leave Quota...",
        }}
      />

      <CreateLeaveQuotaModal
        open={open}
        setOpen={setOpen}
        leaveQuotaData={selectedLeaveQuota}
        setLeaveQuotaData={setSelectedLeaveQuota}
      />
    </div>
  );
};

export default LeaveQuota;
