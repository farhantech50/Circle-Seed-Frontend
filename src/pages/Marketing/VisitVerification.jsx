import React, { useState, useEffect } from "react";
import DataTable from "../../components/DataTable";
import { usePaginationStore } from "../../store/paginationStore";
import { FaClipboardCheck, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Swal from "sweetalert2";

const VisitVerification = () => {
  const { setTotalData } = usePaginationStore();

  const [tableData, setTableData] = useState([
    {
      id: 1,
      date: "2026-06-11",
      agent: "Nasima Begum",
      shop: "Bhai Bhai Enterprise",
      gpsMatch: "98%",
      photo: "Available",
      status: "Pending",
    },
  ]);

  const tableHead = ["SL", "Date", "Agent", "Shop Visited", "GPS Match", "Photo Evidence", "Status", "Action"];

  const columnMapping = {
    Date: "date",
    Agent: "agent",
    "Shop Visited": "shop",
    "GPS Match": "gpsMatch",
    "Photo Evidence": "photo",
    Status: "status",
  };

  const columnAlignment = {
    SL: "center",
    "GPS Match": "center",
    "Photo Evidence": "center",
    Status: "center",
    Action: "center",
  };

  const actionButtonsConfig = [
    {
      icon: <FaCheckCircle className="text-green-600 hover:text-green-800 text-lg" title="Approve Visit" />,
      show: (row) => row.status === "Pending",
      onClick: (row) => {
        setTableData(tableData.map(item => item.id === row.id ? { ...item, status: "Verified" } : item));
        Swal.fire("Verified", "Visit approved.", "success");
      },
    },
    {
      icon: <FaTimesCircle className="text-red-600 hover:text-red-800 text-lg ml-3" title="Reject Visit" />,
      show: (row) => row.status === "Pending",
      onClick: (row) => {
        setTableData(tableData.map(item => item.id === row.id ? { ...item, status: "Rejected" } : item));
        Swal.fire("Rejected", "Visit rejected.", "success");
      },
    },
  ];

  const headerConfig = {
    title: "Visit Authenticity Verification",
    searchPlaceholder: "Search by Agent or Shop...",
  };

  useEffect(() => {
    setTotalData(tableData.length);
  }, [tableData, setTotalData]);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaClipboardCheck className="text-teal-600" /> Visit Verification
          </h1>
          <p className="text-sm text-gray-500 mt-1">Verify agent visits against GPS location and submitted photos.</p>
        </div>
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
    </div>
  );
};

export default VisitVerification;
