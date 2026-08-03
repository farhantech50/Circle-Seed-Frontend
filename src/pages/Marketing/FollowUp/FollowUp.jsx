import React, { useEffect, useState, useCallback } from "react";
import {
  FaCalendarCheck,
  FaRedo,
  FaEye,
  FaEdit,
  FaTrash,
  FaFilter,
  FaTimes,
} from "react-icons/fa";
import { MdAddCircle } from "react-icons/md";
import Swal from "sweetalert2";
import useFollowUp from "../../../hooks/useFollowUp";
import useLeads from "../../../hooks/useLeads";
import useEmployee from "../../../hooks/useEmployee";
import DataTable from "../../../components/DataTable";
import SearchableSelect from "../../../components/SearchableSelect";
import Lookup from "../../../components/Lookup";
import CreateEditFollowUpModal from "./CreateEditFollowUpModal";
import ViewFollowUpModal from "./ViewFollowUpModal";
import { usePaginationStore } from "../../../store/paginationStore";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import { useAuthStore } from "../../../store/authStore";
import showToast from "../../../utils/toast";
import { formatDhakaDate } from "../../../utils/dateUtils";

const FollowUp = () => {
  const { getFollowUps, deleteFollowUp, loading } = useFollowUp();
  const { getLeads } = useLeads();
  const { getEmployees } = useEmployee();
  const { authUser } = useAuthStore();

  const { page, limit, search, setTotalData } = usePaginationStore();
  const { triggerRefresh, setTriggerRefresh } = useTriggerRefreshStore();

  const [followUps, setFollowUps] = useState([]);
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);
  const [createEditModalOpen, setCreateEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Filter States (leadId, userId, outcomeId, startDate, endDate)
  const loggedInUserId = authUser?.id ? String(authUser.id) : "";
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(loggedInUserId);
  const [selectedOutcomeId, setSelectedOutcomeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (authUser?.id && !selectedUserId) {
      setSelectedUserId(String(authUser.id));
    }
  }, [authUser]);

  // Options for Non-Lookup filters (Leads & Staff)
  const [leadOptions, setLeadOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);

  // Fetch Leads and Employees for filter options once on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        // Fetch Leads
        const leadsRes = await getLeads({ limit: 100 });
        if (leadsRes.success && Array.isArray(leadsRes.data)) {
          setLeadOptions(leadsRes.data);
        }

        // Fetch Staff / Employees (userId)
        const empRes = await getEmployees(false);
        if (empRes.success && Array.isArray(empRes.data)) {
          setUserOptions(empRes.data);
        }
      } catch (err) {
        console.error("Failed to load follow-up filter options:", err);
      }
    };

    loadFilterOptions();
  }, []);

  // Fetch follow-ups with active filters
  const fetchFollowUpsList = useCallback(async () => {
    const filters = {
      page,
      limit,
      ...(search ? { search } : {}),
      ...(selectedLeadId ? { leadId: selectedLeadId } : {}),
      ...(selectedUserId ? { userId: selectedUserId } : {}),
      ...(selectedOutcomeId ? { outcomeId: selectedOutcomeId } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
    };

    const res = await getFollowUps(filters);
    if (res.success) {
      setFollowUps(res.data || []);
      setTotalData(res.total || 0);
    } else {
      setFollowUps([]);
      setTotalData(0);
      showToast(res.message || "Failed to load follow-ups list", "error");
    }
  }, [
    getFollowUps,
    page,
    limit,
    search,
    selectedLeadId,
    selectedUserId,
    selectedOutcomeId,
    startDate,
    endDate,
    setTotalData,
  ]);

  useEffect(() => {
    fetchFollowUpsList();
  }, [fetchFollowUpsList, triggerRefresh]);

  const handleClearFilters = () => {
    setSelectedLeadId("");
    setSelectedUserId("");
    setSelectedOutcomeId("");
    setStartDate("");
    setEndDate("");
  };

  const handleDeleteFollowUp = async (row) => {
    const result = await Swal.fire({
      title: "Delete Follow-Up?",
      text: "Are you sure you want to delete this follow-up record? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Yes, Delete",
    });

    if (!result.isConfirmed) return;

    const res = await deleteFollowUp(row.id);
    if (res.success) {
      showToast(res.message || "Follow-up deleted successfully", "success");
      setTriggerRefresh();
    } else {
      showToast(res.message || "Failed to delete follow-up", "error");
    }
  };

  // Format table data for DataTable
  const formattedTableData = followUps.map((item) => {
    const leadName =
      item.lead?.name ||
      item.leadName ||
      "-";

    const companyName =
      item.lead?.company ||
      item.company ||
      "-";

    const outcomeVal =
      item.outcome?.value ||
      item.outcomeName ||
      item.outcome?.name ||
      item.status ||
      "-";

    const createdByVal =
      item.user?.fullName ||
      item.createdBy?.fullName ||
      item.createdByName ||
      "-";

    const formattedDate = item.followUpDate
      ? formatDhakaDate(item.followUpDate)
      : "-";

    return {
      ...item,
      leadNameFormatted: leadName,
      companyFormatted: companyName,
      outcomeVal,
      createdByVal,
      formattedDate,
      shortNotes: item.notes
        ? item.notes.length > 40
          ? `${item.notes.substring(0, 40)}...`
          : item.notes
        : "-",
    };
  });

  return (
    <div className="flex flex-col gap-5 p-6 bg-slate-50 min-h-screen">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100/70 text-emerald-700 rounded-xl">
            <FaCalendarCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">
              Marketing Follow-Ups
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Record and track engagement, notes, and conversation outcomes with leads.
            </p>
          </div>
        </div>

        {/* Quick Stat Badges & Create Action */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
          <div className="bg-emerald-50 border border-emerald-200/80 px-4 py-2 rounded-xl text-right shadow-xs">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider">
              Total Follow-Ups
            </span>
            <span className="text-lg font-black text-emerald-900">
              {followUps.length}
            </span>
          </div>

          <button
            type="button"
            onClick={fetchFollowUpsList}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition shadow-xs disabled:opacity-50"
            title="Refresh Follow-ups List"
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
              setSelectedFollowUp(null);
              setCreateEditModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition transform hover:scale-[1.01]"
          >
            <MdAddCircle className="w-4 h-4" />
            Add Follow-Up
          </button>
        </div>
      </div>

      {/* Filter Card (leadId, userId, outcomeId, startDate, endDate) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <FaFilter className="text-emerald-600" /> Filter Follow-Up Records
          </div>
          {(selectedLeadId ||
            selectedUserId ||
            selectedOutcomeId ||
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
          {/* Lead Filter (leadId) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Filter by Lead
            </label>
            <SearchableSelect
              options={leadOptions}
              value={selectedLeadId}
              onChange={(val) => setSelectedLeadId(val)}
              placeholder="All Leads"
              getOptionLabel={(opt) =>
                `${opt.name || opt.contact || `Lead #${opt.id}`} ${
                  opt.company ? `(${opt.company})` : ""
                }`
              }
              getOptionValue={(opt) => opt.id}
            />
          </div>

          {/* User / Staff Filter (userId) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Recorded By Staff
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

          {/* Outcome Filter (outcomeId) using <Lookup /> component */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Filter by Outcome
            </label>
            <Lookup
              lookupName="follow_up_outcome"
              selectedId={selectedOutcomeId}
              setSelectedId={setSelectedOutcomeId}
              isMultiple={false}
            />
          </div>

          {/* Start Date Filter (startDate) */}
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

          {/* End Date Filter (endDate) */}
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

      {/* Main Table Content Card with API Pagination */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <DataTable
          headerConfig={{
            title: "Follow-Up Records History",
            searchPlaceholder: "Search follow-up notes, lead name, company...",
          }}
          tableHead={[
            "SL",
            "Lead Name",
            "Company",
            "Follow-Up Date",
            "Outcome",
            "Recorded By",
            "Action",
          ]}
          tableData={formattedTableData}
          columnMapping={{
            "Lead Name": "leadNameFormatted",
            Company: "companyFormatted",
            "Follow-Up Date": "formattedDate",
            Outcome: "outcomeVal",
            "Recorded By": "createdByVal",
          }}
          columnAlignment={{
            SL: "center",
            "Lead Name": "left",
            Company: "left",
            "Follow-Up Date": "center",
            Outcome: "center",
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
                setSelectedFollowUp(row);
                setViewModalOpen(true);
              },
            },
          ]}
          loading={loading}
        />
      </div>

      {/* Create / Edit Follow-Up Modal */}
      <CreateEditFollowUpModal
        open={createEditModalOpen}
        setOpen={setCreateEditModalOpen}
        followUpData={selectedFollowUp}
        setFollowUpData={setSelectedFollowUp}
      />

      {/* View Follow-Up Modal */}
      <ViewFollowUpModal
        open={viewModalOpen}
        setOpen={setViewModalOpen}
        followUpData={selectedFollowUp}
      />
    </div>
  );
};

export default FollowUp;
