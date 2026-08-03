import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import CustomModal from "../../../components/CustomModal";
import useLeaveRequest from "../../../hooks/useLeaveRequest";
import useLookUp from "../../../hooks/useLookup";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import showToast from "../../../utils/toast";
import Lookup from "../../../components/Lookup";
const initialForm = {
  leaveTypeId: "",
  startDate: "",
  endDate: "",
  reason: "",
};

const CreateLeaveRequestModal = ({ open, setOpen }) => {
  const { createLeaveRequest, loading } = useLeaveRequest();
  const { getLookup } = useLookUp();
  const { setTriggerRefresh } = useTriggerRefreshStore();

  const [formData, setFormData] = useState(initialForm);
  const [leaveTypes, setLeaveTypes] = useState([]);

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

    const result = await Swal.fire({
      title: "Submit Leave Request?",
      text: "Do you want to submit this leave request?",
      icon: "question",
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
        leaveTypeId: Number(formData.leaveTypeId),
      };

      const res = await createLeaveRequest(payload);

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
      header="Request Leave"
      width="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave Type
            </label>
            <Lookup
              lookupName="leave_type"
              selectedId={formData.leaveTypeId}
              setSelectedId={(id) =>
                setFormData((prev) => ({
                  ...prev,
                  leaveTypeId: id,
                }))
              }
              isMultiple={false}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>

              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>

              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                min={formData.startDate}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>

            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Enter reason for leave..."
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
            disabled={loading}
            className="rounded-lg bg-button-primary px-5 py-2 text-white transition hover:bg-button-primary-hover disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Leave Request"}
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

export default CreateLeaveRequestModal;
