import CustomModal from "../../../components/CustomModal";

const ViewLeaveRequestModal = ({ open, setOpen, requestData }) => {
  const handleClose = () => {
    setOpen(false);
  };

  if (!requestData) return null;

  return (
    <CustomModal
      open={open}
      setOpen={handleClose}
      header="View Leave Request"
      width="w-[70vh]"
    >
      <div className="space-y-6 text-gray-700">
        <div className="grid grid-cols-2 gap-4 border-b pb-4">
          <div>
            <p className="text-sm font-semibold text-gray-500">Leave Type</p>
            <p className="font-medium">{requestData.leaveType || "-"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Status</p>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                requestData.status === "Approved"
                  ? "bg-emerald-100 text-emerald-700"
                  : requestData.status === "Pending"
                  ? "bg-amber-100 text-amber-700"
                  : requestData.status === "Rejected"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {requestData.status || "Pending"}
            </span>
            {requestData.status === "Pending" && requestData.currentApproverRole && (
              <p className="text-xs text-amber-600 font-medium mt-1">
                Waiting on: {requestData.currentApproverRole}
              </p>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Start Date</p>
            <p className="font-medium">{requestData.startDate}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">End Date</p>
            <p className="font-medium">{requestData.endDate}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm font-semibold text-gray-500">Reason</p>
            <p className="font-medium bg-gray-50 p-3 rounded-lg border border-gray-100 mt-1">
              {requestData.reason}
            </p>
          </div>
        </div>

        {requestData.approvals && requestData.approvals.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              Approval Chain
            </h3>
            <div className="space-y-4">
              {requestData.approvals.map((approval) => (
                <div
                  key={approval.id}
                  className="bg-gray-50 p-4 rounded-xl border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {approval.approver?.fullName}{" "}
                        <span className="text-sm text-gray-500 font-normal">
                          ({approval.approver?.employeeId})
                        </span>
                      </p>
                      <p className="text-sm text-primary-600 font-medium">
                        {approval.role?.value}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-semibold ${
                        approval.status?.value === "Approved"
                          ? "bg-emerald-100 text-emerald-700"
                          : approval.status?.value === "Rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {approval.status?.value || "Unknown"}
                    </span>
                  </div>
                  {approval.remarks && (
                    <div className="text-sm text-gray-600 bg-white p-2 rounded border mt-2">
                      <span className="font-semibold text-gray-700">Remarks: </span>
                      {approval.remarks}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2 text-right">
                    {new Date(approval.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
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

export default ViewLeaveRequestModal;
