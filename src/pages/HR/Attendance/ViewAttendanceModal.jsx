import CustomModal from "../../../components/CustomModal";
import { formatDhakaDateTime } from "../../../utils/dateUtils";

const ViewAttendanceModal = ({ open, setOpen, attendanceData }) => {
  const handleClose = () => {
    setOpen(false);
  };

  if (!attendanceData) return null;

  const formatDateTime = (timeString) => {
    if (!timeString) return "-";
    return formatDhakaDateTime(timeString);
  };

  const statusColors = {
    Present: "bg-green-50 text-green-700 border border-green-200",
    Absent: "bg-rose-50 text-rose-700 border border-rose-200",
    Late: "bg-orange-50 text-orange-700 border border-orange-200",
    Pending: "bg-amber-50 text-amber-700 border border-amber-200",
    Approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Rejected: "bg-rose-50 text-rose-700 border border-rose-200",
  };

  return (
    <CustomModal
      open={open}
      setOpen={handleClose}
      header="View Attendance Details"
      width="w-[500px]"
    >
      <div className="space-y-6 text-gray-700">
        <div className="grid grid-cols-2 gap-4 border-b pb-4">
          <div>
            <p className="text-sm font-semibold text-gray-500">Employee Name</p>
            <p className="font-semibold text-gray-900 text-base">{attendanceData.fullName || "-"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Employee ID</p>
            <p className="font-medium text-gray-900">{attendanceData.employeeId || "-"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b pb-4">
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Status</p>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                statusColors[attendanceData.status] || "bg-gray-100 text-gray-700 border border-gray-200"
              }`}
            >
              {attendanceData.status || "-"}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Total Hours Worked</p>
            <p className="font-semibold text-gray-900">
              {attendanceData.totalHours ? `${attendanceData.totalHours} hrs` : "-"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b pb-4">
          <div>
            <p className="text-sm font-semibold text-gray-500">Check In Time</p>
            <p className="font-medium text-gray-800">{formatDateTime(attendanceData.checkInTime)}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Check Out Time</p>
            <p className="font-medium text-gray-800">{formatDateTime(attendanceData.checkOutTime)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b pb-4">
          <div>
            <p className="text-sm font-semibold text-gray-500">Overtime Hours</p>
            <p className="font-semibold text-gray-900">
              {attendanceData.overtimeHours ? `${attendanceData.overtimeHours} hrs` : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Overtime Status</p>
            {attendanceData.overtimeStatus ? (
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                  statusColors[attendanceData.overtimeStatus] || "bg-gray-100 text-gray-700 border border-gray-200"
                }`}
              >
                {attendanceData.overtimeStatus}
              </span>
            ) : (
              <span className="text-gray-400 font-medium">-</span>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-500">Notes</p>
          <div className="font-medium bg-gray-50 p-3 rounded-lg border border-gray-150 mt-1 min-h-[60px] text-gray-800">
            {attendanceData.notes || <span className="text-gray-400 italic">No notes added</span>}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleClose}
            className="rounded-lg bg-gray-200 px-5 py-2 text-gray-700 font-medium transition hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </CustomModal>
  );
};

export default ViewAttendanceModal;
