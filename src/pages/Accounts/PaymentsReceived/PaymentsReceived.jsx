import React, { useEffect, useState, useCallback } from "react";
import { FaHandHoldingUsd, FaRedo, FaEye, FaFilter, FaTimes } from "react-icons/fa";
import usePaymentsReceived from "../../../hooks/usePaymentsReceived";
import DataTable from "../../../components/DataTable";
import ViewPaymentReceivedModal from "./ViewPaymentReceivedModal";
import { usePaginationStore } from "../../../store/paginationStore";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import showToast from "../../../utils/toast";
import { formatDhakaDate } from "../../../utils/dateUtils";

const PaymentsReceived = () => {
  const { getPaymentsReceived, loading } = usePaymentsReceived();
  const { page, limit, search, setTotalData } = usePaginationStore();
  const { triggerRefresh } = useTriggerRefreshStore();

  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Date Filter States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchPaymentsList = useCallback(async () => {
    const filters = {
      page,
      limit,
      ...(search ? { search, invoiceId: search } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
    };

    const res = await getPaymentsReceived(filters);
    if (res.success) {
      setPayments(res.data || []);
      setTotalData(res.total || 0);
    } else {
      setPayments([]);
      setTotalData(0);
      showToast(res.message || "Failed to load payments received", "error");
    }
  }, [getPaymentsReceived, page, limit, search, startDate, endDate, setTotalData]);

  useEffect(() => {
    fetchPaymentsList();
  }, [fetchPaymentsList, triggerRefresh]);

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  // Format table data for DataTable with API pagination
  const formattedTableData = payments.map((item) => {
    const invoiceNo = item.invoice?.invoiceId || (item.invoiceId ? `INV-${item.invoiceId}` : "-");
    const orderRef =
      item.invoice?.orderRef ||
      item.invoice?.posOrder?.orderNumber ||
      item.invoice?.bulkSale?.saleId ||
      item.invoice?.packagedSale?.saleId ||
      "-";
    const paymentMethodVal = item.paymentMethod?.value || item.paymentMethodValue || "Cash";
    const receivedByName = item.receivedBy?.fullName || item.receivedByName || "System";
    const receivedAmount = Number(item.amount || 0);

    const invoiceTotal = item.invoice?.totalAmount !== undefined ? Number(item.invoice.totalAmount) : null;
    const invoiceDue = item.invoice?.dueAmount !== undefined ? Number(item.invoice.dueAmount) : null;
    const statusVal = item.invoice?.status?.value || "Completed";

    const formattedDate = item.createdAt ? formatDhakaDate(item.createdAt) : "-";

    return {
      ...item,
      invoiceNo,
      orderRef,
      paymentMethodVal,
      receivedByName,
      statusVal,
      formattedDate,
      amountFormatted: `৳${receivedAmount.toLocaleString()}`,
      invoiceTotalFormatted: invoiceTotal !== null ? `৳${invoiceTotal.toLocaleString()}` : "-",
      invoiceDueFormatted: invoiceDue !== null ? `৳${invoiceDue.toLocaleString()}` : "-",
    };
  });

  const totalAmountReceivedSum = payments.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  return (
    <div className="flex flex-col gap-5 p-6 bg-slate-50 min-h-screen">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 text-emerald-700">
            <FaHandHoldingUsd className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-black tracking-tight text-slate-800">
              Payments Received
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            View customer payment history recorded for sales invoices.
          </p>
        </div>

        {/* Quick Stat Badges & Actions */}
        <div className="flex items-center gap-3 flex-nowrap overflow-x-auto shrink-0 whitespace-nowrap py-1">
          <div className="bg-emerald-50 border border-emerald-200/80 px-4 py-2 rounded-xl text-right shadow-xs shrink-0">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider">
              Total Payments
            </span>
            <span className="text-lg font-black text-emerald-900">
              {payments.length}
            </span>
          </div>

          <div className="bg-teal-50 border border-teal-200/80 px-4 py-2 rounded-xl text-right shadow-xs shrink-0">
            <span className="text-[10px] uppercase font-bold text-teal-700 block tracking-wider">
              Amount Received (Current Page)
            </span>
            <span className="text-lg font-black text-teal-900">
              ৳{totalAmountReceivedSum.toLocaleString()}
            </span>
          </div>

          <button
            type="button"
            onClick={fetchPaymentsList}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition shadow-xs disabled:opacity-50 shrink-0"
            title="Refresh Payments List"
          >
            <FaRedo className={`w-3 h-3 text-emerald-600 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <FaFilter className="text-emerald-600" /> Date Filters
          </div>
          {(startDate || endDate) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 transition"
            >
              <FaTimes className="w-3 h-3" /> Clear Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Start Date Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* End Date Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Table Content Card with API Pagination */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <DataTable
          headerConfig={{
            title: "Payments Received History",
            searchPlaceholder: "Search payments received...",
          }}
          tableHead={[
            "SL",
            "Invoice No",
            "Order Ref",
            "Amount Received (BDT)",
            "Invoice Total (BDT)",
            "Invoice Due (BDT)",
            "Status",
            "Payment Method",
            "Received By",
            "Date",
            "Action",
          ]}
          tableData={formattedTableData}
          columnMapping={{
            "Invoice No": "invoiceNo",
            "Order Ref": "orderRef",
            "Amount Received (BDT)": "amountFormatted",
            "Invoice Total (BDT)": "invoiceTotalFormatted",
            "Invoice Due (BDT)": "invoiceDueFormatted",
            Status: "statusVal",
            "Payment Method": "paymentMethodVal",
            "Received By": "receivedByName",
            Date: "formattedDate",
          }}
          columnAlignment={{
            SL: "center",
            "Invoice No": "left",
            "Order Ref": "left",
            "Amount Received (BDT)": "right",
            "Invoice Total (BDT)": "right",
            "Invoice Due (BDT)": "right",
            Status: "center",
            "Payment Method": "center",
            "Received By": "left",
            Date: "center",
            Action: "center",
          }}
          actionButtonsConfig={[
            {
              label: "View Payment Details",
              icon: (
                <FaEye
                  className="text-emerald-600 hover:text-emerald-800 text-base transition transform hover:scale-110"
                  title="View Payment Details"
                />
              ),
              show: () => true,
              onClick: (row) => {
                setSelectedPayment(row);
                setViewModalOpen(true);
              },
            },
          ]}
          loading={loading}
        />
      </div>

      {/* View Payment Received Modal */}
      <ViewPaymentReceivedModal
        open={viewModalOpen}
        setOpen={setViewModalOpen}
        paymentData={selectedPayment}
      />
    </div>
  );
};

export default PaymentsReceived;
