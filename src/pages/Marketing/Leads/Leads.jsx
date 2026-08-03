import React, { useEffect, useState, useCallback } from "react";
import {
  FaBullhorn,
  FaPlus,
  FaRedo,
  FaEye,
  FaEdit,
  FaTrash,
  FaUserPlus,
  FaSeedling,
  FaFilter,
  FaTimes,
} from "react-icons/fa";
import { MdAddCircle } from "react-icons/md";
import Swal from "sweetalert2";
import useLeads from "../../../hooks/useLeads";
import useLookUp from "../../../hooks/useLookup";
import useEmployee from "../../../hooks/useEmployee";
import DataTable from "../../../components/DataTable";
import SearchableSelect from "../../../components/SearchableSelect";
import Lookup from "../../../components/Lookup";
import CreateEditLeadModal from "./CreateEditLeadModal";
import ViewLeadModal from "./ViewLeadModal";
import { usePaginationStore } from "../../../store/paginationStore";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import { useAuthStore } from "../../../store/authStore";
import showToast from "../../../utils/toast";
import { formatDhakaDate } from "../../../utils/dateUtils";

const Leads = () => {
  const { getLeads, deleteLead, loading } = useLeads();
  const { getLookup } = useLookUp();
  const { getEmployees } = useEmployee();
  const { authUser } = useAuthStore();

  const { page, limit, search, setTotalData } = usePaginationStore();
  const { triggerRefresh, setTriggerRefresh } = useTriggerRefreshStore();

  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [createEditModalOpen, setCreateEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Filter States (matching query params: statusId, sourceId, seedInterestId, userId)
  const loggedInUserId =
    authUser?.id && authUser.id !== 1 ? String(authUser.id) : null;
  const [selectedStatusId, setSelectedStatusId] = useState("");
  const [selectedSourceId, setSelectedSourceId] = useState("");
  const [selectedSeedInterestId, setSelectedSeedInterestId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(loggedInUserId);

  useEffect(() => {
    if (authUser?.id && authUser.id !== 1 && !selectedUserId) {
      setSelectedUserId(String(authUser.id));
    }
  }, [authUser, selectedUserId]);

  // Options for filters
  const [statusOptions, setStatusOptions] = useState([]);
  const [sourceOptions, setSourceOptions] = useState([]);
  const [seedInterestOptions, setSeedInterestOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);

  // Fetch Lookups for filters
  useEffect(() => {
    const loadFilterLookups = async () => {
      try {
        // Status Lookup (lead_status / status)
        const statusRes = await getLookup("lead_status");
        let statusList =
          statusRes.success && Array.isArray(statusRes.data)
            ? statusRes.data
            : [];
        if (statusList.length === 0) {
          const fallback = await getLookup("status");
          if (fallback.success && Array.isArray(fallback.data)) {
            statusList = fallback.data;
          }
        }
        setStatusOptions(statusList);

        // Source Lookup (lead_source / leadSource)
        const sourceRes = await getLookup("lead_source");
        let sourceList =
          sourceRes.success && Array.isArray(sourceRes.data)
            ? sourceRes.data
            : [];
        if (sourceList.length === 0) {
          const fallback = await getLookup("leadSource");
          if (fallback.success && Array.isArray(fallback.data)) {
            sourceList = fallback.data;
          }
        }
        setSourceOptions(sourceList);

        // Seed Interest Lookup (seed_type / seedType)
        const seedRes = await getLookup("seed_type");
        let seedList =
          seedRes.success && Array.isArray(seedRes.data) ? seedRes.data : [];
        if (seedList.length === 0) {
          const fallback = await getLookup("seedType");
          if (fallback.success && Array.isArray(fallback.data)) {
            seedList = fallback.data;
          }
        }
        setSeedInterestOptions(seedList);

        // Users / Employees List for userId filter
        const empRes = await getEmployees(false);
        if (empRes.success && Array.isArray(empRes.data)) {
          setUserOptions(empRes.data);
        } else {
          const empLookup = await getLookup("employee");
          if (empLookup.success && Array.isArray(empLookup.data)) {
            setUserOptions(empLookup.data);
          }
        }
      } catch (err) {
        console.error("Failed to load filter lookups:", err);
      }
    };

    loadFilterLookups();
  }, []);

  // Fetch leads with active filters
  const fetchLeadsList = useCallback(async () => {
    const filters = {
      page,
      limit,
      ...(search ? { search } : {}),
      ...(selectedStatusId ? { statusId: selectedStatusId } : {}),
      ...(selectedSourceId ? { sourceId: selectedSourceId } : {}),
      ...(selectedSeedInterestId
        ? { seedInterestId: selectedSeedInterestId }
        : {}),
      ...(selectedUserId ? { userId: selectedUserId } : {}),
    };

    const res = await getLeads(filters);
    if (res.success) {
      setLeads(res.data || []);
      setTotalData(res.total || 0);
    } else {
      setLeads([]);
      setTotalData(0);
      showToast(res.message || "Failed to load leads list", "error");
    }
  }, [
    getLeads,
    page,
    limit,
    search,
    selectedStatusId,
    selectedSourceId,
    selectedSeedInterestId,
    selectedUserId,
    setTotalData,
  ]);

  useEffect(() => {
    fetchLeadsList();
  }, [fetchLeadsList, triggerRefresh]);

  const handleClearFilters = () => {
    setSelectedStatusId("");
    setSelectedSourceId("");
    setSelectedSeedInterestId("");
    setSelectedUserId("");
  };

  const handleDeleteLead = async (row) => {
    const result = await Swal.fire({
      title: "Delete Lead?",
      text: `Are you sure you want to delete lead "${row.name}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Yes, Delete",
    });

    if (!result.isConfirmed) return;

    const res = await deleteLead(row.id);
    if (res.success) {
      showToast(res.message || "Lead deleted successfully", "success");
      setTriggerRefresh();
    } else {
      showToast(res.message || "Failed to delete lead", "error");
    }
  };

  // Format table data for DataTable matching exact API response JSON structure
  const formattedTableData = leads.map((item) => {
    const seedInterestVal =
      item.seedInterest?.value ||
      item.seedInterestName ||
      item.seedInterest?.name ||
      "-";

    const sourceVal =
      item.source?.value ||
      item.sourceName ||
      item.source?.name ||
      item.leadSource ||
      "-";

    const statusVal =
      item.status?.value ||
      item.statusName ||
      item.status?.name ||
      item.status ||
      "New";

    const createdByVal = item.createdBy?.fullName || item.createdByName || "-";

    const formattedDate = item.createdAt
      ? formatDhakaDate(item.createdAt)
      : "-";

    return {
      ...item,
      nameFormatted: item.name || "-",
      contactFormatted: item.contact || "-",
      companyFormatted: item.company || "-",
      seedInterestVal,
      sourceVal,
      statusVal,
      createdByVal,
      formattedDate,
    };
  });

  return (
    <div className="flex flex-col gap-5 p-6 bg-slate-50 min-h-screen">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100/70 text-emerald-700 rounded-xl">
            <FaBullhorn className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">
              Leads Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Track and manage potential client inquiries, seed interests &
              sources.
            </p>
          </div>
        </div>

        {/* Quick Stat Badges & Create Action */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
          <div className="bg-emerald-50 border border-emerald-200/80 px-4 py-2 rounded-xl text-right shadow-xs">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider">
              Total Leads
            </span>
            <span className="text-lg font-black text-emerald-900">
              {leads.length}
            </span>
          </div>

          <button
            type="button"
            onClick={fetchLeadsList}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition shadow-xs disabled:opacity-50"
            title="Refresh Leads List"
          >
            <FaRedo
              className={`w-3 h-3 text-emerald-600 ${
                loading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedLead(null);
              setCreateEditModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition transform hover:scale-[1.01]"
          >
            <MdAddCircle className="w-4 h-4" />
            Add New Lead
          </button>
        </div>
      </div>

      {/* Filter Card (statusId, sourceId, seedInterestId, userId) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <FaFilter className="text-emerald-600" /> Filter Leads
          </div>
          {(selectedStatusId ||
            selectedSourceId ||
            selectedSeedInterestId ||
            selectedUserId) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 transition"
            >
              <FaTimes className="w-3 h-3" /> Clear Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Status Filter (statusId) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Status Filter
            </label>
            <Lookup
              lookupName="lead_status"
              selectedId={selectedStatusId}
              setSelectedId={setSelectedStatusId}
              isMultiple={false}
            />
          </div>

          {/* Lead Source Filter (sourceId) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Lead Source Filter
            </label>
            <Lookup
              lookupName="lead_source"
              selectedId={selectedSourceId}
              setSelectedId={setSelectedSourceId}
              isMultiple={false}
            />
          </div>

          {/* Seed Interest Filter (seedInterestId) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Seed Interest Filter
            </label>
            <Lookup
              lookupName="seed_type"
              selectedId={selectedSeedInterestId}
              setSelectedId={setSelectedSeedInterestId}
              isMultiple={false}
            />
          </div>

          {/* Assigned User / Staff Filter (userId) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Assigned Staff (User)
            </label>
            <SearchableSelect
              options={userOptions}
              value={selectedUserId}
              onChange={(val) => setSelectedUserId(val)}
              placeholder="All Staff / Users"
              getOptionLabel={(opt) =>
                opt.fullName ||
                opt.name ||
                opt.value ||
                opt.username ||
                `User #${opt.id}`
              }
              getOptionValue={(opt) => opt.id}
            />
          </div>
        </div>
      </div>

      {/* Main Table Content Card with API Pagination */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <DataTable
          headerConfig={{
            title: "Marketing Leads Directory",
            searchPlaceholder: "Search by lead name, contact, or company...",
          }}
          tableHead={[
            "SL",
            "Lead Name",
            "Contact Info",
            "Company",
            "Seed Interest",
            "Lead Source",
            "Status",
            "Created By",
            "Created Date",
            "Action",
          ]}
          tableData={formattedTableData}
          columnMapping={{
            "Lead Name": "nameFormatted",
            "Contact Info": "contactFormatted",
            Company: "companyFormatted",
            "Seed Interest": "seedInterestVal",
            "Lead Source": "sourceVal",
            Status: "statusVal",
            "Created By": "createdByVal",
            "Created Date": "formattedDate",
          }}
          columnAlignment={{
            SL: "center",
            "Lead Name": "left",
            "Contact Info": "left",
            Company: "left",
            "Seed Interest": "center",
            "Lead Source": "center",
            Status: "center",
            "Created By": "left",
            "Created Date": "center",
            Action: "center",
          }}
          actionButtonsConfig={[
            {
              label: "View Lead Details",
              icon: (
                <FaEye
                  className="text-emerald-600 hover:text-emerald-800 text-base transition transform hover:scale-110"
                  title="View Lead Details"
                />
              ),
              show: () => true,
              onClick: (row) => {
                setSelectedLead(row);
                setViewModalOpen(true);
              },
            },
            {
              label: "Edit Lead",
              icon: (
                <FaEdit
                  className="text-blue-600 hover:text-blue-800 text-base transition transform hover:scale-110"
                  title="Edit Lead"
                />
              ),
              show: () => true,
              onClick: (row) => {
                setSelectedLead(row);
                setCreateEditModalOpen(true);
              },
            },
            {
              label: "Delete Lead",
              icon: (
                <FaTrash
                  className="text-rose-600 hover:text-rose-800 text-base transition transform hover:scale-110"
                  title="Delete Lead"
                />
              ),
              show: () => true,
              onClick: (row) => {
                handleDeleteLead(row);
              },
            },
          ]}
          loading={loading}
        />
      </div>

      {/* Create / Edit Lead Modal */}
      <CreateEditLeadModal
        open={createEditModalOpen}
        setOpen={setCreateEditModalOpen}
        leadData={selectedLead}
        setLeadData={setSelectedLead}
      />

      {/* View Lead Modal */}
      <ViewLeadModal
        open={viewModalOpen}
        setOpen={setViewModalOpen}
        leadData={selectedLead}
      />
    </div>
  );
};

export default Leads;
