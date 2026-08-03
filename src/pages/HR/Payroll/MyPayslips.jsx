import { useEffect, useState } from "react";
import usePayroll from "../../../hooks/usePayroll";
import DataTableWithoutApiPagination from "../../../components/DataTableWithoutApiPagination";
import showToast from "../../../utils/toast";
import { useAuthStore } from "../../../store/authStore";
import { FaEye } from "react-icons/fa";
import PayslipModal from "./PayslipModal";
import { formatDhakaDate } from "../../../utils/dateUtils";

const MyPayslips = () => {
  const { getPayslips, loading } = usePayroll();
  const { authUser } = useAuthStore();

  const [payslips, setPayslips] = useState([]);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);

  useEffect(() => {
    if (authUser?.id) {
      fetchPayslips();
    }
  }, [authUser?.id]);

  const fetchPayslips = async () => {
    const res = await getPayslips(authUser.id);

    if (res.success) {
      setPayslips(
        res.data.map((slip) => ({
          ...slip,
          employeeId: slip.user?.employeeId || authUser?.employeeId || "-",
          employeeName: slip.user?.fullName || authUser?.fullName || "-",
          month: new Date(0, slip.month - 1).toLocaleString("default", {
            month: "long",
          }),
          generatedDate: slip.createdAt
            ? formatDhakaDate(slip.createdAt)
            : "-",
          generatedAt: slip.createdAt
            ? formatDhakaDate(slip.createdAt)
            : "-",
          statusName: slip.status?.value || "Pending",
          status: slip.status?.value || "Pending",
          currentApproverRole: slip.currentApproverRole?.value || "-",
          amountFormatted: slip.amount
            ? `৳ ${Number(slip.amount).toLocaleString()}`
            : "-",
        })),
      );
    } else {
      setPayslips([]);
      showToast(res.message, "error");
    }
  };

  const tableHead = [
    "SL",
    "Month",
    "Year",
    "Amount (BDT)",
    "Generated Date",
    "Status",
    "Current Approver",
    "Action",
  ];

  const columnMapping = {
    Month: "month",
    Year: "year",
    "Amount (BDT)": "amountFormatted",
    "Generated Date": "generatedDate",
    Status: "statusName",
    "Current Approver": "currentApproverRole",
  };

  const columnAlignment = {
    SL: "left",
    Month: "center",
    Year: "center",
    "Amount (BDT)": "right",
    "Generated Date": "center",
    Status: "center",
    "Current Approver": "center",
    Action: "center",
  };

  const ACTION_BUTTONS = [
    {
      show: () => true,
      icon: <FaEye className="text-lime-500 w-5 h-5" />,
      onClick: (row) => {
        setSelectedPayslip(row);
        setIsPayslipModalOpen(true);
      },
      label: "View Payslip",
    },
  ];

  return (
    <div className="p-4">
      <DataTableWithoutApiPagination
        tableHead={tableHead}
        tableData={payslips}
        columnMapping={columnMapping}
        columnAlignment={columnAlignment}
        actionButtonsConfig={ACTION_BUTTONS}
        loading={loading}
        headerConfig={{
          title: "My Payslips",
          searchPlaceholder: "Search payslips...",
        }}
      />

      {isPayslipModalOpen && (
        <PayslipModal
          open={isPayslipModalOpen}
          setOpen={setIsPayslipModalOpen}
          payrollData={selectedPayslip}
        />
      )}
    </div>
  );
};

export default MyPayslips;
