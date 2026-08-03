import React, { useEffect, useState } from "react";
import { FaCheckSquare } from "react-icons/fa";
import usePayroll from "../../../hooks/usePayroll";
import DataTableWithoutApiPagination from "../../../components/DataTableWithoutApiPagination";
import showToast from "../../../utils/toast";
import PayrollDecisionModal from "./PayrollDecisionModal";
import { formatDhakaDate } from "../../../utils/dateUtils";

const MONTHS = [
  { id: 1, name: "January" },
  { id: 2, name: "February" },
  { id: 3, name: "March" },
  { id: 4, name: "April" },
  { id: 5, name: "May" },
  { id: 6, name: "June" },
  { id: 7, name: "July" },
  { id: 8, name: "August" },
  { id: 9, name: "September" },
  { id: 10, name: "October" },
  { id: 11, name: "November" },
  { id: 12, name: "December" },
];

const PayrollApprovals = () => {
  const { getPendingApprovals, loading } = usePayroll();
  const [payrolls, setPayrolls] = useState([]);

  const [open, setOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    const res = await getPendingApprovals();
    if (res.success) {
      const formattedData = (res.data || []).map((item) => ({
        id: item.id,
        employeeId: item.employee?.employeeId || "-",
        employeeName: item.employee?.fullName || "-",
        month: MONTHS.find((m) => m.id === item.month)?.name || item.month,
        year: item.year,
        amount: item.amount,
        generatedAt: item.createdAt
          ? formatDhakaDate(item.createdAt)
          : "-",
      }));
      setPayrolls(formattedData);
    } else {
      setPayrolls([]);
      showToast(res.message, "error");
    }
  };

  const tableHead = [
    "Employee ID",
    "Employee Name",
    "Month",
    "Year",
    "Amount (BDT)",
    "Generated At",
    "Action",
  ];

  const columnMapping = {
    "Employee ID": "employeeId",
    "Employee Name": "employeeName",
    Month: "month",
    Year: "year",
    "Amount (BDT)": "amount",
    "Generated At": "generatedAt",
  };

  const columnAlignment = {
    "Employee ID": "left",
    "Employee Name": "left",
    Month: "left",
    Year: "center",
    "Amount (BDT)": "right",
    "Generated At": "center",
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
    <div className="flex flex-col gap-4 p-4 w-full">
      <DataTableWithoutApiPagination
        tableHead={tableHead}
        tableData={payrolls}
        columnMapping={columnMapping}
        columnAlignment={columnAlignment}
        loading={loading}
        actionButtonsConfig={ACTION_BUTTONS}
        headerConfig={{
          title: "Pending Approvals",
          searchPlaceholder: "Search pending approvals...",
        }}
      />

      <PayrollDecisionModal
        open={open}
        setOpen={setOpen}
        requestData={selectedRequest}
        onDecisionMade={fetchPendingApprovals}
      />
    </div>
  );
};

export default PayrollApprovals;
