import React, { useEffect, useState, useCallback } from "react";
import {
  FaTachometerAlt,
  FaFilter,
  FaRedo,
  FaTimes,
  FaUser,
  FaCalendarAlt,
  FaBullseye,
  FaChartLine,
  FaShoppingCart,
  FaBoxes,
  FaBoxOpen,
  FaPrint,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBullhorn,
  FaUserPlus,
  FaMapMarkedAlt,
  FaPhoneAlt,
} from "react-icons/fa";
import useReports from "../../../hooks/useReports";
import useEmployee from "../../../hooks/useEmployee";
import SearchableSelect from "../../../components/SearchableSelect";
import DataTableWithoutApiPagination from "../../../components/DataTableWithoutApiPagination";
import showToast from "../../../utils/toast";
import { printReportPdf } from "../../../utils/printReport";
import { MONTH_OPTIONS } from "../../HR/Setup/SalesTarget/CreateSalesTargetModal";

const KpiReports = () => {
  const { getKpiSalesReport, getKpiMarketingReport, loading } = useReports();
  const { getEmployees } = useEmployee();

  // Tab State: "sales" | "marketing"
  const [reportType, setReportType] = useState("sales");

  // Filters state
  const [userId, setUserId] = useState("");
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());

  // Dropdowns & Report data state
  const [employees, setEmployees] = useState([]);
  const [reportData, setReportData] = useState(null);

  // Fetch Employees for filter
  useEffect(() => {
    const fetchEmps = async () => {
      const res = await getEmployees(false);
      if (res.success) {
        setEmployees(res.data || []);
      }
    };
    fetchEmps();
  }, [getEmployees]);

  // Fetch KPI Report Data (Only when userId is selected)
  const fetchReport = useCallback(async () => {
    if (!userId) {
      setReportData(null);
      return;
    }

    const filters = {
      userId,
      month: month || undefined,
      year: year || undefined,
    };

    const res =
      reportType === "sales"
        ? await getKpiSalesReport(filters)
        : await getKpiMarketingReport(filters);

    if (res.success) {
      setReportData(res.data);
    } else {
      setReportData(null);
      showToast(res.message, "error");
    }
  }, [userId, month, year, reportType, getKpiSalesReport, getKpiMarketingReport]);

  useEffect(() => {
    if (userId) {
      fetchReport();
    } else {
      setReportData(null);
    }
  }, [userId, reportType, fetchReport]);

  const handleResetFilters = () => {
    setUserId("");
    setMonth((new Date().getMonth() + 1).toString());
    setYear(new Date().getFullYear().toString());
  };

  const hasActiveFilters = Boolean(
    userId ||
      month !== (new Date().getMonth() + 1).toString() ||
      year !== new Date().getFullYear().toString()
  );

  // Formatters
  const formatBdt = (val) =>
    val !== undefined && val !== null
      ? `${Number(val).toLocaleString("en-BD", { minimumFractionDigits: 2 })} BDT`
      : "0.00 BDT";

  const getMonthName = (mVal) => {
    const found = MONTH_OPTIONS.find((m) => m.value === Number(mVal));
    return found ? found.label : `Month ${mVal}`;
  };

  // --- Sales KPI Extracted Values ---
  const salesUserInfo = reportData?.user || {};
  const salesPeriodInfo = reportData?.period || {};
  const salesTargetInfo = reportData?.target || {};
  const salesActualInfo = reportData?.actual || {};
  const salesAchievementPct = reportData?.achievementPercentage || 0;
  const salesStatus = reportData?.status || "N/A";

  const bulkSales = salesActualInfo.bulkSales || { count: 0, totalAmount: 0 };
  const packagedSales = salesActualInfo.packagedSales || { count: 0, totalAmount: 0 };
  const posSales = salesActualInfo.posSales || { count: 0, totalAmount: 0 };
  const totalActualAmount = Number(salesActualInfo.totalAmount || 0);

  // --- Marketing KPI Extracted Values ---
  const mktUserInfo = reportData?.user || {};
  const mktPeriodInfo = reportData?.period || {};
  const mktTargetInfo = reportData?.target || {};
  const mktActualInfo = reportData?.actual || {};
  const mktAchievementInfo = reportData?.achievement || {};
  const mktStatus = reportData?.status || "N/A";

  const leadsActual = mktActualInfo.leads || { count: 0, byStatus: {} };
  const visitsActual = mktActualInfo.visits || { count: 0, byType: {} };
  const followUpsActual = mktActualInfo.followUps || { count: 0 };

  // Sales Table Data
  const salesTableData = [
    {
      channel: "POS Sales",
      count: posSales.count || 0,
      amount: posSales.totalAmount || 0,
      formattedAmount: formatBdt(posSales.totalAmount),
      contribution:
        totalActualAmount > 0
          ? `${((posSales.totalAmount / totalActualAmount) * 100).toFixed(1)}%`
          : "0.0%",
    },
    {
      channel: "Bulk Sales",
      count: bulkSales.count || 0,
      amount: bulkSales.totalAmount || 0,
      formattedAmount: formatBdt(bulkSales.totalAmount),
      contribution:
        totalActualAmount > 0
          ? `${((bulkSales.totalAmount / totalActualAmount) * 100).toFixed(1)}%`
          : "0.0%",
    },
    {
      channel: "Packaged Sales",
      count: packagedSales.count || 0,
      amount: packagedSales.totalAmount || 0,
      formattedAmount: formatBdt(packagedSales.totalAmount),
      contribution:
        totalActualAmount > 0
          ? `${((packagedSales.totalAmount / totalActualAmount) * 100).toFixed(1)}%`
          : "0.0%",
    },
  ];

  // Marketing Table Data
  const mktTableData = [
    {
      metric: "Leads Generation",
      target: mktTargetInfo.targetLeads || 0,
      actual: leadsActual.count || 0,
      achievementRate: `${mktAchievementInfo.leads || 0}%`,
      status: (mktAchievementInfo.leads || 0) >= 100 ? "Achieved" : "In Progress",
    },
    {
      metric: "Field Visits",
      target: mktTargetInfo.targetVisits || 0,
      actual: visitsActual.count || 0,
      achievementRate: `${mktAchievementInfo.visits || 0}%`,
      status: (mktAchievementInfo.visits || 0) >= 100 ? "Achieved" : "In Progress",
    },
    {
      metric: "Client Follow-ups",
      target: mktTargetInfo.targetFollowUps || 0,
      actual: followUpsActual.count || 0,
      achievementRate: `${mktAchievementInfo.followUps || 0}%`,
      status: (mktAchievementInfo.followUps || 0) >= 100 ? "Achieved" : "In Progress",
    },
  ];

  // Print Handler
  const handlePrint = () => {
    if (reportType === "sales") {
      const filterTags = [
        { label: "Employee", value: salesUserInfo.fullName || "Selected Employee" },
        { label: "Month", value: getMonthName(salesPeriodInfo.month || month) },
        { label: "Year", value: salesPeriodInfo.year || year },
      ];

      const kpiCards = [
        {
          label: "Target Amount",
          value: formatBdt(salesTargetInfo.targetAmount),
          subtext: salesTargetInfo.exists ? "Target Configured" : "No Target Set",
          color: salesTargetInfo.exists ? "primary" : "orange",
        },
        {
          label: "Actual Total Sales",
          value: formatBdt(totalActualAmount),
          subtext: `Achievement: ${salesAchievementPct}%`,
          color: "emerald",
        },
        {
          label: "Achievement Rate",
          value: `${salesAchievementPct}%`,
          subtext: `Status: ${salesStatus}`,
          color: salesStatus === "Achieved" || salesStatus === "On Track" ? "emerald" : "orange",
        },
      ];

      const tables = [
        {
          title: "Sales Channel Performance Breakdown",
          columns: ["SL", "Sales Channel", "Transaction Count", "Total Amount (BDT)", "Contribution"],
          alignments: ["left", "left", "center", "right", "center"],
          rows: salesTableData.map((item, idx) => [
            idx + 1,
            item.channel,
            item.count,
            formatBdt(item.amount),
            item.contribution,
          ]),
        },
      ];

      printReportPdf({
        reportTitle: "Sales KPI / Performance Report",
        reportSubTitle: `Target vs Achievement Analysis - ${salesUserInfo.fullName || "Employee"} (${getMonthName(
          salesPeriodInfo.month || month
        )} ${salesPeriodInfo.year || year})`,
        filterTags,
        kpiCards,
        tables,
      });
    } else {
      const filterTags = [
        { label: "Employee", value: mktUserInfo.fullName || "Selected Employee" },
        { label: "Month", value: getMonthName(mktPeriodInfo.month || month) },
        { label: "Year", value: mktPeriodInfo.year || year },
      ];

      const kpiCards = [
        {
          label: "Target Summary (L / V / F)",
          value: `${mktTargetInfo.targetLeads || 0} / ${mktTargetInfo.targetVisits || 0} / ${mktTargetInfo.targetFollowUps || 0}`,
          subtext: mktTargetInfo.exists ? "Target Configured" : "No Target Set",
          color: mktTargetInfo.exists ? "primary" : "orange",
        },
        {
          label: "Actual Summary (L / V / F)",
          value: `${leadsActual.count || 0} / ${visitsActual.count || 0} / ${followUpsActual.count || 0}`,
          subtext: `Overall: ${mktAchievementInfo.overall || 0}%`,
          color: "emerald",
        },
        {
          label: "Overall Achievement Rate",
          value: `${mktAchievementInfo.overall || 0}%`,
          subtext: `Status: ${mktStatus}`,
          color: mktStatus === "Achieved" || mktStatus === "On Track" ? "emerald" : "orange",
        },
      ];

      const tables = [
        {
          title: "Marketing Performance Metrics Breakdown",
          columns: ["SL", "Metric", "Target", "Actual Count", "Achievement Rate", "Status"],
          alignments: ["left", "left", "center", "center", "center", "center"],
          rows: mktTableData.map((item, idx) => [
            idx + 1,
            item.metric,
            item.target,
            item.actual,
            item.achievementRate,
            item.status,
          ]),
        },
      ];

      printReportPdf({
        reportTitle: "Marketing KPI / Performance Report",
        reportSubTitle: `Target vs Achievement Analysis - ${mktUserInfo.fullName || "Employee"} (${getMonthName(
          mktPeriodInfo.month || month
        )} ${mktPeriodInfo.year || year})`,
        filterTags,
        kpiCards,
        tables,
      });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FaTachometerAlt className="text-emerald-600" /> KPI & Performance Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track sales and marketing monthly target achievements by employee.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            disabled={loading || !reportData || !userId}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <FaPrint /> Print Report
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setReportType("sales")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            reportType === "sales"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <FaChartLine /> Sales KPI Report
        </button>

        <button
          type="button"
          onClick={() => setReportType("marketing")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            reportType === "marketing"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <FaBullhorn /> Marketing KPI Report
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <FaFilter className="text-emerald-600" /> Filter Criteria
          </span>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <FaTimes /> Clear Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <FaUser className="text-slate-400" /> Employee
            </label>
            <SearchableSelect
              options={employees}
              value={userId}
              onChange={(val) => setUserId(val)}
              placeholder="Select Employee"
              searchPlaceholder="Search employee..."
              getOptionLabel={(emp) =>
                `${emp.fullName || `Employee ${emp.id}`} - ${emp.employeeId || ""}`
              }
              getOptionValue={(emp) => emp.id}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <FaCalendarAlt className="text-slate-400" /> Month
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            >
              <option value="">All Months</option>
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <FaCalendarAlt className="text-slate-400" /> Year
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="YYYY"
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={fetchReport}
              disabled={!userId}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <FaRedo /> Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      {!userId ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-xs">
          <div className="flex justify-center mb-3">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full">
              <FaUser className="w-8 h-8" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-800">Select an Employee</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            Please select an employee from the filter dropdown above to load their{" "}
            {reportType === "sales" ? "Sales" : "Marketing"} KPI performance report.
          </p>
        </div>
      ) : reportType === "sales" ? (
        /* --- SALES KPI VIEW --- */
        <>
          {/* Sales Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* User Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Employee
                </span>
                <FaUser className="text-emerald-600" />
              </div>
              <div className="text-lg font-black text-slate-800 truncate">
                {salesUserInfo.fullName || "Selected Employee"}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>
                  ID: <strong className="text-slate-700">{salesUserInfo.employeeId || "-"}</strong>
                </span>
                {salesUserInfo.role?.value && (
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-semibold text-[10px]">
                    {salesUserInfo.role.value}
                  </span>
                )}
              </div>
            </div>

            {/* Target Amount */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Target Sales
                </span>
                <FaBullseye className="text-blue-500" />
              </div>
              <div className="text-xl font-black text-blue-600">
                {formatBdt(salesTargetInfo.targetAmount)}
              </div>
              <div className="text-xs text-slate-500">
                {salesTargetInfo.exists ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <FaCheckCircle /> Target Configured
                  </span>
                ) : (
                  <span className="text-amber-600 font-semibold flex items-center gap-1">
                    <FaExclamationTriangle /> No Target Configured
                  </span>
                )}
              </div>
            </div>

            {/* Actual Total Sales */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Actual Sales
                </span>
                <FaChartLine className="text-emerald-600" />
              </div>
              <div className="text-xl font-black text-emerald-700">
                {formatBdt(totalActualAmount)}
              </div>
              <div className="text-xs text-slate-500">
                Period:{" "}
                <strong className="text-slate-700">
                  {getMonthName(salesPeriodInfo.month || month)}{" "}
                  {salesPeriodInfo.year || year}
                </strong>
              </div>
            </div>

            {/* Achievement Rate */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Achievement Rate
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    salesStatus === "Achieved" || salesStatus === "On Track"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {salesStatus}
                </span>
              </div>
              <div className="text-2xl font-black text-slate-800">{salesAchievementPct}%</div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    salesAchievementPct >= 100
                      ? "bg-emerald-500"
                      : salesAchievementPct >= 50
                      ? "bg-blue-500"
                      : "bg-amber-500"
                  }`}
                  style={{ width: `${Math.min(salesAchievementPct, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Sales Channel Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 font-bold text-slate-700 text-sm">
                  <FaShoppingCart className="text-emerald-600" /> POS Sales
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {posSales.count} Transactions
                </span>
              </div>
              <div className="text-2xl font-black text-slate-800">
                {formatBdt(posSales.totalAmount)}
              </div>
              <div className="text-xs text-slate-500">
                Contribution:{" "}
                <strong className="text-emerald-600 font-bold">
                  {totalActualAmount > 0
                    ? `${((posSales.totalAmount / totalActualAmount) * 100).toFixed(1)}%`
                    : "0%"}
                </strong>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 font-bold text-slate-700 text-sm">
                  <FaBoxes className="text-blue-600" /> Bulk Sales
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {bulkSales.count} Orders
                </span>
              </div>
              <div className="text-2xl font-black text-slate-800">
                {formatBdt(bulkSales.totalAmount)}
              </div>
              <div className="text-xs text-slate-500">
                Contribution:{" "}
                <strong className="text-blue-600 font-bold">
                  {totalActualAmount > 0
                    ? `${((bulkSales.totalAmount / totalActualAmount) * 100).toFixed(1)}%`
                    : "0%"}
                </strong>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 font-bold text-slate-700 text-sm">
                  <FaBoxOpen className="text-purple-600" /> Packaged Sales
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {packagedSales.count} Orders
                </span>
              </div>
              <div className="text-2xl font-black text-slate-800">
                {formatBdt(packagedSales.totalAmount)}
              </div>
              <div className="text-xs text-slate-500">
                Contribution:{" "}
                <strong className="text-purple-600 font-bold">
                  {totalActualAmount > 0
                    ? `${((packagedSales.totalAmount / totalActualAmount) * 100).toFixed(1)}%`
                    : "0%"}
                </strong>
              </div>
            </div>
          </div>

          {/* Breakdown Table */}
          <DataTableWithoutApiPagination
            tableHead={["SL", "Sales Channel", "Transaction Count", "Total Amount", "Contribution %"]}
            tableData={salesTableData}
            columnMapping={{
              "Sales Channel": "channel",
              "Transaction Count": "count",
              "Total Amount": "formattedAmount",
              "Contribution %": "contribution",
            }}
            columnAlignment={{
              SL: "left",
              "Sales Channel": "left",
              "Transaction Count": "center",
              "Total Amount": "right",
              "Contribution %": "center",
            }}
            loading={loading}
            headerConfig={{
              title: "Sales Channel Performance Breakdown",
              searchPlaceholder: "Search channel...",
            }}
          />
        </>
      ) : (
        /* --- MARKETING KPI VIEW --- */
        <>
          {/* Marketing Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* User Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Employee
                </span>
                <FaUser className="text-emerald-600" />
              </div>
              <div className="text-lg font-black text-slate-800 truncate">
                {mktUserInfo.fullName || "Selected Employee"}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>
                  ID: <strong className="text-slate-700">{mktUserInfo.employeeId || "-"}</strong>
                </span>
                {mktUserInfo.role?.value && (
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-semibold text-[10px]">
                    {mktUserInfo.role.value}
                  </span>
                )}
              </div>
            </div>

            {/* Target Summary */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Target (L / V / F)
                </span>
                <FaBullseye className="text-blue-500" />
              </div>
              <div className="text-xl font-black text-blue-600">
                {mktTargetInfo.targetLeads || 0} / {mktTargetInfo.targetVisits || 0} / {mktTargetInfo.targetFollowUps || 0}
              </div>
              <div className="text-xs text-slate-500">
                {mktTargetInfo.exists ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <FaCheckCircle /> Targets Configured
                  </span>
                ) : (
                  <span className="text-amber-600 font-semibold flex items-center gap-1">
                    <FaExclamationTriangle /> No Targets Configured
                  </span>
                )}
              </div>
            </div>

            {/* Actual Summary */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Actual (L / V / F)
                </span>
                <FaBullhorn className="text-emerald-600" />
              </div>
              <div className="text-xl font-black text-emerald-700">
                {leadsActual.count || 0} / {visitsActual.count || 0} / {followUpsActual.count || 0}
              </div>
              <div className="text-xs text-slate-500">
                Period:{" "}
                <strong className="text-slate-700">
                  {getMonthName(mktPeriodInfo.month || month)}{" "}
                  {mktPeriodInfo.year || year}
                </strong>
              </div>
            </div>

            {/* Overall Achievement */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Overall Achievement
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    mktStatus === "Achieved" || mktStatus === "On Track"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {mktStatus}
                </span>
              </div>
              <div className="text-2xl font-black text-slate-800">
                {mktAchievementInfo.overall || 0}%
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    (mktAchievementInfo.overall || 0) >= 100
                      ? "bg-emerald-500"
                      : (mktAchievementInfo.overall || 0) >= 50
                      ? "bg-blue-500"
                      : "bg-amber-500"
                  }`}
                  style={{
                    width: `${Math.min(mktAchievementInfo.overall || 0, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Marketing Breakdown Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Leads Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 font-bold text-slate-700 text-sm">
                  <FaUserPlus className="text-emerald-600" /> Leads
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {mktAchievementInfo.leads || 0}% Achieved
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-xs text-slate-400 block">Actual</span>
                  <span className="text-2xl font-black text-slate-800">
                    {leadsActual.count || 0}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Target</span>
                  <span className="text-lg font-bold text-slate-600">
                    {mktTargetInfo.targetLeads || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Visits Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 font-bold text-slate-700 text-sm">
                  <FaMapMarkedAlt className="text-blue-600" /> Visits
                </div>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  {mktAchievementInfo.visits || 0}% Achieved
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-xs text-slate-400 block">Actual</span>
                  <span className="text-2xl font-black text-slate-800">
                    {visitsActual.count || 0}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Target</span>
                  <span className="text-lg font-bold text-slate-600">
                    {mktTargetInfo.targetVisits || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Follow-ups Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 font-bold text-slate-700 text-sm">
                  <FaPhoneAlt className="text-purple-600" /> Follow-ups
                </div>
                <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                  {mktAchievementInfo.followUps || 0}% Achieved
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-xs text-slate-400 block">Actual</span>
                  <span className="text-2xl font-black text-slate-800">
                    {followUpsActual.count || 0}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Target</span>
                  <span className="text-lg font-bold text-slate-600">
                    {mktTargetInfo.targetFollowUps || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Marketing Breakdown Table */}
          <DataTableWithoutApiPagination
            tableHead={["SL", "Metric", "Target", "Actual Count", "Achievement Rate", "Status"]}
            tableData={mktTableData}
            columnMapping={{
              Metric: "metric",
              Target: "target",
              "Actual Count": "actual",
              "Achievement Rate": "achievementRate",
              Status: "status",
            }}
            columnAlignment={{
              SL: "left",
              Metric: "left",
              Target: "center",
              "Actual Count": "center",
              "Achievement Rate": "center",
              Status: "center",
            }}
            loading={loading}
            headerConfig={{
              title: "Marketing Performance Metrics Breakdown",
              searchPlaceholder: "Search metric...",
            }}
          />
        </>
      )}
    </div>
  );
};

export default KpiReports;
