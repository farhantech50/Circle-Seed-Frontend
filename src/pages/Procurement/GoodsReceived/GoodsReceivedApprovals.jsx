import { useEffect, useState } from "react";
import { FaCheckSquare } from "react-icons/fa";
import useGoodsReceived from "../../../hooks/useGoodsReceived";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import { usePaginationStore } from "../../../store/paginationStore";
import DataTable from "../../../components/DataTable";
import showToast from "../../../utils/toast";
import ApprovalDecisionModal from "./ApprovalDecisionModal";
import { formatDhakaDate } from "../../../utils/dateUtils";

const GoodsReceivedApprovals = () => {
  const { getPendingApprovals, loading } = useGoodsReceived();

  const { triggerRefresh } = useTriggerRefreshStore();
  const { page, limit, search, setTotalData } = usePaginationStore();

  const [approvals, setApprovals] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchPendingApprovals();
  }, [page, limit, search, triggerRefresh]);

  const fetchPendingApprovals = async () => {
    const res = await getPendingApprovals();
    if (res.success) {
      const formattedData = (res.data?.data || res.data || []).map((item) => ({
        ...item,
        formattedReceivedDate: item.receivedDate
          ? formatDhakaDate(item.receivedDate)
          : "-",
        formattedCreatedAt: item.createdAt
          ? formatDhakaDate(item.createdAt)
          : "-",
      }));
      setApprovals(formattedData);
      setTotalData(res.data?.pagination?.total || res.data?.total || 0);
    } else {
      setApprovals([]);
      showToast(res.message, "error");
    }
  };

  const tableHead = [
    "SL",
    "Procurement ID",
    "Seed Type",
    "Received Quantity",
    "Received Date",
    "Notes",
    "Requested Date",
    "Action",
  ];

  const columnMapping = {
    "Procurement ID": "procurementId",
    "Seed Type": "seedType",
    "Received Quantity": "receivedQuantity",
    "Received Date": "formattedReceivedDate",
    Notes: "notes",
    "Requested Date": "formattedCreatedAt",
  };

  const columnAlignment = {
    SL: "left",
    "Procurement ID": "left",
    "Seed Type": "left",
    "Received Quantity": "center",
    "Received Date": "center",
    Notes: "left",
    "Requested Date": "center",
    Action: "center",
  };

  const ACTION_BUTTONS = [
    {
      show: () => true,
      icon: <FaCheckSquare className="w-5 h-5 text-primary-500" />,
      onClick: (row) => {
        setSelectedRequest(row);
        setOpen(true);
      },
      label: "Take Decision",
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <DataTable
        tableHead={tableHead}
        tableData={approvals}
        columnMapping={columnMapping}
        columnAlignment={columnAlignment}
        loading={loading}
        headerConfig={{
          title: "Goods Received Approvals",
          searchPlaceholder: "Search pending approvals...",
        }}
        actionButtonsConfig={ACTION_BUTTONS}
      />

      <ApprovalDecisionModal
        open={open}
        setOpen={setOpen}
        requestData={selectedRequest}
      />
    </div>
  );
};

export default GoodsReceivedApprovals;
