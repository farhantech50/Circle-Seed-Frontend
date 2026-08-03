import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBoxOpen, FaEye, FaCalendarAlt, FaRedo, FaArrowLeft, FaCalendarCheck } from "react-icons/fa";
import usePackagedSales from "../../../hooks/usePackagedSales";
import useInvoices from "../../../hooks/useInvoices";
import { usePaginationStore } from "../../../store/paginationStore";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import DataTable from "../../../components/DataTable";
import showToast from "../../../utils/toast";
import ViewPackagedSaleModal from "./ViewPackagedSaleModal";
import { formatDhakaDate } from "../../../utils/dateUtils";

const getTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const PackagedSalesOrdersHistory = () => {
  const navigate = useNavigate();
  const { getStakeholders } = usePackagedSales();
  const { getAllInvoices, loading } = useInvoices();
  const { page, limit, search, setTotalData } = usePaginationStore();
  const { triggerRefresh, setTriggerRefresh } = useTriggerRefreshStore();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [packagedOrders, setPackagedOrders] = useState([]);
  const [stakeholderMap, setStakeholderMap] = useState({});

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  useEffect(() => {
    fetchStakeholdersMap();
  }, []);

  const fetchStakeholdersMap = async () => {
    const res = await getStakeholders();
    if (res.success && Array.isArray(res.data)) {
      const map = {};
      res.data.forEach((s) => {
        map[s.id] = s.name || s.companyName || `Stakeholder #${s.id}`;
      });
      setStakeholderMap(map);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, limit, search, triggerRefresh, startDate, endDate, stakeholderMap]);

  const fetchOrders = async () => {
    const filters = {
      page,
      limit,
      search,
      orderType: "packaged",
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };

    const res = await getAllInvoices(filters);

    if (res.success) {
      const packagedItems = (res.data || []).filter(
        (item) => item.orderType === "packaged" || item.packagedSaleId !== null || item.packagedSale !== null
      );

      const formatted = packagedItems.map((item) => {
        const orderNo = item.packagedSale?.saleId || item.saleId || (item.packagedSaleId ? `PSL-${String(item.packagedSaleId).padStart(4, "0")}` : "-");
        const invoiceNo = item.invoiceId || (item.id ? `INV-${String(item.id).padStart(4, "0")}` : "-");

        const customer =
          item.packagedSale?.stakeholder?.name ||
          item.packagedSale?.stakeholder?.companyName ||
          item.stakeholder?.name ||
          item.stakeholderName ||
          stakeholderMap[item.stakeholderId] ||
          "Walk-in Customer";

        const netTotal = Number(item.totalAmount || item.packagedSale?.totalAmount || 0);
        const dueAmt = Number(item.dueAmount || 0);

        const rawPaidAmt =
          item.paidAmount !== undefined && item.paidAmount !== null && item.paidAmount !== ""
            ? Number(item.paidAmount)
            : Math.max(0, netTotal - dueAmt);

        const commissionObj = item.commission;
        const isCommissionAdjusted = commissionObj?.isAdjusted === true || String(commissionObj?.isAdjusted).toLowerCase() === "true" || commissionObj?.isAdjusted === 1;
        const commissionAmt = isCommissionAdjusted ? Number(commissionObj?.commissionAmount || 0) : 0;
        const paidAmt = isCommissionAdjusted ? Math.max(0, rawPaidAmt - commissionAmt) : rawPaidAmt;

        const commissionFormatted = isCommissionAdjusted ? (
          <span className="font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded text-xs font-mono" title={`Adjusted (${commissionObj?.commissionPercentage || 0}%)`}>
            ৳{commissionAmt.toLocaleString()}
          </span>
        ) : (
          <span className="text-slate-400 font-mono text-xs">-</span>
        );

        const paidFormatted = `৳${paidAmt.toLocaleString()}`;

        const statusValue =
          typeof item.status === "object" && item.status?.value
            ? item.status.value
            : typeof item.status === "string"
              ? item.status
              : "Paid";

        const dateFormatted = item.createdAt
          ? formatDhakaDate(item.createdAt)
          : item.date
            ? formatDhakaDate(item.date)
            : "-";

        return {
          ...item,
          status: statusValue,
          statusName: statusValue,
          orderNo,
          invoiceNo,
          customer,
          netTotalFormatted: `৳${netTotal.toLocaleString()}`,
          paidFormatted,
          commissionFormatted,
          dueFormatted: `৳${dueAmt.toLocaleString()}`,
          dateFormatted,
        };
      });

      setPackagedOrders(formatted);
      setTotalData(res.total || formatted.length);
    } else {
      setPackagedOrders([]);
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
    setTriggerRefresh();
  };

  const handleViewDetails = (row) => {
    setSelectedOrder(row);
    setReceiptOpen(true);
  };

  const tableHead = [
    "SL",
    "Order Ref",
    "Invoice No",
    "Stakeholder",
    "Net Total (BDT)",
    "Paid Amount (BDT)",
    "Commission (BDT)",
    "Due Amount (BDT)",
    "Status",
    "Order Date",
    "Action",
  ];

  const columnMapping = {
    "Order Ref": "orderNo",
    "Invoice No": "invoiceNo",
    Stakeholder: "customer",
    "Net Total (BDT)": "netTotalFormatted",
    "Paid Amount (BDT)": "paidFormatted",
    "Commission (BDT)": "commissionFormatted",
    "Due Amount (BDT)": "dueFormatted",
    Status: "statusName",
    "Order Date": "dateFormatted",
  };

  const columnAlignment = {
    SL: "center",
    "Order Ref": "left",
    "Invoice No": "left",
    Stakeholder: "left",
    "Net Total (BDT)": "right",
    "Paid Amount (BDT)": "right",
    "Commission (BDT)": "center",
    "Due Amount (BDT)": "right",
    Status: "center",
    "Order Date": "center",
    Action: "center",
  };

  const ACTION_BUTTONS = [
    {
      show: () => true,
      icon: <FaEye className="text-emerald-600 w-4 h-4 hover:scale-110 transition" title="View Order Details & Print Invoice" />,
      onClick: handleViewDetails,
      label: "View Order Details & Print Invoice",
    },
  ];

  return (
    <div className="flex flex-col gap-5 p-6 bg-slate-50 min-h-screen">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 text-emerald-700">
            <FaBoxOpen className="w-6 h-6" />
            <h1 className="text-2xl font-black tracking-tight text-slate-800">Packaged Sales Orders History</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            View, filter, and print invoices for all wholesale packaged sales transactions.
          </p>
        </div>

        <button
          onClick={() => navigate("/sales/packaged")}
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition transform active:scale-95"
        >
          <FaArrowLeft className="w-3.5 h-3.5 text-emerald-400" /> Go to Packaged Sales Register
        </button>
      </div>

      {/* Filters & Actions Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={handleSetTodayFilter}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
          >
            <FaCalendarCheck className="w-3.5 h-3.5" /> Today's Packaged Sales
          </button>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <FaCalendarAlt className="text-emerald-600" /> Date Filter:
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

          {(startDate || endDate) && (
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

      {/* Main DataTable Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-2">
        <DataTable
          headerConfig={{
            title: "Packaged Sales  History",
            searchPlaceholder: "Search packaged sales orders by Ref...",
          }}
          tableHead={tableHead}
          tableData={packagedOrders}
          columnMapping={columnMapping}
          columnAlignment={columnAlignment}
          actionButtonsConfig={ACTION_BUTTONS}
          loading={loading}
        />
      </div>

      {/* Printable Invoice & Order Details Modal */}
      <ViewPackagedSaleModal
        open={receiptOpen}
        setOpen={setReceiptOpen}
        orderData={selectedOrder}
      />
    </div>
  );
};

export default PackagedSalesOrdersHistory;
