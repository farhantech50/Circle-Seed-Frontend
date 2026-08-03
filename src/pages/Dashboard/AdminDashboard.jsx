import React, { useEffect, useState, useCallback } from "react";
import {
  FaTachometerAlt,
  FaUsers,
  FaMoneyBillWave,
  FaClipboardList,
  FaExclamationTriangle,
  FaRedo,
  FaTruckLoading,
  FaBullhorn,
  FaCheckCircle,
  FaClock,
  FaHandHoldingUsd,
  FaWarehouse,
  FaLock,
  FaShoppingCart,
  FaBoxes,
  FaBoxOpen,
  FaReceipt,
  FaUserTimes,
  FaUserCheck,
  FaHourglassHalf,
  FaChartLine,
} from "react-icons/fa";
import {
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import useDashboard from "../../hooks/useDashboard";
import { useAuthStore } from "../../store/authStore";
import DataTableWithoutApiPagination from "../../components/DataTableWithoutApiPagination";
import { formatDhakaDate } from "../../utils/dateUtils";

const AdminDashboard = () => {
  const { getAdminDashboard, loading } = useDashboard();
  const { authUser } = useAuthStore();
  const [dashboardData, setDashboardData] = useState(null);

  const roleName = authUser?.roleName || "";
  const isAdminOrSuper =
    roleName.toLowerCase().includes("admin") ||
    authUser?.permissions?.includes("SUPER");

  const fetchDashboard = useCallback(async () => {
    if (!isAdminOrSuper) return;
    const res = await getAdminDashboard();
    if (res.success) {
      setDashboardData(res.data);
    }
  }, [isAdminOrSuper, getAdminDashboard]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Access Control Check
  if (!isAdminOrSuper) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <div className="p-4 bg-red-50 text-red-600 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
          <FaLock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Access Restricted</h2>
        <p className="text-slate-600">
          This dashboard is reserved exclusively for Admin and Super Admin users.
        </p>
      </div>
    );
  }

  // Formatting Helpers
  const formatBdt = (val) =>
    val !== undefined && val !== null
      ? `${Number(val).toLocaleString("en-BD", { minimumFractionDigits: 2 })} BDT`
      : "0.00 BDT";

  // Data Extraction
  const sales = dashboardData?.sales || {};
  const inventory = dashboardData?.inventory || {};
  const procurement = dashboardData?.procurement || {};
  const finance = dashboardData?.finance || {};
  const hr = dashboardData?.hr || {};
  const marketing = dashboardData?.marketing || {};
  const graphData = dashboardData?.graph || [];

  // Low Stock Items (Bulk)
  const lowStockBulkData = (inventory.lowStock?.bulk || []).map((item) => ({
    seedType: item.seedType || "-",
    remainingQuantity: `${item.remainingQuantity} kg`,
  }));

  // Low Stock Items (Packaged)
  const lowStockPackagedData = (inventory.lowStock?.packaged || []).map((item) => ({
    seedType: item.seedType || "-",
    packetSize: `${item.packetSize || "-"} gm`,
    remainingQuantity: `${item.remainingQuantity} packets`,
  }));

  // Expiring Soon Items
  const expiringSoonData = (inventory.expiringSoon || []).map((item) => ({
    seedType: item.seedType || "-",
    remainingQuantity: `${item.remainingQuantity} units/kg`,
    expiryDate: item.expiryDate ? formatDhakaDate(item.expiryDate) : "-",
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-200 text-xs space-y-1">
          <p className="font-bold text-slate-800 border-b border-slate-100 pb-1 mb-1">
            {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="font-semibold">
              {entry.name}: {formatBdt(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-slate-50/50 min-h-screen space-y-4 sm:space-y-6 w-full overflow-x-hidden">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FaTachometerAlt className="text-emerald-600 shrink-0" /> Executive Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Welcome back, <span className="font-semibold text-slate-700">{authUser?.fullName || "Admin"}</span>. Complete real-time business overview.
          </p>
        </div>

        <div className="w-full sm:w-auto flex items-center justify-end">
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <FaRedo className={loading ? "animate-spin" : ""} /> Refresh Dashboard
          </button>
        </div>
      </div>

      {/* 1. TOP EXECUTIVE FINANCIAL & INVENTORY METRICS (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Today's Revenue */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              Today Revenue
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg text-base shrink-0">
              <FaMoneyBillWave />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-800 break-words">
            {formatBdt(sales.todayRevenue)}
          </div>
          <div className="text-[11px] text-slate-500">
            Daily Sales Amount
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500"></div>
        </div>

        {/* Month Revenue */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              Month Revenue
            </span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg text-base shrink-0">
              <FaChartLine />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-700 break-words">
            {formatBdt(sales.monthRevenue)}
          </div>
          <div className="text-[11px] text-slate-500">
            Cumulative This Month
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-teal-500"></div>
        </div>

        {/* Inventory Value */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Inventory Value
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg text-base shrink-0">
              <FaWarehouse />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-800 break-words">
            {formatBdt(inventory.totalInventoryValue)}
          </div>
          <div className="text-[11px] text-slate-500">
            Total Asset Valuation
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500"></div>
        </div>

        {/* Receivables */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              Outstanding Receivables
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg text-base shrink-0">
              <FaHandHoldingUsd />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-800 break-words">
            {formatBdt(finance.totalOutstandingReceivables)}
          </div>
          <div className="text-[11px] text-slate-500">
            Due Customer Receivables
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-500"></div>
        </div>

        {/* Expenses */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 relative overflow-hidden flex flex-col justify-between sm:col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              Expenses (Month)
            </span>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg text-base shrink-0">
              <FaReceipt />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-red-600 break-words">
            {formatBdt(finance.totalExpensesThisMonth)}
          </div>
          <div className="text-[11px] text-slate-500">
            Total Monthly Expenses
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-red-500"></div>
        </div>
      </div>

      {/* 2. DETAILED DEPARTMENT HIGHLIGHTS GRID (6 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Sales Orders: Today vs Month */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
              <FaShoppingCart className="text-emerald-600 shrink-0" /> Sales Orders
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md whitespace-nowrap">
              Today vs Month
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-2 sm:p-2.5 rounded-xl gap-1">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <FaShoppingCart className="text-emerald-600 shrink-0" /> POS Sales:
              </span>
              <span className="text-slate-800 text-[11px] sm:text-xs">
                Today: <strong>{sales.today?.pos?.count || 0}</strong> | Month: <strong>{sales.month?.pos?.count || 0}</strong>
              </span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-2 sm:p-2.5 rounded-xl gap-1">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <FaBoxes className="text-blue-600 shrink-0" /> Bulk Sales:
              </span>
              <span className="text-slate-800 text-[11px] sm:text-xs">
                Today: <strong>{sales.today?.bulk?.count || 0}</strong> | Month: <strong>{sales.month?.bulk?.count || 0}</strong>
              </span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-2 sm:p-2.5 rounded-xl gap-1">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <FaBoxOpen className="text-purple-600 shrink-0" /> Packaged Sales:
              </span>
              <span className="text-slate-800 text-[11px] sm:text-xs">
                Today: <strong>{sales.today?.packaged?.count || 0}</strong> | Month: <strong>{sales.month?.packaged?.count || 0}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* HR & Today Attendance */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
              <FaUsers className="text-blue-600 shrink-0" /> HR & Attendance
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md whitespace-nowrap">
              {hr.totalActiveEmployees || 0} Active Staff
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
            <div className="p-2 sm:p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-emerald-600 flex items-center justify-center gap-1">
                <FaUserCheck /> Present
              </span>
              <span className="text-lg sm:text-xl font-black text-emerald-700 block mt-1">
                {hr.todayAttendance?.present || 0}
              </span>
            </div>
            <div className="p-2 sm:p-2.5 bg-red-50 rounded-xl border border-red-100">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-red-600 flex items-center justify-center gap-1">
                <FaUserTimes /> Absent
              </span>
              <span className="text-lg sm:text-xl font-black text-red-700 block mt-1">
                {hr.todayAttendance?.absent || 0}
              </span>
            </div>
            <div className="p-2 sm:p-2.5 bg-amber-50 rounded-xl border border-amber-100">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-amber-600 flex items-center justify-center gap-1">
                <FaClock /> Late
              </span>
              <span className="text-lg sm:text-xl font-black text-amber-700 block mt-1">
                {hr.todayAttendance?.late || 0}
              </span>
            </div>
          </div>
        </div>

        {/* HR Approvals Attention */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
              <FaClipboardList className="text-purple-600 shrink-0" /> Pending Approvals
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md whitespace-nowrap">
              Action Required
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-700 text-[11px] sm:text-xs">Leave Approvals:</span>
              <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 rounded-md font-bold text-xs">
                {hr.pendingLeaveApprovals || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-700 text-[11px] sm:text-xs">Payroll Approvals:</span>
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-md font-bold text-xs">
                {hr.pendingPayrollApprovals || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Procurement Highlights */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
              <FaTruckLoading className="text-blue-600 shrink-0" /> Procurement Summary
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-700 text-[11px] sm:text-xs">Pending Deliveries:</span>
              <strong className="text-blue-600 text-xs sm:text-sm">
                {procurement.pendingDeliveriesCount || 0}
              </strong>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-700 text-[11px] sm:text-xs">Supplier Dues:</span>
              <strong className="text-slate-800 text-[11px] sm:text-xs break-all text-right">
                {formatBdt(procurement.totalDueToSuppliers)}
              </strong>
            </div>
          </div>
        </div>

        {/* Marketing Summary */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
              <FaBullhorn className="text-amber-600 shrink-0" /> Marketing (Month)
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-700 text-[11px] sm:text-xs">Leads This Month:</span>
              <strong className="text-slate-800 text-xs sm:text-sm">{marketing.leadsThisMonth || 0}</strong>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-700 text-[11px] sm:text-xs">Visits This Month:</span>
              <strong className="text-slate-800 text-xs sm:text-sm">{marketing.visitsThisMonth || 0}</strong>
            </div>
          </div>
        </div>

        {/* Low Stock Overview Counter */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
              <FaExclamationTriangle className="text-amber-500 shrink-0" /> Low Stock Alerts
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-amber-50 rounded-xl">
              <span className="font-semibold text-amber-800 text-[11px] sm:text-xs">Low Stock (Bulk):</span>
              <strong className="text-amber-900 text-[11px] sm:text-xs">{lowStockBulkData.length} items</strong>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-amber-50 rounded-xl">
              <span className="font-semibold text-amber-800 text-[11px] sm:text-xs">Low Stock (Packaged):</span>
              <strong className="text-amber-900 text-[11px] sm:text-xs">{lowStockPackagedData.length} items</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FINANCIAL PERFORMANCE GRAPH (Revenue vs Expenses vs Profit) */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 min-w-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800">Financial History</h2>
            <p className="text-xs text-slate-500 mt-0.5">Monthly revenue, total expenses, and calculated net profit.</p>
          </div>
        </div>

        <div className="h-[280px] sm:h-[340px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={graphData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(val) => `${val / 1000}k`} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={16} />
              <Line type="monotone" dataKey="profit" name="Profit" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
