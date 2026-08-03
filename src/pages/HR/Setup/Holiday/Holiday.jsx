import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaCalendarAlt, FaEdit, FaTrash } from "react-icons/fa";
import { MdAddCircle } from "react-icons/md";
import CreateHolidayModal from "./CreateHolidayModal";
import useHoliday from "../../../../hooks/useHoliday";
import { useTriggerRefreshStore } from "../../../../store/triggerRefreshStore";
import DataTable from "../../../../components/DataTable";
import showToast from "../../../../utils/toast";
import DataTableWithoutApiPagination from "../../../../components/DataTableWithoutApiPagination";
import { useAuthStore } from "../../../../store/authStore";
import { formatDhakaDate } from "../../../../utils/dateUtils";

const Holidays = () => {
  const { getHolidays, deleteHoliday, loading } = useHoliday();

  const { triggerRefresh, setTriggerRefresh } = useTriggerRefreshStore();
  const { authUser } = useAuthStore();

  const [holidays, setHolidays] = useState([]);
  const [selectedHoliday, setSelectedHoliday] = useState(null);

  const [open, setOpen] = useState(false);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchHolidays();
  }, [filters, triggerRefresh]);
  const fetchHolidays = async () => {
    const res = await getHolidays({
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    });
    if (res.success) {
      setHolidays(
        res.data.map((holiday) => ({
          ...holiday,
          date: holiday.date
            ? formatDhakaDate(holiday.date)
            : "-",
        })),
      );
    } else {
      setHolidays([]);
      showToast(res.message, "error");
    }
  };

  const handleEdit = (row) => {
    setSelectedHoliday(row);
    setOpen(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Holiday?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Delete",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      const res = await deleteHoliday(id);

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

  const tableHead = ["SL", "Holiday Name", "Date", "Action"];

  const columnMapping = {
    "Holiday Name": "name",
    Date: "date",
  };

  const columnAlignment = {
    SL: "left",
    "Holiday Name": "left",
    Date: "center",

    Action: "center",
  };

  const ACTION_BUTTONS = [
    {
      show: () => {
        return Boolean(authUser?.permissions?.includes("SUPER") || authUser?.permissions?.includes("UPDATE_HOLIDAY"));
      },
      icon: <FaEdit className="text-blue-500 w-5 h-5" />,
      onClick: handleEdit,
      label: "Edit Holiday",
    },
    {
      show: () => {
        return Boolean(authUser?.permissions?.includes("SUPER") || authUser?.permissions?.includes("DELETE_HOLIDAY"));
      },
      icon: <FaTrash className="text-red-500 w-5 h-5" />,
      onClick: (row) => handleDelete(row.id),
      label: "Delete Holiday",
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="min-w-[220px]">
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-700">
              <FaCalendarAlt className="text-primary-500" />
              Start Date
            </label>

            <div className="relative">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-primary-200 bg-white px-4 py-3 text-text shadow-sm transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>

          <div className="min-w-[220px]">
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-700">
              <FaCalendarAlt className="text-primary-500" />
              End Date
            </label>

            <div className="relative">
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-primary-200 bg-white px-4 py-3 text-text shadow-sm transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>
        </div>

        <div className="flex items-end">
          {(authUser?.permissions?.includes("SUPER") || authUser?.permissions?.includes("CREATE_HOLIDAY")) && (
            <button
              onClick={() => {
                setSelectedHoliday(null);
                setOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-button-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-button-primary-hover"
            >
              <MdAddCircle className="h-5 w-5" />
              Create Holiday
            </button>
          )}
        </div>
      </div>

      <DataTableWithoutApiPagination
        tableHead={tableHead}
        tableData={holidays}
        columnMapping={columnMapping}
        columnAlignment={columnAlignment}
        loading={loading}
        actionButtonsConfig={ACTION_BUTTONS}
        headerConfig={{
          title: "Holiday List",
          searchPlaceholder: "Search Holiday...",
        }}
      />

      <CreateHolidayModal
        open={open}
        setOpen={setOpen}
        holidayData={selectedHoliday}
        setHolidayData={setSelectedHoliday}
      />
    </div>
  );
};

export default Holidays;
