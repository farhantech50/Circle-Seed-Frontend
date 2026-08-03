import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  FaChartLine,
  FaFilter,
  FaRedo,
  FaTimes,
  FaMoneyBillWave,
  FaShoppingCart,
  FaBoxes,
  FaBoxOpen,
  FaMapMarkerAlt,
  FaSeedling,
  FaPrint,
} from "react-icons/fa";
import useReports from "../../../hooks/useReports";
import useLookUp from "../../../hooks/useLookup";
import SearchableSelect from "../../../components/SearchableSelect";
import DataTableWithoutApiPagination from "../../../components/DataTableWithoutApiPagination";
import api from "../../../config/api";
import showToast from "../../../utils/toast";
import { printReportPdf } from "../../../utils/printReport";

const SalesReports = () => {
  const { getSalesReport, loading } = useReports();
  const { getLookup } = useLookUp();

  // Filters State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [seedTypeId, setSeedTypeId] = useState("");
  const [saleType, setSaleType] = useState("");
  const [stakeholderId, setStakeholderId] = useState("");
  const [createdById, setCreatedById] = useState("");
  const [locationId, setLocationId] = useState("");

  // Dropdown Lists State
  const [seedTypes, setSeedTypes] = useState([]);
  const [stakeholders, setStakeholders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [locations, setLocations] = useState([]);

  // Report Data & Tabs
  const [reportData, setReportData] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [posSubTab, setPosSubTab] = useState("seed_type"); // "seed_type" | "location"

  // Fetch Lookups & Filter Options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [seedRes, stkhRes, empRes, locRes] = await Promise.allSettled([
          getLookup("seed_type"),
          api.get("/api/stakeholders", { params: { limit: 500 } }),
          api.get("/api/employees"),
          api.get("/api/pos/"),
        ]);

        if (seedRes.status === "fulfilled" && seedRes.value?.success) {
          setSeedTypes(seedRes.value.data || []);
        }

        if (stkhRes.status === "fulfilled") {
          let list = [];
          if (Array.isArray(stkhRes.value.data)) list = stkhRes.value.data;
          else if (stkhRes.value.data?.data && Array.isArray(stkhRes.value.data.data)) {
            list = stkhRes.value.data.data;
          }
          setStakeholders(list);
        }

        if (empRes.status === "fulfilled") {
          let list = [];
          if (Array.isArray(empRes.value.data)) list = empRes.value.data;
          else if (empRes.value.data?.data && Array.isArray(empRes.value.data.data)) {
            list = empRes.value.data.data;
          }
          setEmployees(list);
        }

        if (locRes.status === "fulfilled") {
          let list = [];
          if (Array.isArray(locRes.value.data)) list = locRes.value.data;
          else if (locRes.value.data?.data && Array.isArray(locRes.value.data.data)) {
            list = locRes.value.data.data;
          }
          setLocations(list);
        }
      } catch (err) {
        console.error("Error loading filter options:", err);
      }
    };

    fetchOptions();
  }, [getLookup]);

  // Fetch Sales Report Data
  const fetchReport = useCallback(async () => {
    const filters = {
      startDate,
      endDate,
      seedTypeId,
      saleType,
      stakeholderId,
      createdById,
      locationId,
    };

    const res = await getSalesReport(filters);
    if (res.success) {
      setReportData(res.data);
    } else {
      showToast(res.message || "Failed to load sales report data", "error");
    }
  }, [getSalesReport, startDate, endDate, seedTypeId, saleType, stakeholderId, createdById, locationId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSeedTypeId("");
    setSaleType("");
    setStakeholderId("");
    setCreatedById("");
    setLocationId("");
  };

  const hasActiveFilters = Boolean(
    startDate || endDate || seedTypeId || saleType || stakeholderId || createdById || locationId
  );

  // Formatting Helper
  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return `৳${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const summary = reportData?.summary || {
    totalRevenue: 0,
    totalOrders: 0,
    pos: { count: 0, totalAmount: 0, bySeedType: [], byLocation: [] },
    bulk: { count: 0, totalAmount: 0, bySeedType: [] },
    packaged: { count: 0, totalAmount: 0, bySeedType: [] },
  };

  // Prepare Table Data
  const posSeedTypeTableData = useMemo(() => {
    return (summary.pos?.bySeedType || []).map((item, idx) => ({
      id: `pos_seed_${item.seedTypeId}_${idx}`,
      seedType: item.seedType || `Seed Type #${item.seedTypeId}`,
      totalQuantity: `${item.totalQuantity} Kg`,
      totalAmount: formatCurrency(item.totalAmount),
    }));
  }, [summary.pos]);

  const posLocationTableData = useMemo(() => {
    return (summary.pos?.byLocation || []).map((item, idx) => ({
      id: `pos_loc_${item.locationId}_${idx}`,
      locationName: item.locationName || "Unknown",
      orderCount: item.orderCount,
      totalAmount: formatCurrency(item.totalAmount),
    }));
  }, [summary.pos]);

  const bulkSeedTypeTableData = useMemo(() => {
    return (summary.bulk?.bySeedType || []).map((item, idx) => ({
      id: `bulk_seed_${item.seedTypeId}_${idx}`,
      seedType: item.seedType || `Seed Type #${item.seedTypeId}`,
      totalQuantity: `${item.totalQuantity} Kg`,
      totalAmount: formatCurrency(item.totalAmount),
    }));
  }, [summary.bulk]);

  const packagedSeedTypeTableData = useMemo(() => {
    return (summary.packaged?.bySeedType || []).map((item, idx) => ({
      id: `packaged_seed_${item.seedTypeId}_${idx}`,
      seedType: item.seedType || `Seed Type #${item.seedTypeId}`,
      totalQuantity: `${item.totalQuantity} pkts`,
      totalAmount: formatCurrency(item.totalAmount),
    }));
  }, [summary.packaged]);

  const handleExportPdf = () => {
    const selectedSeedType = seedTypes.find((s) => String(s.id) === String(seedTypeId))?.value || (seedTypeId ? `ID #${seedTypeId}` : "All");
    const selectedStakeholder = stakeholders.find((s) => String(s.id) === String(stakeholderId))?.name || (stakeholderId ? `ID #${stakeholderId}` : "All");
    const empObj = employees.find((e) => String(e.id) === String(createdById));
    const selectedEmployee = empObj?.firstName ? `${empObj.firstName} ${empObj.lastName || ""}` : (createdById ? `ID #${createdById}` : "All");
    const selectedLocation = locations.find((l) => String(l.id) === String(locationId))?.name || (locationId ? `ID #${locationId}` : "All");

    printReportPdf({
      reportTitle: "Sales & Revenue Statistics Report",
      reportSubTitle: "Circle Seed Sales Performance & Analytics",
      filterTags: [
        { label: "Start Date", value: startDate || "All" },
        { label: "End Date", value: endDate || "All" },
        { label: "Seed Type", value: selectedSeedType },
        { label: "Sale Type", value: saleType ? saleType.toUpperCase() : "All" },
        { label: "Stakeholder", value: selectedStakeholder },
        { label: "Creator", value: selectedEmployee },
        { label: "Location", value: selectedLocation },
      ],
      kpiCards: [
        { label: "Total Revenue", value: formatCurrency(summary.totalRevenue), subtext: `Orders: ${summary.totalOrders}`, color: "emerald" },
        { label: "POS Sales", value: formatCurrency(summary.pos?.totalAmount), subtext: `Orders: ${summary.pos?.count}`, color: "blue" },
        { label: "Bulk Sales", value: formatCurrency(summary.bulk?.totalAmount), subtext: `Orders: ${summary.bulk?.count}`, color: "purple" },
        { label: "Packaged Sales", value: formatCurrency(summary.packaged?.totalAmount), subtext: `Orders: ${summary.packaged?.count}`, color: "amber" },
      ],
      tables: [
        {
          title: "POS Sales by Seed Type",
          columns: ["SL", "Seed Type", "Total Quantity", "Total Amount"],
          rows: posSeedTypeTableData.map((item, idx) => [idx + 1, item.seedType, item.totalQuantity, item.totalAmount]),
          alignments: ["center", "left", "center", "right"],
        },
        {
          title: "POS Sales by Location",
          columns: ["SL", "Location Name", "Order Count", "Total Amount"],
          rows: posLocationTableData.map((item, idx) => [idx + 1, item.locationName, item.orderCount, item.totalAmount]),
          alignments: ["center", "left", "center", "right"],
        },
        {
          title: "Bulk Sales by Seed Type",
          columns: ["SL", "Seed Type", "Total Quantity", "Total Amount"],
          rows: bulkSeedTypeTableData.map((item, idx) => [idx + 1, item.seedType, item.totalQuantity, item.totalAmount]),
          alignments: ["center", "left", "center", "right"],
        },
        {
          title: "Packaged Sales by Seed Type",
          columns: ["SL", "Seed Type", "Total Packets", "Total Amount"],
          rows: packagedSeedTypeTableData.map((item, idx) => [idx + 1, item.seedType, item.totalQuantity, item.totalAmount]),
          alignments: ["center", "left", "center", "right"],
        },
      ],
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-50 min-h-screen">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100/70 text-emerald-700 rounded-xl">
            <FaChartLine className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">
              Sales Reports & Analytics
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive analysis of POS, Bulk, and Packaged sales performance.
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
            <FaFilter className="text-emerald-600" /> Filter Sales Reports
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
              getOptionLabel={(opt) => opt.value || opt.name}
              getOptionValue={(opt) => opt.id}
            />
          </div>

          {/* Sale Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Sale Type
            </label>
            <select
              value={saleType}
              onChange={(e) => setSaleType(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All Sale Types</option>
              <option value="pos">POS Sales</option>
              <option value="bulk">Bulk Sales</option>
              <option value="packaged">Packaged Sales</option>
            </select>
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

          {/* Created By */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Created By
            </label>
            <SearchableSelect
              options={employees}
              value={createdById}
              onChange={(val) => setCreatedById(val || "")}
              placeholder="All Creators / Users"
              getOptionLabel={(emp) =>
                `${emp.firstName ? `${emp.firstName} ${emp.lastName || ""}` : emp.name || emp.username || `User #${emp.id}`}`
              }
              getOptionValue={(emp) => emp.id}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Location
            </label>
            <SearchableSelect
              options={locations}
              value={locationId}
              onChange={(val) => setLocationId(val || "")}
              placeholder="All Locations"
              getOptionLabel={(loc) => loc.name || loc.value}
              getOptionValue={(loc) => loc.id}
            />
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Total Revenue
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white">
              <FaMoneyBillWave className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-slate-800">
              {formatCurrency(summary.totalRevenue)}
            </span>
            <div className="mt-2 pt-2 border-t border-slate-100 text-xs font-medium text-slate-500">
              Total Orders: <strong className="text-slate-800 font-bold">{summary.totalOrders}</strong>
            </div>
          </div>
        </div>

        {/* POS Sales Summary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              POS Sales
            </span>
            <div className="p-2.5 rounded-xl bg-blue-600 text-white">
              <FaShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-slate-800">
              {formatCurrency(summary.pos?.totalAmount)}
            </span>
            <div className="mt-2 pt-2 border-t border-slate-100 text-xs font-medium text-slate-500 flex justify-between">
              <span>Orders: <strong className="text-slate-800 font-bold">{summary.pos?.count}</strong></span>
              <span className="text-blue-600 font-bold">
                {summary.totalRevenue > 0
                  ? `${Math.round(((summary.pos?.totalAmount || 0) / summary.totalRevenue) * 100)}%`
                  : "0%"}
              </span>
            </div>
          </div>
        </div>

        {/* Bulk Sales Summary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
              Bulk Sales
            </span>
            <div className="p-2.5 rounded-xl bg-purple-600 text-white">
              <FaBoxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-slate-800">
              {formatCurrency(summary.bulk?.totalAmount)}
            </span>
            <div className="mt-2 pt-2 border-t border-slate-100 text-xs font-medium text-slate-500 flex justify-between">
              <span>Orders: <strong className="text-slate-800 font-bold">{summary.bulk?.count}</strong></span>
              <span className="text-purple-600 font-bold">
                {summary.totalRevenue > 0
                  ? `${Math.round(((summary.bulk?.totalAmount || 0) / summary.totalRevenue) * 100)}%`
                  : "0%"}
              </span>
            </div>
          </div>
        </div>

        {/* Packaged Sales Summary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Packaged Sales
            </span>
            <div className="p-2.5 rounded-xl bg-amber-600 text-white">
              <FaBoxOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-slate-800">
              {formatCurrency(summary.packaged?.totalAmount)}
            </span>
            <div className="mt-2 pt-2 border-t border-slate-100 text-xs font-medium text-slate-500 flex justify-between">
              <span>Orders: <strong className="text-slate-800 font-bold">{summary.packaged?.count}</strong></span>
              <span className="text-amber-600 font-bold">
                {summary.totalRevenue > 0
                  ? `${Math.round(((summary.packaged?.totalAmount || 0) / summary.totalRevenue) * 100)}%`
                  : "0%"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher for Detailed Statistics */}
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
          All Sales Breakdown
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("pos")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "pos"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          POS Details ({posSeedTypeTableData.length + posLocationTableData.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("bulk")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "bulk"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Bulk Details ({bulkSeedTypeTableData.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("packaged")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "packaged"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Packaged Details ({packagedSeedTypeTableData.length})
        </button>
      </div>

      {/* Detailed Tables Content */}
      <div className="space-y-6">
        {/* POS Section */}
        {(activeTab === "all" || activeTab === "pos") && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-sm font-black text-slate-800">
                <FaShoppingCart className="text-emerald-600" /> POS Sales Breakdown
              </div>

              {/* POS Sub-Tabs: Seed Type vs Location */}
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setPosSubTab("seed_type")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                    posSubTab === "seed_type"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  POS Sales by Seed Type ({posSeedTypeTableData.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPosSubTab("location")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                    posSubTab === "location"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  POS Sales by Location ({posLocationTableData.length})
                </button>
              </div>
            </div>

            {/* Sub-Tab 1: POS Seed Type Table */}
            {posSubTab === "seed_type" && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <DataTableWithoutApiPagination
                  headerConfig={{
                    title: "POS Sales by Seed Type",
                    searchPlaceholder: "Search seed type...",
                  }}
                  tableHead={["SL", "Seed Type", "Total Quantity", "Total Amount"]}
                  tableData={posSeedTypeTableData}
                  columnMapping={{
                    "Seed Type": "seedType",
                    "Total Quantity": "totalQuantity",
                    "Total Amount": "totalAmount",
                  }}
                  columnAlignment={{
                    SL: "center",
                    "Seed Type": "left",
                    "Total Quantity": "center",
                    "Total Amount": "right",
                  }}
                  loading={loading}
                />
              </div>
            )}

            {/* Sub-Tab 2: POS Location Table */}
            {posSubTab === "location" && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <DataTableWithoutApiPagination
                  headerConfig={{
                    title: "POS Sales by Location",
                    searchPlaceholder: "Search location...",
                  }}
                  tableHead={["SL", "Location Name", "Order Count", "Total Amount"]}
                  tableData={posLocationTableData}
                  columnMapping={{
                    "Location Name": "locationName",
                    "Order Count": "orderCount",
                    "Total Amount": "totalAmount",
                  }}
                  columnAlignment={{
                    SL: "center",
                    "Location Name": "left",
                    "Order Count": "center",
                    "Total Amount": "right",
                  }}
                  loading={loading}
                />
              </div>
            )}
          </div>
        )}

        {/* Bulk Section */}
        {(activeTab === "all" || activeTab === "bulk") && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-black text-slate-800">
              <FaBoxes className="text-purple-600" /> Bulk Sales Breakdown
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <DataTableWithoutApiPagination
                headerConfig={{
                  title: "Bulk Sales by Seed Type",
                  searchPlaceholder: "Search bulk seed type...",
                }}
                tableHead={["SL", "Seed Type", "Total Quantity", "Total Amount"]}
                tableData={bulkSeedTypeTableData}
                columnMapping={{
                  "Seed Type": "seedType",
                  "Total Quantity": "totalQuantity",
                  "Total Amount": "totalAmount",
                }}
                columnAlignment={{
                  SL: "center",
                  "Seed Type": "left",
                  "Total Quantity": "center",
                  "Total Amount": "right",
                }}
                loading={loading}
              />
            </div>
          </div>
        )}

        {/* Packaged Section */}
        {(activeTab === "all" || activeTab === "packaged") && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-black text-slate-800">
              <FaBoxOpen className="text-amber-600" /> Packaged Sales Breakdown
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <DataTableWithoutApiPagination
                headerConfig={{
                  title: "Packaged Sales by Seed Type",
                  searchPlaceholder: "Search packaged seed type...",
                }}
                tableHead={["SL", "Seed Type", "Total Packets", "Total Amount"]}
                tableData={packagedSeedTypeTableData}
                columnMapping={{
                  "Seed Type": "seedType",
                  "Total Packets": "totalQuantity",
                  "Total Amount": "totalAmount",
                }}
                columnAlignment={{
                  SL: "center",
                  "Seed Type": "left",
                  "Total Packets": "center",
                  "Total Amount": "right",
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

export default SalesReports;
