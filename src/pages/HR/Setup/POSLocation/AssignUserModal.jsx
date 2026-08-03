import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaUserPlus, FaUserMinus, FaUser } from "react-icons/fa";
import CustomModal from "../../../../components/CustomModal";
import usePOSLocation from "../../../../hooks/usePOSLocation";
import useEmployee from "../../../../hooks/useEmployee";
import SearchableSelect from "../../../../components/SearchableSelect";
import showToast from "../../../../utils/toast";
import { useTriggerRefreshStore } from "../../../../store/triggerRefreshStore";

const AssignUserModal = ({ open, setOpen, locationData }) => {
  const { assignPOSUser, unassignPOSUser, loading: actionLoading } = usePOSLocation();
  const { getEmployees } = useEmployee();
  const { setTriggerRefresh } = useTriggerRefreshStore();

  const [employees, setEmployees] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [employeesLoading, setEmployeesLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchEmployees();
    } else {
      setSelectedUserId("");
    }
  }, [open]);

  const fetchEmployees = async () => {
    setEmployeesLoading(true);
    const res = await getEmployees(false);
    if (res.success) {
      setEmployees(res.data || []);
    } else {
      setEmployees([]);
    }
    setEmployeesLoading(false);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUserId("");
  };

  const handleAssign = async () => {
    if (!selectedUserId) {
      showToast("Please select an employee to assign.", "error");
      return;
    }

    const payload = {
      userId: selectedUserId,
      posLocationId: locationData?.id,
    };

    const res = await assignPOSUser(payload);

    if (res.success) {
      showToast(res.message || "User assigned successfully", "success");
      setTriggerRefresh();
      setSelectedUserId("");
    } else {
      showToast(res.message || "Failed to assign user", "error");
    }
  };

  const handleUnassign = async (user) => {
    const targetUserId = user.userId || user.id || user.user?.id;
    const userName = user.name || user.fullName || user.user?.name || "this user";

    const confirm = await Swal.fire({
      title: `Unassign ${userName}?`,
      text: `Are you sure you want to remove this user from ${locationData?.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Unassign",
    });

    if (!confirm.isConfirmed) return;

    const payload = {
      userId: targetUserId,
      posLocationId: locationData?.id,
    };

    const res = await unassignPOSUser(payload);

    if (res.success) {
      showToast(res.message || "User unassigned successfully", "success");
      setTriggerRefresh();
    } else {
      showToast(res.message || "Failed to unassign user", "error");
    }
  };

  const employeeOptions = employees.map((emp) => ({
    label: `${emp.fullName || emp.name || emp.username} (${emp.email || emp.phone || emp.id})`,
    value: emp.id || emp.userId,
  }));

  const assignments = locationData?.assignments || [];

  return (
    <CustomModal
      open={open}
      setOpen={handleClose}
      header={`Manage Assignments - ${locationData?.name || "POS Location"}`}
      width="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Location Summary */}
        <div className="rounded-xl border border-primary-100 bg-primary-50/50 p-4">
          <p className="text-sm font-semibold text-primary-800">
            {locationData?.name}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            <span className="font-medium">Address:</span> {locationData?.address || "N/A"} |{" "}
            <span className="font-medium">Contact:</span> {locationData?.contact || "N/A"}
          </p>
        </div>

        {/* Assign User Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-bold text-gray-800">
            <FaUserPlus className="text-primary-600" />
            Assign Employee to Location
          </h4>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1">
              <SearchableSelect
                options={employeeOptions}
                value={selectedUserId}
                onChange={(val) => setSelectedUserId(val)}
                placeholder="Search and select employee..."
                searchPlaceholder="Search by name, email, phone..."
                disabled={employeesLoading || actionLoading}
              />
            </div>

            <button
              type="button"
              onClick={handleAssign}
              disabled={!selectedUserId || actionLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-button-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-button-primary-hover disabled:opacity-50"
            >
              <FaUserPlus className="h-4 w-4" />
              Assign User
            </button>
          </div>
        </div>

        {/* Currently Assigned Users List */}
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-bold text-gray-800">
            <FaUser className="text-primary-600" />
            Assigned Users ({assignments.length})
          </h4>

          {assignments.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
              No users currently assigned to this POS location.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white max-h-60 overflow-y-auto">
              {assignments.map((item, idx) => {
                const userObj = item.user || item;
                const displayName =
                  userObj.fullName || userObj.name || userObj.username || item.userName || `User #${item.userId || item.id}`;
                const userEmail = userObj.email || item.userEmail || "";

                return (
                  <div
                    key={item.id || item.userId || idx}
                    className="flex items-center justify-between p-3 transition hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold text-xs">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {displayName}
                        </p>
                        {userEmail && (
                          <p className="text-xs text-gray-500">{userEmail}</p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUnassign(item)}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 hover:text-red-700 disabled:opacity-50"
                    >
                      <FaUserMinus className="h-3.5 w-3.5" />
                      Unassign
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end border-t pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </CustomModal>
  );
};

export default AssignUserModal;
