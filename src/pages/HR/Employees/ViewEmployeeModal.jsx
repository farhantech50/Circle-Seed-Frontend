import { useEffect, useState } from "react";
import CustomModal from "../../../components/CustomModal";
import useEmployee from "../../../hooks/useEmployee";
import {
  formatDhakaDate,
  formatDhakaDateTime,
  formatDhakaTime,
} from "../../../utils/dateUtils";

const ViewEmployeeModal = ({ open, setOpen, employeeId, setEmployeeId }) => {
  const { getEmployeeById } = useEmployee();

  const [employee, setEmployee] = useState(null);

  const formatShiftTime = (timeString) => {
    if (!timeString) return "N/A";
    try {
      const [hours, minutes] = timeString.split(":");
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return formatDhakaTime(date, true);
    } catch (e) {
      return timeString;
    }
  };

  useEffect(() => {
    if (!employeeId) return;

    const fetchEmployee = async () => {
      const res = await getEmployeeById(employeeId);

      if (res.success) {
        setEmployee(res.data);
      }
    };

    fetchEmployee();
  }, [employeeId]);

  const handleClose = () => {
    setOpen(false);
    setEmployeeId(null);
    setEmployee(null);
  };

  return (
    <CustomModal
      open={open}
      setOpen={handleClose}
      header="Employee Details"
      width={"w-[90vw] md:w-[45vw] max-w-3xl"}
    >
      {!employee ? (
        <div className="flex justify-center items-center py-12 text-gray-500 font-medium">
          Loading...
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ["Employee ID", employee.employeeId],
              ["Full Name", employee.fullName],
              ["Username", employee.username],
              ["Email", employee.email],
              ["Contact", employee.contact],
              ["Role", employee.roleName || employee.role?.value],
              ["NID Number", employee.nidNumber],
              [
                "Date of Birth",
                employee.dateOfBirth
                  ? formatDhakaDate(employee.dateOfBirth)
                  : "N/A",
              ],
              [
                "Joining Date",
                employee.joiningDate
                  ? formatDhakaDate(employee.joiningDate)
                  : "N/A",
              ],
              ["Shift Start", formatShiftTime(employee.shiftStart)],
              ["Shift End", formatShiftTime(employee.shiftEnd)],
              [
                "Created At",
                employee.createdAt
                  ? formatDhakaDateTime(employee.createdAt)
                  : "N/A",
              ],
            ].map(([label, value], index) => (
              <div
                key={index}
                className="rounded-xl border border-primary-100 bg-primary-50/40 p-4 shadow-2xs"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-text-light">
                  {label}
                </p>

                <p className="mt-2 text-base font-semibold text-text break-words">
                  {value || "N/A"}
                </p>
              </div>
            ))}

            {/* Location Bounded Attendance Status */}
            <div className="rounded-xl border border-primary-100 bg-primary-50/40 p-4 shadow-2xs">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-light">
                Location Bounded Attendance
              </p>

              <div className="mt-2">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                    employee.locationBoundedAttendance
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}
                >
                  {employee.locationBoundedAttendance ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>

            {/* Status (Active / Inactive) */}
            <div className="rounded-xl border border-primary-100 bg-primary-50/40 p-4 shadow-2xs">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-light">
                Status
              </p>

              <div className="mt-2">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                    employee.isActive
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-red-100 text-red-700 border border-red-200"
                  }`}
                >
                  {employee.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Address */}
            <div className="md:col-span-2 rounded-xl border border-primary-100 bg-primary-50/40 p-4 shadow-2xs">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-light">
                Address
              </p>

              <p className="mt-2 text-base font-medium text-text whitespace-pre-wrap break-words">
                {employee.address || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex justify-end border-t border-primary-100 pt-5">
            <button
              onClick={handleClose}
              className="rounded-lg bg-primary-600 px-6 py-2 text-white font-semibold hover:bg-primary-700 transition-all shadow-2xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </CustomModal>
  );
};

export default ViewEmployeeModal;
