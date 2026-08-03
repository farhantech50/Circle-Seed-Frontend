import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FaUserCheck,
  FaCalendarMinus,
  FaFileInvoiceDollar,
  FaClipboardCheck,
  FaChartLine,
  FaRedo,
  FaClock,
  FaCalendarCheck,
  FaHourglassHalf,
  FaCheckCircle,
  FaExclamationCircle,
  FaBullhorn,
  FaMoneyBillWave,
  FaArrowRight,
  FaUserTie,
} from "react-icons/fa";
import useDashboard from "../../hooks/useDashboard";
import { useAuthStore } from "../../store/authStore";

const EmployeeDashboard = () => {
  const { getEmployeeDashboard, loading } = useDashboard();
  const { authUser } = useAuthStore();
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboard = useCallback(async () => {
    const res = await getEmployeeDashboard();
    if (res.success) {
      setDashboardData(res.data);
    }
  }, [getEmployeeDashboard]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Data Extraction with Fallbacks
  const attendance = dashboardData?.attendance || {};
  const todayAttendance = attendance?.today;

  const leave = dashboardData?.leave || {
    quota: 0,
    used: 0,
    remaining: 0,
    pendingRequests: 0,
  };

  const payslip = dashboardData?.payslip;

  const pendingApprovals = dashboardData?.pendingApprovals || {
    leaveApprovals: 0,
    payrollApprovals: 0,
  };

  const kpi = dashboardData?.kpi || {
    sales: null,
    marketing: null,
  };

  // Helper formatting for BDT Currency
  const formatBdt = (val) =>
    val !== undefined && val !== null
      ? `৳ ${Number(val).toLocaleString("en-BD", { minimumFractionDigits: 2 })}`
      : "৳ 0.00";

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-slate-50/50 min-h-screen space-y-4 sm:space-y-6 w-full overflow-x-hidden">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FaUserTie className="text-emerald-600" /> Employee Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back,{" "}
            <span className="font-semibold text-slate-700">
              {authUser?.fullName || "Employee"}
            </span>{" "}
            ({authUser?.roleName || "Staff"})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <FaRedo className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* TOP METRIC CARDS GRID (4 Key Areas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Today's Attendance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Today's Attendance
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-lg">
              <FaUserCheck />
            </div>
          </div>
          <div>
            {todayAttendance ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    {todayAttendance.status || "Present"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  In: {todayAttendance.inTime || todayAttendance.checkIn || "--:--"} | Out: {todayAttendance.outTime || todayAttendance.checkOut || "--:--"}
                </p>
              </div>
            ) : (
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  Not Checked In
                </span>
                <p className="text-xs text-slate-400 mt-1">No attendance log for today yet</p>
              </div>
            )}
          </div>
          <Link
            to="/hr/attendance"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            View Attendance Logs <FaArrowRight className="text-[10px]" />
          </Link>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500"></div>
        </div>

        {/* 2. Leave Summary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Leave Balance
            </span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl text-lg">
              <FaCalendarMinus />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">
              {leave.remaining}{" "}
              <span className="text-sm font-normal text-slate-500">
                / {leave.quota} Days
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Used: {leave.used} days | Pending: {leave.pendingRequests} requests
            </p>
          </div>
          <Link
            to="/hr/leave/requests"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            Manage Leave Requests <FaArrowRight className="text-[10px]" />
          </Link>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500"></div>
        </div>

        {/* 3. Latest Payslip */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Latest Payslip
            </span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl text-lg">
              <FaFileInvoiceDollar />
            </div>
          </div>
          <div>
            {payslip ? (
              <div>
                <div className="text-xl font-bold text-slate-800">
                  {formatBdt(payslip.netSalary || payslip.amount || payslip.totalSalary)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {payslip.month ? `Month: ${payslip.month}` : "Recent Payslip"} {payslip.status ? `(${payslip.status})` : ""}
                </p>
              </div>
            ) : (
              <div>
                <div className="text-sm font-semibold text-slate-600">
                  No Payslip Available
                </div>
                <p className="text-xs text-slate-400 mt-1">Latest payroll record not found</p>
              </div>
            )}
          </div>
          <Link
            to="/hr/payroll/payslips"
            className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            View My Payslips <FaArrowRight className="text-[10px]" />
          </Link>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-500"></div>
        </div>

        {/* 4. Pending Approvals */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Approvals
            </span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl text-lg">
              <FaClipboardCheck />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">
              {pendingApprovals.leaveApprovals + pendingApprovals.payrollApprovals}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Leave: {pendingApprovals.leaveApprovals} | Payroll: {pendingApprovals.payrollApprovals}
            </p>
          </div>
          <Link
            to="/hr/leave/pending-approvals"
            className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            View Approval Queue <FaArrowRight className="text-[10px]" />
          </Link>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-500"></div>
        </div>
      </div>

      {/* SECONDARY DETAILED SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEAVE DETAILS & BREAKDOWN (Col Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FaCalendarCheck className="text-blue-600" /> Leave Quota Overview
              </h2>
              <Link
                to="/hr/leave/requests"
                className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition"
              >
                + Request Leave
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="text-xs text-slate-500 font-medium">Total Quota</span>
                <p className="text-xl font-bold text-slate-800 mt-1">{leave.quota} Days</p>
              </div>

              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 text-center">
                <span className="text-xs text-emerald-600 font-medium">Used Leave</span>
                <p className="text-xl font-bold text-emerald-700 mt-1">{leave.used} Days</p>
              </div>

              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 text-center">
                <span className="text-xs text-blue-600 font-medium">Remaining</span>
                <p className="text-xl font-bold text-blue-700 mt-1">{leave.remaining} Days</p>
              </div>

              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-100 text-center">
                <span className="text-xs text-amber-600 font-medium">Pending Requests</span>
                <p className="text-xl font-bold text-amber-700 mt-1">{leave.pendingRequests}</p>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs text-slate-500 font-semibold">
                <span>Leave Usage Progress</span>
                <span>
                  {leave.quota > 0
                    ? `${Math.round((leave.used / leave.quota) * 100)}%`
                    : "0%"}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      leave.quota > 0
                        ? Math.min(100, (leave.used / leave.quota) * 100)
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* KPI PERFORMANCE SECTION */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FaChartLine className="text-indigo-600" /> Key Performance Indicators (KPI)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Target performance & achievement summary
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Sales KPI Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <FaMoneyBillWave className="text-emerald-600" /> Sales Target KPI
                  </span>
                  <span className="text-[11px] px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full font-medium">
                    Sales
                  </span>
                </div>
                {kpi.sales ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Target:</span>
                      <span className="font-semibold">{formatBdt(kpi.sales.target)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Achieved:</span>
                      <span className="font-semibold text-emerald-600">
                        {formatBdt(kpi.sales.achieved)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            kpi.sales.target
                              ? (kpi.sales.achieved / kpi.sales.target) * 100
                              : 0
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">
                    No active sales target assigned for this period.
                  </p>
                )}
              </div>

              {/* Marketing KPI Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <FaBullhorn className="text-indigo-600" /> Marketing Target KPI
                  </span>
                  <span className="text-[11px] px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full font-medium">
                    Marketing
                  </span>
                </div>
                {kpi.marketing ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Target:</span>
                      <span className="font-semibold">{formatBdt(kpi.marketing.target)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Achieved:</span>
                      <span className="font-semibold text-indigo-600">
                        {formatBdt(kpi.marketing.achieved)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-indigo-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            kpi.marketing.target
                              ? (kpi.marketing.achieved / kpi.marketing.target) * 100
                              : 0
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">
                    No active marketing target assigned for this period.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE PANEL (Col Span 1): PENDING APPROVALS & QUICK LINKS */}
        <div className="space-y-6">
          {/* Pending Approvals Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <FaHourglassHalf className="text-amber-500" /> Action Required / Approvals
            </h2>

            <div className="space-y-3">
              <div className="p-3.5 bg-amber-50/50 border border-amber-200/60 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-lg text-sm">
                    <FaCalendarMinus />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Leave Approvals</p>
                    <p className="text-[11px] text-slate-500">Pending team requests</p>
                  </div>
                </div>
                <span className="text-sm font-black text-amber-700">
                  {pendingApprovals.leaveApprovals}
                </span>
              </div>

              <div className="p-3.5 bg-purple-50/50 border border-purple-200/60 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 text-purple-700 rounded-lg text-sm">
                    <FaFileInvoiceDollar />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Payroll Approvals</p>
                    <p className="text-[11px] text-slate-500">Pending salary approvals</p>
                  </div>
                </div>
                <span className="text-sm font-black text-purple-700">
                  {pendingApprovals.payrollApprovals}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts Navigation */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 gap-2.5">
              <Link
                to="/hr/attendance"
                className="p-3 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 rounded-xl transition flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-emerald-700 group"
              >
                <span className="flex items-center gap-2">
                  <FaClock className="text-slate-400 group-hover:text-emerald-600" /> Attendance Records
                </span>
                <FaArrowRight className="text-[10px] text-slate-400 group-hover:text-emerald-600" />
              </Link>

              <Link
                to="/hr/leave/requests"
                className="p-3 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 rounded-xl transition flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-blue-700 group"
              >
                <span className="flex items-center gap-2">
                  <FaCalendarMinus className="text-slate-400 group-hover:text-blue-600" /> Leave Applications
                </span>
                <FaArrowRight className="text-[10px] text-slate-400 group-hover:text-blue-600" />
              </Link>

              <Link
                to="/hr/payroll/payslips"
                className="p-3 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 rounded-xl transition flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-purple-700 group"
              >
                <span className="flex items-center gap-2">
                  <FaFileInvoiceDollar className="text-slate-400 group-hover:text-purple-600" /> Download Payslips
                </span>
                <FaArrowRight className="text-[10px] text-slate-400 group-hover:text-purple-600" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
