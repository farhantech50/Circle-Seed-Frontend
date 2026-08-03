import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import CustomModal from "../../../components/CustomModal";
import useLeaveRequest from "../../../hooks/useLeaveRequest";
import useLookUp from "../../../hooks/useLookup";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import showToast from "../../../utils/toast";

const initialForm = {
  statusId: "",
  remarks: "",
};

const LeaveDecisionModal = ({ open, setOpen, requestData }) => {
  const { makeLeaveDecision, loading } = useLeaveRequest();
  const { getLookup } = useLookUp();
  const { setTriggerRefresh } = useTriggerRefreshStore();

  const [formData, setFormData] = useState(initialForm);
  const [statuses, setStatuses] = useState([]);
  const [loadingStatuses, setLoadingStatuses] = useState(false);

  useEffect(() => {
    const fetchStatuses = async () => {
      setLoadingStatuses(true);
      const res = await getLookup("leave_status");
      if (res.success) {
        // Filter out "Pending" (ID 16) if desired, but we will provide all
        // to let the backend handle valid state transitions.
        setStatuses(res.data.filter((status) => status.value !== "Pending"));
      } else {
        showToast("Failed to fetch leave statuses", "error");
      }
      setLoadingStatuses(false);
    };

    if (open) {
      fetchStatuses();
    }
  }, [open]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleClose = () => {
    setOpen(false);
    setFormData(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!requestData?.id) return;

    const result = await Swal.fire({
      title: "Submit Decision?",
      text: "Are you sure you want to submit this decision?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Submit",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const payload = {
        ...formData,
        statusId: Number(formData.statusId),
      };

      const res = await makeLeaveDecision(requestData.id, payload);

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
          text: res.message || "Operation failed.",
          icon: "error",
          confirmButtonColor: "#0D9488",
        });
      }
    } catch (error) {
      console.error(error);

      Swal.fire({
        title: "Error!",
        text: "Something went wrong.",
        icon: "error",
        confirmButtonColor: "#0D9488",
      });
    }
  };

  return (
    <CustomModal
      open={open}
      setOpen={handleClose}
      header="Take Decision"
      width="max-w-lg"
    >
      {requestData && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700 mb-1">
            <span className="font-semibold">Employee:</span>{" "}
            {requestData.employee?.fullName} ({requestData.employee?.employeeId}
            )
          </p>
          <p className="text-sm text-gray-700 mb-1">
            <span className="font-semibold">Leave Type:</span>{" "}
            {requestData.leaveType}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Reason:</span> {requestData.reason}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Decision Status
            </label>
            <select
              name="statusId"
              value={formData.statusId}
              onChange={handleChange}
              required
              disabled={loadingStatuses}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="" disabled>
                {loadingStatuses ? "Loading statuses..." : "Select decision..."}
              </option>
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Enter remarks..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-5">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-gray-700 transition hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || loadingStatuses}
            className="rounded-lg bg-button-primary px-5 py-2 text-white transition hover:bg-button-primary-hover disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Decision"}
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

export default LeaveDecisionModal;
