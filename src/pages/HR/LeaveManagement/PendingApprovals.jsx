import { useEffect, useState } from "react";
import { FaCheckSquare } from "react-icons/fa";
import LeaveDecisionModal from "./LeaveDecisionModal";
import useLeaveRequest from "../../../hooks/useLeaveRequest";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import { usePaginationStore } from "../../../store/paginationStore";
import DataTable from "../../../components/DataTable";
import showToast from "../../../utils/toast";
import DataTableWithoutApiPagination from "../../../components/DataTableWithoutApiPagination";
import { formatDhakaDate } from "../../../utils/dateUtils";

const PendingApprovals = () => {
  const { getPendingApprovals, loading } = useLeaveRequest();
  const { triggerRefresh } = useTriggerRefreshStore();
  const { page, limit, search, setTotalData } = usePaginationStore();

  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchPendingApprovals();
  }, [triggerRefresh, page, limit, search]);

  const fetchPendingApprovals = async () => {
    const res = await getPendingApprovals();
    if (res.success) {
      setTotalData(res.total);
      setPendingApprovals(
        res.data.map((request) => ({
          ...request,
          startDate: formatDhakaDate(request.startDate),
          endDate: formatDhakaDate(request.endDate),
          employeeName: `${request.employee?.fullName} (${request.employee?.employeeId})`,
        }))
      );
    } else {
      setPendingApprovals([]);
      showToast(res.message, "error");
    }
  };

  const tableHead = [
    "SL",
    "Employee",
    "Leave Type",
    "Start Date",
    "End Date",
    "Reason",
    "Action",
  ];

  const columnMapping = {
    Employee: "employeeName",
    "Leave Type": "leaveType",
    "Start Date": "startDate",
    "End Date": "endDate",
    Reason: "reason",
  };

  const columnAlignment = {
    SL: "left",
    Employee: "left",
    "Leave Type": "left",
    "Start Date": "center",
    "End Date": "center",
    Reason: "left",
    Action: "center",
  };

  const ACTION_BUTTONS = [
    {
      show: () => true,
      icon: <FaCheckSquare className="text-primary-600 w-5 h-5" />,
      onClick: (row) => {
        setSelectedRequest(row);
        setOpen(true);
      },
      label: "Take Decision",
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <DataTableWithoutApiPagination
        tableHead={tableHead}
        tableData={pendingApprovals}
        columnMapping={columnMapping}
        columnAlignment={columnAlignment}
        loading={loading}
        actionButtonsConfig={ACTION_BUTTONS}
        headerConfig={{
          title: "Pending Approvals",
          searchPlaceholder: "Search Pending Approvals...",
        }}
      />

      <LeaveDecisionModal 
        open={open} 
        setOpen={setOpen} 
        requestData={selectedRequest} 
      />
    </div>
  );
};

export default PendingApprovals;
