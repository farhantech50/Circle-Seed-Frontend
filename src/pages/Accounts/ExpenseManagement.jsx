import React, { useState, useEffect } from "react";
import DataTable from "../../components/DataTable";
import CustomModal from "../../components/CustomModal";
import { usePaginationStore } from "../../store/paginationStore";
import { FaFileInvoiceDollar, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";

const ExpenseManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { setTotalData } = usePaginationStore();

  const [tableData, setTableData] = useState([
    {
      id: 1,
      date: "2026-06-11",
      category: "Logistics",
      description: "Truck rental for Savar delivery",
      amount: "5,000",
      status: "Paid",
    },
    {
      id: 2,
      date: "2026-06-10",
      category: "Office Supplies",
      description: "Printer Ink & Paper",
      amount: "2,500",
      status: "Pending",
    },
  ]);

  const tableHead = ["SL", "Date", "Category", "Description", "Amount (BDT)", "Status"];

  const columnMapping = {
    Date: "date",
    Category: "category",
    Description: "description",
    "Amount (BDT)": "amount",
    Status: "status",
  };

  const columnAlignment = {
    SL: "center",
    "Amount (BDT)": "right",
    Status: "center",
  };

  const headerConfig = {
    title: "Expense Ledger",
    searchPlaceholder: "Search expense...",
  };

  useEffect(() => {
    setTotalData(tableData.length);
  }, [tableData, setTotalData]);

  const handleAddExpense = (e) => {
    e.preventDefault();
    const newRecord = {
      id: Date.now(),
      date: e.target.date.value,
      category: e.target.category.value,
      description: e.target.description.value,
      amount: e.target.amount.value,
      status: "Pending",
    };
    setTableData([newRecord, ...tableData]);
    setIsModalOpen(false);
    Swal.fire({ icon: "success", title: "Saved", text: "Expense recorded.", timer: 1500, showConfirmButton: false });
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaFileInvoiceDollar className="text-teal-600" /> Expense Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Track operational and overhead costs.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <FaPlus /> Record Expense
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

      <CustomModal open={isModalOpen} setOpen={setIsModalOpen} header="Record Expense">
        <form onSubmit={handleAddExpense} className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" name="date" required defaultValue={new Date().toISOString().split("T")[0]} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select name="category" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="Logistics">Logistics</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Utilities">Utilities & Bills</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Misc">Miscellaneous</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input type="text" name="description" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (BDT)</label>
            <input type="number" name="amount" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium">Save Expense</button>
          </div>
        </form>
      </CustomModal>
    </div>
  );
};

export default ExpenseManagement;
