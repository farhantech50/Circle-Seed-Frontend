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
import CreatePreOrderModal from "./CreatePreOrderModal";
import ViewPreOrderModal from "./ViewPreOrderModal";
import { formatDhakaDate } from "../../../utils/dateUtils";

const PreOrders = () => {
  const { getPreOrders, deletePreOrder, loading } = usePreOrder();

  const { authUser } = useAuthStore();
  const { triggerRefresh, setTriggerRefresh } = useTriggerRefreshStore();
  const { page, limit, search, setTotalData } = usePaginationStore();

  const [preOrders, setPreOrders] = useState([]);
  const [selectedPreOrder, setSelectedPreOrder] = useState(null);
  const [open, setOpen] = useState(false);
  
  const [viewData, setViewData] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);

  useEffect(() => {
    fetchPreOrders();
  }, [page, limit, search, triggerRefresh]);

  const fetchPreOrders = async () => {
    const res = await getPreOrders({
      page,
      limit,
      search,
      typeId: 29,
    });
    if (res.success) {
      setPreOrders(
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
      setPreOrders([]);
      showToast(res.message, "error");
    }
  };

  const handleEdit = (row) => {
    setSelectedPreOrder(row);
    setOpen(true);
  };

  const handleView = (row) => {
    setViewData(row);
    setViewOpen(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Pre-Order?",
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
          authUser?.permissions?.includes("UPDATE_PRE_ORDER")
        ),
      icon: <FaEdit className="w-5 h-5 text-blue-500" />,
      onClick: handleEdit,
      label: "Edit Pre-Order",
    },
    {
      show: () =>
        Boolean(
          authUser?.permissions?.includes("SUPER") ||
          authUser?.permissions?.includes("DELETE_PRE_ORDER")
        ),
      icon: <FaTrash className="w-5 h-5 text-red-500" />,
      onClick: (row) => handleDelete(row.id),
      label: "Delete Pre-Order",
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-end gap-4">
        {(authUser?.permissions?.includes("SUPER") ||
          authUser?.permissions?.includes("CREATE_PRE_ORDER")) && (
          <button
            onClick={() => {
              setSelectedPreOrder(null);
              setOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-button-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-button-primary-hover"
          >
            <MdAddCircle className="h-5 w-5" />
            Create Pre-Order
          </button>
        )}
      </div>

      <DataTable
        tableHead={tableHead}
        tableData={preOrders}
        columnMapping={columnMapping}
        columnAlignment={columnAlignment}
        loading={loading}
        actionButtonsConfig={ACTION_BUTTONS}
        headerConfig={{
          title: "Pre-Orders List",
          searchPlaceholder: "Search Pre-Orders...",
        }}
      />

      <CreatePreOrderModal
        open={open}
        setOpen={setOpen}
        preOrderData={selectedPreOrder}
        setPreOrderData={setSelectedPreOrder}
      />

      <ViewPreOrderModal
        open={viewOpen}
        setOpen={setViewOpen}
        preOrderData={viewData}
      />
    </div>
  );
};

export default PreOrders;
