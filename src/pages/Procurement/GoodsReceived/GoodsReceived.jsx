import { useEffect, useState } from "react";
import { MdAddCircle } from "react-icons/md";
import { FaEye, FaEdit } from "react-icons/fa";
import useGoodsReceived from "../../../hooks/useGoodsReceived";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import { usePaginationStore } from "../../../store/paginationStore";
import { useAuthStore } from "../../../store/authStore";
import DataTable from "../../../components/DataTable";
import showToast from "../../../utils/toast";
import SearchableSelect from "../../../components/SearchableSelect";
import useLookUp from "../../../hooks/useLookup";
import CreateGoodsReceivedModal from "./CreateGoodsReceivedModal";
import ViewGoodsReceivedModal from "./ViewGoodsReceivedModal";
import { formatDhakaDate } from "../../../utils/dateUtils";

const GoodsReceived = () => {
  const { getGoodsReceived, loading } = useGoodsReceived();
  const { getLookup } = useLookUp();

  const { authUser } = useAuthStore();
  const { triggerRefresh } = useTriggerRefreshStore();
  const { page, limit, search, setTotalData } = usePaginationStore();

  const [receivedGoods, setReceivedGoods] = useState([]);
  const [selectedGoodsReceived, setSelectedGoodsReceived] = useState(null);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [statusId, setStatusId] = useState("");
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    const fetchStatuses = async () => {
      const res = await getLookup("receivedStatus");
      if (res.success) {
        setStatuses([{ id: "", value: "All Statuses" }, ...res.data]);
      }
    };
    fetchStatuses();
  }, []);

  useEffect(() => {
    fetchReceivedGoods();
  }, [page, limit, search, triggerRefresh, statusId]);

  const fetchReceivedGoods = async () => {
    const filters = statusId ? { statusId } : {};
    const res = await getGoodsReceived(filters);
    if (res.success) {
      const formattedData = (res.data?.data || res.data || []).map(item => ({
        ...item,
        formattedReceivedDate: item.receivedDate ? formatDhakaDate(item.receivedDate) : "-",
        formattedExpiryDate: item.expiryDate ? formatDhakaDate(item.expiryDate) : "-",
        status: item.status || "-",
        seedType: item.seedType || "-",
        currentApprover: item.currentApproverRole?.value || item.currentApproverRole || "-",
      }));
      setReceivedGoods(formattedData);
      setTotalData(res.data?.pagination?.total || res.data?.total || 0);
    } else {
      setReceivedGoods([]);
      showToast(res.message, "error");
    }
  };

  const tableHead = [
    "SL",
    "Received Code",
    "Procurement ID",
    "Seed Type",
    "Quantity (Kg)",
    "Received Date",
    "Expiry Date",
    "Current Approver",
    "Status",
    "Action",
  ];

  const columnMapping = {
    "Received Code": "receivedCode",
    "Procurement ID": "procurementId",
    "Seed Type": "seedType",
    "Quantity (Kg)": "receivedQuantity",
    "Received Date": "formattedReceivedDate",
    "Expiry Date": "formattedExpiryDate",
    "Current Approver": "currentApprover",
    Status: "status",
  };

  const columnAlignment = {
    SL: "left",
    "Received Code": "left",
    "Procurement ID": "left",
    "Seed Type": "left",
    "Quantity (Kg)": "center",
    "Received Date": "center",
    "Expiry Date": "center",
    "Current Approver": "left",
    Status: "center",
    Action: "center",
  };

  const ACTION_BUTTONS = [
    {
      show: () => true,
      icon: <FaEye className="w-5 h-5 text-green-500" />,
      onClick: (row) => {
        setSelectedGoodsReceived(row);
        setViewOpen(true);
      },
      label: "View Goods Received",
    },
    {
      show: () =>
        authUser?.permissions?.includes("SUPER") ||
        authUser?.permissions?.includes("UPDATE_RECEIVED"),
      icon: <FaEdit className="w-5 h-5 text-blue-500" />,
      onClick: (row) => {
        setSelectedGoodsReceived(row);
        setOpen(true);
      },
      label: "Edit Goods Received",
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="w-full md:w-64">
          <SearchableSelect
            options={statuses}
            value={statusId}
            onChange={setStatusId}
            placeholder="Filter by Status"
            getOptionLabel={(option) => option.value}
            getOptionValue={(option) => option.id}
          />
        </div>
        <div className="flex items-end">
          {(authUser?.permissions?.includes("SUPER") ||
            authUser?.permissions?.includes("CREATE_RECEIVED")) && (
            <button
              onClick={() => {
                setSelectedGoodsReceived(null);
                setOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-button-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-button-primary-hover"
            >
              <MdAddCircle className="h-5 w-5" />
              Receive Goods
            </button>
          )}
        </div>
      </div>

      <DataTable
        tableHead={tableHead}
        tableData={receivedGoods}
        columnMapping={columnMapping}
        columnAlignment={columnAlignment}
        loading={loading}
        headerConfig={{
          title: "Received Goods List",
          searchPlaceholder: "Search received goods...",
        }}
        actionButtonsConfig={ACTION_BUTTONS}
      />

      <CreateGoodsReceivedModal
        open={open}
        setOpen={setOpen}
        goodsReceivedData={selectedGoodsReceived}
        setGoodsReceivedData={setSelectedGoodsReceived}
      />

      <ViewGoodsReceivedModal
        open={viewOpen}
        setOpen={setViewOpen}
        goodsReceivedData={selectedGoodsReceived}
      />
    </div>
  );
};

export default GoodsReceived;
