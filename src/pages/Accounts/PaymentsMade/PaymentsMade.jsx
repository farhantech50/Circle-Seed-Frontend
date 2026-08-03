import React, { useEffect, useState, useCallback } from "react";
import { FaMoneyCheckAlt, FaPlus, FaRedo, FaEye, FaFilter, FaTimes } from "react-icons/fa";
import useProcurementPayments from "../../../hooks/useProcurementPayments";
import DataTable from "../../../components/DataTable";
import SearchableSelect from "../../../components/SearchableSelect";
import CreateProcurementPaymentModal from "./CreateProcurementPaymentModal";
import ViewProcurementPaymentModal from "./ViewProcurementPaymentModal";
import { usePaginationStore } from "../../../store/paginationStore";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import api from "../../../config/api";
import showToast from "../../../utils/toast";
import { formatDhakaDate } from "../../../utils/dateUtils";

const PaymentsMade = () => {
  const {
    getProcurementPayments,
    createProcurementPayment,
    getDueProcurementOrders,
    loading,
  } = useProcurementPayments();

  const { page, limit, search, setTotalData } = usePaginationStore();
  const { triggerRefresh } = useTriggerRefreshStore();

  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Filter States
  const [procurementOrderId, setProcurementOrderId] = useState("");
  const [stakeholderId, setStakeholderId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [stakeholders, setStakeholders] = useState([]);
  const [procurementOrders, setProcurementOrders] = useState([]);
  const [filtersLoading, setFiltersLoading] = useState(false);

  // Load Stakeholders & Procurement Orders lists for filter dropdowns
  useEffect(() => {
    const fetchFilterOptions = async () => {
      setFiltersLoading(true);
      try {
        const [stkRes, procRes] = await Promise.all([
          api.get("/api/stakeholders"),
          getDueProcurementOrders(),
        ]);

        let stkList = [];
        if (Array.isArray(stkRes.data)) stkList = stkRes.data;
        else if (stkRes.data?.data && Array.isArray(stkRes.data.data)) stkList = stkRes.data.data;
        setStakeholders(stkList);

        if (procRes.success && Array.isArray(procRes.data)) {
          setProcurementOrders(procRes.data);
        }
      } catch (err) {
        console.error("Error fetching filter options:", err);
      }
      setFiltersLoading(false);
    };
    fetchFilterOptions();
  }, []);

  const fetchPaymentsList = useCallback(async () => {
    const activeProcurementId = search || procurementOrderId;

    const filters = {
      page,
      limit,
      ...(search ? { search } : {}),
      ...(activeProcurementId ? { procurementOrderId: activeProcurementId } : {}),
      ...(stakeholderId ? { stakeholderId } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
    };

    const res = await getProcurementPayments(filters);
    if (res.success) {
      setPayments(res.data || []);
      setTotalData(res.total || 0);
    } else {
      setPayments([]);
      setTotalData(0);
      showToast(res.message || "Failed to load procurement payments", "error");
    }
  }, [getProcurementPayments, page, limit, search, procurementOrderId, stakeholderId, startDate, endDate, setTotalData]);

  useEffect(() => {
    fetchPaymentsList();
  }, [fetchPaymentsList, triggerRefresh]);

  const handleClearFilters = () => {
    setProcurementOrderId("");
    setStakeholderId("");
    setStartDate("");
    setEndDate("");
  };

  // Format table data for DataTable with API pagination
  const formattedTableData = payments.map((item) => {
    const orderNo = item.procurementOrder?.procurementId || (item.procurementOrderId ? `PRC-${item.procurementOrderId}` : "-");
    const supplierName = item.stakeholder?.name || item.stakeholderName || "-";
    const supplierId = item.stakeholder?.stakeholderId || item.stakeholderCode || "";

    const paymentMethodVal = item.paymentMethod?.value || item.paymentMethodValue || "Cash";
    const paidByName = item.paidBy?.fullName || item.paidByName || "System";
    const paidAmount = Number(item.amount || 0);

    const orderTotal = item.procurementOrder?.totalAmount !== undefined ? Number(item.procurementOrder.totalAmount) : null;
    const orderDue = item.procurementOrder?.dueAmount !== undefined ? Number(item.procurementOrder.dueAmount) : null;

    const formattedDate = item.createdAt ? formatDhakaDate(item.createdAt) : "-";

    return {
      ...item,
      orderNo,
      supplierName,
      supplierId,
      paymentMethodVal,
      paidByName,
      formattedDate,
      amountFormatted: `৳${paidAmount.toLocaleString()}`,
      orderTotalFormatted: orderTotal !== null ? `৳${orderTotal.toLocaleString()}` : "-",
      orderDueFormatted: orderDue !== null ? `৳${orderDue.toLocaleString()}` : "-",
    };
  });

  const totalAmountPaidSum = payments.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  return (
    <div className="flex flex-col gap-5 p-6 bg-slate-50 min-h-screen">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 text-emerald-700">
            <FaMoneyCheckAlt className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-black tracking-tight text-slate-800">
              Payments Made
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track and record supplier payments for procurement orders.
          </p>
        </div>

        {/* Quick Stat Badges & Refresh */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-emerald-50 border border-emerald-200/80 px-4 py-2 rounded-xl text-right shadow-xs">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider">
              Total Payments
            </span>
            <span className="text-lg font-black text-emerald-900">
              {payments.length}
            </span>
          </div>

          <div className="bg-blue-50 border border-blue-200/80 px-4 py-2 rounded-xl text-right shadow-xs">
            <span className="text-[10px] uppercase font-bold text-blue-700 block tracking-wider">
              Amount Paid (Current Page)
            </span>
            <span className="text-lg font-black text-blue-900">
              ৳{totalAmountPaidSum.toLocaleString()}
            </span>
          </div>

          <button
            type="button"
            onClick={fetchPaymentsList}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition shadow-xs disabled:opacity-50"
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
            <FaFilter className="text-emerald-600" /> Filter Options
          </div>
          {(procurementOrderId || stakeholderId || startDate || endDate) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 transition"
            >
              <FaTimes className="w-3 h-3" /> Clear Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs items-end">
          {/* Procurement Order Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Procurement Order
            </label>
            <SearchableSelect
              options={procurementOrders}
              value={procurementOrderId}
              onChange={setProcurementOrderId}
              placeholder={filtersLoading ? "Loading..." : "Select Procurement Order"}
              getOptionLabel={(proc) => `${proc.procurementId || `PRC-${proc.id}`} ${proc.stakeholder?.name ? `(${proc.stakeholder.name})` : ""}`}
              getOptionValue={(proc) => proc.id}
            />
          </div>

          {/* Stakeholder Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Stakeholder / Supplier
            </label>
            <SearchableSelect
              options={stakeholders}
              value={stakeholderId}
              onChange={setStakeholderId}
              placeholder={filtersLoading ? "Loading..." : "Select Stakeholder"}
              getOptionLabel={(stk) => `${stk.name} ${stk.stakeholderId ? `(${stk.stakeholderId})` : ""}`}
              getOptionValue={(stk) => stk.id}
            />
          </div>

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

          {/* Make Payment Button inside Filter Options */}
          <div>
            <label className="block text-[11px] font-semibold text-transparent mb-1 select-none">
              Action
            </label>
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition transform hover:scale-[1.01]"
            >
              <FaPlus className="w-3.5 h-3.5" />
              Make Payment
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Content Card with API Pagination */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <DataTable
          headerConfig={{
            title: "Payments Made History",
            searchPlaceholder: "Search payments made...",
          }}
          tableHead={[
            "SL",
            "Order No",
            "Supplier Name",
            "Amount Paid (BDT)",
            "Order Total (BDT)",
            "Order Due (BDT)",
            "Payment Method",
            "Paid By",
            "Date",
            "Action",
          ]}
          tableData={formattedTableData}
          columnMapping={{
            "Order No": "orderNo",
            "Supplier Name": "supplierName",
            "Amount Paid (BDT)": "amountFormatted",
            "Order Total (BDT)": "orderTotalFormatted",
            "Order Due (BDT)": "orderDueFormatted",
            "Payment Method": "paymentMethodVal",
            "Paid By": "paidByName",
            Date: "formattedDate",
          }}
          columnAlignment={{
            SL: "center",
            "Order No": "left",
            "Supplier Name": "left",
            "Amount Paid (BDT)": "right",
            "Order Total (BDT)": "right",
            "Order Due (BDT)": "right",
            "Payment Method": "center",
            "Paid By": "left",
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

      {/* Record Procurement Payment Modal */}
      <CreateProcurementPaymentModal
        open={createModalOpen}
        setOpen={setCreateModalOpen}
        onSuccess={fetchPaymentsList}
        onPaymentSuccess={fetchPaymentsList}
        createPayment={createProcurementPayment}
        createProcurementPayment={createProcurementPayment}
        submitting={loading}
      />

      {/* View Procurement Payment Details Modal */}
      <ViewProcurementPaymentModal
        open={viewModalOpen}
        setOpen={setViewModalOpen}
        paymentData={selectedPayment}
      />
    </div>
  );
};

export default PaymentsMade;
