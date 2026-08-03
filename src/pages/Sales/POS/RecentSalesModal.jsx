import React from "react";
import CustomModal from "../../../components/CustomModal";
import DataTableWithoutApiPagination from "../../../components/DataTableWithoutApiPagination";
import { FaEye } from "react-icons/fa";
import { formatDhakaDate } from "../../../utils/dateUtils";

const RecentSalesModal = ({ open, setOpen, salesHistory = [], onSelectOrder, loading = false }) => {
  const tableHead = [
    "SL",
    "POS ID",
    "Invoice ID",
    "Outlet",
    "Customer",
    "Grand Total (BDT)",
    "Status",
    "Date",
    "Action",
  ];

  const formattedData = salesHistory.map((order) => {
    const posOrderNo = order.posId || order.posOrderNo || (order.id ? `POS-${String(order.id).padStart(4, "0")}` : "POS");
    const invoiceId = order.invoice?.invoiceId || order.invoiceId || order.invoiceNo || (order.id ? `INV-${String(order.id).padStart(4, "0")}` : "INV");

    const grandTotal = Number(order.totalAmount || order.grandTotal || 0);

    const statusValue =
      typeof order.status === "object" && order.status?.value
        ? order.status.value
        : typeof order.status === "string"
        ? order.status
        : "Completed";

    const formattedDate = order.createdAt
      ? formatDhakaDate(order.createdAt)
      : order.date || "-";

    const locationName = order.location?.name || order.locationName || order.posLocation?.name || "-";

    return {
      ...order,
      status: statusValue,
      statusName: statusValue,
      posOrderNo,
      invoiceId,
      locationName,
      customer: order.customerName || "Walk-in Customer",
      formattedTotal: `৳${grandTotal.toLocaleString()}`,
      formattedDate,
    };
  });

  const columnMapping = {
    "POS ID": "posOrderNo",
    "Invoice ID": "invoiceId",
    "Outlet": "locationName",
    Customer: "customer",
    "Grand Total (BDT)": "formattedTotal",
    Status: "statusName",
    Date: "formattedDate",
  };

  const columnAlignment = {
    SL: "center",
    "POS ID": "left",
    "Invoice ID": "left",
    "Outlet": "left",
    Customer: "left",
    "Grand Total (BDT)": "right",
    Status: "center",
    Date: "center",
    Action: "center",
  };

  const actionButtonsConfig = [
    {
      icon: <FaEye className="text-emerald-600 hover:text-emerald-800 text-base transition transform hover:scale-110" title="View Order Details & Print Invoice" />,
      show: () => true,
      onClick: (row) => {
        onSelectOrder(row);
      },
    },
  ];

  const headerConfig = {
    title: "Recent POS Sales Orders",
    searchPlaceholder: "Search by Invoice # or Customer...",
  };

  return (
    <CustomModal
      open={open}
      setOpen={setOpen}
      header="Recent POS Sales History"
      maxWidth="max-w-5xl"
    >
      <div className="p-2 space-y-4">
        {formattedData.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-base font-medium">No sales recorded in this session yet.</p>
            <p className="text-xs text-gray-400 mt-1">Completed POS checkout invoices will appear here.</p>
          </div>
        ) : (
          <DataTableWithoutApiPagination
            tableHead={tableHead}
            tableData={formattedData}
            columnMapping={columnMapping}
            columnAlignment={columnAlignment}
            actionButtonsConfig={actionButtonsConfig}
            headerConfig={headerConfig}
            loading={loading}
          />
        )}
      </div>
    </CustomModal>
  );
};

export default RecentSalesModal;
