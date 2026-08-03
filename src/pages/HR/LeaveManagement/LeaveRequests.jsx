import { useEffect, useState } from "react";
import { MdAddCircle } from "react-icons/md";
import { FaEye, FaUser, FaCalendarCheck, FaCalendarPlus } from "react-icons/fa";
import CreateLeaveRequestModal from "./CreateLeaveRequestModal";
import ViewLeaveRequestModal from "./ViewLeaveRequestModal";
import useLeaveRequest from "../../../hooks/useLeaveRequest";
import useEmployee from "../../../hooks/useEmployee";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import { usePaginationStore } from "../../../store/paginationStore";
import DataTableWithoutApiPagination from "../../../components/DataTableWithoutApiPagination";
import SearchableSelect from "../../../components/SearchableSelect";
import showToast from "../../../utils/toast";
import { useAuthStore } from "../../../store/authStore";
import { formatDhakaDate } from "../../../utils/dateUtils";

const LeaveRequests = () => {
  const { getLeaveRequests, getLeaveBalance, loading } = useLeaveRequest();
  const { getEmployees } = useEmployee();
  const { triggerRefresh } = useTriggerRefreshStore();
  const { authUser } = useAuthStore();
  const { page, limit, search, setTotalData } = usePaginationStore();

  const isAdmin = ["Super Admin", "Admin", "HR Manager", "Accounts Manager",
    "Sales Manager",
    "Inventory Manager",
    "Factory & Production Manager",
    "Marketing Manager"].includes(authUser?.roleName);

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [leaveBalance, setLeaveBalance] = useState(null);

  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const targetUserId = isAdmin ? (selectedEmployee || authUser?.id) : authUser?.id;

  useEffect(() => {
    if (isAdmin) {
      const fetchEmployees = async () => {
        const res = await getEmployees(false); // Fetch all employees without pagination
        if (res.success) {
          setEmployees(res.data || []);
        }
      };
      fetchEmployees();
    }
  }, [isAdmin]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (targetUserId) {
        const res = await getLeaveBalance(targetUserId);
        if (res.success && res.data) {
          setLeaveBalance(res.data);
        } else {
          setLeaveBalance(null);
        }
      }
    };
    fetchBalance();
  }, [targetUserId, triggerRefresh, getLeaveBalance]);

  useEffect(() => {
    fetchLeaveRequests();
  }, [
    triggerRefresh,
    page,
    limit,
    search,
    authUser?.id,
    isAdmin,
    selectedEmployee,
  ]);

  const fetchLeaveRequests = async () => {
    const filters = isAdmin
      ? selectedEmployee
        ? { userId: selectedEmployee }
        : {}
      : { userId: authUser?.id };

    const res = await getLeaveRequests(filters);
    if (res.success) {
      setTotalData(res.total);
      setLeaveRequests(
        res.data.map((request) => ({
          ...request,
          startDate: formatDhakaDate(request.startDate),
          endDate: formatDhakaDate(request.endDate),
          leaveType: request.leaveType || request.leaveTypeId,
          pendingAt:
            request.status === "Pending"
              ? request.currentApproverRole || "-"
              : "Completed",
        })),
      );
    } else {
      setLeaveRequests([]);
      showToast(res.message, "error");
    }
  };

  const tableHead = [
    "SL",
    "Leave Type",
    "Start Date",
    "End Date",
    "Reason",
    "Status",
    "Pending At",
    "Action",
  ];

  const columnMapping = {
    "Leave Type": "leaveType",
    "Start Date": "startDate",
    "End Date": "endDate",
    Reason: "reason",
    Status: "status",
    "Pending At": "pendingAt",
  };

  const columnAlignment = {
    SL: "left",
    "Leave Type": "left",
    "Start Date": "center",
    "End Date": "center",
    Reason: "left",
    Status: "center",
    "Pending At": "center",
    Action: "center",
  };

  const ACTION_BUTTONS = [
    {
      show: () => true,
      icon: <FaEye className="text-lime-500 w-5 h-5" />,
      onClick: (row) => {
        setSelectedRequest(row);
        setViewOpen(true);
      },
      label: "View Request",
    },
  ];

  return (
    <div className="flex flex-col gap-5 p-4">
      {/* 2 Leave Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Used Leave */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between transition hover:shadow-md">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 block">
              Used Leave ({leaveBalance?.year || new Date().getFullYear()})
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-800">
                {leaveBalance?.usedDays ?? 0}
              </span>
              <span className="text-xs font-bold text-slate-500">
                / {leaveBalance?.allocatedDays ?? 14} Days Allocated
              </span>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600">
            <FaCalendarCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Remaining Leave */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between transition hover:shadow-md">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
              Remaining Leave ({leaveBalance?.year || new Date().getFullYear()})
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-emerald-600">
                {leaveBalance?.remainingDays ?? 14}
              </span>
              <span className="text-xs font-bold text-slate-500">
                Days Available
              </span>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600">
            <FaCalendarPlus className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between relative bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {isAdmin ? (
          <div className="flex-1 max-w-sm">
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-700">
              <FaUser className="text-primary-500" />
              Select Employee
            </label>
            <SearchableSelect
              options={employees}
              value={selectedEmployee}
              onChange={setSelectedEmployee}
              placeholder="Select Employee"
              searchPlaceholder="Search employee name or ID..."
              getOptionLabel={(emp) =>
                `${emp.fullName || `Employee ${emp.id}`} - ${emp.employeeId}`
              }
              getOptionValue={(emp) => emp.id}
            />
          </div>
        ) : (
          <div></div> // Placeholder to keep spacing when non-admin
        )}

        <button
          onClick={() => {
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-button-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-button-primary-hover"
        >
          <MdAddCircle className="h-5 w-5" />
          Request Leave
        </button>
      </div>

      <DataTableWithoutApiPagination
        tableHead={tableHead}
        tableData={leaveRequests}
        columnMapping={columnMapping}
        columnAlignment={columnAlignment}
        loading={loading}
        actionButtonsConfig={ACTION_BUTTONS}
        headerConfig={{
          title: "Leave Requests",
          searchPlaceholder: "Search Leave Requests...",
        }}
      />

      <CreateLeaveRequestModal open={open} setOpen={setOpen} />

      <ViewLeaveRequestModal
        open={viewOpen}
        setOpen={setViewOpen}
        requestData={selectedRequest}
      />
    </div>
  );
};

export default LeaveRequests;
