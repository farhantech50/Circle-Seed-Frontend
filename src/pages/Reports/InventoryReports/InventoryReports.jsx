import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  FaBoxes,
  FaFilter,
  FaRedo,
  FaTimes,
  FaWarehouse,
  FaExclamationTriangle,
  FaHourglassHalf,
  FaBoxOpen,
  FaSeedling,
  FaPrint,
} from "react-icons/fa";
import useReports from "../../../hooks/useReports";
import useLookUp from "../../../hooks/useLookup";
import SearchableSelect from "../../../components/SearchableSelect";
import DataTableWithoutApiPagination from "../../../components/DataTableWithoutApiPagination";
import showToast from "../../../utils/toast";
import { formatDhakaDateTime } from "../../../utils/dateUtils";
import { printReportPdf } from "../../../utils/printReport";

const InventoryReports = () => {
  const { getInventoryReport, loading } = useReports();
  const { getLookup } = useLookUp();

  // Filter state
  const [seedTypeId, setSeedTypeId] = useState("");
  const [seedTypes, setSeedTypes] = useState([]);

  // Report Data
  const [reportData, setReportData] = useState(null);
  
  // Warning Tables Tab State: "low_bulk" | "low_packaged" | "expiring"
  const [warningTab, setWarningTab] = useState("low_bulk");

  // Main Directory Tab State: "all" | "bulk" | "packaged"
  const [activeTab, setActiveTab] = useState("all");

  // Fetch Lookups
  useEffect(() => {
    const fetchSeedTypes = async () => {
      const res = await getLookup("seed_type");
      if (res.success) {
        setSeedTypes(res.data || []);
      }
    };
    fetchSeedTypes();
  }, [getLookup]);

  // Fetch Inventory Report
  const fetchReport = useCallback(async () => {
    const filters = { seedTypeId };
    const res = await getInventoryReport(filters);
    if (res.success) {
      setReportData(res.data);
    } else {
      showToast(res.message || "Failed to load inventory report data", "error");
    }
  }, [getInventoryReport, seedTypeId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleClearFilter = () => {
    setSeedTypeId("");
  };

  // Helper Formatter
  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return `৳${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatKg = (val) => {
    const num = Number(val) || 0;
    return `${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kg`;
  };

  const summary = reportData?.summary || {
    totalBulkKg: 0,
    totalPackagedKg: 0,
    totalOverallKg: 0,
    totalBulkValue: 0,
    totalPackagedValue: 0,
    totalInventoryValue: 0,
  };

  const lowStockBulk = reportData?.lowStock?.bulk || [];
  const lowStockPackaged = reportData?.lowStock?.packaged || [];
  const expiringSoon = reportData?.expiringSoon || [];
  const bulkBatches = reportData?.bulkBatches || [];
  const packagedStock = reportData?.packagedStock || [];

  // Table Data Formations
  const bulkBatchesTableData = useMemo(() => {
    return bulkBatches.map((batch, idx) => {
      const seedTypeName = typeof batch.seedType === "object" ? batch.seedType?.value : batch.seedType || "-";
      const statusName = typeof batch.status === "object" ? batch.status?.value : batch.status || "-";
      const totalVal = (Number(batch.remainingQuantity) || 0) * (Number(batch.unitPrice) || 0);

      return {
        id: batch.id || `bulk_${idx}`,
        batchId: batch.batchId || `BT-${batch.id}`,
        seedType: seedTypeName,
        totalQuantity: `${batch.quantity || 0} Kg`,
        remainingQuantity: `${batch.remainingQuantity || 0} Kg`,
        unitPrice: formatCurrency(batch.unitPrice),
        totalValue: formatCurrency(totalVal),
        expiryDateFormatted: batch.expiryDate ? formatDhakaDateTime(batch.expiryDate).split(",")[0] : "N/A",
        status: statusName,
      };
    });
  }, [bulkBatches]);

  const packagedStockTableData = useMemo(() => {
    return packagedStock.map((item, idx) => {
      const seedTypeName = typeof item.seedType === "object" ? item.seedType?.value : item.seedType || "-";
      const pktSize = typeof item.packetSize === "object" ? item.packetSize?.value : item.packetSize || "-";
      const totalVal = (Number(item.remainingQuantity) || 0) * (Number(item.unitPrice) || 0);
      const expiry = item.bulkInventory?.expiryDate;

      return {
        id: item.id || `pkg_${idx}`,
        seedType: seedTypeName,
        packetSize: pktSize ? `${pktSize} g / Kg` : "-",
        totalQuantity: `${item.quantity || 0} pkts`,
        remainingQuantity: `${item.remainingQuantity || 0} pkts`,
        unitPrice: formatCurrency(item.unitPrice),
        totalValue: formatCurrency(totalVal),
        expiryDateFormatted: expiry ? formatDhakaDateTime(expiry).split(",")[0] : "N/A",
      };
    });
  }, [packagedStock]);

  const lowStockBulkTableData = useMemo(() => {
    return lowStockBulk.map((item, idx) => ({
      id: `ls_bulk_${idx}`,
      batchId: item.batchId || "-",
      seedType: item.seedType || "-",
      remainingQuantity: `${item.remainingQuantity} Kg`,
    }));
  }, [lowStockBulk]);

  const lowStockPackagedTableData = useMemo(() => {
    return lowStockPackaged.map((item, idx) => ({
      id: `ls_pkg_${idx}`,
      seedType: item.seedType || "-",
      packetSize: item.packetSize ? `${item.packetSize} g` : "-",
      remainingQuantity: `${item.remainingQuantity} pkts`,
    }));
  }, [lowStockPackaged]);

  const expiringSoonTableData = useMemo(() => {
    return expiringSoon.map((item, idx) => ({
      id: `exp_${idx}`,
      batchId: item.batchId || "-",
      seedType: item.seedType || "-",
      remainingQuantity: `${item.remainingQuantity} Kg`,
      expiryDateFormatted: item.expiryDate ? formatDhakaDateTime(item.expiryDate).split(",")[0] : "N/A",
    }));
  }, [expiringSoon]);

  const handleExportPdf = () => {
    const selectedSeedType = seedTypes.find((s) => String(s.id) === String(seedTypeId))?.value || (seedTypeId ? `ID #${seedTypeId}` : "All");

    const pdfTables = [];

    if (lowStockBulkTableData.length > 0) {
      pdfTables.push({
        title: "Low Stock Bulk Batches",
        columns: ["SL", "Batch ID", "Seed Type", "Remaining Qty"],
        rows: lowStockBulkTableData.map((item, idx) => [idx + 1, item.batchId, item.seedType, item.remainingQuantity]),
        alignments: ["center", "left", "left", "right"],
      });
    }

    if (lowStockPackagedTableData.length > 0) {
      pdfTables.push({
        title: "Low Stock Packaged Items",
        columns: ["SL", "Seed Type", "Packet Size", "Remaining Qty"],
        rows: lowStockPackagedTableData.map((item, idx) => [idx + 1, item.seedType, item.packetSize, item.remainingQuantity]),
        alignments: ["center", "left", "center", "right"],
      });
    }

    if (expiringSoonTableData.length > 0) {
      pdfTables.push({
        title: "Batches Expiring Soon",
        columns: ["SL", "Batch ID", "Seed Type", "Remaining Qty", "Expiry Date"],
        rows: expiringSoonTableData.map((item, idx) => [idx + 1, item.batchId, item.seedType, item.remainingQuantity, item.expiryDateFormatted]),
        alignments: ["center", "left", "left", "right", "center"],
      });
    }

    pdfTables.push({
      title: "Bulk Inventory Batches Directory",
      columns: ["SL", "Batch ID", "Seed Type", "Initial Qty", "Remaining Qty", "Unit Price (BDT)", "Remaining Value", "Expiry Date", "Status"],
      rows: bulkBatchesTableData.map((item, idx) => [idx + 1, item.batchId, item.seedType, item.totalQuantity, item.remainingQuantity, item.unitPrice, item.totalValue, item.expiryDateFormatted, item.status]),
      alignments: ["center", "left", "left", "center", "center", "right", "right", "center", "center"],
    });

    pdfTables.push({
      title: "Packaged Inventory Stock Directory",
      columns: ["SL", "Seed Type", "Packet Size", "Initial Packets", "Remaining Packets", "Unit Price (BDT)", "Remaining Value", "Expiry Date"],
      rows: packagedStockTableData.map((item, idx) => [idx + 1, item.seedType, item.packetSize, item.totalQuantity, item.remainingQuantity, item.unitPrice, item.totalValue, item.expiryDateFormatted]),
      alignments: ["center", "left", "center", "center", "center", "right", "right", "center"],
    });

    printReportPdf({
      reportTitle: "Inventory Valuation & Stock Statistics Report",
      reportSubTitle: "Circle Seed Inventory & Batch Tracking",
      filterTags: [{ label: "Seed Type", value: selectedSeedType }],
      kpiCards: [
        { label: "Total Inventory Valuation", value: formatCurrency(summary.totalInventoryValue), subtext: `Total Qty: ${formatKg(summary.totalOverallKg)}`, color: "emerald" },
        { label: "Bulk Inventory", value: formatCurrency(summary.totalBulkValue), subtext: `Stock Qty: ${formatKg(summary.totalBulkKg)}`, color: "blue" },
        { label: "Packaged Inventory", value: formatCurrency(summary.totalPackagedValue), subtext: `Stock Qty: ${formatKg(summary.totalPackagedKg)}`, color: "amber" },
        { label: "Stock Warnings", value: `${lowStockBulk.length + lowStockPackaged.length} Low Stock`, subtext: `${expiringSoon.length} Expiring Soon`, color: "rose" },
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
            <FaWarehouse className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">
              Inventory Reports & Analytics
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Stock valuation, bulk & packaged batch statistics, low stock and expiration warnings.
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
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <FaFilter className="text-emerald-600" /> Filter Inventory
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <SearchableSelect
              options={seedTypes}
              value={seedTypeId}
              onChange={(val) => setSeedTypeId(val || "")}
              placeholder="Filter by Seed Type"
              getOptionLabel={(opt) => opt.value}
              getOptionValue={(opt) => opt.id}
            />
          </div>
          {seedTypeId && (
            <button
              type="button"
              onClick={handleClearFilter}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 transition shrink-0"
            >
              <FaTimes className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Overall Stock */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Total Inventory Valuation
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white">
              <FaWarehouse className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-slate-800">
              {formatCurrency(summary.totalInventoryValue)}
            </span>
            <div className="mt-2 pt-2 border-t border-slate-100 text-xs font-medium text-slate-500">
              Total Quantity: <strong className="text-emerald-700 font-bold">{formatKg(summary.totalOverallKg)}</strong>
            </div>
          </div>
        </div>

        {/* Bulk Stock Valuation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Bulk Inventory
            </span>
            <div className="p-2.5 rounded-xl bg-blue-600 text-white">
              <FaBoxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-slate-800">
              {formatCurrency(summary.totalBulkValue)}
            </span>
            <div className="mt-2 pt-2 border-t border-slate-100 text-xs font-medium text-slate-500">
              Bulk Stock: <strong className="text-blue-700 font-bold">{formatKg(summary.totalBulkKg)}</strong>
            </div>
          </div>
        </div>

        {/* Packaged Stock Valuation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Packaged Inventory
            </span>
            <div className="p-2.5 rounded-xl bg-amber-600 text-white">
              <FaBoxOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-slate-800">
              {formatCurrency(summary.totalPackagedValue)}
            </span>
            <div className="mt-2 pt-2 border-t border-slate-100 text-xs font-medium text-slate-500">
              Packaged Stock: <strong className="text-amber-700 font-bold">{formatKg(summary.totalPackagedKg)}</strong>
            </div>
          </div>
        </div>

        {/* Stock Alerts KPI */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
              Stock Warnings
            </span>
            <div className="p-2.5 rounded-xl bg-rose-600 text-white">
              <FaExclamationTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-semibold">
            <div
              onClick={() => setWarningTab("low_bulk")}
              className={`p-2.5 rounded-xl border cursor-pointer transition ${
                warningTab === "low_bulk" ? "bg-rose-100 border-rose-300 ring-2 ring-rose-400" : "bg-rose-50 border-rose-100"
              }`}
            >
              <span className="text-rose-600 block text-[10px] uppercase font-bold">Low Bulk</span>
              <span className="text-lg font-black text-rose-800">{lowStockBulk.length} items</span>
            </div>
            <div
              onClick={() => setWarningTab("expiring")}
              className={`p-2.5 rounded-xl border cursor-pointer transition ${
                warningTab === "expiring" ? "bg-amber-100 border-amber-300 ring-2 ring-amber-400" : "bg-amber-50 border-amber-100"
              }`}
            >
              <span className="text-amber-600 block text-[10px] uppercase font-bold">Expiring Soon</span>
              <span className="text-lg font-black text-amber-800">{expiringSoon.length} items</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Warning Tables Section with 3 Tabs */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-sm font-black text-slate-800">
            <FaExclamationTriangle className="text-rose-600" /> Stock Warnings & Expirations
          </div>

          {/* 3 Tabs for Warnings */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setWarningTab("low_bulk")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                warningTab === "low_bulk"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              Low Stock Bulk ({lowStockBulk.length})
            </button>
            <button
              type="button"
              onClick={() => setWarningTab("low_packaged")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                warningTab === "low_packaged"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              Low Stock Packaged ({lowStockPackaged.length})
            </button>
            <button
              type="button"
              onClick={() => setWarningTab("expiring")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                warningTab === "expiring"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              Batches Expiring Soon ({expiringSoon.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Low Stock Bulk Table */}
        {warningTab === "low_bulk" && (
          <div className="bg-white rounded-xl border border-rose-200 overflow-hidden">
            <DataTableWithoutApiPagination
              headerConfig={{
                title: "Low Stock Bulk Batches",
                searchPlaceholder: "Search batch or seed type...",
              }}
              tableHead={["SL", "Batch ID", "Seed Type", "Remaining Qty"]}
              tableData={lowStockBulkTableData}
              columnMapping={{
                "Batch ID": "batchId",
                "Seed Type": "seedType",
                "Remaining Qty": "remainingQuantity",
              }}
              columnAlignment={{
                SL: "center",
                "Batch ID": "left",
                "Seed Type": "left",
                "Remaining Qty": "right",
              }}
              loading={loading}
            />
          </div>
        )}

        {/* Tab 2: Low Stock Packaged Table */}
        {warningTab === "low_packaged" && (
          <div className="bg-white rounded-xl border border-rose-200 overflow-hidden">
            <DataTableWithoutApiPagination
              headerConfig={{
                title: "Low Stock Packaged Items",
                searchPlaceholder: "Search seed type or packet size...",
              }}
              tableHead={["SL", "Seed Type", "Packet Size", "Remaining Qty"]}
              tableData={lowStockPackagedTableData}
              columnMapping={{
                "Seed Type": "seedType",
                "Packet Size": "packetSize",
                "Remaining Qty": "remainingQuantity",
              }}
              columnAlignment={{
                SL: "center",
                "Seed Type": "left",
                "Packet Size": "center",
                "Remaining Qty": "right",
              }}
              loading={loading}
            />
          </div>
        )}

        {/* Tab 3: Expiring Soon Table */}
        {warningTab === "expiring" && (
          <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
            <DataTableWithoutApiPagination
              headerConfig={{
                title: "Batches Expiring Soon",
                searchPlaceholder: "Search batch or expiry date...",
              }}
              tableHead={["SL", "Batch ID", "Seed Type", "Remaining Qty", "Expiry Date"]}
              tableData={expiringSoonTableData}
              columnMapping={{
                "Batch ID": "batchId",
                "Seed Type": "seedType",
                "Remaining Qty": "remainingQuantity",
                "Expiry Date": "expiryDateFormatted",
              }}
              columnAlignment={{
                SL: "center",
                "Batch ID": "left",
                "Seed Type": "left",
                "Remaining Qty": "right",
                "Expiry Date": "center",
              }}
              loading={loading}
            />
          </div>
        )}
      </div>

      {/* Main Inventory Batches / Stock Directory Section */}
      <div className="space-y-4">
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
            All Inventory Directory
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
            Bulk Batches ({bulkBatchesTableData.length})
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
            Packaged Stock ({packagedStockTableData.length})
          </button>
        </div>

        <div className="space-y-6">
          {/* Bulk Batches Table */}
          {(activeTab === "all" || activeTab === "bulk") && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-black text-slate-800">
                <FaBoxes className="text-blue-600" /> Bulk Inventory Batches ({bulkBatchesTableData.length})
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <DataTableWithoutApiPagination
                  headerConfig={{
                    title: "Bulk Batches Directory",
                    searchPlaceholder: "Search batch ID, seed type, or status...",
                  }}
                  tableHead={[
                    "SL",
                    "Batch ID",
                    "Seed Type",
                    "Initial Qty",
                    "Remaining Qty",
                    "Unit Price (BDT)",
                    "Remaining Value",
                    "Expiry Date",
                    "Status",
                  ]}
                  tableData={bulkBatchesTableData}
                  columnMapping={{
                    "Batch ID": "batchId",
                    "Seed Type": "seedType",
                    "Initial Qty": "totalQuantity",
                    "Remaining Qty": "remainingQuantity",
                    "Unit Price (BDT)": "unitPrice",
                    "Remaining Value": "totalValue",
                    "Expiry Date": "expiryDateFormatted",
                    Status: "status",
                  }}
                  columnAlignment={{
                    SL: "center",
                    "Batch ID": "left",
                    "Seed Type": "left",
                    "Initial Qty": "center",
                    "Remaining Qty": "center",
                    "Unit Price (BDT)": "right",
                    "Remaining Value": "right",
                    "Expiry Date": "center",
                    Status: "center",
                  }}
                  loading={loading}
                />
              </div>
            </div>
          )}

          {/* Packaged Stock Table */}
          {(activeTab === "all" || activeTab === "packaged") && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-black text-slate-800">
                <FaBoxOpen className="text-amber-600" /> Packaged Inventory Stock ({packagedStockTableData.length})
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <DataTableWithoutApiPagination
                  headerConfig={{
                    title: "Packaged Stock Directory",
                    searchPlaceholder: "Search seed type or packet size...",
                  }}
                  tableHead={[
                    "SL",
                    "Seed Type",
                    "Packet Size",
                    "Initial Packets",
                    "Remaining Packets",
                    "Unit Price (BDT)",
                    "Remaining Value",
                    "Expiry Date",
                  ]}
                  tableData={packagedStockTableData}
                  columnMapping={{
                    "Seed Type": "seedType",
                    "Packet Size": "packetSize",
                    "Initial Packets": "totalQuantity",
                    "Remaining Packets": "remainingQuantity",
                    "Unit Price (BDT)": "unitPrice",
                    "Remaining Value": "totalValue",
                    "Expiry Date": "expiryDateFormatted",
                  }}
                  columnAlignment={{
                    SL: "center",
                    "Seed Type": "left",
                    "Packet Size": "center",
                    "Initial Packets": "center",
                    "Remaining Packets": "center",
                    "Unit Price (BDT)": "right",
                    "Remaining Value": "right",
                    "Expiry Date": "center",
                  }}
                  loading={loading}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryReports;
