import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaEdit, FaMapMarkerAlt, FaTrash } from "react-icons/fa";
import { MdAddCircle } from "react-icons/md";
import useOfficeLocation from "../../../../hooks/useOfficeLocation";
import { useTriggerRefreshStore } from "../../../../store/triggerRefreshStore";
import { useAuthStore } from "../../../../store/authStore";
import DataTableWithoutApiPagination from "../../../../components/DataTableWithoutApiPagination";
import showToast from "../../../../utils/toast";
import CreateLocationModal from "./CreateLocationModal";

const Locations = () => {
  const { getOfficeLocations, deleteOfficeLocation, loading } =
    useOfficeLocation();

  const { triggerRefresh, setTriggerRefresh } = useTriggerRefreshStore();
  const { authUser } = useAuthStore();

  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchOfficeLocations();
  }, [triggerRefresh]);

  const fetchOfficeLocations = async () => {
    const res = await getOfficeLocations();

    if (res.success) {
      setLocations(res.data);
    } else {
      setLocations([]);
      showToast(res.message, "error");
    }
  };

  const handleEdit = (row) => {
    setSelectedLocation(row);
    setOpen(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Office Location?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Delete",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      const res = await deleteOfficeLocation(id);

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

  const tableHead = [
    "SL",
    "Location Name",
    "Latitude",
    "Longitude",
    "Radius (m)",
    "Action",
  ];

  const columnMapping = {
    "Location Name": "name",
    Latitude: "latitude",
    Longitude: "longitude",
    "Radius (m)": "radiusMeters",
  };

  const columnAlignment = {
    SL: "left",
    "Location Name": "left",
    Latitude: "center",
    Longitude: "center",
    "Radius (m)": "center",
    Action: "center",
  };

  const ACTION_BUTTONS = [
    {
      show: () =>
        Boolean(
          authUser?.permissions?.includes("SUPER") ||
          authUser?.permissions?.includes("UPDATE_OFFICE_LOCATION"),
        ),
      icon: <FaEdit className="w-5 h-5 text-blue-500" />,
      onClick: handleEdit,
      label: "Edit Office Location",
    },
    {
      show: () =>
        Boolean(
          authUser?.permissions?.includes("SUPER") ||
          authUser?.permissions?.includes("DELETE_OFFICE_LOCATION"),
        ),
      icon: <FaTrash className="w-5 h-5 text-red-500" />,
      onClick: (row) => handleDelete(row.id),
      label: "Delete Office Location",
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-primary-700">
            <FaMapMarkerAlt className="text-primary-500" />
            Attendance Location Setup
          </h2>
        </div>

        {(authUser?.permissions?.includes("SUPER") ||
          authUser?.permissions?.includes("CREATE_OFFICE_LOCATION")) && (
          <button
            onClick={() => {
              setSelectedLocation(null);
              setOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-button-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-button-primary-hover"
          >
            <MdAddCircle className="h-5 w-5" />
            Create Location
          </button>
        )}
      </div>

      <DataTableWithoutApiPagination
        tableHead={tableHead}
        tableData={locations}
        columnMapping={columnMapping}
        columnAlignment={columnAlignment}
        loading={loading}
        actionButtonsConfig={ACTION_BUTTONS}
        headerConfig={{
          title: "Office Locations",
          searchPlaceholder: "Search Location...",
        }}
      />

      <CreateLocationModal
        open={open}
        setOpen={setOpen}
        locationData={selectedLocation}
        setLocationData={setSelectedLocation}
      />
    </div>
  );
};

export default Locations;
