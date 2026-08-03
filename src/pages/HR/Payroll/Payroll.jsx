import React, { useEffect, useState } from "react";
import SearchableSelect from "../../../components/SearchableSelect";
import useEmployee from "../../../hooks/useEmployee";
import usePayroll from "../../../hooks/usePayroll";
import DataTable from "../../../components/DataTable";
import { useAuthStore } from "../../../store/authStore";
import { FaSearch, FaEye } from "react-icons/fa";
import { MdAddCircle } from "react-icons/md";
import showToast from "../../../utils/toast";
import GeneratePayrollModal from "./GeneratePayrollModal";
import PayslipModal from "./PayslipModal";
import { usePaginationStore } from "../../../store/paginationStore";
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

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => ({
  id: currentYear - 2 + i,
  name: (currentYear - 2 + i).toString(),
}));

const Payroll = () => {
  const { authUser } = useAuthStore();
  const { getEmployees } = useEmployee();
  const { getPayroll, loading } = usePayroll();
  const { page, limit, search, setTotalData } = usePaginationStore();
  const isAdmin = ["Super Admin", "Admin","Accounts Manager",
          "Accounts Executive"].includes(authUser?.roleName);

  const [employees, setEmployees] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    userId: "",
    month: new Date().getMonth() + 1,
    year: currentYear,
  });

  useEffect(() => {
    if (isAdmin) {
      fetchEmployees();
    }
  }, [isAdmin]);

  const fetchEmployees = async () => {
    const res = await getEmployees(false);
    if (res.success) {
      setEmployees(res.data || []);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, [page, limit, search]);

  const fetchPayrolls = async (overrideFilters = filters) => {
    const finalUserId = isAdmin ? overrideFilters.userId : authUser?.id;

    const payload = {
      page,
      limit,
      search,
    };

    if (finalUserId) {
      payload.userId = Number(finalUserId);
    }

    if (overrideFilters.month) {
      payload.month = Number(overrideFilters.month);
    }

    if (overrideFilters.year) {
      payload.year = Number(overrideFilters.year);
    }

    const res = await getPayroll(payload);

    if (res.success) {
      setTotalData(res.total);

      setPayrolls(
        (res.data || []).map((item) => ({
          ...item,
          employeeId: item.user?.employeeId || "-",
          employeeName: item.user?.fullName || "-",
          month: MONTHS.find((m) => m.id === item.month)?.name || item.month,
          year: item.year,
          amount: item.amount,
          pendingApproval: item.currentApproverRole
            ? item.currentApproverRole.value
            : "-",
          status: item.status?.value || "-",
          currentApproverRole: item.currentApproverRole?.value || "-",
          generatedAt: item.createdAt
            ? formatDhakaDate(item.createdAt)
            : "-",
        })),
      );
    } else {
      setPayrolls([]);
      setTotalData(0);
      showToast(res.message, "error");
    }
  };

  const handleSearch = () => {
    fetchPayrolls();
  };
  const tableHead = [
    "Employee ID",
    "Employee Name",
    "Month",
    "Year",
    "Amount (BDT)",
    "Status",
    "Pending Approval",
    "Generated At",
    "Action",
  ];

  const columnMapping = {
    "Employee ID": "employeeId",
    "Employee Name": "employeeName",
    Month: "month",
    Year: "year",
    "Amount (BDT)": "amount",
    Status: "status",
    "Pending Approval": "pendingApproval",
    "Generated At": "generatedAt",
  };

  const columnAlignment = {
    "Employee ID": "left",
    "Employee Name": "left",
    Month: "left",
    Year: "center",
    "Amount (BDT)": "right",
    Status: "center",
    "Pending Approval": "center",
    "Generated At": "center",
    Action: "center",
  };

  const ACTION_BUTTONS = [
    {
      show: () => true,
      icon: <FaEye className="text-lime-500 w-5 h-5" />,
      onClick: (row) => {
        setSelectedPayroll(row);
        setIsPayslipModalOpen(true);
      },
      label: "View Payslip",
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 w-full">
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div
          className={`grid grid-cols-1 gap-4 items-end ${isAdmin ? "md:grid-cols-5" : "md:grid-cols-3"}`}
        >
          {isAdmin && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-primary-700">
                Employee
              </label>
              <SearchableSelect
                options={employees}
                value={filters.userId}
                onChange={(val) =>
                  setFilters((prev) => ({ ...prev, userId: val }))
                }
                placeholder="All Employees"
                searchPlaceholder="Search by name or ID..."
                getOptionLabel={(emp) =>
                  `${emp.fullName || `Employee ${emp.id}`} - ${emp.employeeId}`
                }
                getOptionValue={(emp) => emp.id}
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold text-primary-700">
              Month
            </label>
            <select
              value={filters.month}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  month: Number(e.target.value),
                }))
              }
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-sm transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            >
              <option value="">Select Month</option>
              {MONTHS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-primary-700">
              Year
            </label>
            <select
              value={filters.year}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  year: Number(e.target.value),
                }))
              }
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-sm transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            >
              <option value="">Select Year</option>
              {YEARS.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-button-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-button-primary-hover disabled:opacity-70"
            >
              <FaSearch className="h-4 w-4" />
              {loading ? "Fetching..." : "Fetch Payroll"}
            </button>
          </div>

          {isAdmin && (
            <div>
              <button
                onClick={() => setIsGenerateModalOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-button-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-button-primary-hover"
              >
                <MdAddCircle className="text-lg" />
                Generate Payroll
              </button>
            </div>
          )}
        </div>
      </div>

      {payrolls.length > 0 ? (
        <DataTable
          tableHead={tableHead}
          tableData={payrolls}
          columnMapping={columnMapping}
          columnAlignment={columnAlignment}
          actionButtonsConfig={ACTION_BUTTONS}
          loading={loading}
          headerConfig={{
            title: "Payroll Data",
            searchPlaceholder: "Search Payroll...",
          }}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
          <p className="text-gray-500">
            No payroll data to display. Please adjust filters and fetch.
          </p>
        </div>
      )}

      {isGenerateModalOpen && (
        <GeneratePayrollModal
          open={isGenerateModalOpen}
          setOpen={setIsGenerateModalOpen}
          onGenerated={handleSearch}
          employees={employees}
        />
      )}

      {isPayslipModalOpen && (
        <PayslipModal
          open={isPayslipModalOpen}
          setOpen={setIsPayslipModalOpen}
          payrollData={selectedPayroll}
        />
      )}
    </div>
  );
};

export default Payroll;
