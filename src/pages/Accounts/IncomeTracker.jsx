import React, { useState, useEffect } from "react";
import DataTable from "../../components/DataTable";
import CustomModal from "../../components/CustomModal";
import { usePaginationStore } from "../../store/paginationStore";
import { FaMoneyBillWave, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";

const IncomeTracker = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { setTotalData } = usePaginationStore();

  const [tableData, setTableData] = useState([
    {
      id: 1,
      date: "2026-06-11",
      source: "Wholesale Order #1001",
      amount: "45,000",
      method: "Bank Transfer",
    },
    {
      id: 2,
      date: "2026-06-10",
      source: "POS Daily Closing",
      amount: "1,45,000",
      method: "Cash",
    },
  ]);

  const tableHead = ["SL", "Date", "Income Source / Reference", "Amount (BDT)", "Payment Method"];

  const columnMapping = {
    Date: "date",
    "Income Source / Reference": "source",
    "Amount (BDT)": "amount",
    "Payment Method": "method",
  };

  const columnAlignment = {
    SL: "center",
    "Amount (BDT)": "right",
    "Payment Method": "center",
  };

  const headerConfig = {
    title: "Income Ledger",
    searchPlaceholder: "Search income...",
  };

  useEffect(() => {
    setTotalData(tableData.length);
  }, [tableData, setTotalData]);

  const handleAddIncome = (e) => {
    e.preventDefault();
    const newRecord = {
      id: Date.now(),
      date: e.target.date.value,
      source: e.target.source.value,
      amount: e.target.amount.value,
      method: e.target.method.value,
    };
    setTableData([newRecord, ...tableData]);
    setIsModalOpen(false);
    Swal.fire({ icon: "success", title: "Saved", text: "Income recorded.", timer: 1500, showConfirmButton: false });
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaMoneyBillWave className="text-teal-600" /> Income Tracker
          </h1>
          <p className="text-sm text-gray-500 mt-1">Log all incoming revenue sources.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <FaPlus /> Record Income
        </button>
      </div>

      <DataTable
        tableHead={tableHead}
        tableData={tableData}
        columnMapping={columnMapping}
        columnAlignment={columnAlignment}
        headerConfig={headerConfig}
        loading={false}
      />

      <CustomModal open={isModalOpen} setOpen={setIsModalOpen} header="Record Income">
        <form onSubmit={handleAddIncome} className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" name="date" required defaultValue={new Date().toISOString().split("T")[0]} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source / Reference</label>
            <input type="text" name="source" required placeholder="e.g., Sale #5012" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (BDT)</label>
            <input type="number" name="amount" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select name="method" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Mobile Banking">Mobile Banking (bKash/Nagad)</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium">Save Income</button>
          </div>
        </form>
      </CustomModal>
    </div>
  );
};

export default IncomeTracker;
