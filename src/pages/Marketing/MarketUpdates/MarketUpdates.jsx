import React, { useEffect, useState, useCallback } from "react";
import {
  FaSeedling,
  FaMapMarkerAlt,
  FaChartLine,
  FaChevronRight,
  FaArrowLeft,
  FaRedo,
  FaEye,
  FaEdit,
  FaTrash,
  FaSearch,
} from "react-icons/fa";
import { MdAddCircle } from "react-icons/md";
import Swal from "sweetalert2";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import useMarketUpdates from "../../../hooks/useMarketUpdates";
import useLookUp from "../../../hooks/useLookup";
import DataTable from "../../../components/DataTable";
import CreateEditMarketUpdateModal from "./CreateEditMarketUpdateModal";
import ViewMarketUpdateModal from "./ViewMarketUpdateModal";
import { usePaginationStore } from "../../../store/paginationStore";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import showToast from "../../../utils/toast";
import { formatDhakaDate } from "../../../utils/dateUtils";

const MarketUpdates = () => {
  const { getMarketUpdates, getTrendGraph, deleteMarketUpdate, loading } =
    useMarketUpdates();
  const { getLookup } = useLookUp();
  const { page, limit, search, setTotalData } = usePaginationStore();
  const { triggerRefresh, setTriggerRefresh } = useTriggerRefreshStore();

  // Navigation Drill-Down State
  // selectedSeed: null (Level 1) | { id, value } (Level 2)
  // selectedRegion: null (Level 2) | { id, value } (Level 3)
  const [selectedSeed, setSelectedSeed] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);

  // Search input state for Card grid filtering
  const [cardSearchTerm, setCardSearchTerm] = useState("");

  // Lookups data
  const [seedTypes, setSeedTypes] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(false);

  // Trend Graph & Table Data for Level 3
  const [trendData, setTrendData] = useState([]);
  const [trendLoading, setTrendLoading] = useState(false);

  const [updates, setUpdates] = useState([]);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [createEditModalOpen, setCreateEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Fetch Lookups (Seed Types & Regions)
  const loadLookups = useCallback(async () => {
    setLoadingLookups(true);
    try {
      const seedRes = await getLookup("seed_type");
      if (seedRes.success && Array.isArray(seedRes.data)) {
        setSeedTypes(seedRes.data);
      }

      let regRes = await getLookup("region");
      let regList = regRes.success && Array.isArray(regRes.data) ? regRes.data : [];
      if (regList.length === 0) {
        regRes = await getLookup("region_type");
        if (regRes.success && Array.isArray(regRes.data)) regList = regRes.data;
      }
      setRegions(regList);
    } catch (err) {
      console.error("Failed to load lookups:", err);
    } finally {
      setLoadingLookups(false);
    }
  }, [getLookup]);

  useEffect(() => {
    loadLookups();
  }, [loadLookups]);

  // Reset card search term when navigating levels
  useEffect(() => {
    setCardSearchTerm("");
  }, [selectedSeed, selectedRegion]);

  // Fetch Trend Graph Data when both Seed & Region are selected (Level 3)
  const fetchTrendData = useCallback(async () => {
    if (!selectedSeed || !selectedRegion) return;
    setTrendLoading(true);
    const res = await getTrendGraph({
      seedTypeId: selectedSeed.id,
      regionId: selectedRegion.id,
    });
    if (res.success && Array.isArray(res.data)) {
      const sorted = [...res.data].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      setTrendData(sorted);
    } else {
      setTrendData([]);
    }
    setTrendLoading(false);
  }, [getTrendGraph, selectedSeed, selectedRegion]);

  // Fetch Table History Data for Level 3
  const fetchUpdatesList = useCallback(async () => {
    if (!selectedSeed || !selectedRegion) return;
    const filters = {
      page,
      limit,
      ...(search ? { search } : {}),
      seedTypeId: selectedSeed.id,
      regionId: selectedRegion.id,
    };

    const res = await getMarketUpdates(filters);
    if (res.success) {
      setUpdates(res.data || []);
      setTotalData(res.total || 0);
    } else {
      setUpdates([]);
      setTotalData(0);
    }
  }, [
    getMarketUpdates,
    selectedSeed,
    selectedRegion,
    page,
    limit,
    search,
    setTotalData,
  ]);

  useEffect(() => {
    if (selectedSeed && selectedRegion) {
      fetchTrendData();
      fetchUpdatesList();
    }
  }, [selectedSeed, selectedRegion, fetchTrendData, fetchUpdatesList, triggerRefresh]);

  const handleDeleteUpdate = async (row) => {
    const result = await Swal.fire({
      title: "Delete Market Record?",
      text: "Are you sure you want to delete this market price update?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Yes, Delete",
    });

    if (!result.isConfirmed) return;

    const res = await deleteMarketUpdate(row.id);
    if (res.success) {
      showToast(res.message || "Record deleted successfully", "success");
      setTriggerRefresh();
    } else {
      showToast(res.message || "Failed to delete record", "error");
    }
  };

  const formatCurrency = (val) => {
    const num = Number(val);
    return isNaN(num)
      ? "৳0.00"
      : `৳${num.toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;
  };

  // Filter Level 1 Seeds by cardSearchTerm
  const filteredSeedTypes = seedTypes.filter((seed) => {
    const name = seed.value || seed.name || "";
    return name.toLowerCase().includes(cardSearchTerm.toLowerCase());
  });

  // Filter Level 2 Regions by cardSearchTerm
  const filteredRegions = regions.filter((reg) => {
    const name = reg.value || reg.name || "";
    return name.toLowerCase().includes(cardSearchTerm.toLowerCase());
  });

  // Format table data for Level 3 DataTable
  const formattedTableData = updates.map((item) => {
    const seedTypeName =
      item.seedType?.value ||
      item.seedTypeName ||
      item.seedType?.name ||
      "-";

    const regionName =
      item.region?.value ||
      item.regionName ||
      item.region?.name ||
      "-";

    const createdByVal =
      item.createdBy?.fullName ||
      item.createdByName ||
      "-";

    const formattedDate = item.date
      ? formatDhakaDate(item.date)
      : "-";

    return {
      ...item,
      seedTypeName,
      regionName,
      priceFormatted: formatCurrency(item.pricePerKg),
      createdByVal,
      formattedDate,
    };
  });

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-50 min-h-screen">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100/70 text-emerald-700 rounded-xl">
              <FaChartLine className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-800">
                Market Price Intelligence
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Browse seed categories and regions to analyze price trend graphs.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {(selectedSeed || selectedRegion) && (
            <button
              type="button"
              onClick={() => {
                if (selectedRegion) {
                  setSelectedRegion(null);
                } else {
                  setSelectedSeed(null);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition shadow-xs"
            >
              <FaArrowLeft className="w-3 h-3 text-emerald-600" />
              Back
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              loadLookups();
              if (selectedSeed && selectedRegion) {
                fetchTrendData();
                fetchUpdatesList();
              }
            }}
            disabled={loadingLookups}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition shadow-xs disabled:opacity-50"
          >
            <FaRedo className={`w-3 h-3 text-emerald-600 ${loadingLookups ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedUpdate(null);
              setCreateEditModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition transform hover:scale-[1.01]"
          >
            <MdAddCircle className="w-4 h-4" />
            Add Market Price
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LEVEL 1: SEEDS CARDS GRID VIEW WITH SEARCH                                */}
      {/* ========================================================================= */}
      {!selectedSeed && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <FaSeedling className="text-emerald-600" /> Select Seed Category
            </h2>

            {/* Name Search Box */}
            <div className="relative w-full sm:w-72">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Search seed category by name..."
                value={cardSearchTerm}
                onChange={(e) => setCardSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-slate-50/50"
              />
            </div>
          </div>

          {loadingLookups ? (
            <div className="flex items-center justify-center p-16 bg-white rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 animate-pulse">
                <FaRedo className="animate-spin" /> Loading Seed Categories...
              </div>
            </div>
          ) : filteredSeedTypes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-slate-200 text-center">
              <FaSeedling className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">No Seed Categories Found</p>
              <p className="text-xs text-slate-400 mt-1">
                {cardSearchTerm ? `No seeds match "${cardSearchTerm}"` : "Please ensure seed lookups are added."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSeedTypes.map((seed) => (
                <div
                  key={seed.id}
                  onClick={() => setSelectedSeed(seed)}
                  className="bg-primary-50 rounded-xl shadow-sm border border-primary-100 p-5 hover:shadow-md hover:border-primary-300 transition-all cursor-pointer group flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary-100 rounded-lg text-primary-700 group-hover:bg-primary-200 transition-colors">
                      <FaSeedling className="w-5 h-5" />
                    </div>
                    <h3
                      className="text-lg font-bold text-gray-800 line-clamp-1"
                      title={seed.value || seed.name}
                    >
                      {seed.value || seed.name || `Seed #${seed.id}`}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {/* Middle Action Box: View Regions */}
                    <div className="flex items-center justify-between bg-white border border-gray-100 shadow-sm p-3.5 rounded-lg group-hover:border-primary-200 group-hover:bg-primary-100/50 transition-all">
                      <span className="text-sm font-bold text-primary-700 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-primary-500 text-xs" /> View Regions
                      </span>
                      <FaChevronRight className="w-3.5 h-3.5 text-primary-600 group-hover:translate-x-1 transition-transform" />
                    </div>

                    {/* Bottom Subtitle Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-1">
                      <span>Coverage</span>
                      <span className="font-semibold text-gray-700">All Regions</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 2: REGIONS CARDS GRID VIEW WITH SEARCH                              */}
      {/* ========================================================================= */}
      {selectedSeed && !selectedRegion && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <FaMapMarkerAlt className="text-emerald-600" /> Select Region for {selectedSeed.value}
            </h2>

            {/* Name Search Box */}
            <div className="relative w-full sm:w-72">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Search region by name..."
                value={cardSearchTerm}
                onChange={(e) => setCardSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-slate-50/50"
              />
            </div>
          </div>

          {loadingLookups ? (
            <div className="flex items-center justify-center p-16 bg-white rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 animate-pulse">
                <FaRedo className="animate-spin" /> Loading Regions...
              </div>
            </div>
          ) : filteredRegions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-slate-200 text-center">
              <FaMapMarkerAlt className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">No Regions Found</p>
              <p className="text-xs text-slate-400 mt-1">
                {cardSearchTerm ? `No regions match "${cardSearchTerm}"` : "Please ensure region lookups are added."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRegions.map((reg) => (
                <div
                  key={reg.id}
                  onClick={() => setSelectedRegion(reg)}
                  className="bg-primary-50 rounded-xl shadow-sm border border-primary-100 p-5 hover:shadow-md hover:border-primary-300 transition-all cursor-pointer group flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary-100 rounded-lg text-primary-700 group-hover:bg-primary-200 transition-colors">
                      <FaMapMarkerAlt className="w-5 h-5" />
                    </div>
                    <h3
                      className="text-lg font-bold text-gray-800 line-clamp-1"
                      title={reg.value || reg.name}
                    >
                      {reg.value || reg.name || `Region #${reg.id}`}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {/* Middle Action Box: View Trend Graph */}
                    <div className="flex items-center justify-between bg-white border border-gray-100 shadow-sm p-3.5 rounded-lg group-hover:border-primary-200 group-hover:bg-primary-100/50 transition-all">
                      <span className="text-sm font-bold text-primary-700 flex items-center gap-2">
                        <FaChartLine className="text-primary-500 text-xs" /> View Trend Graph
                      </span>
                      <FaChevronRight className="w-3.5 h-3.5 text-primary-600 group-hover:translate-x-1 transition-transform" />
                    </div>

                    {/* Bottom Subtitle Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-1">
                      <span>Selected Seed</span>
                      <span className="font-semibold text-gray-700 line-clamp-1">{selectedSeed.value}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 3: TREND GRAPH & HISTORY DATA TABLE VIEW                             */}
      {/* ========================================================================= */}
      {selectedSeed && selectedRegion && (
        <div className="space-y-6">
          {/* Trend Graph Visual Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                  <FaChartLine className="text-emerald-600 text-lg" />
                  Price Trend Graph: {selectedSeed.value} — {selectedRegion.value}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Historical market price movement per kg over time.
                </p>
              </div>

              {trendData.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 rounded-xl text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                    Latest Price
                  </span>
                  <span className="text-sm font-black text-emerald-900">
                    {formatCurrency(trendData[trendData.length - 1]?.price)} / kg
                  </span>
                </div>
              )}
            </div>

            {/* Recharts AreaChart */}
            <div className="w-full h-72 relative bg-slate-50/50 rounded-xl p-3 border border-slate-100 flex items-center justify-center">
              {trendLoading ? (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 animate-pulse">
                  <FaRedo className="animate-spin" /> Loading trend graph data...
                </div>
              ) : trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trendData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorPriceTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "#64748B" }}
                      tickFormatter={(str) => {
                        return formatDhakaDate(str);
                      }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#64748B" }}
                      tickFormatter={(val) => `৳${val}`}
                    />
                    <Tooltip
                      formatter={(val) => [formatCurrency(val), "Price / kg"]}
                      labelFormatter={(lbl) => `Date: ${lbl}`}
                      contentStyle={{
                        backgroundColor: "#0F172A",
                        color: "#FFFFFF",
                        borderRadius: "0.75rem",
                        border: "none",
                        fontSize: "12px",
                        fontWeight: "bold",
                        padding: "8px 12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#059669"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorPriceTrend)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-slate-400 text-xs py-8">
                  <FaChartLine className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-slate-600">
                    No trend graph recorded for {selectedSeed.value} in {selectedRegion.value}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Click "Add Market Price" above to record a new market price entry.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Regional History DataTable */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <DataTable
              headerConfig={{
                title: `Recorded Price History — ${selectedSeed.value} (${selectedRegion.value})`,
                searchPlaceholder: "Search price records...",
              }}
              tableHead={[
                "SL",
                "Seed Type",
                "Region",
                "Price / kg (BDT)",
                "Date",
                "Recorded By",
                "Action",
              ]}
              tableData={formattedTableData}
              columnMapping={{
                "Seed Type": "seedTypeName",
                Region: "regionName",
                "Price / kg (BDT)": "priceFormatted",
                Date: "formattedDate",
                "Recorded By": "createdByVal",
              }}
              columnAlignment={{
                SL: "center",
                "Seed Type": "left",
                Region: "left",
                "Price / kg (BDT)": "right",
                Date: "center",
                "Recorded By": "left",
                Action: "center",
              }}
              actionButtonsConfig={[
                {
                  label: "View Record Details",
                  icon: (
                    <FaEye
                      className="text-emerald-600 hover:text-emerald-800 text-base transition transform hover:scale-110"
                      title="View Record Details"
                    />
                  ),
                  show: () => true,
                  onClick: (row) => {
                    setSelectedUpdate(row);
                    setViewModalOpen(true);
                  },
                },
              ]}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* Create / Edit Market Update Modal */}
      <CreateEditMarketUpdateModal
        open={createEditModalOpen}
        setOpen={setCreateEditModalOpen}
        updateData={selectedUpdate}
        setUpdateData={setSelectedUpdate}
      />

      {/* View Market Update Modal */}
      <ViewMarketUpdateModal
        open={viewModalOpen}
        setOpen={setViewModalOpen}
        updateData={selectedUpdate}
      />
    </div>
  );
};

export default MarketUpdates;
