import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  FaStore,
  FaEdit,
  FaTrash,
  FaUserCog,
  FaEye,
} from "react-icons/fa";
import { MdAddCircle } from "react-icons/md";
import usePOSLocation from "../../../../hooks/usePOSLocation";
import { useTriggerRefreshStore } from "../../../../store/triggerRefreshStore";
import { useAuthStore } from "../../../../store/authStore";
import DataTableWithoutApiPagination from "../../../../components/DataTableWithoutApiPagination";
import showToast from "../../../../utils/toast";
import CreatePOSModal from "./CreatePOSModal";
import AssignUserModal from "./AssignUserModal";
import ViewPOSModal from "./ViewPOSModal";

const POSLocation = () => {
  const { getPOSLocations, deletePOSLocation, loading } = usePOSLocation();
  const { triggerRefresh, setTriggerRefresh } = useTriggerRefreshStore();
  const { authUser } = useAuthStore();

  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [triggerRefresh]);

  const fetchData = async () => {
    const res = await getPOSLocations();

    if (res.success) {
      const freshLocations = res.data || [];
      setLocations(freshLocations);

      setSelectedLocation((prev) => {
        if (!prev) return null;
        return freshLocations.find((loc) => loc.id === prev.id) || prev;
      });
    } else {
      setLocations([]);
      showToast(res.message, "error");
    }
  };

  const handleView = (row) => {
    setSelectedLocation(row);
    setViewModalOpen(true);
  };

  const handleEdit = (row) => {
    setSelectedLocation(row);
    setCreateModalOpen(true);
  };

  const handleManageUsers = (row) => {
    setSelectedLocation(row);
    setAssignModalOpen(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete POS Location?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Delete",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      const res = await deletePOSLocation(id);

      if (res.success) {
        setTriggerRefresh();
        Swal.fire({
          title: "Deleted!",
          text: res.message,
          icon: "success",
          confirmButtonColor: "#0D9488",
        });
      } else {
        Swal.fire({
          title: "Error",
          text: res.message,
          icon: "error",
          confirmButtonColor: "#0D9488",
        });
      }
    });
  };

  // Format table data for DataTableWithoutApiPagination
  const formattedData = locations.map((loc) => {
    const assignmentsCount = loc.assignments?.length || 0;
    const assignedUserNames =
      loc.assignments
        ?.map((a) => a.user?.fullName || a.user?.name || a.userName || `User #${a.userId || a.id}`)
        .slice(0, 2)
        .join(", ") || "";

    return {
      ...loc,
      status: loc.isActive ? "Active" : "Inactive",
      assignedStaffBadge: (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center rounded-full bg-primary-100 px-2.5 py-1 text-xs font-bold text-primary-700">
            {assignmentsCount} Staff
          </span>
          {assignedUserNames && (
            <span className="text-xs text-gray-500 truncate max-w-[150px]" title={assignedUserNames}>
              ({assignedUserNames}{assignmentsCount > 2 ? "..." : ""})
            </span>
          )}
        </div>
      ),
    };
  });

  const tableHead = [
    "SL",
    "POS Location Name",
    "Address",
    "Contact",
    "Status",
    "Assigned Staff",
    "Action",
  ];

  const columnMapping = {
    "POS Location Name": "name",
    Address: "address",
    Contact: "contact",
    Status: "status",
    "Assigned Staff": "assignedStaffBadge",
  };

  const columnAlignment = {
    SL: "left",
    "POS Location Name": "left",
    Address: "left",
    Contact: "left",
    Status: "center",
    "Assigned Staff": "center",
    Action: "center",
  };

  const ACTION_BUTTONS = [
    {
      show: () => true,
      icon: <FaEye className="w-5 h-5 text-green-500" />,
      onClick: handleView,
      label: "View POS Location",
    },
    {
      show: () => true,
      icon: <FaUserCog className="w-5 h-5 text-emerald-600" />,
      onClick: handleManageUsers,
      label: "Assign / Manage Users",
    },
    {
      show: () =>
        Boolean(
          authUser?.permissions?.includes("SUPER") ||
          authUser?.permissions?.includes("UPDATE_POS_LOCATION") ||
          true
        ),
      icon: <FaEdit className="w-5 h-5 text-blue-500" />,
      onClick: handleEdit,
      label: "Edit POS Location",
    },
    {
      show: () =>
        Boolean(
          authUser?.permissions?.includes("SUPER") ||
          authUser?.permissions?.includes("DELETE_POS_LOCATION") ||
          true
        ),
      icon: <FaTrash className="w-5 h-5 text-red-500" />,
      onClick: (row) => handleDelete(row.id),
      label: "Delete POS Location",
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-primary-700">
            <FaStore className="text-primary-500" />
            POS Location Setup
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage POS outlet locations, assign staff members, and track active sales counters.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedLocation(null);
            setCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-button-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-button-primary-hover"
        >
          <MdAddCircle className="h-5 w-5" />
          Create POS Location
        </button>
      </div>

      {/* Main Locations Table */}
      <DataTableWithoutApiPagination
        tableHead={tableHead}
        tableData={formattedData}
        columnMapping={columnMapping}
        columnAlignment={columnAlignment}
        loading={loading}
        actionButtonsConfig={ACTION_BUTTONS}
        headerConfig={{
          title: "All POS Outlet Locations",
          searchPlaceholder: "Search by outlet name, address, contact...",
        }}
      />

      {/* Modals */}
      <CreatePOSModal
        open={createModalOpen}
        setOpen={setCreateModalOpen}
        locationData={selectedLocation}
        setLocationData={setSelectedLocation}
      />

      {selectedLocation && (
        <AssignUserModal
          open={assignModalOpen}
          setOpen={setAssignModalOpen}
          locationData={selectedLocation}
        />
      )}

      {selectedLocation && (
        <ViewPOSModal
          open={viewModalOpen}
          setOpen={setViewModalOpen}
          locationData={selectedLocation}
        />
      )}
    </div>
  );
};

export default POSLocation;
