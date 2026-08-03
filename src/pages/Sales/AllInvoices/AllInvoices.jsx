import React, { useEffect, useState, useCallback } from "react";
import { FaFileInvoiceDollar, FaEye, FaMoneyBillWave, FaCalendarAlt, FaRedo, FaSearch, FaFilter, FaCalendarCheck, FaUser } from "react-icons/fa";
import useInvoices from "../../../hooks/useInvoices";
import useLookUp from "../../../hooks/useLookup";
import useBulkSales from "../../../hooks/useBulkSales";
import { usePaginationStore } from "../../../store/paginationStore";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import DataTable from "../../../components/DataTable";
import showToast from "../../../utils/toast";
import ViewInvoiceModal from "../ViewInvoiceModal";
import RecordPaymentModal from "../PartialInvoices/RecordPaymentModal";
import { formatDhakaDate } from "../../../utils/dateUtils";

const getTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const AllInvoices = () => {
  const { getAllInvoices, recordInvoicePayment, loading, submittingPayment } = useInvoices();
  const { getLookup } = useLookUp();
  const { getStakeholders } = useBulkSales();
  const { page, limit, search, setTotalData } = usePaginationStore();
  const { triggerRefresh, setTriggerRefresh } = useTriggerRefreshStore();

  // Query Filter States matching API specification (id, statusId, stakeholderId, startDate, endDate)
  const [statusIdFilter, setStatusIdFilter] = useState("");
  const [stakeholderIdFilter, setStakeholderIdFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [statusOptions, setStatusOptions] = useState([]);
  const [stakeholderOptions, setStakeholderOptions] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // Modal States
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [viewInvoiceOpen, setViewInvoiceOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // Fetch status and stakeholder lookup options
  useEffect(() => {
    fetchStatusOptions();
    fetchStakeholderOptions();
  }, []);

  const fetchStatusOptions = async () => {
    const res = await getLookup("invoice_status");
    if (res.success && Array.isArray(res.data)) {
      setStatusOptions(res.data);
    }
  };

  const fetchStakeholderOptions = async () => {
    const res = await getStakeholders();
    if (res.success && Array.isArray(res.data)) {
      setStakeholderOptions(res.data);
    }
  };

  // Fetch invoices list whenever query filters change
  const fetchInvoices = useCallback(async () => {
    const filters = {
      page,
      limit,
      search: search || undefined,
      statusId: statusIdFilter || undefined,
      stakeholderId: stakeholderIdFilter || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };

    const res = await getAllInvoices(filters);
    if (res.success) {
      const formatted = (res.data || []).map((item) => {
        const invoiceNo = item.invoiceId || (item.id ? `INV-${item.id}` : "-");
        const orderNo =
          item.bulkSale?.saleId ||
          item.packagedSale?.saleId ||
          item.posOrder?.posId ||
          item.orderNumber ||
          "-";

        const orderTypeDisplay = item.orderType
          ? item.orderType.charAt(0).toUpperCase() + item.orderType.slice(1)
          : "-";

        const stakeholder =
          item.bulkSale?.stakeholder?.name ||
          item.packagedSale?.stakeholder?.name ||
          item.stakeholderName ||
          item.posOrder?.customerName ||
          item.customerName ||
          "Walk-in Customer";

        const totalAmt = Number(item.totalAmount || 0);
        const dueAmt = Number(item.dueAmount || 0);
        const rawPaidAmt =
          item.paidAmount !== undefined &&
          item.paidAmount !== null &&
          item.paidAmount !== ""
            ? Number(item.paidAmount)
            : Math.max(0, totalAmt - dueAmt);

        const commissionObj = item.commission;
        const isCommissionAdjusted = commissionObj?.isAdjusted === true;
        const commissionAmt = isCommissionAdjusted ? Number(commissionObj?.commissionAmount || 0) : 0;
        const paidAmt = isCommissionAdjusted ? Math.max(0, rawPaidAmt - commissionAmt) : rawPaidAmt;

        const statusDisplay =
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

        const commissionFormatted = isCommissionAdjusted ? (
          <span className="font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded text-xs font-mono" title={`Adjusted (${commissionObj?.commissionPercentage || 0}%)`}>
            ৳{commissionAmt.toLocaleString()}
          </span>
        ) : (
          <span className="text-slate-400 font-mono text-xs">-</span>
        );

        const paidFormatted = `৳${paidAmt.toLocaleString()}`;

        return {
          ...item,
          invoiceNo,
          orderNo,
          orderTypeDisplay,
          stakeholder,
          totalAmt,
          paidAmt,
          dueAmt,
          commissionAmt,
          isCommissionAdjusted,
          statusDisplay,
          totalFormatted: `৳${totalAmt.toLocaleString()}`,
          paidFormatted,
          commissionFormatted,
          dueFormatted: `৳${dueAmt.toLocaleString()}`,
          dateFormatted,
        };
      });

      setInvoices(formatted);
      setTotalData(res.total !== undefined ? res.total : formatted.length);
    } else {
      setInvoices([]);
      setTotalData(0);
      showToast(res.message || "Failed to load invoices", "error");
    }
  }, [page, limit, search, statusIdFilter, stakeholderIdFilter, startDate, endDate, getAllInvoices, setTotalData]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices, triggerRefresh]);

  const handleSetTodayFilter = () => {
    const today = getTodayDate();
    setStartDate(today);
    setEndDate(today);
  };

  const handleResetFilters = () => {
    setStatusIdFilter("");
    setStakeholderIdFilter("");
    setStartDate("");
    setEndDate("");
    setTriggerRefresh();
  };

  return (
    <div className="flex flex-col gap-5 p-6 bg-slate-50 min-h-screen">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 text-emerald-700">
            <FaFileInvoiceDollar className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-black tracking-tight text-slate-800">
              All Sales Invoices
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse, search, and manage all invoices across POS, Bulk, and Packaged sales.
          </p>
        </div>

        {/* Quick Filter Shortcut Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleSetTodayFilter}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition shadow-xs"
          >
            <FaCalendarCheck className="w-3.5 h-3.5" /> Today's Invoices
          </button>

          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition shadow-xs"
          >
            <FaRedo className={`w-3 h-3 text-emerald-600 ${loading ? "animate-spin" : ""}`} /> Reset Filters
          </button>
        </div>
      </div>

      {/* Filter Controls Bar matching API Query Specification */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 border-b border-slate-100 pb-2">
          <FaFilter className="text-emerald-600" /> Query & Filter Controls
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* 1. Filter by Status ID (statusId) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Status (statusId)
            </label>
            <select
              value={statusIdFilter}
              onChange={(e) => setStatusIdFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              {statusOptions.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.value || st.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Filter by Stakeholder / Customer (stakeholderId) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Stakeholder (stakeholderId)
            </label>
            <select
              value={stakeholderIdFilter}
              onChange={(e) => setStakeholderIdFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All Stakeholders</option>
              {stakeholderOptions.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name || st.companyName || `Stakeholder #${st.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Start Date (startDate) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* 4. End Date (endDate) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Datatable Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <DataTable
          headerConfig={{
            title: "Sales Invoices List",
            searchPlaceholder: "Search invoices by ID",
          }}
          tableHead={[
            "SL",
            "Invoice ID",
            "Order Ref",
            "Order Type",
            "Stakeholder",
            "Net Total (BDT)",
            "Paid Amount (BDT)",
            "Commission (BDT)",
            "Due Amount (BDT)",
            "Status",
            "Date",
            "Action",
          ]}
          tableData={invoices}
          columnMapping={{
            "Invoice ID": "invoiceNo",
            "Order Ref": "orderNo",
            "Order Type": "orderTypeDisplay",
            Stakeholder: "stakeholder",
            "Net Total (BDT)": "totalFormatted",
            "Paid Amount (BDT)": "paidFormatted",
            "Commission (BDT)": "commissionFormatted",
            "Due Amount (BDT)": "dueFormatted",
            Status: "statusDisplay",
            Date: "dateFormatted",
          }}
          columnAlignment={{
            SL: "center",
            "Invoice ID": "left",
            "Order Ref": "left",
            "Order Type": "center",
            Stakeholder: "left",
            "Net Total (BDT)": "right",
            "Paid Amount (BDT)": "right",
            "Commission (BDT)": "center",
            "Due Amount (BDT)": "right",
            Status: "center",
            Date: "center",
            Action: "center",
          }}
          actionButtonsConfig={[
            {
              label: "View Invoice Details",
              icon: (
                <FaEye
                  className="text-emerald-600 hover:text-emerald-800 text-base transition transform hover:scale-110"
                  title="View Invoice Details"
                />
              ),
              show: () => true,
              onClick: (row) => {
                setSelectedInvoice(row);
                setViewInvoiceOpen(true);
              },
            },
          ]}
          loading={loading}
        />
      </div>

      {/* View Full Invoice Details Modal */}
      <ViewInvoiceModal
        open={viewInvoiceOpen}
        setOpen={setViewInvoiceOpen}
        orderData={selectedInvoice}
        invoiceId={selectedInvoice?.id || selectedInvoice?.invoice?.id}
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        open={paymentModalOpen}
        setOpen={setPaymentModalOpen}
        invoiceData={selectedInvoice}
        onPaymentSuccess={fetchInvoices}
        recordInvoicePayment={recordInvoicePayment}
        submitting={submittingPayment}
      />
    </div>
  );
};

export default AllInvoices;
