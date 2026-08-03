import { FaStore, FaMapMarkerAlt, FaPhoneAlt, FaUserCheck, FaCalendarAlt, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import CustomModal from "../../../../components/CustomModal";

const ViewPOSModal = ({ open, setOpen, locationData }) => {
  const handleClose = () => {
    setOpen(false);
  };

  if (!locationData) return null;

  const assignments = locationData.assignments || [];

  return (
    <CustomModal
      open={open}
      setOpen={handleClose}
      header="POS Location Details"
      width="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Header Card */}
        <div className="flex items-center gap-4 rounded-2xl border border-primary-100 bg-primary-50/60 p-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-500 text-white shadow-md">
            <FaStore className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-primary-800">
              {locationData.name}
            </h3>
            <div className="mt-1 flex items-center gap-3 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <FaMapMarkerAlt className="text-primary-500" />
                {locationData.address || "No address provided"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <FaPhoneAlt className="text-primary-500" />
                {locationData.contact || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3.5">
            <p className="text-xs font-semibold text-gray-500 uppercase">Outlet ID</p>
            <p className="mt-1 text-sm font-bold text-gray-800">#{locationData.id}</p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3.5">
            <p className="text-xs font-semibold text-gray-500 uppercase">Status</p>
            <p className="mt-1 text-sm font-bold">
              {locationData.isActive ? (
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <FaCheckCircle /> Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-red-500">
                  <FaTimesCircle /> Inactive
                </span>
              )}
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3.5">
            <p className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
              <FaCalendarAlt className="text-gray-400" /> Created At
            </p>
            <p className="mt-1 text-sm font-medium text-gray-700">
              {locationData.createdAt
                ? new Date(locationData.createdAt).toLocaleString()
                : "N/A"}
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3.5">
            <p className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
              <FaCalendarAlt className="text-gray-400" /> Last Updated
            </p>
            <p className="mt-1 text-sm font-medium text-gray-700">
              {locationData.updatedAt
                ? new Date(locationData.updatedAt).toLocaleString()
                : "N/A"}
            </p>
          </div>
        </div>

        {/* Assigned Staff Section */}
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-bold text-gray-800">
            <FaUserCheck className="text-primary-600" />
            Assigned Employees ({assignments.length})
          </h4>

          {assignments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
              No employees currently assigned to this outlet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
              {assignments.map((item, idx) => {
                const userObj = item.user || item;
                const displayName =
                  userObj.fullName || userObj.name || userObj.username || item.userName || `User #${item.userId || item.id}`;
                const userEmail = userObj.email || item.userEmail || "";

                return (
                  <div
                    key={item.id || item.userId || idx}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-2xs"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 font-bold text-xs text-primary-700">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {displayName}
                      </p>
                      {userEmail && (
                        <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
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

export default ViewPOSModal;
