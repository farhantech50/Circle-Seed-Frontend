import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  FaBook,
  FaRedo,
  FaFilter,
  FaTimes,
  FaBuilding,
  FaUser,
  FaIdBadge,
  FaArrowDown,
  FaArrowUp,
  FaFileInvoiceDollar,
  FaShoppingCart,
  FaBoxOpen,
  FaExchangeAlt,
  FaWallet,
  FaHandHoldingUsd,
  FaPercentage,
} from "react-icons/fa";
import { useAuthStore } from "../../../store/authStore";
import useLedger from "../../../hooks/useLedger";
import DataTableWithoutApiPagination from "../../../components/DataTableWithoutApiPagination";
import SearchableSelect from "../../../components/SearchableSelect";
import api from "../../../config/api";
import showToast from "../../../utils/toast";
import AdjustCommissionModal from "./AdjustCommissionModal";
import { formatDhakaDateTime } from "../../../utils/dateUtils";

const Ledger = () => {
  const { authUser } = useAuthStore();
  const { getLedger, loading } = useLedger();

  // Active Stakeholder state (default to empty string so no initial API call occurs until selected)
  const [selectedStakeholderId, setSelectedStakeholderId] = useState("");
  const [stakeholdersList, setStakeholdersList] = useState([]);
  const [stakeholdersLoading, setStakeholdersLoading] = useState(false);

  // Ledger Data state
  const [ledgerData, setLedgerData] = useState(null);
  const [adjustCommissionOpen, setAdjustCommissionOpen] = useState(false);

  // Filter States
  const [typeFilter, setTypeFilter] = useState("all");
  const [directionFilter, setDirectionFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Load Stakeholders list for selector dropdown
  useEffect(() => {
    const fetchStakeholders = async () => {
      setStakeholdersLoading(true);
      try {
        const res = await api.get("/api/stakeholders", {
          params: { limit: 500 },
        });
        let list = [];
        if (Array.isArray(res.data)) list = res.data;
        else if (res.data?.data && Array.isArray(res.data.data))
          list = res.data.data;
        setStakeholdersList(list);
      } catch (err) {
        console.error("Error fetching stakeholders:", err);
      } finally {
        setStakeholdersLoading(false);
      }
    };
    fetchStakeholders();
  }, []);

  // Fetch Ledger data for selected stakeholder
  const fetchLedger = useCallback(async () => {
    if (!selectedStakeholderId) {
      setLedgerData(null);
      return;
    }

    const res = await getLedger(selectedStakeholderId);
    if (res.success && res.data) {
      setLedgerData(res.data);
    } else {
      setLedgerData(null);
      showToast(res.message || "Failed to load ledger data", "error");
    }
  }, [getLedger, selectedStakeholderId]);

  useEffect(() => {
    if (selectedStakeholderId) {
      fetchLedger();
    } else {
      setLedgerData(null);
    }
  }, [selectedStakeholderId, fetchLedger]);

  const handleClearFilters = () => {
    setTypeFilter("all");
    setDirectionFilter("all");
    setSortOrder("desc");
    setStartDate("");
    setEndDate("");
  };

  // Helper formatting functions
  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return `৳${num.toLocaleString()}`;
  };

  const formatTypeLabel = (type) => {
    switch (type) {
      case "procurement_order":
        return "Procurement Order";
      case "bulk_sale_invoice":
        return "Bulk Sale Invoice";
      case "packaged_sale_invoice":
        return "Packaged Sale Invoice";
      case "payment_received":
        return "Payment Received";
      case "payment_made":
      case "payment_sent":
        return "Payment Made";
      default:
        return type ? type.replace(/_/g, " ").toUpperCase() : "-";
    }
  };

  const getTypeBadge = (type) => {
    const isCommission = type && String(type).toLowerCase().includes("commission");
    if (isCommission) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <FaArrowUp className="w-3 h-3 text-purple-600" />
          COMMISSION ADJUSTED
        </span>
      );
    }

    switch (type) {
      case "procurement_order":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <FaShoppingCart className="w-3 h-3 text-amber-600" />
            Procurement Order
          </span>
        );
      case "bulk_sale_invoice":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <FaFileInvoiceDollar className="w-3 h-3 text-blue-600" />
            Bulk Sale Invoice
          </span>
        );
      case "packaged_sale_invoice":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            <FaBoxOpen className="w-3 h-3 text-teal-600" />
            Packaged Sale Invoice
          </span>
        );
      case "payment_received":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <FaArrowDown className="w-3 h-3 text-emerald-600" />
            Payment Received
          </span>
        );
      case "payment_made":
      case "payment_sent":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <FaArrowUp className="w-3 h-3 text-purple-600" />
            Payment Made
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {formatTypeLabel(type)}
          </span>
        );
    }
  };

  const getDirectionBadge = (direction, type) => {
    const isCommission = type && String(type).toLowerCase().includes("commission");
    if (isCommission) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-100 text-indigo-800">
          Paid (Debit)
        </span>
      );
    }

    switch (direction) {
      case "payable":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-100 text-rose-800">
            <FaArrowUp className="w-2.5 h-2.5" /> Payable
          </span>
        );
      case "receivable":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">
            <FaArrowDown className="w-2.5 h-2.5" /> Receivable
          </span>
        );
      case "receivable_reduction":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-sky-100 text-sky-800">
            Received (Credit)
          </span>
        );
      case "payable_reduction":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-100 text-indigo-800">
            Paid (Debit)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
            {direction || "-"}
          </span>
        );
    }
  };

  // Filter raw transactions
  const rawTransactions = ledgerData?.transactions || [];

  const filteredTransactions = useMemo(() => {
    const list = rawTransactions.filter((tx) => {
      // Type Filter
      if (typeFilter !== "all" && tx.type !== typeFilter) {
        return false;
      }
      // Direction Filter
      if (directionFilter !== "all" && tx.direction !== directionFilter) {
        return false;
      }
      // Start Date Filter
      if (startDate) {
        const txDate = new Date(tx.date).getTime();
        const start = new Date(startDate).setHours(0, 0, 0, 0);
        if (txDate < start) return false;
      }
      // End Date Filter
      if (endDate) {
        const txDate = new Date(tx.date).getTime();
        const end = new Date(endDate).setHours(23, 59, 59, 999);
        if (txDate > end) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      const timeA = new Date(a.date).getTime() || 0;
      const timeB = new Date(b.date).getTime() || 0;
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });
  }, [rawTransactions, typeFilter, directionFilter, startDate, endDate, sortOrder]);

  // Format table data for DataTableWithoutApiPagination
  const formattedTableData = useMemo(() => {
    return filteredTransactions.map((tx, idx) => {
      const formattedDate = formatDhakaDateTime(tx.date);

      return {
        id: `${tx.type}_${tx.reference}_${tx.date}_${idx}`,
        dateFormatted: formattedDate,
        reference: tx.reference || "-",
        typeBadge: getTypeBadge(tx.type),
        directionBadge: getDirectionBadge(tx.direction, tx.type),
        amountFormatted: formatCurrency(tx.amount),
        rawAmount: tx.amount,
        type: tx.type,
        direction: tx.direction,
      };
    });
  }, [filteredTransactions]);

  const summary = ledgerData?.summary || {
    totalReceivable: 0,
    totalReceived: 0,
    totalAdjustedCommissions: 0,
    outstandingReceivable: 0,
    totalPayable: 0,
    totalPaid: 0,
    outstandingPayable: 0,
    netBalance: 0,
    netBalanceLabel: "Settled",
  };

  const stakeholder = ledgerData?.stakeholder || {
    id: selectedStakeholderId,
    name: "Stakeholder",
    stakeholderId: `STK-${String(selectedStakeholderId).padStart(4, "0")}`,
    companyName: "-",
  };

  // Determine Net Balance Color styling
  const isNetNegative = summary.netBalance < 0;
  const isNetPositive = summary.netBalance > 0;

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-50 min-h-screen">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100/70 text-emerald-700 rounded-xl">
            <FaBook className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">
              Stakeholder Ledger
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive transaction history, receivables, payables & net balance.
            </p>
          </div>
        </div>

        {/* Stakeholder Selector & Action Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
          {/* Searchable Stakeholder Switcher */}
          <div className="min-w-[260px] flex-1 sm:flex-none">
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-wider">
              Select Stakeholder
            </label>
            <SearchableSelect
              options={stakeholdersList}
              value={selectedStakeholderId}
              onChange={(val) => setSelectedStakeholderId(val || "")}
              placeholder={
                stakeholdersLoading ? "Loading stakeholders..." : "Select Stakeholder"
              }
              getOptionLabel={(stk) =>
                `${stk.name} ${stk.stakeholderId ? `(${stk.stakeholderId})` : ""} ${
                  stk.companyName ? `- ${stk.companyName}` : ""
                }`
              }
              getOptionValue={(stk) => stk.id}
            />
          </div>

          <button
            type="button"
            onClick={fetchLedger}
            disabled={loading || !selectedStakeholderId}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition shadow-xs disabled:opacity-50 shrink-0"
            title="Refresh Ledger Data"
          >
            <FaRedo
              className={`w-3.5 h-3.5 text-emerald-600 ${
                loading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </div>
      </div>

      {!selectedStakeholderId ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs flex flex-col items-center justify-center my-4 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl border border-emerald-100/80 shadow-xs">
            <FaUser />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Stakeholder Selected</h3>
          <p className="text-xs text-slate-500 max-w-md">
            Please select a stakeholder from the dropdown above to view their ledger summary, balance position, and transaction history.
          </p>
        </div>
      ) : (
        <>

      {/* Stakeholder Info Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-5 shadow-sm border border-slate-700 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold text-xl shrink-0">
              <FaUser />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-wide">
                  {stakeholder.name || "Stakeholder"}
                </h2>
                <span className="bg-emerald-500/30 text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                  {stakeholder.stakeholderId || `STK-${stakeholder.id}`}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-1">
                {stakeholder.companyName && (
                  <span className="flex items-center gap-1.5">
                    <FaBuilding className="text-emerald-400" />
                    {stakeholder.companyName}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-slate-400">
                  <FaIdBadge className="text-emerald-400" />
                  ID: #{stakeholder.id}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Balance Status & Adjust Commission Badge */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setAdjustCommissionOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md transition transform hover:scale-[1.02] cursor-pointer"
            >
              <FaPercentage className="w-4 h-4 text-emerald-100" />
              Adjust Commission
            </button>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-xl text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-300 block tracking-wider">
                Net Balance Position
              </span>
              <span
                className={`text-lg font-black ${
                  isNetNegative
                    ? "text-rose-300"
                    : isNetPositive
                    ? "text-emerald-300"
                    : "text-slate-200"
                }`}
              >
                {formatCurrency(summary.netBalance)}
              </span>
              <span
                className={`block text-[11px] font-bold ${
                  isNetNegative
                    ? "text-rose-300"
                    : isNetPositive
                    ? "text-emerald-300"
                    : "text-slate-300"
                }`}
              >
                {isNetNegative
                  ? `Stakeholder Will Get (${formatCurrency(Math.abs(summary.netBalance))})`
                  : isNetPositive
                  ? `Circle Seed Will Get (${formatCurrency(summary.netBalance)})`
                  : "Settled (0 Balance)"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1st Card: Total Receivable - Circle Seed Will Get */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block">
                Total Receivable
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                (Circle Seed Will Get)
              </span>
            </div>
            <div className="p-2 rounded-xl bg-teal-600 text-white">
              <FaHandHoldingUsd className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-teal-900">
              {formatCurrency(summary.totalReceivable)}
            </span>
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
              <div>
                Received:{" "}
                <strong className="text-emerald-600">
                  {formatCurrency(summary.totalReceived)}
                </strong>
              </div>
              <div className="text-right">
                Due:{" "}
                <strong className="text-rose-600">
                  {formatCurrency(summary.outstandingReceivable)}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* 2nd Card: Total Payable - Stakeholder Will Get */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 block">
                Total Payable
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                (Stakeholder Will Get)
              </span>
            </div>
            <div className="p-2 rounded-xl bg-amber-600 text-white">
              <FaExchangeAlt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-900">
              {formatCurrency(summary.totalPayable)}
            </span>
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
              <div>
                Paid:{" "}
                <strong className="text-purple-600">
                  {formatCurrency(summary.totalPaid)}
                </strong>
              </div>
              <div className="text-right">
                Due:{" "}
                <strong className="text-rose-600">
                  {formatCurrency(summary.outstandingPayable)}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* 3rd Card: Adjusted Commissions Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block">
                  Adjusted Commission
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  (Total Adjusted)
                </span>
              </div>
              <div className="p-2 rounded-xl bg-teal-600 text-white">
                <FaPercentage className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-teal-900">
                {formatCurrency(summary.totalAdjustedCommissions)}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAdjustCommissionOpen(true)}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition shadow-xs cursor-pointer"
            >
              <FaPercentage className="w-3 h-3 text-teal-600" /> Adjust Commission
            </button>
          </div>
        </div>

        {/* 3rd Card: Final Net Balance Card */}
        <div
          className={`p-5 rounded-2xl border shadow-xs transition ${
            isNetNegative
              ? "bg-rose-50/80 border-rose-200"
              : isNetPositive
              ? "bg-emerald-50/80 border-emerald-200"
              : "bg-slate-50 border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Final Net Balance
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                (Net Position)
              </span>
            </div>
            <div
              className={`p-2 rounded-xl text-white ${
                isNetNegative
                  ? "bg-rose-600"
                  : isNetPositive
                  ? "bg-emerald-600"
                  : "bg-slate-600"
              }`}
            >
              <FaWallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span
              className={`text-2xl font-black ${
                isNetNegative
                  ? "text-rose-900"
                  : isNetPositive
                  ? "text-emerald-900"
                  : "text-slate-800"
              }`}
            >
              {formatCurrency(summary.netBalance)}
            </span>
            <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-slate-200/60 text-xs font-semibold">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Claim Position:</span>
                <span
                  className={`px-2 py-0.5 rounded-md font-bold ${
                    isNetNegative
                      ? "bg-rose-100 text-rose-800"
                      : isNetPositive
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {isNetNegative
                    ? "Stakeholder Will Get"
                    : isNetPositive
                    ? "Circle Seed Will Get"
                    : "Settled"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                {isNetNegative
                  ? `(Circle Seed owes Stakeholder ${formatCurrency(Math.abs(summary.netBalance))})`
                  : isNetPositive
                  ? `(Stakeholder owes Circle Seed ${formatCurrency(summary.netBalance)})`
                  : "No outstanding net balance."}
              </p>
            </div>
          </div>
        </div>

        {/* Total Transactions Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Total Transactions
            </span>
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <FaBook className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-800">
              {filteredTransactions.length}
            </span>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
              <span>Showing filtered entries</span>
              <span className="font-bold text-blue-600">
                {rawTransactions.length} Total
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <FaFilter className="text-emerald-600" /> Filter Ledger Entries
          </div>
          {(typeFilter !== "all" ||
            directionFilter !== "all" ||
            startDate ||
            endDate) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 transition"
            >
              <FaTimes className="w-3 h-3" /> Clear Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Transaction Type Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Transaction Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="procurement_order">Procurement Order</option>
              <option value="bulk_sale_invoice">Bulk Sale Invoice</option>
              <option value="packaged_sale_invoice">Packaged Sale Invoice</option>
              <option value="payment_received">Payment Received</option>
              <option value="payment_made">Payment Made</option>
              <option value="commission_adjusted">Commission Adjusted</option>
            </select>
          </div>

          {/* Direction Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Direction
            </label>
            <select
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All Directions</option>
              <option value="payable">Payable</option>
              <option value="receivable">Receivable</option>
              <option value="receivable_reduction">Received (Credit)</option>
              <option value="payable_reduction">Paid (Debit)</option>
            </select>
          </div>

          {/* Date Order (Serial) Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Date Order (Serial)
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            >
              <option value="desc">Newest First (Latest at top)</option>
              <option value="asc">Oldest First (Chronological)</option>
            </select>
          </div>

          {/* Start Date Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* End Date Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Table Section using DataTableWithoutApiPagination */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <DataTableWithoutApiPagination
          headerConfig={{
            title: `Ledger Transactions History (${formattedTableData.length})`,
            searchPlaceholder: "Search by reference or transaction...",
          }}
          tableHead={[
            "SL",
            "Date",
            "Reference",
            "Type",
            "Direction",
            "Amount (BDT)",
          ]}
          tableData={formattedTableData}
          columnMapping={{
            Date: "dateFormatted",
            Reference: "reference",
            Type: "typeBadge",
            Direction: "directionBadge",
            "Amount (BDT)": "amountFormatted",
          }}
          columnAlignment={{
            SL: "center",
            Date: "left",
            Reference: "left",
            Type: "center",
            Direction: "center",
            "Amount (BDT)": "right",
          }}
          loading={loading}
        />
      </div>
      {/* Adjust Commission Modal */}
      <AdjustCommissionModal
        open={adjustCommissionOpen}
        setOpen={setAdjustCommissionOpen}
        stakeholder={stakeholder}
        summary={summary}
        onAdjustSuccess={fetchLedger}
      />
        </>
      )}
    </div>
  );
};

export default Ledger;
