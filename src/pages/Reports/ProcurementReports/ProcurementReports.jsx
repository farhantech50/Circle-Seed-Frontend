import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  FaIndustry,
  FaFilter,
  FaRedo,
  FaTimes,
  FaMoneyBillWave,
  FaTruck,
  FaCheckCircle,
  FaExclamationCircle,
  FaClock,
  FaUserTie,
  FaPrint,
} from "react-icons/fa";
import useReports from "../../../hooks/useReports";
import useLookUp from "../../../hooks/useLookup";
import SearchableSelect from "../../../components/SearchableSelect";
import DataTableWithoutApiPagination from "../../../components/DataTableWithoutApiPagination";
import api from "../../../config/api";
import showToast from "../../../utils/toast";
import { formatDhakaDateTime } from "../../../utils/dateUtils";
import { printReportPdf } from "../../../utils/printReport";

const ProcurementReports = () => {
  const { getProcurementReport, loading } = useReports();
  const { getLookup } = useLookUp();

  // Filters state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [typeId, setTypeId] = useState("");
  const [statusId, setStatusId] = useState("");
  const [stakeholderId, setStakeholderId] = useState("");
  const [seedTypeId, setSeedTypeId] = useState("");

  // Options state
  const [procurementTypes, setProcurementTypes] = useState([]);
  const [procurementStatuses, setProcurementStatuses] = useState([]);
  const [stakeholders, setStakeholders] = useState([]);
  const [seedTypes, setSeedTypes] = useState([]);

  // Report Data
  const [reportData, setReportData] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  // Load Dropdowns
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [typeRes, statusRes, stkhRes, seedRes] = await Promise.allSettled([
          getLookup("stakeholderType"),
          getLookup("procurementStatus"),
          api.get("/api/stakeholders", { params: { limit: 500 } }),
          getLookup("seed_type"),
        ]);

        if (typeRes.status === "fulfilled" && typeRes.value?.success) {
          setProcurementTypes(typeRes.value.data || []);
        }

        if (statusRes.status === "fulfilled" && statusRes.value?.success) {
          setProcurementStatuses(statusRes.value.data || []);
        }

        if (stkhRes.status === "fulfilled") {
          let list = [];
          if (Array.isArray(stkhRes.value.data)) list = stkhRes.value.data;
          else if (stkhRes.value.data?.data && Array.isArray(stkhRes.value.data.data)) {
            list = stkhRes.value.data.data;
          }
          setStakeholders(list);
        }

        if (seedRes.status === "fulfilled" && seedRes.value?.success) {
          setSeedTypes(seedRes.value.data || []);
        }
      } catch (err) {
        console.error("Error fetching procurement options:", err);
      }
    };

    fetchOptions();
  }, [getLookup]);

  // Fetch Report Data
  const fetchReport = useCallback(async () => {
    const filters = {
      startDate,
      endDate,
      typeId,
      statusId,
      stakeholderId,
      seedTypeId,
    };

    const res = await getProcurementReport(filters);
    if (res.success) {
      setReportData(res.data);
    } else {
      showToast(res.message || "Failed to load procurement report data", "error");
    }
  }, [getProcurementReport, startDate, endDate, typeId, statusId, stakeholderId, seedTypeId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setTypeId("");
    setStatusId("");
    setStakeholderId("");
    setSeedTypeId("");
  };

  const hasActiveFilters = Boolean(
    startDate || endDate || typeId || statusId || stakeholderId || seedTypeId
  );

  // Formatter
  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return `৳${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const summary = reportData?.summary || {
    totalOrders: 0,
    totalOrderedQuantity: 0,
    totalReceivedQuantity: 0,
    totalOrderValue: 0,
    totalPaid: 0,
    totalDue: 0,
    byType: [],
  };

  const pendingDeliveries = reportData?.pendingDeliveries || [];
  const orders = reportData?.orders || [];

  // Fulfillment rate calculation
  const fulfillmentRate =
    summary.totalOrderedQuantity > 0
      ? Math.round((summary.totalReceivedQuantity / summary.totalOrderedQuantity) * 100)
      : 0;

  // Format Data Tables
  const pendingDeliveriesTableData = useMemo(() => {
    return pendingDeliveries.map((item, idx) => {
      const formattedExpDate =
        item.expectedDeliveryDate && !item.expectedDeliveryDate.startsWith("1970")
          ? formatDhakaDateTime(item.expectedDeliveryDate).split(",")[0]
          : "Not Set";

      return {
        id: item.id || `pending_${idx}`,
        procurementId: item.procurementId || "-",
        stakeholder: item.stakeholder || "-",
        seedType: item.seedType || "-",
        orderedQuantity: `${item.orderedQuantity} Kg`,
        receivedQuantity: `${item.receivedQuantity} Kg`,
        pendingQuantity: `${item.pendingQuantity} Kg`,
        expectedDeliveryDate: formattedExpDate,
        totalAmount: formatCurrency(item.totalAmount),
        paidAmount: formatCurrency(item.paidAmount),
        dueAmount: formatCurrency(item.dueAmount),
      };
    });
  }, [pendingDeliveries]);

  const allOrdersTableData = useMemo(() => {
    return orders.map((order, idx) => {
      const stkName = typeof order.stakeholder === "object" ? order.stakeholder?.name : order.stakeholder || "-";
      const seedTypeName = typeof order.seedType === "object" ? order.seedType?.value : order.seedType || "-";
      const typeName = typeof order.type === "object" ? order.type?.value : order.type || "-";
      const statusName = typeof order.status === "object" ? order.status?.value : order.status || "-";
      const orderDateFormatted = order.orderDate ? formatDhakaDateTime(order.orderDate).split(",")[0] : "-";

      return {
        id: order.id || `order_${idx}`,
        procurementId: order.procurementId || "-",
        orderDateFormatted,
        stakeholder: stkName,
        type: typeName,
        seedType: seedTypeName,
        orderedQuantity: `${order.orderedQuantity || 0} Kg`,
        receivedQuantity: `${order.receivedQuantity || 0} Kg`,
        unitPrice: formatCurrency(order.unitPrice),
        totalAmount: formatCurrency(order.totalAmount),
        paidAmount: formatCurrency(order.paidAmount),
        dueAmount: formatCurrency(order.dueAmount || 0),
        status: statusName,
      };
    });
  }, [orders]);

  const handleExportPdf = () => {
    const selectedType = procurementTypes.find((t) => String(t.id) === String(typeId))?.value || (typeId ? `ID #${typeId}` : "All");
    const selectedStatus = procurementStatuses.find((s) => String(s.id) === String(statusId))?.value || (statusId ? `ID #${statusId}` : "All");
    const selectedStakeholder = stakeholders.find((s) => String(s.id) === String(stakeholderId))?.name || (stakeholderId ? `ID #${stakeholderId}` : "All");
    const selectedSeedType = seedTypes.find((s) => String(s.id) === String(seedTypeId))?.value || (seedTypeId ? `ID #${seedTypeId}` : "All");

    const pdfTables = [];

    if (pendingDeliveriesTableData.length > 0) {
      pdfTables.push({
        title: "Pending Deliveries Tracking",
        compact: true,
        columns: ["SL", "Procurement ID", "Stakeholder", "Seed Type", "Ordered Qty", "Received Qty", "Pending Qty", "Exp. Delivery", "Total Amount", "Paid", "Due"],
        rows: pendingDeliveriesTableData.map((item, idx) => [idx + 1, item.procurementId, item.stakeholder, item.seedType, item.orderedQuantity, item.receivedQuantity, item.pendingQuantity, item.expectedDeliveryDate, item.totalAmount, item.paidAmount, item.dueAmount]),
        alignments: ["center", "left", "left", "left", "center", "center", "center", "center", "right", "right", "right"],
      });
    }

    pdfTables.push({
      title: "All Procurement Orders Directory",
      compact: true,
      columns: ["SL", "Procurement ID", "Order Date", "Stakeholder", "Type", "Seed Type", "Ordered Qty", "Received Qty", "Unit Price", "Total Amount", "Paid", "Due", "Status"],
      rows: allOrdersTableData.map((item, idx) => [idx + 1, item.procurementId, item.orderDateFormatted, item.stakeholder, item.type, item.seedType, item.orderedQuantity, item.receivedQuantity, item.unitPrice, item.totalAmount, item.paidAmount, item.dueAmount, item.status]),
      alignments: ["center", "left", "left", "left", "center", "left", "center", "center", "right", "right", "right", "right", "center"],
    });

    printReportPdf({
      reportTitle: "Procurement & Supplier Order Statistics Report",
      reportSubTitle: "Circle Seed Supplier Orders, Fulfillment & Accounts",
      filterTags: [
        { label: "Start Date", value: startDate || "All" },
        { label: "End Date", value: endDate || "All" },
        { label: "Supplier Type", value: selectedType },
        { label: "Status", value: selectedStatus },
        { label: "Stakeholder", value: selectedStakeholder },
        { label: "Seed Type", value: selectedSeedType },
      ],
      kpiCards: [
        { label: "Total Order Value", value: formatCurrency(summary.totalOrderValue), subtext: `Total Orders: ${summary.totalOrders}`, color: "emerald" },
        { label: "Quantity Fulfillment", value: `${fulfillmentRate}%`, subtext: `${summary.totalReceivedQuantity} / ${summary.totalOrderedQuantity} Kg`, color: "blue" },
        { label: "Financial Position", value: `Paid: ${formatCurrency(summary.totalPaid)}`, subtext: `Due: ${formatCurrency(summary.totalDue)}`, color: "amber" },
        { label: "Pending Deliveries", value: `${pendingDeliveries.length} Shipments`, subtext: "Awaiting reception", color: "purple" },
      ],
      tables: pdfTables,
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-50 min-h-screen">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100/70 text-emerald-700 rounded-xl">
            <FaIndustry className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">
              Procurement Reports & Analytics
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Order tracking, supplier type breakdowns, fulfillment status, and financial obligations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button
            type="button"
            onClick={handleExportPdf}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm cursor-pointer"
          >
            <FaPrint className="w-3.5 h-3.5" />
            Print PDF Report
          </button>

          <button
            type="button"
            onClick={fetchReport}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition shadow-xs disabled:opacity-50"
          >
            <FaRedo className={`w-3.5 h-3.5 text-emerald-600 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <FaFilter className="text-emerald-600" /> Filter Procurement Reports
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 transition"
            >
              <FaTimes className="w-3 h-3" /> Clear Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Start Date */}
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

          {/* End Date */}
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

          {/* Procurement Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Supplier Type
            </label>
            <SearchableSelect
              options={procurementTypes}
              value={typeId}
              onChange={(val) => setTypeId(val || "")}
              placeholder="All Types"
              getOptionLabel={(opt) => opt.value}
              getOptionValue={(opt) => opt.id}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Status
            </label>
            <SearchableSelect
              options={procurementStatuses}
              value={statusId}
              onChange={(val) => setStatusId(val || "")}
              placeholder="All Statuses"
              getOptionLabel={(opt) => opt.value}
              getOptionValue={(opt) => opt.id}
            />
          </div>

          {/* Stakeholder */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Stakeholder
            </label>
            <SearchableSelect
              options={stakeholders}
              value={stakeholderId}
              onChange={(val) => setStakeholderId(val || "")}
              placeholder="All Stakeholders"
              getOptionLabel={(stk) =>
                `${stk.name} ${stk.companyName ? `(${stk.companyName})` : ""}`
              }
              getOptionValue={(stk) => stk.id}
            />
          </div>

          {/* Seed Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Seed Type
            </label>
            <SearchableSelect
              options={seedTypes}
              value={seedTypeId}
              onChange={(val) => setSeedTypeId(val || "")}
              placeholder="All Seed Types"
              getOptionLabel={(opt) => opt.value}
              getOptionValue={(opt) => opt.id}
            />
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Procurement Value */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Total Order Value
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white">
              <FaMoneyBillWave className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-slate-800">
              {formatCurrency(summary.totalOrderValue)}
            </span>
            <div className="mt-2 pt-2 border-t border-slate-100 text-xs font-medium text-slate-500">
              Total Orders: <strong className="text-emerald-700 font-bold">{summary.totalOrders}</strong>
            </div>
          </div>
        </div>

        {/* Quantity Fulfillment Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Quantity Fulfillment
            </span>
            <div className="p-2.5 rounded-xl bg-blue-600 text-white">
              <FaTruck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-800">{fulfillmentRate}%</span>
              <span className="text-xs text-blue-600 font-bold">
                {summary.totalReceivedQuantity} / {summary.totalOrderedQuantity} Kg
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, fulfillmentRate)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Financial Position: Paid vs Due */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Financial Summary
            </span>
            <div className="p-2.5 rounded-xl bg-amber-600 text-white">
              <FaMoneyBillWave className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold">
            <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
              <span className="text-emerald-700 block text-[10px] uppercase font-bold">Paid</span>
              <span className="text-sm font-black text-emerald-800">{formatCurrency(summary.totalPaid)}</span>
            </div>
            <div className="bg-rose-50 p-2 rounded-xl border border-rose-100">
              <span className="text-rose-700 block text-[10px] uppercase font-bold">Due</span>
              <span className="text-sm font-black text-rose-800">{formatCurrency(summary.totalDue)}</span>
            </div>
          </div>
        </div>

        {/* Pending Deliveries Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
              Pending Deliveries
            </span>
            <div className="p-2.5 rounded-xl bg-purple-600 text-white">
              <FaClock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-slate-800">
              {pendingDeliveries.length}
            </span>
            <div className="mt-2 pt-2 border-t border-slate-100 text-xs font-medium text-slate-500">
              Incomplete shipments needing reception
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown by Supplier Type Cards */}
      {summary.byType?.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Breakdown by Supplier / Procurement Type
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {summary.byType.map((typeItem, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
                    <FaUserTie className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800">{typeItem.type}</h4>
                    <span className="text-xs text-slate-500 font-medium">
                      {typeItem.count} {typeItem.count === 1 ? "Order" : "Orders"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-slate-900">
                    {formatCurrency(typeItem.totalValue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs Switcher for Tables */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "all"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          All Orders & Pending Deliveries
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "pending"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Pending Deliveries ({pendingDeliveriesTableData.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "orders"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          All Procurement Orders ({allOrdersTableData.length})
        </button>
      </div>

      {/* Tables Section */}
      <div className="space-y-6">
        {/* Pending Deliveries Table */}
        {(activeTab === "all" || activeTab === "pending") && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-black text-slate-800">
              <FaClock className="text-purple-600" /> Pending Deliveries ({pendingDeliveriesTableData.length})
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <DataTableWithoutApiPagination
                headerConfig={{
                  title: "Pending Deliveries Tracking",
                  searchPlaceholder: "Search ID, stakeholder, or seed type...",
                }}
                tableHead={[
                  "SL",
                  "Procurement ID",
                  "Stakeholder",
                  "Seed Type",
                  "Ordered Qty",
                  "Received Qty",
                  "Pending Qty",
                  "Exp. Delivery",
                  "Total Amount",
                  "Paid",
                  "Due",
                ]}
                tableData={pendingDeliveriesTableData}
                columnMapping={{
                  "Procurement ID": "procurementId",
                  Stakeholder: "stakeholder",
                  "Seed Type": "seedType",
                  "Ordered Qty": "orderedQuantity",
                  "Received Qty": "receivedQuantity",
                  "Pending Qty": "pendingQuantity",
                  "Exp. Delivery": "expectedDeliveryDate",
                  "Total Amount": "totalAmount",
                  Paid: "paidAmount",
                  Due: "dueAmount",
                }}
                columnAlignment={{
                  SL: "center",
                  "Procurement ID": "left",
                  Stakeholder: "left",
                  "Seed Type": "left",
                  "Ordered Qty": "center",
                  "Received Qty": "center",
                  "Pending Qty": "center",
                  "Exp. Delivery": "center",
                  "Total Amount": "right",
                  Paid: "right",
                  Due: "right",
                }}
                loading={loading}
              />
            </div>
          </div>
        )}

        {/* All Procurement Orders Table */}
        {(activeTab === "all" || activeTab === "orders") && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-black text-slate-800">
              <FaIndustry className="text-blue-600" /> Procurement Orders Directory ({allOrdersTableData.length})
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <DataTableWithoutApiPagination
                headerConfig={{
                  title: "All Procurement Orders",
                  searchPlaceholder: "Search ID, stakeholder, type, status...",
                }}
                tableHead={[
                  "SL",
                  "Procurement ID",
                  "Order Date",
                  "Stakeholder",
                  "Type",
                  "Seed Type",
                  "Ordered Qty",
                  "Received Qty",
                  "Unit Price",
                  "Total Amount",
                  "Paid",
                  "Due",
                  "Status",
                ]}
                tableData={allOrdersTableData}
                columnMapping={{
                  "Procurement ID": "procurementId",
                  "Order Date": "orderDateFormatted",
                  Stakeholder: "stakeholder",
                  Type: "type",
                  "Seed Type": "seedType",
                  "Ordered Qty": "orderedQuantity",
                  "Received Qty": "receivedQuantity",
                  "Unit Price": "unitPrice",
                  "Total Amount": "totalAmount",
                  Paid: "paidAmount",
                  Due: "dueAmount",
                  Status: "status",
                }}
                columnAlignment={{
                  SL: "center",
                  "Procurement ID": "left",
                  "Order Date": "left",
                  Stakeholder: "left",
                  Type: "center",
                  "Seed Type": "left",
                  "Ordered Qty": "center",
                  "Received Qty": "center",
                  "Unit Price": "right",
                  "Total Amount": "right",
                  Paid: "right",
                  Due: "right",
                  Status: "center",
                }}
                loading={loading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcurementReports;
