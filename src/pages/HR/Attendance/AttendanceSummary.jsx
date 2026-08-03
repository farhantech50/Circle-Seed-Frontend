import { useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaUser,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaPlaneDeparture,
  FaIdBadge,
} from "react-icons/fa";
import { BriefcaseBusiness } from "lucide-react";
import useAttendance from "../../../hooks/useAttendance";
import useEmployee from "../../../hooks/useEmployee";
import { useAuthStore } from "../../../store/authStore";
import showToast from "../../../utils/toast";
import SearchableSelect from "../../../components/SearchableSelect";
import AttendanceStatementModal from "./AttendanceStatementModal";
import { formatDhakaDate } from "../../../utils/dateUtils";

const AttendanceSummary = () => {
  const { getAttendanceReport, loading } = useAttendance();
  const { getEmployees } = useEmployee();

  const authUser = useAuthStore((state) => state.authUser);

  const roleNameNormalized = (authUser?.roleName || "").trim().toLowerCase();
  const canSelectUser =
    roleNameNormalized === "super admin" ||
    roleNameNormalized === "admin" ||
    roleNameNormalized === "hr manager" ||
    roleNameNormalized === "hr executive" ||
    [1, 2, 13, 14].includes(Number(authUser?.roleId));

  const currentDate = new Date();

  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  )
    .toISOString()
    .split("T")[0];

  const lastDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  )
    .toISOString()
    .split("T")[0];

  const [employees, setEmployees] = useState([]);
  const [report, setReport] = useState(null);
  const [statementModalOpen, setStatementModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    userId: authUser?.id || "",
    startDate: firstDay,
    endDate: lastDay,
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (authUser?.id && !filters.userId) {
      setFilters((prev) => ({
        ...prev,
        userId: authUser.id,
      }));
    }
  }, [authUser?.id]);

  useEffect(() => {
    if (!canSelectUser && authUser?.id && filters.userId !== authUser.id) {
      setFilters((prev) => ({
        ...prev,
        userId: authUser.id,
      }));
      return;
    }

    if (filters.userId && filters.startDate && filters.endDate) {
      fetchReport();
    }
  }, [
    filters.userId,
    filters.startDate,
    filters.endDate,
    authUser?.id,
    canSelectUser,
  ]);

  const fetchEmployees = async () => {
    const res = await getEmployees(false);

    if (res.success) {
      setEmployees(
        (res.data || []).filter(
          (emp) =>
            emp.role?.value?.toLowerCase() !== "superadmin" &&
            emp.username?.toLowerCase() !== "superadmin",
        ),
      );
    }
  };

  const fetchReport = async () => {
    const res = await getAttendanceReport(filters);

    if (res.success) {
      setReport(res.data);
    } else {
      setReport(null);
      showToast(res.message, "error");
    }
  };

  const formatDate = (date) => formatDhakaDate(date);

  const DateList = ({ title, dates, color, icon }) => (
    <div className="rounded-2xl border border-primary-100 bg-white shadow-sm overflow-hidden">
      <div className={`${color} px-5 py-4 flex items-center gap-3 text-white`}>
        {icon}
        <h3 className="font-semibold">{title}</h3>
      </div>

      <div className="p-5">
        {dates?.length ? (
          <div className="flex flex-wrap gap-3">
            {dates.map((date) => (
              <span
                key={date}
                className="rounded-full bg-primary-50 border border-primary-100 px-4 py-2 text-sm"
              >
                {formatDate(date)}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-text-light">No records found.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-2xl border border-primary-100 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-bold">Attendance Summary Filter</h2>

        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-700">
              <FaUser />
              Employee {!canSelectUser && "(Self Only)"}
            </label>

            <SearchableSelect
              options={employees}
              value={filters.userId}
              onChange={(value) => {
                if (!canSelectUser) return;
                setFilters((prev) => ({
                  ...prev,
                  userId: value,
                }));
              }}
              disabled={!canSelectUser}
              placeholder="Select Employee"
              searchPlaceholder="Search employee..."
              getOptionLabel={(emp) => `${emp.fullName} - ${emp.employeeId}`}
              getOptionValue={(emp) => emp.id}
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-700">
              <FaCalendarAlt />
              Start Date
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
              className="w-full rounded-xl border border-primary-200 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-700">
              <FaCalendarAlt />
              End Date
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
              className="w-full rounded-xl border border-primary-200 px-4 py-3"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white p-20 text-center shadow-sm">
          Loading...
        </div>
      ) : (
        report && (
          <>
            <div className="rounded-2xl bg-primary-500 p-6 text-white shadow">
              <div className="grid gap-5 lg:grid-cols-3">
                <div className="flex items-center gap-3">
                  <FaUser className="text-2xl" />

                  <div>
                    <p className="text-sm text-primary-100">Employee</p>
                    <h2 className="text-2xl font-bold">
                      {report.user.fullName}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FaIdBadge className="text-2xl" />

                  <div>
                    <p className="text-sm text-primary-100">Employee ID</p>
                    <h3>{report.user.employeeId}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <BriefcaseBusiness size={24} />

                  <div>
                    <p className="text-sm text-primary-100">Role</p>
                    <h3>{report.user.role.value}</h3>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-primary-400 pt-4">
                <div>
                  {formatDate(report.startDate)} - {formatDate(report.endDate)}
                </div>
                {/* Statement Button */}
                <button
                  onClick={() => setStatementModalOpen(true)}
                  className="px-4 py-2 bg-white text-primary-600 rounded-lg text-sm font-bold shadow hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <FaCalendarAlt />
                  View Statement
                </button>
              </div>
            </div>{" "}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-primary-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-light">Working Days</p>
                    <h3 className="mt-2 text-3xl font-bold text-primary-600">
                      {report.workingDays}
                    </h3>
                  </div>

                  <FaCalendarAlt className="text-4xl text-primary-400" />
                </div>
              </div>

              <div className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700">Present</p>
                    <h3 className="mt-2 text-3xl font-bold text-green-700">
                      {report.present.count}
                    </h3>
                  </div>

                  <FaCheckCircle className="text-4xl text-green-600" />
                </div>
              </div>

              <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-700">Late</p>
                    <h3 className="mt-2 text-3xl font-bold text-yellow-700">
                      {report.late.count}
                    </h3>
                  </div>

                  <FaClock className="text-4xl text-yellow-600" />
                </div>
              </div>

              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-700">Absent</p>
                    <h3 className="mt-2 text-3xl font-bold text-red-700">
                      {report.absent.count}
                    </h3>
                  </div>

                  <FaTimesCircle className="text-4xl text-red-600" />
                </div>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <DateList
                title="Present Dates"
                dates={report.present.dates}
                color="bg-green-600"
                icon={<FaCheckCircle />}
              />

              <DateList
                title="Late Dates"
                dates={report.late.dates}
                color="bg-yellow-500"
                icon={<FaClock />}
              />

              <DateList
                title="Absent Dates"
                dates={report.absent.dates}
                color="bg-red-600"
                icon={<FaTimesCircle />}
              />

              <div className="rounded-2xl border border-primary-100 bg-white shadow-sm overflow-hidden">
                <div className="bg-blue-600 px-5 py-4 flex items-center gap-3 text-white">
                  <FaPlaneDeparture />
                  <h3 className="font-semibold">Leave Taken</h3>
                </div>

                <div className="p-5">
                  {report.leaveTaken.count > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      <span className="rounded-full bg-primary-50 border border-primary-100 px-4 py-2 text-sm font-semibold text-blue-700">
                        {report.leaveTaken.count} {report.leaveTaken.count === 1 ? "Day" : "Days"}
                      </span>
                    </div>
                  ) : (
                    <p className="text-text-light">No leaves taken.</p>
                  )}
                </div>
              </div>


              <div className="rounded-2xl border border-primary-100 bg-white shadow-sm overflow-hidden">
                <div className="bg-purple-600 px-5 py-4 flex items-center gap-3 text-white">
                  <FaClock />
                  <h3 className="font-semibold">Overtime</h3>
                </div>
                <div className="p-5">
                  {report.overtime?.totalHours ? (
                    <div className="flex flex-wrap gap-3">
                      <span className="rounded-full bg-primary-50 border border-primary-100 px-4 py-2 text-sm font-semibold text-purple-700">
                        {report.overtime.totalHours} Hours
                      </span>
                    </div>
                  ) : (
                    <p className="text-text-light">No overtime recorded.</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-primary-100 bg-white shadow-sm overflow-hidden">
                <div className="bg-blue-600 px-5 py-4 flex items-center gap-3 text-white">
                  <FaPlaneDeparture />
                  <h3 className="font-semibold">Leave History</h3>
                </div>

                <div className="p-5">
                  {report.leaveTaken.leaves?.length ? (
                    <div className="space-y-4">
                      {report.leaveTaken.leaves.map((leave) => (
                        <div
                          key={leave.id}
                          className="rounded-xl border border-primary-100 p-4"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">
                              {leave.leaveType?.value || leave.leaveType || "-"}
                            </h4>

                            {(leave.status?.value || leave.status) && (
                              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs">
                                {leave.status?.value || leave.status}
                              </span>
                            )}
                          </div>

                          <p className="mt-2 text-sm text-text-light">
                            {formatDate(leave.startDate)} -{" "}
                            {formatDate(leave.endDate)}
                          </p>

                          {leave.reason && (
                            <p className="mt-2 text-sm">{leave.reason}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-light">
                      No leave taken during this period.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )
      )}

      {/* Statement Modal */}
      <AttendanceStatementModal
        open={statementModalOpen}
        setOpen={setStatementModalOpen}
        filters={filters}
      />
    </div>
  );
};

export default AttendanceSummary;
