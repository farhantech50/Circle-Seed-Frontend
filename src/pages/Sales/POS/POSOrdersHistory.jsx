import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCashRegister, FaEye, FaCalendarAlt, FaRedo, FaCalendarCheck, FaArrowLeft, FaStore } from "react-icons/fa";
import usePOS from "../../../hooks/usePOS";
import usePOSLocation from "../../../hooks/usePOSLocation";
import { usePaginationStore } from "../../../store/paginationStore";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import DataTable from "../../../components/DataTable";
import showToast from "../../../utils/toast";
import ReceiptModal from "./ReceiptModal";
import { formatDhakaDate } from "../../../utils/dateUtils";

const getTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const POSOrdersHistory = () => {
  const navigate = useNavigate();
  const posHook = usePOS();
  const getPOSOrders = posHook?.getPOSOrders;
  const loading = posHook?.loading || false;
  const { getPOSLocations } = usePOSLocation();
  const { page, limit, search, setTotalData } = usePaginationStore();
  const { triggerRefresh, setTriggerRefresh } = useTriggerRefreshStore();

  // Location & Date Filters
  const [posLocations, setPosLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  // Fetch POS Locations list for filter dropdown
  useEffect(() => {
    const fetchLocationsList = async () => {
      const res = await getPOSLocations();
      if (res.success) {
        setPosLocations(res.data || []);
      }
    };
    fetchLocationsList();
  }, [getPOSLocations]);

  useEffect(() => {
    if (typeof getPOSOrders === "function") {
      fetchOrders();
    }
  }, [page, limit, search, triggerRefresh, startDate, endDate, selectedLocationId, getPOSOrders]);

  const fetchOrders = async () => {
    if (typeof getPOSOrders !== "function") {
      console.warn("getPOSOrders is not yet available on usePOS hook");
      return;
    }

    const filters = {
      page,
      limit,
      search,
      locationId: selectedLocationId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };

    const res = await getPOSOrders(filters);

    if (res.success) {
      const formatted = (res.data || []).map((item) => {
        const posOrderNo = item.posId || item.orderNo || `POS-${String(item.id).padStart(4, "0")}`;
        const invoiceNo = item.invoice?.invoiceId || item.invoiceNo || `INV-${String(item.id).padStart(4, "0")}`;

        const customer = item.customerName || "Walk-in Customer";
        const contact = item.customerContact || "-";
        const paymentMethodName = item.paymentMethod?.value || item.paymentMethodName || "Cash";
        const cashierName = item.createdBy?.fullName || "Cashier";
        const cashierEmployeeId = item.createdBy?.employeeId || "-";

        const itemsList = Array.isArray(item.items) ? item.items : [];
        const totalItemsCount = itemsList.reduce((acc, i) => acc + Number(i.quantity || 0), 0);

        const seedNamesList = itemsList
          .map((i) => i.packagedInventory?.seedType?.value || i.packagedInventory?.seedType?.name || i.seedTypeName || i.name)
          .filter(Boolean);

        const seedItemsDisplay = seedNamesList.length > 0 ? Array.from(new Set(seedNamesList)).join(", ") : "Packaged Item";

        const subtotal = Number(item.subtotal || 0);

        let discountAmt = 0;
        const discountType = item.discountType || "flat";
        const discountValue = Number(item.discountValue || 0);

        if (discountType === "percentage" || discountType === "percent") {
          discountAmt = (subtotal * discountValue) / 100;
        } else {
          discountAmt = discountValue;
        }

        const netTotal = Number(item.totalAmount || item.grandTotal || Math.max(0, subtotal - discountAmt));

        // Extract status value directly from backend response: item.status.value
        const statusValue =
          typeof item.status === "object" && item.status?.value
            ? item.status.value
            : typeof item.status === "string"
            ? item.status
            : "Completed";

        const formattedDate = item.createdAt
          ? formatDhakaDate(item.createdAt)
          : item.date
          ? formatDhakaDate(item.date)
          : "-";

        const locationName = item.location?.name || item.locationName || item.posLocation?.name || "-";

        return {
          ...item,
          status: statusValue,
          statusName: statusValue,
          posOrderNo,
          invoiceNo,
          locationName,
          customer,
          contact,
          paymentMethodName,
          cashierName,
          cashierEmployeeId,
          seedItemsDisplay,
          totalItemsDisplay: `${totalItemsCount} Pcs`,
          subtotalFormatted: `৳${subtotal.toLocaleString()}`,
          discountFormatted: discountAmt > 0 ? `৳${discountAmt.toLocaleString()}` : "0",
          formattedTotal: `৳${netTotal.toLocaleString()}`,
          formattedDate,
        };
      });

      setOrders(formatted);
      setTotalData(res.total !== undefined ? res.total : formatted.length);
    } else {
      setOrders([]);
      setTotalData(0);
      showToast(res.message, "error");
    }
  };

  const handleSetTodayFilter = () => {
    const today = getTodayDate();
    setStartDate(today);
    setEndDate(today);
  };

  const handleResetFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedLocationId("");
    setTriggerRefresh();
  };

  const handleViewReceipt = (row) => {
    setSelectedOrder(row);
    setReceiptOpen(true);
  };

  // Essential columns only for clear & clean table layout
  const tableHead = [
    "SL",
    "POS ID",
    "Invoice ID",
    "Outlet",
    "Customer",
    "Total Amount (BDT)",
    "Status",
    "Date",
    "Action",
  ];

  const columnMapping = {
    "POS ID": "posOrderNo",
    "Invoice ID": "invoiceNo",
    "Outlet": "locationName",
    Customer: "customer",
    "Total Amount (BDT)": "formattedTotal",
    Status: "statusName",
    Date: "formattedDate",
  };

  const columnAlignment = {
    SL: "center",
    "POS ID": "left",
    "Invoice ID": "left",
    "Outlet": "left",
    Customer: "left",
    "Total Amount (BDT)": "right",
    Status: "center",
    Date: "center",
    Action: "center",
  };

  // Single View Action button opens details modal with full summary & print option
  const actionButtonsConfig = [
    {
      label: "View Details & Print",
      icon: <FaEye className="text-emerald-600 hover:text-emerald-800 text-base transition transform hover:scale-110" title="View Full Order Details & Print Invoice" />,
      show: () => true,
      onClick: (row) => handleViewReceipt(row),
    },
  ];

  return (
    <div className="flex flex-col gap-5 p-6 bg-slate-50 min-h-screen">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 text-emerald-700">
            <FaCashRegister className="w-6 h-6" />
            <h1 className="text-2xl font-black tracking-tight text-slate-800">POS Sales Orders History</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            View, filter, and print receipts for all completed POS sales transactions.
          </p>
        </div>

        <button
          onClick={() => navigate("/sales/pos")}
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition transform active:scale-95"
        >
          <FaArrowLeft className="w-3.5 h-3.5 text-emerald-400" /> Back to POS Terminal
        </button>
      </div>

      {/* POS Quick Today, Location & Date Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={handleSetTodayFilter}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
          >
            <FaCalendarCheck className="w-3.5 h-3.5" /> Today's POS Sales
          </button>

          {/* Location / Outlet Filter */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <FaStore className="text-emerald-600" /> Location:
          </div>
          <select
            value={selectedLocationId}
            onChange={(e) => setSelectedLocationId(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700 font-semibold focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All Outlets</option>
            {posLocations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 ml-1">
            <FaCalendarAlt className="text-emerald-600" /> Date:
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none"
          />

          {(startDate || endDate || selectedLocationId) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              <FaRedo className="w-3 h-3" /> Clear Filters
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setTriggerRefresh()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
        >
          <FaRedo className="w-3 h-3" /> Refresh Table
        </button>
      </div>

      {/* Main DataTable Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-2">
        <DataTable
          headerConfig={{
            title: "POS Sales History",
            searchPlaceholder: "Search POS orders by Order ID, Invoice, Customer...",
          }}
          tableHead={tableHead}
          tableData={orders}
          columnMapping={columnMapping}
          columnAlignment={columnAlignment}
          actionButtonsConfig={actionButtonsConfig}
          loading={loading}
        />
      </div>

      {/* Printable Receipt & Full Order Details Modal */}
      <ReceiptModal
        open={receiptOpen}
        setOpen={setReceiptOpen}
        orderData={selectedOrder}
      />
    </div>
  );
};

export default POSOrdersHistory;
