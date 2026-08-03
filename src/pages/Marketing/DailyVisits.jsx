import React, { useState, useEffect } from "react";
import DataTable from "../../components/DataTable";
import CustomModal from "../../components/CustomModal";
import { usePaginationStore } from "../../store/paginationStore";
import { FaWalking, FaPlus, FaEye, FaCheck } from "react-icons/fa";
import Swal from "sweetalert2";

const DailyVisits = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { setTotalData } = usePaginationStore();

  const [tableData, setTableData] = useState([
    {
      id: 1,
      date: "2026-06-11",
      agent: "Tariqul Islam",
      area: "Savar Market",
      shopsVisited: "15",
      ordersCollected: "3",
      status: "Completed",
    },
    {
      id: 2,
      date: "2026-06-11",
      agent: "Nasima Begum",
      area: "Gazipur Chowrasta",
      shopsVisited: "8",
      ordersCollected: "0",
      status: "In Progress",
    },
  ]);

  const tableHead = ["SL", "Date", "Marketing Agent", "Working Area", "Shops Visited", "Orders Collected", "Status", "Action"];

  const columnMapping = {
    Date: "date",
    "Marketing Agent": "agent",
    "Working Area": "area",
    "Shops Visited": "shopsVisited",
    "Orders Collected": "ordersCollected",
    Status: "status",
  };

  const columnAlignment = {
    SL: "center",
    "Shops Visited": "center",
    "Orders Collected": "center",
    Status: "center",
    Action: "center",
  };

  const actionButtonsConfig = [
    {
      icon: <FaEye className="text-teal-600 hover:text-teal-800 text-lg" title="View Report" />,
      show: () => true,
      onClick: (row) => Swal.fire("Visit Report", `Area: ${row.area}\nOrders: ${row.ordersCollected}`, "info"),
    },
  ];

  const headerConfig = {
    title: "Field Visit Summary",
    searchPlaceholder: "Search by Agent or Area...",
  };

  useEffect(() => {
    setTotalData(tableData.length);
  }, [tableData, setTotalData]);

  const handleAddVisit = (e) => {
    e.preventDefault();
    const newVisit = {
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      agent: e.target.agent.value,
      area: e.target.area.value,
      shopsVisited: "0",
      ordersCollected: "0",
      status: "Assigned",
    };
    setTableData([newVisit, ...tableData]);
    setIsModalOpen(false);
    Swal.fire({ icon: "success", title: "Assigned", text: "New area assigned to agent.", timer: 1500, showConfirmButton: false });
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaWalking className="text-teal-600" /> Daily Visits
          </h1>
          <p className="text-sm text-gray-500 mt-1">Assign areas and track daily shop visits by marketing executives.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <FaPlus /> Assign Area
        </button>
      </div>

      <DataTable
        tableHead={tableHead}
        tableData={tableData}
        columnMapping={columnMapping}
        columnAlignment={columnAlignment}
        actionButtonsConfig={actionButtonsConfig}
        headerConfig={headerConfig}
        loading={false}
      />

      <CustomModal open={isModalOpen} setOpen={setIsModalOpen} header="Assign Working Area">
        <form onSubmit={handleAddVisit} className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Agent</label>
            <input type="text" name="agent" required placeholder="Agent Name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Area / Market</label>
            <input type="text" name="area" required placeholder="e.g., Kawran Bazar" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium">Assign</button>
          </div>
        </form>
      </CustomModal>
    </div>
  );
};

export default DailyVisits;
