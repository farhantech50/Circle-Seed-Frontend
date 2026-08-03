import React, { useState, useEffect } from "react";
import DataTable from "../../components/DataTable";
import { usePaginationStore } from "../../store/paginationStore";
import { FaChartBar, FaEye } from "react-icons/fa";
import Swal from "sweetalert2";

const DemandAnalysis = () => {
  const { setTotalData } = usePaginationStore();

  const [tableData] = useState([
    {
      id: 1,
      region: "Savar",
      product: "Circle Rice - BR28",
      demandLevel: "High",
      stockSuggestion: "+500 kg",
    },
    {
      id: 2,
      region: "Gazipur",
      product: "Circle Tomato - Red King",
      demandLevel: "Medium",
      stockSuggestion: "Adequate",
    },
  ]);

  const tableHead = ["SL", "Region / Area", "Product Name", "Market Demand Level", "Stock Suggestion", "Action"];

  const columnMapping = {
    "Region / Area": "region",
    "Product Name": "product",
    "Market Demand Level": "demandLevel",
    "Stock Suggestion": "stockSuggestion",
  };

  const columnAlignment = {
    SL: "center",
    "Market Demand Level": "center",
    "Stock Suggestion": "center",
    Action: "center",
  };

  const actionButtonsConfig = [
    {
      icon: <FaEye className="text-teal-600 hover:text-teal-800 text-lg" title="View Insights" />,
      show: () => true,
      onClick: (row) => Swal.fire("Demand Insights", `Region: ${row.region}\nProduct: ${row.product}\nTrend: Upward`, "info"),
    },
  ];

  const headerConfig = {
    title: "Regional Demand Trends",
    searchPlaceholder: "Search by Region or Product...",
  };

  useEffect(() => {
    setTotalData(tableData.length);
  }, [tableData, setTotalData]);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaChartBar className="text-teal-600" /> Demand Analysis
          </h1>
          <p className="text-sm text-gray-500 mt-1">Analyze market trends based on field marketing reports.</p>
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

export default DemandAnalysis;
