import Swal from "sweetalert2";
import CustomModal from "../../../components/CustomModal";
import useAttendance from "../../../hooks/useAttendance";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";

const OvertimeDecisionModal = ({ open, setOpen, overtimeData }) => {
  const { submitOvertimeDecision, loading } = useAttendance();
  const { setTriggerRefresh } = useTriggerRefreshStore();

  const handleClose = () => {
    setOpen(false);
  };

  const handleDecision = async (statusId, statusName) => {
    if (!overtimeData?.id) return;

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

    const res = await submitOvertimeDecision(overtimeData.id, {
      overtimeStatusId: statusId,
    });

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
        text: res.message || "Failed to submit decision.",
        icon: "error",
        confirmButtonColor: "#0D9488",
      });
    }
  };

  if (!overtimeData) return null;

  return (
    <CustomModal
      open={open}
      setOpen={handleClose}
      header="Overtime Decision"
      width="max-w-md"
    >
      <div className="space-y-6 text-gray-700">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
          <p className="text-sm">
            <span className="font-semibold">Employee:</span>{" "}
            {overtimeData.user?.fullName} ({overtimeData.user?.employeeId})
          </p>
          <p className="text-sm">
            <span className="font-semibold">Date:</span>{" "}
            {overtimeData.formattedDate}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Overtime Hours:</span>{" "}
            {overtimeData.overtimeHours} hrs
          </p>
          <p className="text-sm">
            <span className="font-semibold">Total Work Hours:</span>{" "}
            {overtimeData.totalHours} hrs
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleDecision(67, "Approve")}
            className="flex-1 rounded-lg bg-emerald-600 px-5 py-2.5 text-white font-semibold transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Approve"}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleDecision(68, "Reject")}
            className="flex-1 rounded-lg bg-rose-600 px-5 py-2.5 text-white font-semibold transition hover:bg-rose-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Reject"}
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-gray-700 font-semibold transition hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </CustomModal>
  );
};

export default OvertimeDecisionModal;
