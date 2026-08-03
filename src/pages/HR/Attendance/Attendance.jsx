import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaTrash, FaCalendarAlt, FaEye } from "react-icons/fa";
import { MdAddCircle } from "react-icons/md";
import CreateAttendanceModal from "./CreateAttendanceModal";
import ViewAttendanceModal from "./ViewAttendanceModal";
import useAttendance from "../../../hooks/useAttendance";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import showToast from "../../../utils/toast";
import DataTableWithoutApiPagination from "../../../components/DataTableWithoutApiPagination";
import { useAuthStore } from "../../../store/authStore";
import { formatDhakaTime } from "../../../utils/dateUtils";

const Attendance = () => {
  const { getAttendances, deleteAttendance, loading } = useAttendance();
  const { triggerRefresh, setTriggerRefresh } = useTriggerRefreshStore();
  const { authUser } = useAuthStore();

  const [attendances, setAttendances] = useState([]);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);

  const todayDate = new Date().toISOString().split("T")[0];

  const [filters, setFilters] = useState({
    date: todayDate,
  });

  useEffect(() => {
    fetchAttendances();
  }, [filters, triggerRefresh]);

  const fetchAttendances = async () => {
    const res = await getAttendances({
      date: filters.date || undefined,
    });

    if (res.success) {
      setAttendances(
        res.data
          .filter(
            (attendance) =>
              attendance.fullName?.toLowerCase() !== "super admin" &&
              attendance.fullName?.toLowerCase() !== "superadmin",
          )
          .map((attendance) => ({
            ...attendance,
            id: attendance.attendanceId,
            checkInTimeFormatted: attendance.checkInTime
              ? formatDhakaTime(attendance.checkInTime)
              : "-",
            checkOutTimeFormatted: attendance.checkOutTime
              ? formatDhakaTime(attendance.checkOutTime)
              : "-",
          })),
      );
    } else {
      setAttendances([]);
      showToast(res.message, "error");
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Attendance?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Delete",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      const res = await deleteAttendance(id);

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
    "Status",
    "Check In Time",
    "Check Out Time",
    "Action",
  ];

  const columnMapping = {
    "Employee Name": "fullName",
    "Employee ID": "employeeId",
    Status: "status",
    "Check In Time": "checkInTimeFormatted",
    "Check Out Time": "checkOutTimeFormatted",
  };

  const columnAlignment = {
    SL: "left",
    "Employee Name": "left",
    "Employee ID": "left",
    Status: "center",
    "Check In Time": "center",
    "Check Out Time": "center",
    Action: "center",
  };

  const ACTION_BUTTONS = [
    {
      show: () => true,
      icon: <FaEye className="text-lime-500 w-5 h-5" />,
      onClick: (row) => {
        setSelectedAttendance(row);
        setViewOpen(true);
      },
      label: "View Details",
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="min-w-[220px]">
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-700">
              <FaCalendarAlt className="text-primary-500" />
              Filter by Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={filters.date}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-primary-200 bg-white px-4 py-3 text-text shadow-sm transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>
        </div>
      </div>

      <DataTableWithoutApiPagination
        tableHead={tableHead}
        tableData={attendances}
        columnMapping={columnMapping}
        columnAlignment={columnAlignment}
        loading={loading}
        actionButtonsConfig={ACTION_BUTTONS}
        headerConfig={{
          title: "Attendance List",
          searchPlaceholder: "Search Attendance...",
        }}
      />

      <CreateAttendanceModal open={open} setOpen={setOpen} />
      <ViewAttendanceModal
        open={viewOpen}
        setOpen={setViewOpen}
        attendanceData={selectedAttendance}
      />
    </div>
  );
};

export default Attendance;
