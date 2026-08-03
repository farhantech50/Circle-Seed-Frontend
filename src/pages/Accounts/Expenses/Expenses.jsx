import React, { useEffect, useState, useCallback } from "react";
import { FaReceipt, FaPlus, FaRedo, FaEye, FaEdit, FaFilter, FaTimes } from "react-icons/fa";
import useExpenses from "../../../hooks/useExpenses";
import DataTable from "../../../components/DataTable";
import CreateEditExpenseModal from "./CreateEditExpenseModal";
import ViewExpenseModal from "./ViewExpenseModal";
import { usePaginationStore } from "../../../store/paginationStore";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import showToast from "../../../utils/toast";
import useLookUp from "../../../hooks/useLookup";
import { formatDhakaDate } from "../../../utils/dateUtils";

const Expenses = () => {
  const { getExpenses, createExpense, updateExpense, loading } = useExpenses();
  const { getLookup } = useLookUp();
  const { page, limit, search, setTotalData } = usePaginationStore();
  const { triggerRefresh } = useTriggerRefreshStore();

  const [expenses, setExpenses] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [createEditModalOpen, setCreateEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Filter States
  const [categoryId, setCategoryId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [categories, setCategories] = useState([]);

  // Fetch Category Lookup for filter
  useEffect(() => {
    const fetchCategories = async () => {
      const res = await getLookup("expense_category");
      if (res.success) {
        const catData = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
        setCategories(catData);
      }
    };
    fetchCategories();
  }, []);

  const fetchExpensesList = useCallback(async () => {
    const filters = {
      page,
      limit,
      ...(search ? { search } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
    };

    const res = await getExpenses(filters);
    if (res.success) {
      setExpenses(res.data || []);
      setTotalData(res.total || 0);
    } else {
      setExpenses([]);
      setTotalData(0);
      showToast(res.message || "Failed to load expenses list", "error");
    }
  }, [getExpenses, page, limit, search, categoryId, startDate, endDate, setTotalData]);

  useEffect(() => {
    fetchExpensesList();
  }, [fetchExpensesList, triggerRefresh]);

  const handleClearFilters = () => {
    setCategoryId("");
    setStartDate("");
    setEndDate("");
  };

  const handleOpenEdit = (expense) => {
    setSelectedExpense(expense);
    setCreateEditModalOpen(true);
  };

  const handleOpenCreate = () => {
    setSelectedExpense(null);
    setCreateEditModalOpen(true);
  };

  // Format table data for DataTable with API pagination
  const formattedTableData = expenses.map((item) => {
    const categoryName = item.category?.value || item.categoryValue || "General";
    const paymentMethodVal = item.paymentMethod?.value || item.paymentMethodValue || "N/A";
    const createdByName = item.createdBy?.fullName || item.createdByName || "System";
    const expenseAmount = Number(item.amount || 0);
    const expenseDateFormatted = item.date ? formatDhakaDate(item.date) : "-";

    return {
      ...item,
      categoryName,
      paymentMethodVal,
      createdByName,
      expenseDateFormatted,
      amountFormatted: `৳${expenseAmount.toLocaleString()}`,
    };
  });

  const totalAmountSum = expenses.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  return (
    <div className="flex flex-col gap-5 p-6 bg-slate-50 min-h-screen">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 text-emerald-700">
            <FaReceipt className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-black tracking-tight text-slate-800">
              Expense Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track, record, and manage company operational and overhead expenses.
          </p>
        </div>

        {/* Quick Stat Badges & Refresh */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-emerald-50 border border-emerald-200/80 px-4 py-2 rounded-xl text-right shadow-xs">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider">
              Total Entries
            </span>
            <span className="text-lg font-black text-emerald-900">
              {expenses.length}
            </span>
          </div>

          <div className="bg-amber-50 border border-amber-200/80 px-4 py-2 rounded-xl text-right shadow-xs">
            <span className="text-[10px] uppercase font-bold text-amber-700 block tracking-wider">
              Total Expenses (Current Page)
            </span>
            <span className="text-lg font-black text-amber-900">
              ৳{totalAmountSum.toLocaleString()}
            </span>
          </div>

          <button
            type="button"
            onClick={fetchExpensesList}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition shadow-xs disabled:opacity-50"
            title="Refresh Expenses List"
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
          {(categoryId || startDate || endDate) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 transition"
            >
              <FaTimes className="w-3 h-3" /> Clear Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs items-end">
          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Expense Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            >
              <option value="">-- All Categories --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.value || cat.name}
                </option>
              ))}
            </select>
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
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
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
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Record Expense Button inside Filter Option Row */}
          <div>
            <label className="block text-[11px] font-semibold text-transparent mb-1 select-none">
              Action
            </label>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition transform hover:scale-[1.01]"
            >
              <FaPlus className="w-3.5 h-3.5" />
              Record Expense
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Content Card with API Pagination */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <DataTable
          headerConfig={{
            title: "Expense Ledger List",
            searchPlaceholder: "Search expense...",
          }}
          tableHead={[
            "SL",
            "Date",
            "Category",
            "Description",
            "Amount (BDT)",
            "Payment Method",
            "Created By",
            "Action",
          ]}
          tableData={formattedTableData}
          columnMapping={{
            Date: "expenseDateFormatted",
            Category: "categoryName",
            Description: "description",
            "Amount (BDT)": "amountFormatted",
            "Payment Method": "paymentMethodVal",
            "Created By": "createdByName",
          }}
          columnAlignment={{
            SL: "center",
            Date: "center",
            Category: "left",
            Description: "left",
            "Amount (BDT)": "right",
            "Payment Method": "center",
            "Created By": "left",
            Action: "center",
          }}
          actionButtonsConfig={[
            {
              label: "View Expense Details",
              icon: (
                <FaEye
                  className="text-emerald-600 hover:text-emerald-800 text-base transition transform hover:scale-110"
                  title="View Expense Details"
                />
              ),
              show: () => true,
              onClick: (row) => {
                setSelectedExpense(row);
                setViewModalOpen(true);
              },
            },
            {
              label: "Edit Expense",
              icon: (
                <FaEdit
                  className="text-blue-600 hover:text-blue-800 text-base transition transform hover:scale-110"
                  title="Edit Expense"
                />
              ),
              show: () => true,
              onClick: (row) => {
                handleOpenEdit(row);
              },
            },
          ]}
          loading={loading}
        />
      </div>

      {/* Create / Edit Expense Modal */}
      <CreateEditExpenseModal
        open={createEditModalOpen}
        setOpen={setCreateEditModalOpen}
        expenseData={selectedExpense}
        setExpenseData={setSelectedExpense}
        onSuccess={fetchExpensesList}
        createExpense={createExpense}
        updateExpense={updateExpense}
        submitting={loading}
      />

      {/* View Expense Details Modal */}
      <ViewExpenseModal
        open={viewModalOpen}
        setOpen={setViewModalOpen}
        expenseData={selectedExpense}
      />
    </div>
  );
};

export default Expenses;
