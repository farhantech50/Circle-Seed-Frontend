import React, { useState, useEffect } from "react";
import DataTable from "../../components/DataTable";
import { usePaginationStore } from "../../store/paginationStore";
import { FaRoute, FaEye } from "react-icons/fa";
import Swal from "sweetalert2";

const RouteHistory = () => {
  const { setTotalData } = usePaginationStore();

  const [tableData] = useState([
    {
      id: 1,
      date: "2026-06-10",
      agent: "Tariqul Islam",
      route: "Savar -> Nabinagar -> Dhamrai",
      distance: "45 km",
    },
  ]);

  const tableHead = ["SL", "Date", "Marketing Agent", "Route Taken", "Distance Covered", "Action"];

  const columnMapping = {
    Date: "date",
    "Marketing Agent": "agent",
    "Route Taken": "route",
    "Distance Covered": "distance",
  };

  const columnAlignment = {
    SL: "center",
    "Distance Covered": "center",
    Action: "center",
  };

  const actionButtonsConfig = [
    {
      icon: <FaEye className="text-teal-600 hover:text-teal-800 text-lg" title="View Route on Map" />,
      show: () => true,
      onClick: (row) => Swal.fire("Map Preview", `Route for ${row.agent}\n${row.route}`, "info"),
    },
  ];

  const headerConfig = {
    title: "Agent Route History",
    searchPlaceholder: "Search by Agent...",
  };

  useEffect(() => {
    setTotalData(tableData.length);
  }, [tableData, setTotalData]);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaRoute className="text-teal-600" /> Route History
          </h1>
          <p className="text-sm text-gray-500 mt-1">Review historical travel routes of field agents.</p>
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

export default RouteHistory;
