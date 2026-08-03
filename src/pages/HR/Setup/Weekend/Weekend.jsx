import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaTrash } from "react-icons/fa";
import { MdAddCircle } from "react-icons/md";
import CreateWeekendModal from "./CreateWeekendModal";
import useWeekend from "../../../../hooks/useWeekend";
import { useTriggerRefreshStore } from "../../../../store/triggerRefreshStore";
import showToast from "../../../../utils/toast";
import DataTableWithoutApiPagination from "../../../../components/DataTableWithoutApiPagination";
import { useAuthStore } from "../../../../store/authStore";

const daysOfWeekList = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const Weekend = () => {
  const { getWeekends, deleteWeekend, loading } = useWeekend();

  const { triggerRefresh, setTriggerRefresh } = useTriggerRefreshStore();
  const { authUser } = useAuthStore();

  const [weekends, setWeekends] = useState([]);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchWeekends();
  }, [triggerRefresh]);

  const fetchWeekends = async () => {
    const res = await getWeekends();
    if (res.success) {
      setWeekends(
        res.data.map((weekend) => ({
          ...weekend,
          dayName:
            weekend.dayOfWeek !== undefined &&
              weekend.dayOfWeek >= 0 &&
              weekend.dayOfWeek <= 6
              ? daysOfWeekList[weekend.dayOfWeek]
              : "-",
        }))
      );
    } else {
      setWeekends([]);
      showToast(res.message, "error");
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Weekend?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Delete",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      const res = await deleteWeekend(id);

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

  const tableHead = ["SL", "Day", "Action"];

  const columnMapping = {
    Day: "dayName",
  };

  const columnAlignment = {
    SL: "left",
    Day: "center",
    Action: "center",
  };

  const ACTION_BUTTONS = [
    {
      show: () => {
        return Boolean(authUser?.permissions?.includes("SUPER") || authUser?.permissions?.includes("DELETE_WEEKEND"));
      },
      icon: <FaTrash className="text-red-500 w-5 h-5" />,
      onClick: (row) => handleDelete(row.id),
      label: "Delete Weekend",
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col md:flex-row justify-end gap-4">
        <div className="flex items-end">
          {(authUser?.permissions?.includes("SUPER") || authUser?.permissions?.includes("CREATE_WEEKEND")) && (
            <button
              onClick={() => {
                setOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-button-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-button-primary-hover"
            >
              <MdAddCircle className="h-5 w-5" />
              Create Weekend
            </button>
          )}
        </div>
      </div>

      <DataTableWithoutApiPagination
        tableHead={tableHead}
        tableData={weekends}
        columnMapping={columnMapping}
        columnAlignment={columnAlignment}
        loading={loading}
        actionButtonsConfig={ACTION_BUTTONS}
        headerConfig={{
          title: "Weekend List",
          searchPlaceholder: "Search Weekend...",
        }}
      />

      <CreateWeekendModal
        open={open}
        setOpen={setOpen}
      />
    </div>
  );
};

export default Weekend;
