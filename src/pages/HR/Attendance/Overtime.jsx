import { useEffect, useState } from "react";
import { FaCalendarAlt, FaCheckSquare, FaTimesCircle } from "react-icons/fa";
import Swal from "sweetalert2";
import useAttendance from "../../../hooks/useAttendance";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import showToast from "../../../utils/toast";
import DataTableWithoutApiPagination from "../../../components/DataTableWithoutApiPagination";
import Lookup from "../../../components/Lookup";
import { formatDhakaDate, formatDhakaTime } from "../../../utils/dateUtils";

const Overtime = () => {
  const { getOvertimes, submitOvertimeDecision, loading } = useAttendance();
  const { triggerRefresh, setTriggerRefresh } = useTriggerRefreshStore();

  const [overtimes, setOvertimes] = useState([]);

  const currentDate = new Date();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const [filters, setFilters] = useState({
    startDate: firstDay,
    endDate: lastDay,
    overtimeStatusId: "",
  });

  useEffect(() => {
    fetchOvertimes();
  }, [filters, triggerRefresh]);

  const fetchOvertimes = async () => {
    const res = await getOvertimes(filters);

    if (res.success) {
      setOvertimes(
        (res.data || []).map((item) => ({
          ...item,
          employeeName: item.user?.fullName || "-",
          employeeId: item.user?.employeeId || "-",
          formattedDate: item.date ? formatDhakaDate(item.date) : "-",
          checkInTime: item.checkInTime ? formatDhakaTime(item.checkInTime) : "-",
          checkOutTime: item.checkOutTime ? formatDhakaTime(item.checkOutTime) : "-",
          totalHours: item.totalHours ? `${item.totalHours} hrs` : "-",
          overtimeHours: item.overtimeHours ? `${item.overtimeHours} hrs` : "-",
          overtimeStatus: item.overtimeStatus?.value || "Pending",
        }))
      );
    } else {
      setOvertimes([]);
      showToast(res.message, "error");
    }
  };

  const handleDecision = async (id, statusId, statusName) => {
    const result = await Swal.fire({
      title: `${statusName} Overtime?`,
      text: `Are you sure you want to set this overtime request to ${statusName.toLowerCase()}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: statusId === 67 ? "#10B981" : "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `Yes, ${statusName}`,
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    const res = await submitOvertimeDecision(id, {
      overtimeStatusId: statusId,
    });

    if (res.success) {
      setTriggerRefresh();
      Swal.fire({
        title: "Success!",
        text: res.message,
        icon: "success",
        confirmButtonColor: "#0D9488",
      });
    } else {
      Swal.fire({
        title: "Error!",
        text: res.message || "Failed to submit decision.",
        icon: "error",
        confirmButtonColor: "#0D9488",
      });
    }
  };

  const tableHead = [
    "SL",
    "Employee Name",
    "Employee ID",
    "Date",
    "Check In",
    "Check Out",
    "Total Hours",
    "Overtime Hours",
    "Status",
    "Action",
  ];

  const columnMapping = {
    "Employee Name": "employeeName",
    "Employee ID": "employeeId",
    Date: "formattedDate",
    "Check In": "checkInTime",
    "Check Out": "checkOutTime",
    "Total Hours": "totalHours",
    "Overtime Hours": "overtimeHours",
    Status: "overtimeStatus",
  };

  const columnAlignment = {
    SL: "left",
    "Employee Name": "left",
    "Employee ID": "left",
    Date: "center",
    "Check In": "center",
    "Check Out": "center",
    "Total Hours": "center",
    "Overtime Hours": "center",
    Status: "center",
    Action: "center",
  };

  const ACTION_BUTTONS = [
    {
      show: (row) => row.overtimeStatus?.toLowerCase() === "pending" || row.overtimeStatusId === 66,
      icon: <FaCheckSquare className="text-emerald-600 w-5 h-5" />,
      onClick: (row) => handleDecision(row.id, 67, "Approved"),
      label: "Approve",
    },
    {
      show: (row) => row.overtimeStatus?.toLowerCase() === "pending" || row.overtimeStatusId === 66,
      icon: <FaTimesCircle className="text-rose-600 w-5 h-5" />,
      onClick: (row) => handleDecision(row.id, 68, "Rejected"),
      label: "Reject",
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="rounded-2xl border border-primary-100 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-bold text-gray-800">Overtime Filters</h2>

        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-700">
              <FaCalendarAlt className="text-primary-500" />
              Filter by Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-primary-200 bg-white px-4 py-3 text-text shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-700">
              <FaCalendarAlt className="text-primary-500" />
              Filter by End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-primary-200 bg-white px-4 py-3 text-text shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-700">
              <FaCheckSquare className="text-primary-500" />
              Filter by Status
            </label>
            <Lookup
              lookupName="overtimeStatus"
              selectedId={filters.overtimeStatusId}
              setSelectedId={(id) =>
                setFilters((prev) => ({
                  ...prev,
                  overtimeStatusId: id,
                }))
              }
            />
          </div>
        </div>
      </div>

      <DataTableWithoutApiPagination
        tableHead={tableHead}
        tableData={overtimes}
        columnMapping={columnMapping}
        columnAlignment={columnAlignment}
        loading={loading}
        actionButtonsConfig={ACTION_BUTTONS}
        headerConfig={{
          title: "Overtime List",
          searchPlaceholder: "Search Overtime...",
        }}
      />
    </div>
  );
};

export default Overtime;
