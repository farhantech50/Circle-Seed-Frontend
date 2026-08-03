import React, { useEffect, useState, useCallback } from "react";
import {
  FaMapMarkedAlt,
  FaRedo,
  FaEye,
  FaEdit,
  FaFilter,
  FaTimes,
  FaBan,
} from "react-icons/fa";
import { MdAddCircle } from "react-icons/md";
import Swal from "sweetalert2";
import useVisit from "../../../hooks/useVisit";
import useEmployee from "../../../hooks/useEmployee";
import DataTable from "../../../components/DataTable";
import SearchableSelect from "../../../components/SearchableSelect";
import Lookup from "../../../components/Lookup";
import CreateEditVisitModal from "./CreateEditVisitModal";
import ViewVisitModal from "./ViewVisitModal";
import { usePaginationStore } from "../../../store/paginationStore";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import { useAuthStore } from "../../../store/authStore";
import showToast from "../../../utils/toast";
import { formatDhakaDate } from "../../../utils/dateUtils";

const VisitAssignment = () => {
  const { getVisits, cancelVisit, loading } = useVisit();
  const { getEmployees } = useEmployee();
  const { authUser } = useAuthStore();

  const { page, limit, search, setTotalData } = usePaginationStore();
  const { triggerRefresh, setTriggerRefresh } = useTriggerRefreshStore();

  const [visits, setVisits] = useState([]);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [createEditModalOpen, setCreateEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Role Scope & Permissions
  const roleNameNormalized = (authUser?.roleName || "").trim().toLowerCase();

  const canViewAllAndFilterStaff =
    roleNameNormalized === "super admin" ||
    roleNameNormalized === "admin" ||
    roleNameNormalized === "marketing manager";

  const loggedInUserId = authUser?.id ? String(authUser.id) : "";
  const loggedInEmpCode = authUser?.employeeId ? String(authUser.employeeId) : "";

  // Filter States (typeId, assignedToId, startDate, endDate)
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [selectedAssignedToId, setSelectedAssignedToId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [employeeOptions, setEmployeeOptions] = useState([]);

  // Fetch employees for staff filter option if authorized
  useEffect(() => {
    if (canViewAllAndFilterStaff) {
      const loadFilterOptions = async () => {
        try {
          const empRes = await getEmployees();
          if (empRes.success && Array.isArray(empRes.data)) {
            setEmployeeOptions(empRes.data);
          }
        } catch (err) {
          console.error("Failed to load visit filter options:", err);
        }
      };

      loadFilterOptions();
    }
  }, [canViewAllAndFilterStaff, getEmployees]);

  // Fetch visits with active filters & role scoping
  const fetchVisitsList = useCallback(async () => {
    const activeAssignedToId = canViewAllAndFilterStaff
      ? selectedAssignedToId || undefined
      : loggedInUserId || undefined;

    const filters = {
      page,
      limit,
      ...(search ? { search } : {}),
      ...(selectedTypeId ? { typeId: selectedTypeId } : {}),
      ...(activeAssignedToId ? { assignedToId: activeAssignedToId, userId: activeAssignedToId } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
    };

    const res = await getVisits(filters);
    if (res.success) {
      let rawList = res.data || [];

      // Strict user scoping: Regular employees ONLY see their own visits
      if (!canViewAllAndFilterStaff && (loggedInUserId || loggedInEmpCode)) {
        rawList = rawList.filter((item) => {
          const assignedId = String(item.assignedToId || item.assignedTo?.id || "");
          const createdId = String(item.createdById || item.createdBy?.id || "");
          const empCode = String(item.assignedTo?.employeeId || "");

          return (
            (loggedInUserId && assignedId === loggedInUserId) ||
            (loggedInUserId && createdId === loggedInUserId) ||
            (loggedInEmpCode && empCode === loggedInEmpCode)
          );
        });
      } else if (canViewAllAndFilterStaff && selectedAssignedToId) {
        rawList = rawList.filter((item) => {
          const assignedId = String(item.assignedToId || item.assignedTo?.id || "");
          return assignedId === String(selectedAssignedToId);
        });
      }

      setVisits(rawList);
      setTotalData(res.total || rawList.length);
    } else {
      setVisits([]);
      setTotalData(0);
      showToast(res.message || "Failed to load visit assignments", "error");
    }
  }, [
    getVisits,
    page,
    limit,
    search,
    selectedTypeId,
    selectedAssignedToId,
    startDate,
    endDate,
    canViewAllAndFilterStaff,
    loggedInUserId,
    loggedInEmpCode,
    setTotalData,
  ]);

  useEffect(() => {
    fetchVisitsList();
  }, [fetchVisitsList, triggerRefresh]);

  const handleClearFilters = () => {
    setSelectedTypeId("");
    setSelectedAssignedToId("");
    setStartDate("");
    setEndDate("");
  };

  const handleCancelVisit = async (row) => {
    const visitCode = row.visitIdCode || `VST-${row.id}`;
    const result = await Swal.fire({
      title: "Cancel Visit Assignment?",
      text: `Are you sure you want to cancel visit assignment "${visitCode}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#F59E0B",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Yes, Cancel Visit",
    });

    if (!result.isConfirmed) return;

    const res = await cancelVisit(row.id);
    if (res.success) {
      showToast(res.message || "Visit cancelled successfully", "success");
      setTriggerRefresh();
    } else {
      showToast(res.message || "Failed to cancel visit", "error");
    }
  };

  // Format table data for DataTable matching exact backend JSON response
  const formattedTableData = visits.map((item) => {
    const visitIdCode = item.visitId || `VST-${String(item.id).padStart(4, "0")}`;
    
    const typeName =
      item.type?.value ||
      item.type?.name ||
      item.typeName ||
      "-";

    const assignedToName =
      item.assignedTo?.fullName ||
      item.assignedTo?.name ||
      item.assignedToName ||
      "-";

    const leadName = item.lead?.name || item.leadName;
    const leadContact = item.lead?.contact || item.lead?.contactPhone;

    const stakeholderName =
      item.stakeholder?.name ||
      item.stakeholder?.companyName ||
      item.stakeholderName;

    const contactName =
      item.contactName || leadName || stakeholderName || "-";

    const contactPhone =
      item.contactPhone ||
      leadContact ||
      item.stakeholder?.phone ||
      "-";

    const relatedTarget = leadName
      ? `Lead: ${leadName}`
      : stakeholderName
      ? `Stakeholder: ${stakeholderName}`
      : "Direct Contact";

    const formattedDate = item.plannedDate
      ? formatDhakaDate(item.plannedDate)
      : "-";

    const statusVal =
      item.status?.value ||
      item.status?.name ||
      (typeof item.status === "string" ? item.status : "Planned");

    return {
      ...item,
      visitIdCode,
      typeNameFormatted: typeName,
      assignedToNameFormatted: assignedToName,
      contactNameFormatted: contactName,
      contactPhoneFormatted: contactPhone,
      plannedDateFormatted: formattedDate,
      relatedTarget,
      statusVal,
      status: statusVal,
    };
  });

  return (
    <div className="flex flex-col gap-4 p-5 bg-slate-50 min-h-screen">
      {/* Filter Card with Date & Staff Filters and Assign Visit Action */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <FaFilter className="text-emerald-600" /> Filter Visit Assignments
          </div>

          {(selectedTypeId || selectedAssignedToId || startDate || endDate) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 transition"
            >
              <FaTimes className="w-3 h-3" /> Clear Filters
            </button>
          )}
        </div>

        <div
          className={`grid grid-cols-1 sm:grid-cols-2 ${
            canViewAllAndFilterStaff ? "lg:grid-cols-5" : "lg:grid-cols-4"
          } gap-3 items-end text-xs`}
        >
          {/* Visit Type Lookup Filter (visit_type) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Filter by Visit Type
            </label>
            <Lookup
              lookupName="visit_type"
              selectedId={selectedTypeId}
              setSelectedId={setSelectedTypeId}
              isMultiple={false}
            />
          </div>

          {/* Assigned Staff Filter (Only visible to Admin & Marketing Manager) */}
          {canViewAllAndFilterStaff && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Filter by Staff
              </label>
              <SearchableSelect
                options={employeeOptions}
                value={selectedAssignedToId}
                onChange={(val) => setSelectedAssignedToId(val)}
                placeholder="All Staff"
                getOptionLabel={(opt) =>
                  `${opt.fullName || opt.name || `Staff #${opt.id}`} ${
                    opt.designation ? `(${opt.designation})` : ""
                  }`
                }
                getOptionValue={(opt) => opt.id}
              />
            </div>
          )}

          {/* Start Date Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
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
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Action Button: Assign Visit */}
          {Boolean(
            authUser?.permissions?.includes("SUPER") ||
            authUser?.permissions?.includes("CREATE_VISIT") ||
            authUser?.permissions?.includes("ASSIGN_VISIT") ||
            canViewAllAndFilterStaff
          ) && (
            <div>
              <button
                type="button"
                onClick={() => {
                  setSelectedVisit(null);
                  setCreateEditModalOpen(true);
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-sm transition transform hover:scale-[1.01]"
              >
                <MdAddCircle className="w-4 h-4" />
                Assign Visit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Table Content Card with API Pagination */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <DataTable
          headerConfig={{
            title: canViewAllAndFilterStaff
              ? "All Visit Assignments Directory"
              : "My Visit Assignments Directory",
            searchPlaceholder: "Search visit ID, contact name, phone, type...",
          }}
          tableHead={[
            "SL",
            "Visit ID",
            "Visit Type",
            "Assigned Staff",
            "Contact Name",
            "Contact Phone",
            "Target Type",
            "Planned Date",
            "Status",
            "Action",
          ]}
          tableData={formattedTableData}
          columnMapping={{
            "Visit ID": "visitIdCode",
            "Visit Type": "typeNameFormatted",
            "Assigned Staff": "assignedToNameFormatted",
            "Contact Name": "contactNameFormatted",
            "Contact Phone": "contactPhoneFormatted",
            "Target Type": "relatedTarget",
            "Planned Date": "plannedDateFormatted",
            Status: "statusVal",
          }}
          columnAlignment={{
            SL: "center",
            "Visit ID": "center",
            "Visit Type": "left",
            "Assigned Staff": "left",
            "Contact Name": "left",
            "Contact Phone": "left",
            "Target Type": "left",
            "Planned Date": "center",
            Status: "center",
            Action: "center",
          }}
          actionButtonsConfig={[
            {
              label: "View Visit Details",
              icon: (
                <FaEye
                  className="text-emerald-600 hover:text-emerald-800 text-lg transition transform hover:scale-110"
                  title="View Details"
                />
              ),
              show: (row) => true,
              onClick: (row) => {
                setSelectedVisit(row);
                setViewModalOpen(true);
              },
            },
            {
              label: "Edit Visit Assignment",
              icon: (
                <FaEdit
                  className="text-amber-500 hover:text-amber-700 text-base transition transform hover:scale-110"
                  title="Edit Assignment"
                />
              ),
              show: () => {
                return Boolean(
                  authUser?.permissions?.includes("SUPER") ||
                  authUser?.permissions?.includes("UPDATE_VISIT") ||
                  canViewAllAndFilterStaff
                );
              },
              onClick: (row) => {
                setSelectedVisit(row);
                setCreateEditModalOpen(true);
              },
            },
            {
              label: "Cancel Visit Assignment",
              icon: (
                <FaBan
                  className="text-amber-600 hover:text-amber-800 text-base transition transform hover:scale-110"
                  title="Cancel Visit"
                />
              ),
              show: (row) => {
                const statusVal = row.status?.value || row.status || "";
                const isTerminated =
                  statusVal.toString().toLowerCase().includes("cancel") ||
                  statusVal.toString().toLowerCase().includes("completed");

                if (isTerminated) return false;

                return Boolean(
                  authUser?.permissions?.includes("SUPER") ||
                  authUser?.permissions?.includes("UPDATE_VISIT") ||
                  authUser?.permissions?.includes("CANCEL_VISIT") ||
                  canViewAllAndFilterStaff
                );
              },
              onClick: (row) => {
                handleCancelVisit(row);
              },
            },
          ]}
          loading={loading}
        />
      </div>

      {/* Create / Edit Visit Modal */}
      <CreateEditVisitModal
        open={createEditModalOpen}
        setOpen={setCreateEditModalOpen}
        visitData={selectedVisit}
        setVisitData={setSelectedVisit}
      />

      {/* View Visit Modal */}
      <ViewVisitModal
        open={viewModalOpen}
        setOpen={setViewModalOpen}
        visitData={selectedVisit}
      />
    </div>
  );
};

export default VisitAssignment;
