import React, { useEffect, useState, useCallback } from "react";
import { FaFileInvoiceDollar, FaMoneyBillWave, FaRedo, FaEye } from "react-icons/fa";
import usePartialInvoices from "../../../hooks/usePartialInvoices";
import DataTableWithoutApiPagination from "../../../components/DataTableWithoutApiPagination";
import RecordPaymentModal from "./RecordPaymentModal";
import ViewInvoiceModal from "../ViewInvoiceModal";
import showToast from "../../../utils/toast";

const PartialInvoices = () => {
  const { getPartialInvoices, recordInvoicePayment, loading, submittingPayment } = usePartialInvoices();

  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [viewInvoiceOpen, setViewInvoiceOpen] = useState(false);

  const fetchInvoicesList = useCallback(async () => {
    const res = await getPartialInvoices();
    if (res.success) {
      setInvoices(res.data || []);
    } else {
      showToast(res.message || "Failed to load due payments", "error");
    }
  }, [getPartialInvoices]);

  useEffect(() => {
    fetchInvoicesList();
  }, [fetchInvoicesList]);

  // Format table data for DataTableWithoutApiPagination
  const formattedTableData = invoices.map((item) => {
    const invoiceNo = item.invoiceId || (item.id ? `INV-${item.id}` : "-");
    const orderNo = item.orderNumber || "-";
    const orderTypeDisplay = item.orderType
      ? item.orderType.charAt(0).toUpperCase() + item.orderType.slice(1)
      : "-";
    const stakeholder = item.stakeholderName || item.stakeholder?.name || "N/A";

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
      commissionAmt,
      isCommissionAdjusted,
      totalFormatted: `৳${totalAmt.toLocaleString()}`,
      paidFormatted,
      commissionFormatted,
      dueFormatted: `৳${dueAmt.toLocaleString()}`,
    };
  });

  const totalDueSum = invoices.reduce(
    (sum, item) => sum + (Number(item.dueAmount) || 0),
    0
  );

  return (
    <div className="flex flex-col gap-5 p-6 bg-slate-50 min-h-screen">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 text-emerald-700">
            <FaFileInvoiceDollar className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-black tracking-tight text-slate-800">
              Due Payments
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            View and record payments for pending partial invoices.
          </p>
        </div>

        {/* Quick Stat Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-amber-50 border border-amber-200/80 px-4 py-2 rounded-xl text-right shadow-xs">
            <span className="text-[10px] uppercase font-bold text-amber-700 block tracking-wider">
              Pending Invoices
            </span>
            <span className="text-lg font-black text-amber-900">
              {invoices.length}
            </span>
          </div>

          <div className="bg-rose-50 border border-rose-200/80 px-4 py-2 rounded-xl text-right shadow-xs">
            <span className="text-[10px] uppercase font-bold text-rose-700 block tracking-wider">
              Total Outstanding Due
            </span>
            <span className="text-lg font-black text-rose-900">
              ৳{totalDueSum.toLocaleString()}
            </span>
          </div>

          <button
            type="button"
            onClick={fetchInvoicesList}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition shadow-xs disabled:opacity-50"
            title="Refresh Invoices List"
          >
            <FaRedo className={`w-3 h-3 text-emerald-600 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Table Content Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-2">
        {/* Data Table */}
        <DataTableWithoutApiPagination
          headerConfig={{
            title: "Due Invoices List",
            searchPlaceholder: "Search by Invoice ID, Order No, Stakeholder...",
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
            "Action",
          ]}
          tableData={formattedTableData}
          columnMapping={{
            "Invoice ID": "invoiceNo",
            "Order Ref": "orderNo",
            "Order Type": "orderTypeDisplay",
            Stakeholder: "stakeholder",
            "Net Total (BDT)": "totalFormatted",
            "Paid Amount (BDT)": "paidFormatted",
            "Commission (BDT)": "commissionFormatted",
            "Due Amount (BDT)": "dueFormatted",
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
            {
              label: "Received Payment",
              icon: (
                <FaMoneyBillWave
                  className="text-emerald-600 hover:text-emerald-800 text-base transition transform hover:scale-110 cursor-pointer"
                  title="Received Payment"
                />
              ),
              show: () => true,
              onClick: (row) => {
                setSelectedInvoice(row);
                setPaymentModalOpen(true);
              },
            },
          ]}
          loading={loading}
        />
      </div>

      {/* View Full Invoice Modal */}
      <ViewInvoiceModal
        open={viewInvoiceOpen}
        setOpen={setViewInvoiceOpen}
        orderData={selectedInvoice}
        invoiceId={selectedInvoice?.invoiceId || selectedInvoice?.id}
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        open={paymentModalOpen}
        setOpen={setPaymentModalOpen}
        invoiceData={selectedInvoice}
        onPaymentSuccess={fetchInvoicesList}
        recordInvoicePayment={recordInvoicePayment}
        submitting={submittingPayment}
      />
    </div>
  );
};

export default PartialInvoices;
