import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { MdAddCircle } from "react-icons/md";
import usePreOrder from "../../../hooks/usePreOrder";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import { usePaginationStore } from "../../../store/paginationStore";
import { useAuthStore } from "../../../store/authStore";
import DataTable from "../../../components/DataTable";
import showToast from "../../../utils/toast";
import CreateImportModal from "./CreateImportModal";
import ViewImportModal from "./ViewImportModal";
import { formatDhakaDate } from "../../../utils/dateUtils";

const Import = () => {
  const { getPreOrders, deletePreOrder, loading } = usePreOrder();

  const { authUser } = useAuthStore();
  const { triggerRefresh, setTriggerRefresh } = useTriggerRefreshStore();
  const { page, limit, search, setTotalData } = usePaginationStore();

  const [imports, setImports] = useState([]);
  const [selectedImport, setSelectedImport] = useState(null);
  const [open, setOpen] = useState(false);
  
  const [viewData, setViewData] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);

  useEffect(() => {
    fetchImports();
  }, [page, limit, search, triggerRefresh]);

  const fetchImports = async () => {
    const res = await getPreOrders({
      page,
      limit,
      search,
      typeId: 30,
    });
    if (res.success) {
      setImports(
        res.data?.data?.map((item) => ({
          ...item,
          orderDateFormatted: item.orderDate ? formatDhakaDate(item.orderDate) : "-",
          expectedDeliveryDateFormatted: item.expectedDeliveryDate ? formatDhakaDate(item.expectedDeliveryDate) : "-",
          seedType: item.seedType?.value || "-",
          stakeholderName: item.stakeholder?.name || item.supplier?.name || "-",
        })) || []
      );
      setTotalData(res.data?.total || 0);
    } else {
      setImports([]);
      showToast(res.message, "error");
    }
  };

  const handleEdit = (row) => {
    setSelectedImport(row);
    setOpen(true);
  };

  const handleView = (row) => {
    setViewData(row);
    setViewOpen(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Import?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Delete",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      const res = await deletePreOrder(id);

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
    "Procurement ID",
    "Stakeholder Name",
    "Seed Type",
    "Order Date",
    "Expected Delivery",
    "Quantity (KG)",
    "Unit Price (BDT)",
    "Total (BDT)",
    "Action",
  ];

  const columnMapping = {
    "Procurement ID": "procurementId",
    "Stakeholder Name": "stakeholderName",
    "Seed Type": "seedType",
    "Order Date": "orderDateFormatted",
    "Expected Delivery": "expectedDeliveryDateFormatted",
    "Quantity (KG)": "orderedQuantity",
    "Unit Price (BDT)": "unitPrice",
    "Total (BDT)": "totalAmount",
  };

  const columnAlignment = {
    SL: "left",
    "Procurement ID": "left",
    "Stakeholder Name": "left",
    "Seed Type": "left",
    "Order Date": "center",
    "Expected Delivery": "center",
    "Quantity (KG)": "right",
    "Unit Price (BDT)": "right",
    "Total (BDT)": "right",
    Action: "center",
  };

  const ACTION_BUTTONS = [
    {
      show: () => true,
      icon: <FaEye className="text-lime-500 w-5 h-5" />,
      onClick: handleView,
      label: "View Details",
    },
    {
      show: () =>
        Boolean(
          authUser?.permissions?.includes("SUPER") ||
          authUser?.permissions?.includes("UPDATE_IMPORT")
        ),
      icon: <FaEdit className="w-5 h-5 text-blue-500" />,
      onClick: handleEdit,
      label: "Edit Import",
    },
    {
      show: () =>
        Boolean(
          authUser?.permissions?.includes("SUPER") ||
          authUser?.permissions?.includes("DELETE_IMPORT")
        ),
      icon: <FaTrash className="w-5 h-5 text-red-500" />,
      onClick: (row) => handleDelete(row.id),
      label: "Delete Import",
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-end gap-4">
        {(authUser?.permissions?.includes("SUPER") ||
          authUser?.permissions?.includes("CREATE_IMPORT")) && (
          <button
            onClick={() => {
              setSelectedImport(null);
              setOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-button-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-button-primary-hover"
          >
            <MdAddCircle className="h-5 w-5" />
            Create Import
          </button>
        )}
      </div>

      <DataTable
        tableHead={tableHead}
        tableData={imports}
        columnMapping={columnMapping}
        columnAlignment={columnAlignment}
        loading={loading}
        actionButtonsConfig={ACTION_BUTTONS}
        headerConfig={{
          title: "Import List",
          searchPlaceholder: "Search Imports...",
        }}
      />

      <CreateImportModal
        open={open}
        setOpen={setOpen}
        importData={selectedImport}
        setImportData={setSelectedImport}
      />

      <ViewImportModal
        open={viewOpen}
        setOpen={setViewOpen}
        importData={viewData}
      />
    </div>
  );
};

export default Import;
